const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlan.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/generate', verifyToken, studyPlanController.generateStudyPlan);
router.get('/:userId', verifyToken, studyPlanController.getStudyPlan);

module.exports = router;
