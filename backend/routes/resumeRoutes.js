const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const upload = require('../config/multer');
const { uploadResume, getResume } = require('../controllers/resumeController');

router.post('/upload', verifyToken, upload.single('file'), uploadResume);
router.put('/update', verifyToken, upload.single('file'), uploadResume);
router.get('/', verifyToken, getResume);

module.exports = router;