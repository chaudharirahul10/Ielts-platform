const router = require('express').Router();
const ctrl = require('../controllers/writing.controller');
const { protect } = require('../middleware/auth.middleware');
router.use(protect);
router.post('/submit', ctrl.submitEssay);
router.post('/ai-check', ctrl.quickGrammarCheck);
router.get('/history', ctrl.getHistory);
router.get('/:id', ctrl.getSubmissionById);
module.exports = router;
