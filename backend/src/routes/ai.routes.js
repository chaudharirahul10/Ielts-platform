const router = require('express').Router();
const ctrl = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
router.use(protect);
router.post('/chat', ctrl.chat);
router.post('/explain-answer', ctrl.explainAnswer);
router.post('/generate-vocab', ctrl.generateVocab);
router.post('/study-plan', ctrl.generateStudyPlanAI);
module.exports = router;
