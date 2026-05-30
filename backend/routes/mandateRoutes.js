const express = require('express');
const router = express.Router();
const {
  createMandate,
  getAllMandates,
  getMandateById,
  updateMandateStatus
} = require('../controllers/mandateController');
const { protect } = require(
  '../middleware/authMiddleware'
);

router.route('/')
  .post(protect, createMandate)
  .get(protect, getAllMandates);

router.route('/:id')
  .get(protect, getMandateById)
  .put(protect, updateMandateStatus);

module.exports = router;
