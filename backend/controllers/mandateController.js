const Mandate = require('../models/Mandate');
const { syncMandateWithRazorpay, syncPendingMandatesForUser } = require('../utils/paymentSync');

// Create Mandate
exports.createMandate = async (req, res) => {
  try {
    const {
      payeeName, payeeUpiId, amount,
      maxAmountPerDebit, frequency,
      startDate, endDate, purpose,
      customerEmail, customerPhone
    } = req.body;

    if (!payeeName || !payeeUpiId || 
        !amount || !frequency || 
        !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    const mandate = await Mandate.create({
      user: req.user._id,
      payeeName,
      payeeUpiId,
      amount: Number(amount),
      maxAmountPerDebit: Number(maxAmountPerDebit),
      frequency,
      startDate,
      endDate,
      purpose: purpose || '',
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
    });

    console.log('✅ Mandate created:', mandate.mandateId);

    res.status(201).json({
      success: true,
      message: 'Mandate created successfully',
      mandate: {
        _id: mandate._id,
        mandateId: mandate.mandateId,
        payeeName: mandate.payeeName,
        payeeUpiId: mandate.payeeUpiId,
        amount: mandate.amount,
        frequency: mandate.frequency,
        status: mandate.status,
        totalPayments: mandate.totalPayments,
        startDate: mandate.startDate,
        endDate: mandate.endDate,
      }
    });

  } catch (error) {
    console.error('Create mandate error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Mandates
exports.getAllMandates = async (req, res) => {
  try {
    await syncPendingMandatesForUser(req.user._id);

    const mandates = await Mandate.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

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

// Get Mandate By ID
exports.getMandateById = async (req, res) => {
  try {
    const mandate = await Mandate.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!mandate) {
      return res.status(404).json({
        success: false,
        message: 'Mandate not found'
      });
    }

    const syncedMandate = await syncMandateWithRazorpay(mandate);

    res.json({ success: true, mandate: syncedMandate });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Mandate Status
exports.updateMandateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const mandate = await Mandate.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!mandate) {
      return res.status(404).json({
        success: false,
        message: 'Mandate not found'
      });
    }

    mandate.status = status;
    await mandate.save();

    res.json({
      success: true,
      message: `Mandate ${status.toLowerCase()} successfully`,
      mandate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
