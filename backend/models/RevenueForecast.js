const mongoose = require('mongoose');

const revenueForecastSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Historical Data
  historicalRevenue: [{
    month: String, // YYYY-MM
    amount: Number,
    successfulPayments: Number,
    failedPayments: Number
  }],
  
  // Forecast
  forecast: [{
    month: String, // YYYY-MM
    predictedAmount: Number,
    confidence: Number, // 0-100
    lowEstimate: Number,
    highEstimate: Number
  }],
  
  // Current Metrics
  totalExpectedMonthlyRevenue: Number,
  expectedCollectionThisMonth: Number,
  expectedCollectionThisQuarter: Number,
  averageMonthlyRevenue: Number,
  
  // Trends
  growthRate: Number, // percentage
  volatility: Number, // standard deviation
  seasonalityPattern: String, // none, seasonal, trending
  
  // Risk Assessment
  collectionRiskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  mandatesAtRisk: {
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  },
  
  // AI Insights
  insights: [{
    title: String,
    description: String,
    type: { type: String }, // observation, warning, opportunity
    priority: { type: String, enum: ['High', 'Medium', 'Low'] },
    createdAt: { type: Date, default: Date.now }
  }],
  
  lastCalculatedAt: { type: Date, default: Date.now },
  nextCalculationDue: { type: Date }
});

module.exports = mongoose.model('RevenueForecast', revenueForecastSchema);
