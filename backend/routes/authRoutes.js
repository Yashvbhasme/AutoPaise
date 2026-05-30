const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateBankDetails,
  getBankDetails,
  updateRazorpayAccount,
  getRazorpayAccount
} = require('../controllers/authController');
const { protect } = require(
  '../middleware/authMiddleware'
);

const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/bank-details', protect, upload.single('passbook'), updateBankDetails);
router.get('/bank-details', protect, getBankDetails);
router.put('/razorpay-account', protect, updateRazorpayAccount);
router.get('/razorpay-account', protect, getRazorpayAccount);

module.exports = router;
