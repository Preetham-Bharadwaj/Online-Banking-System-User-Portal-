const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone_number, role, is_admin, kyc_status, onboarding_state, date_of_birth, address, aadhaar_last4, pan_number, is_verified, mfa_enabled, created_at, updated_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

exports.authorize = (...roles) => {

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route` 
      });
    }
    next();
  };
};
