const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists.' });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Session expired.' });
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required.' });
  next();
};
