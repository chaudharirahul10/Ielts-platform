const crypto = require("crypto");
const { generateToken, hashToken } = require("../utils/token");
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, OTP_EXPIRY_MS } = require('../utils/otpGenerator');
const emailService = require('../services/emailService');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function updateStreak(user) {
  const today = new Date().setHours(0, 0, 0, 0);
  const last = user.lastStudyDate ? new Date(user.lastStudyDate).setHours(0, 0, 0, 0) : null;
  if (last === today) return;
  user.streak = last === today - 86400000 ? user.streak + 1 : 1;
  user.lastStudyDate = new Date();
  user.lastLoginAt = new Date();
  await user.save();
}

function buildAuthResponse(user) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  return { success: true, token: accessToken, refreshToken, user: user.toPublicJSON() };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, targetBand, examType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const otp = generateOTP();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      targetBand,
      examType,

      otp,
      otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS),
    });

    try {
      await emailService.sendOTPEmail(normalizedEmail, otp);
    } catch (sendErr) {
      console.error('Registration OTP send failed:', sendErr.message);
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: normalizedEmail,
      message: 'Registration successful. Please verify your email.',
    });

  } catch (err) {
    next(err);
  }
};
exports.verifyEmail = async (req, res, next) => {

    try {

        const { token } = req.query;

        const hashed = hashToken(token);

        const user = await User.findOne({
            verificationToken: hashed
        }).select("+verificationToken +verificationTokenExpiry");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification link."
            });
        }

        if (user.verificationTokenExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Verification link expired."
            });
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;

        await user.save();

        await emailService.sendWelcomeEmail(
            user.email,
            user.name
        );

        res.json({
            success: true,
            message: "Email verified successfully."
        });

    } catch (err) {
        next(err);
    }

};
exports.resendVerificationEmail = async (
    req,
    res,
    next
) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({

            email,

        });

        if (!user)

            return res.json({

                success: true,

            });

        if (user.isEmailVerified)

            return res.json({

                success: true,

                message: "Already verified.",

            });

        const rawToken = generateToken();

        user.verificationToken =
            hashToken(rawToken);

        user.verificationTokenExpiry =
            Date.now() + 3600000;

        await user.save();

        const link =
            `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

        await emailService.sendVerificationEmail(

            user.email,

            link

        );

        res.json({

            success: true,

            message: "Verification email sent.",

        });

    } catch (err) {

        next(err);

    }

};


exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiry');
    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
    user.isEmailVerified = true; user.otp = undefined; user.otpExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified!' });
  } catch(err) { next(err); }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.json({ success: true, message: 'If that email exists, a code was sent.' });
    const otp = generateOTP();
    user.otp = otp; user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();
    try { await emailService.sendOTPEmail(normalizedEmail, otp); } catch (sendErr) { console.error('OTP send failed:', sendErr.message); }
    res.json({ success: true, message: 'New code sent.' });
  } catch(err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    const passwordValid = await user.comparePassword(password);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    if (!user.isEmailVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
      await user.save();
      try { await emailService.sendOTPEmail(normalizedEmail, otp); } catch (sendErr) { console.error('OTP resend failed:', sendErr.message); }
      return res.status(403).json({ success: false, message: 'Please verify your email first. A new code was sent.', requiresVerification: true, email: normalizedEmail });
    }

    await updateStreak(user);
    user.refreshToken = signRefreshToken(user._id);
    await user.save();
    res.json(buildAuthResponse(user));
  } catch(err) { next(err); }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch {
      const resp = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`);
      payload = await resp.json();
      payload.sub = payload.sub || payload.id;
    }
    let user = await User.findOne({ email: payload.email });
    if (!user) user = await User.create({ name: payload.name, email: payload.email, googleId: payload.sub, avatar: payload.picture, isEmailVerified: true });
    else if (!user.googleId) { user.googleId = payload.sub; user.avatar = user.avatar || payload.picture; await user.save(); }
    await updateStreak(user);
    user.refreshToken = signRefreshToken(user._id);
    await user.save();
    res.json(buildAuthResponse(user));
  } catch(err) { res.status(401).json({ success: false, message: 'Google authentication failed.' }); }
};

exports.googleCallback = async (req, res) => {
  const { user, accessToken, refreshToken } = req.user;
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?auth=success&token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}`;
  res.redirect(redirectUrl);
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token missing.' });
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    const newAccessToken = signAccessToken(user._id);
    res.json({ success: true, token: newAccessToken, user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => res.json({ success: true, user: req.user.toPublicJSON() });
exports.logout = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) { user.refreshToken = ''; await user.save(); }
    }
    res.json({ success: true, message: 'Logged out.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Logout failed.' }); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const link = `${process.env.FRONTEND_URL}/reset-password?token=${signAccessToken(user._id)}`;
      await emailService.sendPasswordResetEmail(email, link);
    }
    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch(err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const { verifyAccessToken } = require('../utils/jwt');
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ success: false, message: 'Invalid reset link.' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password reset. Please log in.' });
  } catch { res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' }); }
};
