const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Mandate = require('../models/Mandate');
const sendEmail = require('../utils/email');

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Stats
exports.getStats = async (req, res) => {
  try {
    const totalOwners = await User.countDocuments();
    const pendingVerification = await User.countDocuments({
      'bankDetails.verificationStatus': 'pending_review'
    });
    const verifiedOwners = await User.countDocuments({
      'bankDetails.verificationStatus': 'verified'
    });
    const rejectedOwners = await User.countDocuments({
      'bankDetails.verificationStatus': 'rejected'
    });
    const activeOwners = await User.countDocuments({ isActive: true });
    const deactivatedOwners = await User.countDocuments({ isActive: false });
    const totalMandates = await Mandate.countDocuments();
    const activeMandates = await Mandate.countDocuments({ status: 'Active' });
    const totalRevenue = await Mandate.aggregate([
      { $match: { status: 'Active' } },
      { $group: { 
        _id: null, 
        total: { 
          $sum: { 
            $multiply: ['$amount', '$completedPayments'] 
          } 
        } 
      }}
    ]);

    res.json({
      success: true,
      stats: {
        totalOwners,
        pendingVerification,
        verifiedOwners,
        rejectedOwners,
        activeOwners,
        deactivatedOwners,
        totalMandates,
        activeMandates,
        totalRevenue: totalRevenue[0]?.total || 0,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Owners with filters
exports.getAllOwners = async (req, res) => {
  try {
    const { status, active } = req.query;
    let filter = {};

    if (status && status !== 'all') {
      filter['bankDetails.verificationStatus'] = status;
    }
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const owners = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Add mandate count to each owner
    const ownersWithStats = await Promise.all(
      owners.map(async (owner) => {
        const mandateCount = await Mandate.countDocuments({ user: owner._id });
        const activeMandates = await Mandate.countDocuments({ user: owner._id, status: 'Active' });
        return {
          ...owner.toObject(),
          mandateCount,
          activeMandates,
        };
      })
    );

    res.json({
      success: true,
      count: owners.length,
      owners: ownersWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Owner By ID
exports.getOwnerById = async (req, res) => {
  try {
    const owner = await User.findById(req.params.id).select('-password');
    
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const mandates = await Mandate.find({ user: req.params.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      owner,
      mandates,
      totalMandates: mandates.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify Owner Bank Details
exports.verifyOwner = async (req, res) => {
  try {
    const owner = await User.findByIdAndUpdate(
      req.params.id,
      {
        'bankDetails.isVerified': true,
        'bankDetails.verificationStatus': 'verified',
        'bankDetails.verifiedAt': new Date(),
        'bankDetails.rejectionReason': null,
      },
      { new: true }
    ).select('-password');

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    res.json({
      success: true,
      message: 'Bank details verified! ✅',
      owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reject Owner Bank Details
exports.rejectOwner = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const owner = await User.findByIdAndUpdate(
      req.params.id,
      {
        'bankDetails.isVerified': false,
        'bankDetails.verificationStatus': 'rejected',
        'bankDetails.rejectionReason': reason,
      },
      { new: true }
    ).select('-password');

    // Automatically notify the user via email
    await sendEmail({
      email: owner.email,
      subject: 'Bank Verification Failed - RecurPay',
      message: `Hello ${owner.name},\n\nUnfortunately, your bank details were rejected during the verification process.\n\nReason: ${reason}\n\nPlease log into your dashboard and submit corrected details to resume mandate collection.`,
    });

    res.json({
      success: true,
      message: 'Bank details rejected',
      owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle Account Active/Deactivate
exports.toggleOwnerStatus = async (req, res) => {
  try {
    const { reason } = req.body;
    const owner = await User.findById(req.params.id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    owner.isActive = !owner.isActive;
    await owner.save();

    // If deactivating pause all active mandates and send email notification
    if (!owner.isActive) {
      await Mandate.updateMany(
        { user: owner._id, status: 'Active' },
        { status: 'Paused' }
      );

      if (reason) {
        await sendEmail({
          email: owner.email,
          subject: 'Account Deactivated - RecurPay',
          message: `Hello ${owner.name},\n\nYour business account has been deactivated.\n\nReason: ${reason}\n\nPlease contact support if you believe this is an error.`,
        });
      }
    }

    res.json({
      success: true,
      message: owner.isActive
        ? 'Account activated successfully! ✅'
        : 'Account deactivated successfully! ⛔',
      isActive: owner.isActive,
      owner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Mandates
exports.getAllMandates = async (req, res) => {
  try {
    const mandates = await Mandate.find()
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: mandates.length,
      mandates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
