const AIService = require('../services/aiService');
const PaymentAnalytics = require('../models/PaymentAnalytics');
const RevenueForecast = require('../models/RevenueForecast');
const SmartReminder = require('../models/SmartReminder');
const Mandate = require('../models/Mandate');

// =================== RISK SCORE ENDPOINTS ===================

exports.getMandateRiskScore = async (req, res) => {
  try {
    const { mandateId } = req.params;
    
    const riskAssessment = await AIService.calculateRiskScore(mandateId);
    
    res.status(200).json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllMandatesRiskScores = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all mandates for this user
    const mandates = await Mandate.find({ user: userId });
    
    // Calculate risk scores for all
    const riskScores = await Promise.all(
      mandates.map(m => AIService.calculateRiskScore(m._id))
    );
    
    // Organize by risk level
    const grouped = {
      high: riskScores.filter(r => r.riskLevel === 'High'),
      medium: riskScores.filter(r => r.riskLevel === 'Medium'),
      low: riskScores.filter(r => r.riskLevel === 'Low')
    };
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: riskScores.length,
          high: grouped.high.length,
          medium: grouped.medium.length,
          low: grouped.low.length
        },
        byRiskLevel: grouped,
        allRiskScores: riskScores
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMandateAnalytics = async (req, res) => {
  try {
    const { mandateId } = req.params;
    
    const analytics = await PaymentAnalytics.findOne({ mandate: mandateId });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'No analytics found for this mandate'
      });
    }
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================== REVENUE FORECAST ENDPOINTS ===================

exports.getRevenueForcast = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const forecast = await AIService.forecastRevenue(userId);
    
    res.status(200).json({
      success: true,
      data: forecast
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRevenueMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let forecast = await RevenueForecast.findOne({ user: userId });
    
    if (!forecast) {
      forecast = await AIService.forecastRevenue(userId);
    }
    
    const metrics = {
      expectedThisMonth: forecast.expectedCollectionThisMonth || 0,
      expectedThisQuarter: forecast.expectedCollectionThisQuarter || 0,
      averageMonthly: forecast.averageMonthlyRevenue || 0,
      growthRate: forecast.growthRate || 0,
      volatility: forecast.volatility || 0,
      riskLevel: forecast.collectionRiskLevel,
      mandatesAtRisk: forecast.mandatesAtRisk,
      nextMonthForecast: forecast.forecast && forecast.forecast.length > 0 
        ? forecast.forecast[0] 
        : null
    };
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getRevenueInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let forecast = await RevenueForecast.findOne({ user: userId });
    
    if (!forecast) {
      forecast = await AIService.forecastRevenue(userId);
    }
    
    res.status(200).json({
      success: true,
      data: {
        insights: forecast.insights || [],
        metrics: {
          expectedThisMonth: forecast.expectedCollectionThisMonth,
          expectedThisQuarter: forecast.expectedCollectionThisQuarter,
          mandatesAtRisk: forecast.mandatesAtRisk,
          riskLevel: forecast.collectionRiskLevel
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMonthlyForecast = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let forecast = await RevenueForecast.findOne({ user: userId });
    
    if (!forecast) {
      forecast = await AIService.forecastRevenue(userId);
    }
    
    res.status(200).json({
      success: true,
      data: {
        forecast: forecast.forecast || [],
        historicalRevenue: forecast.historicalRevenue || [],
        averageMonthly: forecast.averageMonthlyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================== SMART REMINDER ENDPOINTS ===================

exports.getOptimalReminderTiming = async (req, res) => {
  try {
    const { mandateId } = req.params;
    
    const reminder = await AIService.calculateOptimalReminderTiming(mandateId);
    
    res.status(200).json({
      success: true,
      data: {
        recommendedTiming: reminder.recommendedReminderTiming,
        customerBehavior: reminder.customerPaymentBehavior,
        effectiveness: reminder.reminderEffectivenessScore,
        bestTimings: reminder.bestReminderTimings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reminders = await SmartReminder.find({ user: userId })
      .populate('mandate', 'payeeName amount frequency')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMessagePreference = async (req, res) => {
  try {
    const { mandateId } = req.params;
    const { language, tone } = req.body;
    
    const reminder = await SmartReminder.findOne({ mandate: mandateId });
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    
    if (language) reminder.messagePreference.language = language;
    if (tone) reminder.messagePreference.tone = tone;
    
    await reminder.save();
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================== DASHBOARD OVERVIEW ===================

exports.getAIDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get risk scores
    const mandates = await Mandate.find({ user: userId, status: 'Active' });
    const riskScores = await Promise.all(
      mandates.map(m => AIService.calculateRiskScore(m._id))
    );
    
    // Get revenue forecast
    let forecast = await RevenueForecast.findOne({ user: userId });
    if (!forecast) {
      forecast = await AIService.forecastRevenue(userId);
    }
    
    // Get reminders
    const reminders = await SmartReminder.find({ user: userId });
    
    const overview = {
      riskMetrics: {
        total: riskScores.length,
        high: riskScores.filter(r => r.riskLevel === 'High').length,
        medium: riskScores.filter(r => r.riskLevel === 'Medium').length,
        low: riskScores.filter(r => r.riskLevel === 'Low').length,
        averageRiskScore: Math.round(
          riskScores.reduce((sum, r) => sum + r.riskScore, 0) / riskScores.length
        )
      },
      revenueMetrics: {
        expectedThisMonth: forecast.expectedCollectionThisMonth || 0,
        expectedThisQuarter: forecast.expectedCollectionThisQuarter || 0,
        averageMonthly: forecast.averageMonthlyRevenue || 0,
        growthRate: forecast.growthRate || 0,
        riskLevel: forecast.collectionRiskLevel
      },
      mandatesAtRisk: forecast.mandatesAtRisk,
      topInsights: forecast.insights ? forecast.insights.slice(0, 3) : [],
      remindersConfigured: reminders.length,
      nextMonth: forecast.forecast && forecast.forecast.length > 0 
        ? forecast.forecast[0] 
        : null
    };
    
    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================== DATA SYNC ENDPOINTS ===================

/**
 * Sync payment data to update analytics
 * Called whenever a payment is processed
 */
exports.syncPaymentData = async (req, res) => {
  try {
    const { mandateId, paymentData } = req.body;
    
    let analytics = await PaymentAnalytics.findOne({ mandate: mandateId });
    if (!analytics) {
      analytics = new PaymentAnalytics({ mandate: mandateId });
    }
    
    // Add to payment history
    analytics.paymentHistory.push({
      date: new Date(),
      amount: paymentData.amount,
      status: paymentData.status,
      failureReason: paymentData.failureReason,
      retryCount: paymentData.retryCount || 0
    });
    
    // Update totals
    analytics.totalPaymentAttempts += 1;
    if (paymentData.status === 'success') {
      analytics.successfulPayments += 1;
    } else if (paymentData.status === 'failed') {
      analytics.failedPayments += 1;
      
      // Track failure reason
      const existingReason = analytics.failureReasons.find(r => r.reason === paymentData.failureReason);
      if (existingReason) {
        existingReason.count += 1;
        existingReason.lastOccurred = new Date();
      } else {
        analytics.failureReasons.push({
          reason: paymentData.failureReason,
          count: 1,
          lastOccurred: new Date()
        });
      }
    }
    
    // Update success rate
    analytics.paymentSuccessRate = Math.round(
      (analytics.successfulPayments / analytics.totalPaymentAttempts) * 100
    );
    
    // Update last activity
    analytics.lastActivityDate = new Date();
    analytics.inactiveForDays = 0;
    
    await analytics.save();
    
    // Recalculate risk score
    const riskAssessment = await AIService.calculateRiskScore(mandateId);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Payment data synced successfully',
        riskAssessment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Trigger recalculation of all AI metrics for a user
 */
exports.recalculateAllMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const mandates = await Mandate.find({ user: userId });
    
    // Recalculate risk scores
    await Promise.all(
      mandates.map(m => AIService.calculateRiskScore(m._id))
    );
    
    // Recalculate revenue forecast
    await AIService.forecastRevenue(userId);
    
    // Recalculate reminder timings
    await Promise.all(
      mandates.map(m => AIService.calculateOptimalReminderTiming(m._id))
    );
    
    res.status(200).json({
      success: true,
      message: 'All AI metrics recalculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
