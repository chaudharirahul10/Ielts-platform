const User = require('../models/User');
const Question = require('../models/Question');
const Result = require('../models/Result');

exports.listUsers = async (req, res, next) => {
  try {
    const { page=1, limit=20, search='' } = req.query;
    const filter = search ? { $or: [{ name: new RegExp(search,'i') },{ email: new RegExp(search,'i') }] } : {};
    const users = await User.find(filter).select('-password').limit(+limit).skip((+page-1)*+limit).sort({ createdAt:-1 });
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total });
  } catch(err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const allowed = ['role','isPremium','targetBand','isEmailVerified'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new:true }).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'User not found.' });
    res.json({ success:true, user });
  } catch(err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ success:true, message:'User deleted.' }); }
  catch(err) { next(err); }
};

exports.createQuestion = async (req, res, next) => {
  try { const q = await Question.create({ ...req.body, createdBy: req.user._id }); res.status(201).json({ success:true, question:q }); }
  catch(err) { next(err); }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!q) return res.status(404).json({ success:false, message:'Question not found.' });
    res.json({ success:true, question:q });
  } catch(err) { next(err); }
};

exports.deleteQuestion = async (req, res, next) => {
  try { await Question.findByIdAndUpdate(req.params.id, { isActive:false }); res.json({ success:true, message:'Question removed.' }); }
  catch(err) { next(err); }
};

exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role:'student' });
    const premiumUsers = await User.countDocuments({ isPremium:true });
    const totalQuestions = await Question.countDocuments({ isActive:true });
    const totalTests = await Result.countDocuments();
    res.json({ success:true, analytics:{ totalUsers, premiumUsers, totalQuestions, totalTests } });
  } catch(err) { next(err); }
};
