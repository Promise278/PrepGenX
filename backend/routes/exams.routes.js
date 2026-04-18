const express = require('express');
const router = express.Router();
const examsController = require('../controllers/exams.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/', verifyToken, examsController.getExams);
router.get('/:id/questions', verifyToken, examsController.getExamQuestions);
router.get('/subjects', verifyToken, examsController.getSubjects);
router.post('/seed', verifyToken, examsController.seedExams);
router.post('/mock', verifyToken, examsController.generateMock);

router.get('/status/:userId', verifyToken, examsController.getExamStatus);

module.exports = router;
