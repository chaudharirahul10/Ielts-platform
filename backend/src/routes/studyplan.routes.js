const router = require('express').Router();
const StudyPlan = require('../models/StudyPlan');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const studyPlan = await StudyPlan.findOne({ user: req.user._id, isActive: true });
    res.json({ success: true, studyPlan });
  } catch (err) {
    next(err);
  }
});

router.put('/day/:dayIndex/task/:taskId', async (req, res, next) => {
  try {
    const dayIndex = Number(req.params.dayIndex);
    if (!Number.isInteger(dayIndex) || dayIndex < 0) {
      return res.status(400).json({ success: false, message: 'Invalid day index.' });
    }

    const studyPlan = await StudyPlan.findOne({ user: req.user._id, isActive: true });
    const task = studyPlan?.days?.[dayIndex]?.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    task.isCompleted = !task.isCompleted;
    await studyPlan.save();
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
