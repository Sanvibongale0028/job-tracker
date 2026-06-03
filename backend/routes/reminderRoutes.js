const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { addReminder } = require('../controllers/reminderController');

router.post('/', verifyToken, addReminder);

module.exports = router;