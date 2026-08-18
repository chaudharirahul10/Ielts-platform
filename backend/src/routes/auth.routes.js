const router = require('express').Router();
const passport = require('../config/passport');
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/resend-otp', ctrl.resendOTP);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/resend-verification-email', ctrl.resendVerificationEmail);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.put('/change-password', protect, ctrl.changePassword);
router.post('/google', ctrl.googleLogin);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google`, session: false }), ctrl.googleCallback);
router.post('/refresh-token', ctrl.refreshToken);
router.get('/me', protect, ctrl.getMe);
router.post('/logout', protect, ctrl.logout);

module.exports = router;
