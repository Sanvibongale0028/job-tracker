const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const  {
    addApplication,
    getApplications,
    updateApplication,
    deleteApplication,
    getStats,
    getAnalytics
} = require('../controllers/applicationController');

router.post('/', verifyToken, addApplication);
router.get('/', verifyToken, getApplications);
router.get('/stats', verifyToken, getStats);
router.get('/analytics', verifyToken, getAnalytics);
router.put('/:id', verifyToken, updateApplication);
router.delete('/:id', verifyToken, deleteApplication);

module.exports = router;