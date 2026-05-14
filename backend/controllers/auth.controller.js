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
  userResponse.has_upi_pin = !!user.upi_pin;
  delete userResponse.password_hash;
  delete userResponse.upi_pin;
  return userResponse;
};

exports.sanitizeUser = sanitizeUser;

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

    const password_hash = await bcrypt.hash(password, 10);
    const upi_pin_hash = await bcrypt.hash(upi_pin, 10);
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
        upi_pin: upi_pin_hash,
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

exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.length < 2) {
      return res.status(200).json([]);
    }

    // 1. Specialized Search Logic
    let query = supabase
      .from('users')
      .select('id, full_name, upi_id, phone_number, is_verified, profile_image');

    if (q.includes('@')) {
      // If query looks like a UPI ID, prioritize exact or partial UPI match
      query = query.or(`upi_id.eq.${q},upi_id.ilike.%${q}%`);
    } else {
      // General fuzzy search for names and phones
      query = query.or(`full_name.ilike.%${q}%,upi_id.ilike.%${q}%,phone_number.ilike.%${q}%`);
    }

    const { data, error } = await query.limit(10);

    if (error) throw error;

    // Filter results: Normally hide current user EXCEPT if they type their own UPI exactly (for self-pay testing)
    const results = (data || []).filter(u => u.id !== currentUserId || (u.upi_id?.toLowerCase() === q.toLowerCase()));

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};exports.getAllUsers = async (req, res, next) => {
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

