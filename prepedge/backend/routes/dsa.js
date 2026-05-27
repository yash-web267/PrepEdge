const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getProblems, markSolved, getStats } = require('../controllers/dsaController');
const { validateDSAProgress, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/problems', authMiddleware, getProblems);
router.get('/stats', authMiddleware, getStats);
router.post('/solve', authMiddleware, validateDSAProgress, handleValidationErrors, markSolved);

module.exports = router;