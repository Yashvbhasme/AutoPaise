const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@recurpay.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    await Admin.create({
      name: 'Super Admin',
      email: 'admin@recurpay.com',
      password: 'Admin@123456',
    });

    console.log('Admin account created successfully ✅');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
