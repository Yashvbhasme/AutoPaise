const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  mobile: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  bankDetails: {
    accountName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    ifscCode: { type: String, default: null },
    bankName: { type: String, default: null },
    accountType: { 
      type: String, 
      enum: ['Savings', 'Current'], 
      default: 'Savings' 
    },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: [
        'not_submitted',
        'pending_review', 
        'verified',
        'rejected'
      ],
      default: 'not_submitted'
    },
    rejectionReason: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
  },
  razorpayAccount: {
    keyId: { type: String, default: null },
    keySecret: { type: String, default: null },
    mode: {
      type: String,
      enum: ['test', 'live'],
      default: 'test'
    },
    isConfigured: { type: Boolean, default: false },
    updatedAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
