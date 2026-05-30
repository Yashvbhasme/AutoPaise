const mongoose = require('mongoose');

const mandateSchema = new mongoose.Schema({
  mandateId: { 
    type: String, 
    unique: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  payeeName: { 
    type: String, 
    required: true 
  },
  payeeUpiId: { 
    type: String, 
    required: true 
  },
  customerEmail: { 
    type: String, 
    default: null 
  },
  customerPhone: { 
    type: String, 
    default: null 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  maxAmountPerDebit: { 
    type: Number, 
    required: true 
  },
  frequency: { 
    type: String,
    enum: ['Monthly', 'Quarterly'],
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  purpose: { 
    type: String, 
    maxlength: 200,
    default: '' 
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Pending Approval',
      'Active',
      'Paused',
      'Cancelled',
      'Failed'
    ],
    default: 'Pending'
  },
  totalPayments: { 
    type: Number, 
    default: 0 
  },
  completedPayments: { 
    type: Number, 
    default: 0 
  },
  razorpayPaymentLinkId: { 
    type: String, 
    default: null 
  },
  shortUrl: { 
    type: String, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto generate mandateId and calculate payments
mandateSchema.pre('save', function(next) {
  if (!this.mandateId) {
    const year = new Date().getFullYear();
    const random = Math.floor(
      1000 + Math.random() * 9000
    );
    this.mandateId = `MND-${year}-${random}`;
  }

  if (this.startDate && this.endDate) {
    const months = Math.ceil(
      (new Date(this.endDate) - 
       new Date(this.startDate)) /
      (1000 * 60 * 60 * 24 * 30)
    );
    this.totalPayments = 
      this.frequency === 'Monthly'
        ? months
        : Math.ceil(months / 3);
  }

  next();
});

module.exports = mongoose.model(
  'Mandate', mandateSchema
);
