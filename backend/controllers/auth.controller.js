const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ACCOUNT_PREFIX = '4567';
const IFSC_CODE = 'VRX0001234';

const normalizePhone = (phoneNumber = '') => phoneNumber.replace(/\D/g, '');

const generateAccountNumber = () => {
  const suffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${ACCOUNT_PREFIX}${suffix}`;
};

const buildUpiId = (email) => `${email.split('@')[0].replace(/[^a-z0-9._-]/gi, '').toLowerCase()}@finova`;

const createToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role || 'customer' },
  process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
);

const sanitizeUser = (user) => {
  const userResponse = { ...user };
  delete userResponse.password_hash;
  delete userResponse.upi_pin;
  return userResponse;
};

exports.register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      full_name,
      phone_number,
      upi_pin, // New requirement
      initial_balance = 1000.00
    } = req.body;

    if (!email || !password || !full_name || !phone_number || !upi_pin) {
      return res.status(400).json({ error: 'All fields including UPI PIN are required' });
    }

    const normalizedPhone = normalizePhone(phone_number);

    // Check for existing user
    const { data: existingUsers, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},phone_number.eq.${normalizedPhone}`)
      .limit(1);

    if (lookupError) throw lookupError;
    if (existingUsers?.length) {
      return res.status(400).json({ error: 'Email or Phone Number already registered' });
    }

    const normalizedUpiPin = String(upi_pin).replace(/\D/g, '');

    if (normalizedUpiPin.length < 4) {
      return res.status(400).json({ error: 'UPI PIN must be at least 4 digits' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const upi_id = buildUpiId(email);

    // Insert into users
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        full_name,
        phone_number: normalizedPhone,
        upi_id,
        upi_pin: normalizedUpiPin,
        balance: initial_balance,
        role: 'customer'
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Create default account
    const accountNumber = generateAccountNumber();
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert([{
        user_id: user.id,
        account_number: accountNumber,
        account_type: 'savings',
        balance: initial_balance,
        status: 'active',
        upi_id: upi_id
      }])
      .select()
      .single();

    if (accountError) throw accountError;

    // Create initial notification
    await supabase.from('notifications').insert([{
      user_id: user.id,
      title: 'Welcome to Finova!',
      message: `Your account ${accountNumber} has been successfully created with a welcome balance of ₹${initial_balance}.`,
      is_read: false
    }]);

    const token = createToken(user);

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
      account
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide an email and password' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // Re-fetch user to get latest balance/data
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// In-memory O(1) search cache for ADA-based search speedup
const searchCache = new Map();
const CACHE_TTL = 30000; // 30 seconds cache TTL

exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q) {
      return res.status(200).json([]);
    }

    // 1. Sanitize Search Query (ADA Security & Performance check)
    const sanitized = q.replace(/[^a-zA-Z0-9\s._@-]/g, '').trim();
    if (sanitized.length < 2) {
      return res.status(200).json([]);
    }

    const lowercaseQuery = sanitized.toLowerCase();
    const cacheKey = `${currentUserId}:${lowercaseQuery}`;
    
    // 2. O(1) In-Memory Cache Lookup
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)) {
      return res.status(200).json(cachedEntry.data);
    }

    // 3. Specialized Indexed Search Logic
    let query = supabase
      .from('users')
      .select('id, full_name, upi_id, phone_number, is_verified, profile_image');

    if (lowercaseQuery.includes('@')) {
      // Prioritize exact or partial UPI match
      query = query.or(`upi_id.eq.${lowercaseQuery},upi_id.ilike.%${lowercaseQuery}%`);
    } else {
      // General fuzzy search for name, UPI, and phone
      query = query.or(`full_name.ilike.%${lowercaseQuery}%,upi_id.ilike.%${lowercaseQuery}%,phone_number.ilike.%${lowercaseQuery}%`);
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    // Filter results: Hide current user unless they search their own UPI address (self-testing)
    const results = (data || []).filter(
      u => u.id !== currentUserId || (u.upi_id?.toLowerCase() === lowercaseQuery)
    );

    // 4. Cache the results in O(1) Hash Map
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      data: results
    });

    // 5. Automatic O(1) Pruning of stale cache entries
    if (searchCache.size > 500) {
      const now = Date.now();
      for (const [key, val] of searchCache.entries()) {
        if (now - val.timestamp > CACHE_TTL) {
          searchCache.delete(key);
        }
      }
    }

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
}; exports.getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, upi_id, is_verified, profile_image')
      .neq('id', currentUserId)
      .limit(20);

    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    next(error);
  }
};
