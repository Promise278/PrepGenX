const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/ai.controller');
const protect = require('../middlewares/auth.middleware');

// Setup multer for temporary audio storage
const upload = multer({ dest: 'uploads/' });

// Route to process Voice Tutor interactions
// Used protect middleware to ensure only authenticated students use API
router.post('/tutor', protect, upload.single('audio'), aiController.processVoiceTutor);

// Route to process Image Tutor interactions
router.post('/image', protect, upload.single('image'), aiController.processImageTutor);

module.exports = router;
