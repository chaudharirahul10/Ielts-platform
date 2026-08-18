exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.OTP_EXPIRY_MS = 10 * 60 * 1000;
