const PaymentAnalytics = require('../models/PaymentAnalytics');
const RevenueForecast = require('../models/RevenueForecast');
const SmartReminder = require('../models/SmartReminder');
const Mandate = require('../models/Mandate');

// =================== RISK SCORE CALCULATION ===================

/**
 * Calculate payment failure risk for a mandate
 * Risk Score: 0-100 (higher = riskier)
 * 
 * Factors:
 * - Payment Success Rate (40%)
 * - Average Days Late (20%)
 * - Recent Failure Trend (15%)
 * - Inactivity Duration (15%)
 * - Mandate Age (10%)
 */
class AIService {
  
  static async calculateRiskScore(mandateId) {
    try {
      const mandate = await Mandate.findById(mandateId).populate('user');
      if (!mandate) throw new Error('Mandate not found');
      
      let analytics = await PaymentAnalytics.findOne({ mandate: mandateId });
      if (!analytics) {
        // Create new analytics record
        analytics = new PaymentAnalytics({ mandate: mandateId });
      }
      
      let riskScore = 0;
      const riskFactors = [];
      
      // Factor 1: Payment Success Rate (40% weight)
      if (analytics.totalPaymentAttempts > 0) {
        const successRate = (analytics.successfulPayments / analytics.totalPaymentAttempts) * 100;
        const successRateFactor = Math.max(0, 100 - successRate);
        const successRiskContribution = (successRateFactor / 100) * 40;
        riskScore += successRiskContribution;
        
        riskFactors.push({
          factor: 'Payment Success Rate',
          weight: 40,
          description: `Success rate: ${successRate.toFixed(1)}%`
        });
      } else {
        // New mandate - neutral risk
        riskFactors.push({
          factor: 'New Mandate',
          weight: 0,
          description: 'No payment history yet'
        });
      }
      
      // Factor 2: Average Days Late (20% weight)
      if (analytics.averageDaysLate > 0) {
        // Maximum risk at 10+ days late
        const lateFactor = Math.min(100, (analytics.averageDaysLate / 10) * 100);
        const lateRiskContribution = (lateFactor / 100) * 20;
        riskScore += lateRiskContribution;
        
        riskFactors.push({
          factor: 'Payment Delays',
          weight: 20,
          description: `Average ${analytics.averageDaysLate.toFixed(1)} days late`
        });
      }
      
      // Factor 3: Recent Failure Trend (15% weight)
      const recentFailures = this._getRecentFailureCount(analytics.paymentHistory, 3); // last 3 payments
      if (recentFailures > 0) {
        const recentFailureFactor = Math.min(100, (recentFailures / 3) * 100);
        const failureRiskContribution = (recentFailureFactor / 100) * 15;
        riskScore += failureRiskContribution;
        
        riskFactors.push({
          factor: 'Recent Failures',
          weight: 15,
          description: `${recentFailures} failures in last 3 payments`
        });
      }
      
      // Factor 4: Inactivity Duration (15% weight)
      if (analytics.lastActivityDate) {
        const daysSinceActivity = Math.floor(
          (new Date() - new Date(analytics.lastActivityDate)) / (1000 * 60 * 60 * 24)
        );
        // Maximum risk at 90+ days inactive
        const inactivityFactor = Math.min(100, (daysSinceActivity / 90) * 100);
        const inactivityRiskContribution = (inactivityFactor / 100) * 15;
        riskScore += inactivityRiskContribution;
        
        riskFactors.push({
          factor: 'Inactivity',
          weight: 15,
          description: `No activity for ${daysSinceActivity} days`
        });
      }
      
      // Factor 5: Mandate Age (10% weight)
      const mandateAgeDays = Math.floor(
        (new Date() - new Date(mandate.createdAt)) / (1000 * 60 * 60 * 24)
      );
      
      let ageFactor = 0;
      if (mandateAgeDays < 30) {
        // New mandates get slight benefit of doubt
        ageFactor = 20;
      } else if (mandateAgeDays < 90) {
        ageFactor = 10;
      }
      // Older mandates with consistent performance = lower risk
      if (analytics.successfulPayments > 5 && analytics.failedPayments === 0) {
        ageFactor = Math.max(0, ageFactor - 20);
      }
      
      const ageRiskContribution = (Math.max(0, ageFactor) / 100) * 10;
      riskScore += ageRiskContribution;
      
      riskFactors.push({
        factor: 'Mandate Age',
        weight: 10,
        description: `${mandateAgeDays} days old`
      });
      
      // Determine risk level
      let riskLevel = 'Low';
      if (riskScore >= 70) riskLevel = 'High';
      else if (riskScore >= 40) riskLevel = 'Medium';
      
      // Calculate probability of success
      const probabilityOfSuccess = Math.max(0, Math.min(100, 100 - riskScore));
      
      // Save analytics
      analytics.riskScore = Math.round(riskScore);
      analytics.riskLevel = riskLevel;
      analytics.riskFactors = riskFactors;
      analytics.probabilityOfSuccess = Math.round(probabilityOfSuccess);
      analytics.calculatedAt = new Date();
      
      await analytics.save();
      
      return {
        riskScore: Math.round(riskScore),
        riskLevel,
        probabilityOfSuccess: Math.round(probabilityOfSuccess),
        riskFactors,
        analysisDate: new Date()
      };
    } catch (error) {
      console.error('Error calculating risk score:', error);
      throw error;
    }
  }
  
  static _getRecentFailureCount(paymentHistory, count = 3) {
    if (!paymentHistory || paymentHistory.length === 0) return 0;
    const recent = paymentHistory.slice(-count);
    return recent.filter(p => p.status === 'failed').length;
  }
  
  // =================== REVENUE FORECASTING ===================
  
  /**
   * Forecast monthly revenue for next 3-6 months
   * Uses historical payment data and trends
   */
  static async forecastRevenue(userId) {
    try {
      const mandates = await Mandate.find({ user: userId, status: 'Active' });
      
      let forecast = await RevenueForecast.findOne({ user: userId });
      if (!forecast) {
        forecast = new RevenueForecast({ user: userId });
      }
      
      // Aggregate mandate analytics
      const allAnalytics = await PaymentAnalytics.find({
        mandate: { $in: mandates.map(m => m._id) }
      });
      
      // Calculate historical monthly revenue
      const historicalRevenue = this._calculateHistoricalRevenue(allAnalytics);
      forecast.historicalRevenue = historicalRevenue;
      
      // Calculate average monthly revenue
      if (historicalRevenue.length > 0) {
        const totalHistoricalRevenue = historicalRevenue.reduce((sum, m) => sum + m.amount, 0);
        forecast.averageMonthlyRevenue = Math.round(totalHistoricalRevenue / historicalRevenue.length);
      }
      
      // Generate forecast for next 6 months
      const nextMonthsForecast = this._generateMonthlyForecast(
        historicalRevenue,
        mandates,
        6
      );
      forecast.forecast = nextMonthsForecast;
      
      // Calculate expected revenue metrics
      const thisMonth = nextMonthsForecast.find(f => {
        const date = new Date();
        return f.month === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      });
      forecast.expectedCollectionThisMonth = thisMonth?.predictedAmount || 0;
      
      const thisQuarter = nextMonthsForecast.filter(f => {
        const date = new Date();
        const currentMonth = date.getMonth() + 1;
        const quarterStart = Math.floor((currentMonth - 1) / 3) * 3 + 1;
        const quarterEnd = quarterStart + 2;
        const fMonth = parseInt(f.month.split('-')[1]);
        return fMonth >= quarterStart && fMonth <= quarterEnd;
      });
      forecast.expectedCollectionThisQuarter = thisQuarter.reduce((sum, m) => sum + m.predictedAmount, 0);
      
      // Calculate total expected monthly revenue from all active mandates
      forecast.totalExpectedMonthlyRevenue = mandates.reduce((sum, m) => {
        if (m.frequency === 'Monthly') {
          return sum + m.amount;
        } else if (m.frequency === 'Quarterly') {
          return sum + (m.amount / 3);
        }
        return sum;
      }, 0);
      
      // Calculate trends
      const revenues = historicalRevenue.map(h => h.amount);
      forecast.growthRate = this._calculateGrowthRate(revenues);
      forecast.volatility = this._calculateVolatility(revenues);
      
      // Assess collection risk
      const highRiskCount = allAnalytics.filter(a => a.riskLevel === 'High').length;
      const mediumRiskCount = allAnalytics.filter(a => a.riskLevel === 'Medium').length;
      const lowRiskCount = allAnalytics.filter(a => a.riskLevel === 'Low').length;
      
      forecast.mandatesAtRisk = {
        high: highRiskCount,
        medium: mediumRiskCount,
        low: lowRiskCount
      };
      
      forecast.collectionRiskLevel = highRiskCount > mandates.length * 0.3 ? 'High' : 
                                      mediumRiskCount > mandates.length * 0.5 ? 'Medium' : 'Low';
      
      // Generate AI insights
      forecast.insights = this._generateInsights(forecast, allAnalytics, mandates);
      
      forecast.lastCalculatedAt = new Date();
      forecast.nextCalculationDue = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await forecast.save();
      
      return forecast;
    } catch (error) {
      console.error('Error forecasting revenue:', error);
      throw error;
    }
  }
  
  static _calculateHistoricalRevenue(analytics) {
    const monthlyData = {};
    
    analytics.forEach(a => {
      if (a.paymentHistory && a.paymentHistory.length > 0) {
        a.paymentHistory.forEach(payment => {
          const date = new Date(payment.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthKey,
              amount: 0,
              successfulPayments: 0,
              failedPayments: 0
            };
          }
          
          if (payment.status === 'success') {
            monthlyData[monthKey].amount += payment.amount;
            monthlyData[monthKey].successfulPayments += 1;
          } else if (payment.status === 'failed') {
            monthlyData[monthKey].failedPayments += 1;
          }
        });
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  static _generateMonthlyForecast(historicalRevenue, mandates, months) {
    const forecast = [];
    const avgRevenue = historicalRevenue.length > 0
      ? historicalRevenue.reduce((sum, m) => sum + m.amount, 0) / historicalRevenue.length
      : 0;
    
    const today = new Date();
    
    for (let i = 0; i < months; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Base prediction on average with slight variance
      const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
      const predictedAmount = Math.round(avgRevenue * (1 + variance));
      
      // Confidence decreases over time
      const confidence = Math.max(50, 95 - (i * 5));
      
      forecast.push({
        month: monthStr,
        predictedAmount: Math.max(0, predictedAmount),
        confidence,
        lowEstimate: Math.round(predictedAmount * 0.85),
        highEstimate: Math.round(predictedAmount * 1.15)
      });
    }
    
    return forecast;
  }
  
  static _calculateGrowthRate(revenues) {
    if (revenues.length < 2) return 0;
    const oldRevenue = revenues[0];
    const newRevenue = revenues[revenues.length - 1];
    return ((newRevenue - oldRevenue) / oldRevenue) * 100;
  }
  
  static _calculateVolatility(revenues) {
    if (revenues.length < 2) return 0;
    const mean = revenues.reduce((a, b) => a + b) / revenues.length;
    const variance = revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
    return Math.sqrt(variance);
  }
  
  static _generateInsights(forecast, allAnalytics, mandates) {
    const insights = [];
    
    // Insight 1: Risk Assessment
    if (forecast.mandatesAtRisk.high > 0) {
      insights.push({
        title: '⚠️ High-Risk Mandates Detected',
        description: `${forecast.mandatesAtRisk.high} mandate(s) showing high failure risk. Consider proactive follow-ups.`,
        type: 'warning',
        priority: 'High'
      });
    }
    
    // Insight 2: Collection Potential
    if (forecast.expectedCollectionThisMonth > 0) {
      insights.push({
        title: '💰 Expected Collection',
        description: `This month: ₹${forecast.expectedCollectionThisMonth.toLocaleString('en-IN')} | This quarter: ₹${forecast.expectedCollectionThisQuarter.toLocaleString('en-IN')}`,
        type: 'observation',
        priority: 'Medium'
      });
    }
    
    // Insight 3: Growth Trend
    if (forecast.growthRate > 5) {
      insights.push({
        title: '📈 Revenue Growing',
        description: `Your revenue is growing at ${forecast.growthRate.toFixed(1)}% month-over-month.`,
        type: 'opportunity',
        priority: 'Low'
      });
    } else if (forecast.growthRate < -5) {
      insights.push({
        title: '📉 Revenue Declining',
        description: `Revenue has declined by ${Math.abs(forecast.growthRate).toFixed(1)}%. Review mandate health.`,
        type: 'warning',
        priority: 'High'
      });
    }
    
    // Insight 4: Success Rate
    const avgSuccessRate = allAnalytics.length > 0
      ? (allAnalytics.reduce((sum, a) => sum + a.paymentSuccessRate, 0) / allAnalytics.length)
      : 100;
    
    if (avgSuccessRate < 80) {
      insights.push({
        title: '✓ Improve Payment Success',
        description: `Current success rate: ${avgSuccessRate.toFixed(1)}%. Target should be 95%+`,
        type: 'opportunity',
        priority: 'High'
      });
    }
    
    return insights;
  }
  
  // =================== SMART REMINDER TIMING ===================
  
  /**
   * Analyze payment behavior and suggest optimal reminder timing
   */
  static async calculateOptimalReminderTiming(mandateId) {
    try {
      const mandate = await Mandate.findById(mandateId);
      if (!mandate) throw new Error('Mandate not found');
      
      let reminder = await SmartReminder.findOne({ mandate: mandateId });
      if (!reminder) {
        reminder = new SmartReminder({
          mandate: mandateId,
          user: mandate.user
        });
      }
      
      const analytics = await PaymentAnalytics.findOne({ mandate: mandateId });
      
      // Analyze payment patterns
      if (analytics && analytics.paymentHistory && analytics.paymentHistory.length > 0) {
        const paymentHours = this._extractPaymentHours(analytics.paymentHistory);
        const optimalHour = this._getMostCommonHour(paymentHours);
        const optimalDay = this._calculateOptimalPaymentDay(analytics);
        
        // Calculate days before due date for optimal reminder
        let daysBefore = 1; // default
        
        if (analytics.averageDaysLate > 5) {
          daysBefore = 3; // Remind earlier for chronically late payers
        } else if (analytics.averageDaysLate > 2) {
          daysBefore = 2;
        }
        
        reminder.recommendedReminderTiming = {
          daysBefore,
          optimalHour,
          optimalDay
        };
        
        // Extract customer behavior
        reminder.customerPaymentBehavior = {
          averagePaymentDayOfMonth: analytics.mostCommonPaymentDay,
          averagePaymentTimeOfDay: this._timeToString(optimalHour),
          paymentOnTimePercentage: analytics.paymentSuccessRate,
          latePaymentTendency: {
            averageLateByDays: analytics.averageDaysLate,
            frequencyOfLatePayments: analytics.failedPayments
          }
        };
        
        // Calculate reminder effectiveness
        reminder.reminderEffectivenessScore = this._calculateReminderEffectiveness(
          analytics,
          reminder.reminders
        );
        
        // Generate best timing recommendations
        reminder.bestReminderTimings = this._generateBestTimings(analytics, reminder.reminders);
      } else {
        // Default for new mandates
        reminder.recommendedReminderTiming = {
          daysBefore: 1,
          optimalHour: 10,
          optimalDay: null
        };
      }
      
      reminder.updatedAt = new Date();
      await reminder.save();
      
      return reminder;
    } catch (error) {
      console.error('Error calculating reminder timing:', error);
      throw error;
    }
  }
  
  static _extractPaymentHours(paymentHistory) {
    return paymentHistory
      .filter(p => p.status === 'success')
      .map(p => new Date(p.date).getHours());
  }
  
  static _getMostCommonHour(hours) {
    if (hours.length === 0) return 10; // default morning hour
    const hourCounts = {};
    hours.forEach(h => {
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    return Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );
  }
  
  static _calculateOptimalPaymentDay(analytics) {
    // Return the most common day customers make payments
    // This helps schedule reminders for when they're active
    return analytics.mostCommonPaymentDay || null;
  }
  
  static _timeToString(hour) {
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
  
  static _calculateReminderEffectiveness(analytics, reminderHistory) {
    if (!reminderHistory || reminderHistory.length === 0) return 50;
    
    const successful = reminderHistory.filter(r => r.paymentStatus === 'success').length;
    const effectiveness = (successful / reminderHistory.length) * 100;
    
    return Math.round(effectiveness);
  }
  
  static _generateBestTimings(analytics, reminderHistory) {
    const timings = [
      { daysBeforeDue: 3, successRate: 70, averageResponseTime: 48 * 60 * 60 * 1000 },
      { daysBeforeDue: 2, successRate: 80, averageResponseTime: 36 * 60 * 60 * 1000 },
      { daysBeforeDue: 1, successRate: 85, averageResponseTime: 12 * 60 * 60 * 1000 }
    ];
    
    return timings;
  }
}

module.exports = AIService;
