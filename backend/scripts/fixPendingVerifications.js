const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected');

  const result = await User.updateMany(
    { 
      'bankDetails.accountNumber': { $ne: null },
      'bankDetails.isVerified': false,
      'bankDetails.verificationStatus': { $ne: 'pending_review' }
    },
    {
      $set: {
        'bankDetails.verificationStatus': 'pending_review',
        'bankDetails.submittedAt': new Date()
      }
    }
  );

  console.log(`Fixed ${result.modifiedCount} users to be 'pending_review'`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
