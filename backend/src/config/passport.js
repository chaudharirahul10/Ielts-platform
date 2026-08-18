const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL:
  process.env.GOOGLE_CALLBACK_URL ||
  `${process.env.BACKEND_URL}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails?.[0]?.value });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value || '',
        isEmailVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      user.avatar = user.avatar || profile.photos?.[0]?.value || '';
      user.isEmailVerified = true;
      await user.save();
    }

    const refreshTokenValue = signRefreshToken(user._id);
    user.refreshToken = refreshTokenValue;
    await user.save();
    const payload = { user, accessToken: signAccessToken(user._id), refreshToken: refreshTokenValue };
    return done(null, payload);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
