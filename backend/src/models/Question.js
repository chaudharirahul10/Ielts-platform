const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  module: { type: String, enum: ['listening','reading','writing','speaking'], required: true },
  audioUrl: { type: String, default: '' },
  audioSection: { type: Number, min: 1, max: 4, default: null },
  passage: { type: String, default: '' },
  passageTitle: { type: String, default: '' },
  examType: { type: String, enum: ['academic','general','both'], default: 'both' },
  taskType: { type: String, enum: ['task1','task2',null], default: null },
  taskSubtype: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  speakingPart: { type: Number, enum: [1,2,3,null], default: null },
  cueCard: { type: String, default: '' },
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['mcq','fill_blank','true_false_ng','matching_headings','matching_info',
           'summary_completion','sentence_completion','note_completion','essay','cue_card','short_answer'],
    required: true,
  },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  explanation: { type: String, default: '' },
  difficulty: { type: String, enum: ['beginner','intermediate','advanced'], required: true },
  tags: [{ type: String }],
  totalAttempts: { type: Number, default: 0 },
  correctAttempts: { type: Number, default: 0 },
  avgTimeSeconds: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

questionSchema.index({ module: 1, difficulty: 1 });
module.exports = mongoose.model('Question', questionSchema);
