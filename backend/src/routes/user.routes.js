const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');

router.get('/profile', protect, async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user.toPublicJSON() });
  } catch (err) { next(err); }
});

router.put('/profile', protect, async (req, res, next) => {
  try {
    const allowed = ['name', 'country', 'targetBand', 'examType', 'examDate', 'currentLevel', 'currentBand', 'studyGoal', 'accountSettings', 'avatar', 'isDarkMode'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) { next(err); }
});

module.exports = router;
