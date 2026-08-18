const aiService = require('../services/aiService');
const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

exports.chat = async (req, res, next) => {
  try {
    const { messages, weakAreas } = req.body;
    const userContext = { currentLevel: req.user.currentLevel, targetBand: req.user.targetBand, weakAreas: weakAreas||[] };
    const reply = await aiService.chatWithTutor({ messages, userContext });
    res.json({ success: true, reply });
  } catch(err) { next(err); }
};

exports.explainAnswer = async (req, res, next) => {
  try {
    const { questionText, userAnswer, correctAnswer, context } = req.body;
    const explanation = await aiService.explainAnswer({ questionText, userAnswer, correctAnswer, context });
    res.json({ success: true, explanation });
  } catch(err) { next(err); }
};

exports.generateVocab = async (req, res, next) => {
  try {
    const { topic, difficulty, count } = req.body;
    const result = await aiService.generateVocabulary({ topic, difficulty, count });
    res.json({ success: true, words: result.words || result });
  } catch(err) { next(err); }
};

exports.generateStudyPlanAI = async (req, res, next) => {
  try {
    const { targetBand, examDate, studyHoursPerDay, weakAreas } = req.body;
    const currentLevel = req.user.currentLevel;
    const plan = await aiService.generateStudyPlan({ currentLevel, targetBand, examDate, studyHoursPerDay, weakAreas: weakAreas||[] });
    const days = [];
    const start = new Date();
    let offset = 0;
    (plan.weeks||[]).forEach(w => (w.days||[]).forEach(d => {
      const date = new Date(start); date.setDate(date.getDate() + offset++);
      days.push({ date, dayLabel: `${d.dayLabel} — Week ${w.weekNumber}`, tasks: (d.tasks||[]).map(t => ({ ...t, isCompleted: false })) });
    }));
    await StudyPlan.updateMany({ user: req.user._id, isActive: true }, { isActive: false });
    const studyPlan = await StudyPlan.create({ user: req.user._id, currentLevel, targetBand, examDate, studyHoursPerDay, weakAreas: weakAreas||[], days, generatedByAI: true });
    await User.findByIdAndUpdate(req.user._id, { targetBand, examDate });
    res.json({ success: true, summary: plan.summary, studyPlan });
  } catch(err) { next(err); }
};
