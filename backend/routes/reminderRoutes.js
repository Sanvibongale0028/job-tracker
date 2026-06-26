const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { addReminder, getReminders } = require('../controllers/reminderController');

router.post('/', verifyToken, addReminder);
router.get('/', verifyToken, getReminders);

module.exports = router;