const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { exportToExcel, exportToPDF } = require('../controllers/exportController');

router.get('/excel', verifyToken, exportToExcel);
router.get('/pdf', verifyToken, exportToPDF);

module.exports = router;