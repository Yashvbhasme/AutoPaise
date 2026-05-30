const razorpay = require('../config/razorpay');
const Mandate = require('../models/Mandate');
const User = require('../models/User');

// Initiate Mandate on Razorpay
exports.initiateMandateOnRazorpay = async (
  req, res
) => {
  try {
    const { 
      mandateId, customerEmail, customerPhone, preferUpiLink = true } = req.body;
    const isTestMode =
      process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_');
    const shouldCreateUpiLink = preferUpiLink && !isTestMode;

    console.log('=== Initiating Razorpay ===');
    console.log('Mandate ID:', mandateId);

    if (!mandateId) {
      return res.status(400).json({
        success: false,
        message: 'Mandate ID is required'
      });
    }

    const mandate = await Mandate.findOne({
      mandateId,
      user: req.user._id
    });

    if (!mandate) {
      return res.status(404).json({
        success: false,
        message: 'Mandate not found'
      });
    }

    if (mandate.shortUrl && !shouldCreateUpiLink) {
      return res.json({
        success: true,
        message: 'Payment link already exists',
        data: {
          shortUrl: mandate.shortUrl,
          upiLinkSupported: !isTestMode
        }
      });
    }

    const owner = await User.findById(req.user._id);

    const linkData = {
      amount: mandate.amount * 100,
      currency: 'INR',
      accept_partial: false,
      description:
        (mandate.purpose || 'UPI AutoPay Mandate') +
        ' | ' + mandate.frequency +
        ' | ' + mandate.mandateId,
      customer: {
        name: mandate.payeeName || 'Customer'
      },
      notify: { sms: false, email: false },
      reminder_enable: true,
      notes: {
        mandateId: mandate.mandateId,
        frequency: mandate.frequency,
        ownerName: owner.name
      },
      callback_url:
        `${process.env.FRONTEND_URL}/mandate/${mandate._id}`,
      callback_method: 'get'
    };

    if (shouldCreateUpiLink) {
      linkData.upi_link = true;
    }

    if (customerEmail?.includes('@')) {
      linkData.customer.email = customerEmail;
      linkData.notify.email = true;
    }

    if (customerPhone?.length >= 10) {
      linkData.customer.contact =
        '+91' + customerPhone.slice(-10);
      linkData.notify.sms = true;
    }

    console.log('Creating payment link...');
    const paymentLink =
      await razorpay.paymentLink.create(linkData);

    console.log('✅ Link created:', paymentLink.short_url);

    mandate.razorpayPaymentLinkId = paymentLink.id;
    mandate.shortUrl = paymentLink.short_url;
    mandate.status = 'Pending Approval';
    if (customerEmail) 
      mandate.customerEmail = customerEmail;
    if (customerPhone) 
      mandate.customerPhone = customerPhone;
    await mandate.save();

    return res.json({
      success: true,
      message: 'Payment link generated!',
      data: {
        shortUrl: paymentLink.short_url,
        paymentLinkId: paymentLink.id,
        mandateId: mandate.mandateId,
        upiLinkSupported: shouldCreateUpiLink,
        emailSent: !!(customerEmail?.includes('@')),
        smsSent: !!(customerPhone?.length >= 10)
      }
    });

  } catch (error) {
    console.error('Razorpay Error:', error);
    return res.status(500).json({
      success: false,
      message: error.error?.description ||
        error.message ||
        'Failed to generate payment link'
    });
  }
};

// Get Payment Link
exports.getMandatePaymentLink = async (req, res) => {
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

    res.json({
      success: true,
      shortUrl: mandate.shortUrl || null,
      status: mandate.status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.syncMandatePaymentStatus = async (req, res) => {
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

    if (!mandate.razorpayPaymentLinkId) {
      return res.json({
        success: true,
        mandate
      });
    }

    const paymentLink = await razorpay.paymentLink.fetch(
      mandate.razorpayPaymentLinkId
    );

    if (paymentLink.status === 'paid' && mandate.status !== 'Active') {
      mandate.status = 'Active';
      await mandate.save();
    }

    return res.json({
      success: true,
      mandate,
      paymentLinkStatus: paymentLink.status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.error?.description ||
        error.message ||
        'Failed to sync payment status'
    });
  }
};

// Webhook Handler
exports.handleWebhook = async (req, res) => {
  try {
    const rawBody = req.body instanceof Buffer
      ? req.body.toString()
      : JSON.stringify(req.body);

    const body = JSON.parse(rawBody);
    const event = body.event;
    console.log('Webhook event:', event);

    if (event === 'payment_link.paid') {
      const linkId =
        body.payload?.payment_link?.entity?.id;
      if (linkId) {
        await Mandate.findOneAndUpdate(
          { razorpayPaymentLinkId: linkId },
          { status: 'Active' }
        );
        console.log('✅ Mandate activated!');
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      message: 'Webhook error' 
    });
  }
};
