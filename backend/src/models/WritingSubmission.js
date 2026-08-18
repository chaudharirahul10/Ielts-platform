const mongoose = require('mongoose');

const writingSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  taskType: { type: String, enum: ['task1','task2'], required: true },
  questionText: { type: String, required: true },
  content: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
  timeSpentSec: { type: Number, default: 0 },
  bandScore: { type: Number, default: null },
  criteria: {
    taskAchievement: { band: Number, feedback: String },
    coherenceCohesion: { band: Number, feedback: String },
    lexicalResource: { band: Number, feedback: String },
    grammaticalRange: { band: Number, feedback: String },
  },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  improvedVersion: { type: String, default: '' },
  commonMistakes: [{ type: String }],
  vocabularySuggestions: [{ original: String, suggestion: String, example: String }],
  status: { type: String, enum: ['pending','evaluated','failed'], default: 'pending' },
  evaluatedAt: { type: Date, default: null },
}, { timestamps: true });

writingSubmissionSchema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model('WritingSubmission', writingSubmissionSchema);
