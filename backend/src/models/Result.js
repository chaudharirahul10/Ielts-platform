const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  userAnswer: { type: mongoose.Schema.Types.Mixed },
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  isCorrect: { type: Boolean },
  timeTakenSec: { type: Number, default: 0 },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mockTest: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', default: null },
  module: { type: String, enum: ['listening','reading','writing','speaking','full'], required: true },
  rawScore: { type: Number, default: 0 },
  bandScore: { type: Number, default: 0 },
  subScores: {
    listening: { type: Number, default: null },
    reading: { type: Number, default: null },
    writing: { type: Number, default: null },
    speaking: { type: Number, default: null },
  },
  writingCriteria: {
    taskAchievement: { type: Number, default: null },
    coherenceCohesion: { type: Number, default: null },
    lexicalResource: { type: Number, default: null },
    grammaticalRange: { type: Number, default: null },
  },
  speakingCriteria: {
    fluencyCoherence: { type: Number, default: null },
    lexicalResource: { type: Number, default: null },
    grammaticalRange: { type: Number, default: null },
    pronunciation: { type: Number, default: null },
  },
  answers: [answerSchema],
  aiFeedback: {
    summary: { type: String, default: '' },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    improvedVersion: { type: String, default: '' },
  },
  timeSpentSec: { type: Number, default: 0 },
  isFullTest: { type: Boolean, default: false },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

resultSchema.index({ user: 1, completedAt: -1 });
module.exports = mongoose.model('Result', resultSchema);
