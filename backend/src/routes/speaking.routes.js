const router = require('express').Router();
const multer = require('multer');
const controller = require('../controllers/speaking.controller');
const { protect } = require('../middleware/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, file.mimetype.startsWith('audio/')),
});

router.use(protect);
router.post('/submit', upload.single('audio'), controller.submit);
router.get('/history', controller.getHistory);

module.exports = router;
