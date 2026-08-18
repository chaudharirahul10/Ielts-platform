const mongoose = require('mongoose');

const speakingSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  part: { type: Number, enum: [1,2,3], required: true },
  questionText: { type: String, required: true },
  audioUrl: { type: String, default: '' },
  durationSec: { type: Number, default: 0 },
  transcript: { type: String, default: '' },
  bandScore: { type: Number, default: null },
  criteria: {
    fluencyCoherence: { band: Number, feedback: String },
    lexicalResource: { band: Number, feedback: String },
    grammaticalRange: { band: Number, feedback: String },
    pronunciation: { band: Number, feedback: String },
  },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  betterPhrases: [{ said: String, better: String }],
  status: { type: String, enum: ['pending','transcribed','evaluated','failed'], default: 'pending' },
  evaluatedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('SpeakingSubmission', speakingSubmissionSchema);
