const mongoose = require('mongoose');

const paymentAnalyticsSchema = new mongoose.Schema({
  mandate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandate',
    required: true,
    unique: true
  },
  // Payment History
  totalPaymentAttempts: { type: Number, default: 0 },
  successfulPayments: { type: Number, default: 0 },
  failedPayments: { type: Number, default: 0 },
  paymentSuccessRate: { type: Number, default: 0 }, // percentage
  
  // Failure Analysis
  failureReasons: [{
    reason: String, // network_error, insufficient_funds, etc.
    count: { type: Number, default: 0 },
    lastOccurred: Date
  }],
  
  // Timing Analysis
  averagePaymentGapDays: { type: Number, default: 0 },
  paymentGaps: [{ type: Number }], // array of days between payments
  mostCommonPaymentDay: { type: Number, default: null }, // 0-6, where 0 = Sunday
  averageDaysLate: { type: Number, default: 0 },
  
  // Risk Scoring
  riskScore: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  riskFactors: [{
    factor: String,
    weight: Number,
    description: String
  }],
  
  // Payment Timeline
  paymentHistory: [{
    date: Date,
    amount: Number,
    status: { 
      type: String, 
      enum: ['success', 'failed', 'pending']
    },
    failureReason: String,
    retryCount: { type: Number, default: 0 }
  }],
  
  // Predictions
  nextPaymentDueDate: Date,
  predictedPaymentDate: Date,
  probabilityOfSuccess: { type: Number, min: 0, max: 100, default: 50 },
  estimatedRevenueCycle: { type: Number, default: 0 }, // in days
  
  // Churn Risk
  churnRiskScore: { type: Number, min: 0, max: 100, default: 0 },
  lastActivityDate: Date,
  inactiveForDays: { type: Number, default: 0 },
  
  updatedAt: { type: Date, default: Date.now },
  calculatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
paymentAnalyticsSchema.index({ mandate: 1 });
paymentAnalyticsSchema.index({ riskLevel: 1 });
paymentAnalyticsSchema.index({ riskScore: 1 });

module.exports = mongoose.model('PaymentAnalytics', paymentAnalyticsSchema);
