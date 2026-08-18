const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  module: { type: String, enum: ['listening', 'reading', 'writing', 'speaking', 'vocabulary', 'grammar', 'mixed'], default: 'mixed' },
  durationMin: { type: Number, default: 30 },
  isCompleted: { type: Boolean, default: false },
});

const daySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  dayLabel: { type: String, required: true },
  tasks: { type: [taskSchema], default: [] },
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  currentLevel: { type: Number, min: 1, max: 9, required: true },
  targetBand: { type: Number, min: 1, max: 9, required: true },
  examDate: { type: Date, default: null },
  studyHoursPerDay: { type: Number, default: 1 },
  weakAreas: { type: [String], default: [] },
  days: { type: [daySchema], default: [] },
  generatedByAI: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
