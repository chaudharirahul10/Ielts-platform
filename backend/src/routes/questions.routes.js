const router = require('express').Router();
const Question = require('../models/Question');
const { protect } = require('../middleware/auth.middleware');
router.use(protect);
router.get('/', async (req, res, next) => {
  try {
    const { module, difficulty, questionType, limit=20, page=1 } = req.query;
    const filter = { isActive: true };
    if (module) filter.module = module;
    if (difficulty) filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;
    const questions = await Question.find(filter).limit(+limit).skip((+page-1)*+limit);
    const total = await Question.countDocuments(filter);
    res.json({ success: true, questions, total });
  } catch(err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, question: q });
  } catch(err) { next(err); }
});
module.exports = router;
