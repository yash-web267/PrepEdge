const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getRandomQuestion, submitAnswer, getHistory } = require('../controllers/interviewController');
const { validateInterview, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/random-question', authMiddleware, getRandomQuestion);
router.get('/history', authMiddleware, getHistory);
router.post('/submit', authMiddleware, validateInterview, handleValidationErrors, submitAnswer);

module.exports = router;