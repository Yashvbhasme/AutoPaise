const express = require('express');
const router = express.Router();
const {
  initiateMandateOnRazorpay,
  getMandatePaymentLink,
  syncMandatePaymentStatus,
  handleWebhook
} = require('../controllers/razorpayController');
const { protect } = require(
  '../middleware/authMiddleware'
);

router.post('/initiate', protect, 
  initiateMandateOnRazorpay);
router.get('/payment-link/:id', protect, 
  getMandatePaymentLink);
router.post('/payment-link/:id/sync', protect,
  syncMandatePaymentStatus);
router.post('/webhook', handleWebhook);

module.exports = router;
