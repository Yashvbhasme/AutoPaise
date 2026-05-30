const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name, email, password, mobile
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email and password'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        bankDetails: user.bankDetails,
        razorpayAccount: {
          keyId: user.razorpayAccount?.keyId || '',
          mode: user.razorpayAccount?.mode || 'test',
          isConfigured: Boolean(user.razorpayAccount?.isConfigured),
          updatedAt: user.razorpayAccount?.updatedAt || null
        },
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Bank Details
exports.updateBankDetails = async (req, res) => {
  try {
    const {
      accountName, accountNumber,
      ifscCode, bankName, accountType
    } = req.body;

    if (!accountName || !accountNumber || 
        !ifscCode || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'All bank details are required'
      });
    }

    console.log('[BankDetails] Auth Header:', req.headers.authorization);
    console.log('[BankDetails] Content-Type:', req.headers['content-type']);
    console.log('[BankDetails] Received req.body:', req.body);
    console.log('[BankDetails] Received req.file:', req.file);

    let passbookUrl = undefined;
    if (req.file) {
      passbookUrl = `/uploads/${req.file.filename}`;
      console.log('[BankDetails] File uploaded successfully to:', passbookUrl);
    } else {
      console.log('[BankDetails] No file was uploaded in this request.');
    }

    const previousUser = await User.findById(req.user._id);

    // Only update passbookUrl if a returning user uploaded a new one, 
    // otherwise preserve existing if there is one.
    const finalPassbookUrl = passbookUrl || previousUser.bankDetails?.passbookUrl || null;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        bankDetails: {
          accountName,
          accountNumber,
          ifscCode: ifscCode.toUpperCase(),
          bankName,
          accountType: accountType || 'Savings',
          passbookUrl: finalPassbookUrl,
          isVerified: false,
          verificationStatus: 'pending_review',
          rejectionReason: null,
          submittedAt: Date.now()
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Bank details saved successfully',
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Bank Details
exports.getBankDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('bankDetails name email');
    res.json({
      success: true,
      bankDetails: user.bankDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Razorpay Account
exports.updateRazorpayAccount = async (req, res) => {
  try {
    const { keyId, keySecret, mode } = req.body;

    if (!keyId || !keySecret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay key ID and key secret are required'
      });
    }

    const trimmedKeyId = keyId.trim();
    const trimmedKeySecret = keySecret.trim();
    const finalMode = mode === 'live' ? 'live' : 'test';

    if (finalMode === 'test' && !trimmedKeyId.startsWith('rzp_test_')) {
      return res.status(400).json({
        success: false,
        message: 'Test mode requires a Razorpay test key ID'
      });
    }

    if (finalMode === 'live' && !trimmedKeyId.startsWith('rzp_live_')) {
      return res.status(400).json({
        success: false,
        message: 'Live mode requires a Razorpay live key ID'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        razorpayAccount: {
          keyId: trimmedKeyId,
          keySecret: trimmedKeySecret,
          mode: finalMode,
          isConfigured: true,
          updatedAt: Date.now()
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Razorpay account saved successfully',
      user,
      razorpayAccount: {
        keyId: user.razorpayAccount.keyId,
        mode: user.razorpayAccount.mode,
        isConfigured: user.razorpayAccount.isConfigured,
        updatedAt: user.razorpayAccount.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Razorpay Account
exports.getRazorpayAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('razorpayAccount');

    res.json({
      success: true,
      razorpayAccount: {
        keyId: user.razorpayAccount?.keyId || '',
        mode: user.razorpayAccount?.mode || 'test',
        isConfigured: Boolean(user.razorpayAccount?.isConfigured),
        updatedAt: user.razorpayAccount?.updatedAt || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
