const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/login', admin.adminLogin);
router.get('/stats', protectAdmin, admin.getStats);
router.get('/owners', protectAdmin, admin.getAllOwners);
router.get('/owners/:id', protectAdmin, admin.getOwnerById);
router.put('/owners/:id/verify', protectAdmin, admin.verifyOwner);
router.put('/owners/:id/reject', protectAdmin, admin.rejectOwner);
router.put('/owners/:id/toggle-status', protectAdmin, admin.toggleOwnerStatus);
router.get('/mandates', protectAdmin, admin.getAllMandates);

module.exports = router;
