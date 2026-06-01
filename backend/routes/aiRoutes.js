const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// =================== RISK SCORE ROUTES ===================
router.get('/risk/mandate/:mandateId', aiController.getMandateRiskScore);
router.get('/risk/all', aiController.getAllMandatesRiskScores);
router.get('/analytics/mandate/:mandateId', aiController.getMandateAnalytics);

// =================== REVENUE FORECAST ROUTES ===================
router.get('/forecast/revenue', aiController.getRevenueForcast);
router.get('/forecast/metrics', aiController.getRevenueMetrics);
router.get('/forecast/insights', aiController.getRevenueInsights);
router.get('/forecast/monthly', aiController.getMonthlyForecast);

// =================== SMART REMINDER ROUTES ===================
router.get('/reminder/optimal/:mandateId', aiController.getOptimalReminderTiming);
router.get('/reminders/all', aiController.getAllReminders);
router.put('/reminder/preference/:mandateId', aiController.updateMessagePreference);

// =================== DASHBOARD ROUTES ===================
router.get('/dashboard/overview', aiController.getAIDashboardOverview);

// =================== DATA SYNC ROUTES ===================
router.post('/sync/payment', aiController.syncPaymentData);
router.post('/recalculate', aiController.recalculateAllMetrics);

module.exports = router;
