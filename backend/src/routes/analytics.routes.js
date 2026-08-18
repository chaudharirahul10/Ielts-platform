const router = require('express').Router();
const ctrl = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
router.use(protect);
router.get('/overview', ctrl.getOverview);
router.get('/progress', ctrl.getProgress);
router.get('/weak-areas', ctrl.getWeakAreas);
router.get('/leaderboard', ctrl.getLeaderboard);
module.exports = router;
