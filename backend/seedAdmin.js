const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected for seeder');

    const adminExists = await User.findOne({ email: 'admin@autopaise.com' });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit();
    }

    await User.create({
      name: 'Admin AutoPaise',
      email: 'admin@autopaise.com',
      password: 'superuser123',
      mobile: '9999999999',
      role: 'admin'
    });

    console.log('Admin created successfully! (admin@autopaise.com / superuser123)');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
