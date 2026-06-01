const mongoose = require('mongoose');

const smartReminderSchema = new mongoose.Schema({
  mandate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mandate',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Recommended Timing
  recommendedReminderTiming: {
    daysBefore: { type: Number, default: 1 }, // days before due date
    optimalHour: { type: Number, default: 10 }, // hour of day (0-23)
    optimalDay: { type: Number, default: null } // 0-6 (Monday = 1, Friday = 5, etc.)
  },
  
  // Timing Analysis
  customerPaymentBehavior: {
    averagePaymentDayOfMonth: Number,
    averagePaymentTimeOfDay: String, // "morning", "afternoon", "evening", "night"
    paymentOnTimePercentage: Number,
    latePaymentTendency: {
      averageLateByDays: Number,
      frequencyOfLatePayments: Number
    }
  },
  
  // Reminder History
  reminders: [{
    sentAt: Date,
    timing: { // relative to due date
      daysBeforeDue: Number,
      hourOfDay: Number
    },
    responseTime: Number, // milliseconds to payment after reminder
    paymentStatus: String, // success, failed, pending
    wasEffective: Boolean
  }],
  
  // ML Insights
  reminderEffectivenessScore: { type: Number, min: 0, max: 100, default: 50 },
  bestReminderTimings: [{
    daysBeforeDue: Number,
    successRate: Number,
    averageResponseTime: Number
  }],
  
  // Personalized Messages
  messagePreference: {
    language: { type: String, enum: ['English', 'Hindi', 'Marathi'], default: 'English' },
    tone: { type: String, enum: ['formal', 'friendly', 'urgent'], default: 'friendly' },
    includeAmount: { type: Boolean, default: true }
  },
  
  // Next Reminder
  nextReminderScheduled: Date,
  lastReminderSent: Date,
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SmartReminder', smartReminderSchema);
