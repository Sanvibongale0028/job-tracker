const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { analyzeResume } = require('../controllers/resumeAnalyzerController');

router.get('/analyze', verifyToken, analyzeResume);

module.exports = router;