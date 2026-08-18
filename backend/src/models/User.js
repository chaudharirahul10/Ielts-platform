const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const accountSettingsSchema = new mongoose.Schema({
  emailNotifications: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: true },
  reminders: { type: Boolean, default: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 8, select: false },
  googleId: { type: String, default: null },
  avatar: { type: String, default: '' },
  isEmailVerified: {
  type: Boolean,
  default: false,
},

// OTP (Future 2FA ya Mobile Verification)
otp: {
  type: String,
  select: false,
},

otpExpiry: {
  type: Date,
  select: false,
},

// Email Verification Token
verificationToken: {
  type: String,
  default: null,
  select: false,
},

verificationTokenExpiry: {
  type: Date,
  default: null,
  select: false,
},

// Reset Password Token
resetPasswordToken: {
  type: String,
  default: null,
  select: false,
},

resetPasswordExpiry: {
  type: Date,
  default: null,
  select: false,
},

// JWT Refresh Token
refreshToken: {
  type: String,
  default: '',
},
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  examType: { type: String, enum: ['academic', 'general'], default: 'academic' },
  targetBand: { type: Number, min: 1, max: 9, default: 7.0 },
  currentLevel: { type: Number, min: 1, max: 9, default: 5.5 },
  currentBand: { type: Number, min: 1, max: 9, default: 5.5 },
  examDate: { type: Date, default: null },
  country: { type: String, default: '' },
  studyGoal: { type: String, default: 'Improve my IELTS performance steadily.' },
  accountSettings: { type: accountSettingsSchema, default: () => ({}) },
  scores: {
    overall: { type: Number, default: 0 },
    listening: { type: Number, default: 0 },
    reading: { type: Number, default: 0 },
    writing: { type: Number, default: 0 },
    speaking: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: null },
  },
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  totalStudyTimeMin: { type: Number, default: 0 },
  totalQuestionsAnswered: { type: Number, default: 0 },
  testsCompleted: { type: Number, default: 0 },
  isDarkMode: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  if (typeof this.password !== 'string' || this.password.startsWith('$2')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  if (!this.password) return false;
  if (typeof this.password !== 'string') return false;

  if (this.password.startsWith('$2')) {
    try {
      return await bcrypt.compare(candidate, this.password);
    } catch (err) {
      return false;
    }
  }
  if (this.password === candidate) {
    this.password = candidate;
    await this.save({ validateBeforeSave: false });
    return true;
  }

  return false;
};

userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    isEmailVerified: this.isEmailVerified,
    avatar: this.avatar,
    role: this.role,
    examType: this.examType,
    targetBand: this.targetBand,
    currentLevel: this.currentLevel,
    currentBand: this.currentBand,
    examDate: this.examDate,
    country: this.country,
    studyGoal: this.studyGoal,
    accountSettings: this.accountSettings,
    scores: this.scores,
    streak: this.streak,
    totalStudyTimeMin: this.totalStudyTimeMin,
    testsCompleted: this.testsCompleted,
    isPremium: this.isPremium,
    isDarkMode: this.isDarkMode,
  };
};

module.exports = mongoose.model('User', userSchema);
