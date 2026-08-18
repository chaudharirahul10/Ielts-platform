const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'dev-ielts-secret';
const accessExpiry = process.env.JWT_EXPIRE || '7d';
const refreshExpiry = process.env.JWT_REFRESH_EXPIRE || '30d';

exports.signAccessToken = (userId) => jwt.sign({ id: userId, type: 'access' }, secret, { expiresIn: accessExpiry });
exports.signRefreshToken = (userId) => jwt.sign({ id: userId, type: 'refresh' }, secret, { expiresIn: refreshExpiry });
exports.verifyAccessToken = (token) => jwt.verify(token, secret);
exports.verifyRefreshToken = (token) => jwt.verify(token, secret);
