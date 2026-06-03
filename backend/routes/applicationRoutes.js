const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const  {
    addApplication,
    getApplications,
    updateApplication,
    deleteApplication
} = require('../controllers/applicationController');

router.post('/', verifyToken, addApplication);
router.get('/', verifyToken, getApplications);
router.put('/:id', verifyToken, updateApplication);
router.delete('/:id', verifyToken, deleteApplication);

module.exports = router;