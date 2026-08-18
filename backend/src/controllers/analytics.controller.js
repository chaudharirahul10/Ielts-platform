const Result = require('../models/Result');
const User = require('../models/User');

exports.getOverview = async (req, res, next) => {
  try {
    const user = req.user;
    const recentResults = await Result.find({ user: user._id }).sort({ completedAt: -1 }).limit(10);
    res.json({ success: true, overview: { scores: user.scores, streak: user.streak, totalStudyTimeMin: user.totalStudyTimeMin, testsCompleted: user.testsCompleted, totalQuestionsAnswered: user.totalQuestionsAnswered, recentResults } });
  } catch(err) { next(err); }
};

exports.getProgress = async (req, res, next) => {
  try {
    res.json({ success: true, progress: [] });
  } catch(err) { next(err); }
};

exports.getWeakAreas = async (req, res, next) => {
  try {
    const results = await Result.find({ user: req.user._id }).sort({ completedAt: -1 }).limit(20);
    const stats = {};
    results.forEach(r => r.answers.forEach(a => {
      stats[r.module] = stats[r.module] || { correct:0, total:0 };
      stats[r.module].total++;
      if (a.isCorrect) stats[r.module].correct++;
    }));
    const weakAreas = Object.entries(stats).map(([name, {correct,total}]) => ({
      name, accuracyPct: total ? Math.round((correct/total)*100) : 0
    })).sort((a,b) => a.accuracyPct - b.accuracyPct);
    res.json({ success: true, weakAreas });
  } catch(err) { next(err); }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ role:'student' }).sort({ 'scores.overall': -1 }).limit(20).select('name avatar country scores totalStudyTimeMin');
    const leaderboard = users.map((u, i) => ({ rank: i+1, name: u.name, avatar: u.avatar, country: u.country, score: u.scores.overall, studyTimeMin: u.totalStudyTimeMin }));
    res.json({ success: true, leaderboard });
  } catch(err) { next(err); }
};
