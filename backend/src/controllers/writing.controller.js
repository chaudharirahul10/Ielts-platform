const WritingSubmission = require('../models/WritingSubmission');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { calculateWritingBand } = require('../utils/bandCalculator');

exports.submitEssay = async (req, res, next) => {
  try {
    const { taskType, questionText, content, timeSpentSec, questionId } = req.body;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const sub = await WritingSubmission.create({ user: req.user._id, question: questionId||null, taskType, questionText, content, wordCount, timeSpentSec, status:'pending' });
    const ai = await aiService.evaluateWriting({ essay: content, taskType, questionText });
    const band = ai.bandScore || calculateWritingBand({ taskAchievement: ai.criteria.taskAchievement.band, coherenceCohesion: ai.criteria.coherenceCohesion.band, lexicalResource: ai.criteria.lexicalResource.band, grammaticalRange: ai.criteria.grammaticalRange.band });
    Object.assign(sub, { bandScore: band, criteria: ai.criteria, strengths: ai.strengths, improvements: ai.improvements, improvedVersion: ai.improvedVersion, commonMistakes: ai.commonMistakes, vocabularySuggestions: ai.vocabularySuggestions, status:'evaluated', evaluatedAt: new Date() });
    await sub.save();
    await User.findByIdAndUpdate(req.user._id, { 'scores.writing': band, 'scores.lastUpdated': new Date() });
    res.json({ success: true, submission: sub });
  } catch(err) { next(err); }
};

exports.quickGrammarCheck = async (req, res, next) => {
  try {
    const result = await aiService.quickGrammarCheck({ text: req.body.text });
    res.json({ success: true, ...result });
  } catch(err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const subs = await WritingSubmission.find({ user: req.user._id }).sort({ createdAt: -1 }).select('-content -improvedVersion').limit(50);
    res.json({ success: true, submissions: subs });
  } catch(err) { next(err); }
};

exports.getSubmissionById = async (req, res, next) => {
  try {
    const sub = await WritingSubmission.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, submission: sub });
  } catch(err) { next(err); }
};
