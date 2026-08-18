const SpeakingSubmission = require('../models/SpeakingSubmission');
const User = require('../models/User');
const aiService = require('../services/aiService');
const speechService = require('../services/speechService');

exports.submit = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'An audio recording is required.' });

    const part = Number(req.body.part);
    if (![1, 2, 3].includes(part) || !req.body.questionText) {
      return res.status(400).json({ success: false, message: 'A valid speaking part and question are required.' });
    }

    const durationSec = Math.max(0, Number(req.body.durationSec) || 0);
    let transcript = '';
    try {
      transcript = await speechService.transcribeAudioBuffer(req.file.buffer, req.file.mimetype);
    } catch (err) {
      console.error('Speech transcription failed:', err.message);
    }

    const evaluation = await aiService.evaluateSpeaking({ transcript, questionText: req.body.questionText, part, durationSec });
    const submission = await SpeakingSubmission.create({
      user: req.user._id,
      part,
      questionText: req.body.questionText,
      durationSec,
      transcript,
      bandScore: evaluation.bandScore,
      criteria: evaluation.criteria,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      betterPhrases: evaluation.betterPhrases,
      status: 'evaluated',
      evaluatedAt: new Date(),
    });
    await User.findByIdAndUpdate(req.user._id, { 'scores.speaking': evaluation.bandScore, 'scores.lastUpdated': new Date() });
    res.json({ success: true, submission });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const submissions = await SpeakingSubmission.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, submissions });
  } catch (err) {
    next(err);
  }
};
