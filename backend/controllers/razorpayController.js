const razorpay = require('../config/razorpay');
const Mandate = require('../models/Mandate');
const User = require('../models/User');
const {
  activateMandate,
  syncMandateWithRazorpay,
  syncPendingMandatesForUser,
} = require('../utils/paymentSync');

const getPublicCallbackUrl = (mandateId) => {
  const frontendUrl = process.env.FRONTEND_URL?.trim();

  if (!frontendUrl) {
    return null;
  }

  try {
    const callbackUrl = new URL(`/mandate/${mandateId}`, frontendUrl);
    const isLocalhost =
      callbackUrl.hostname === 'localhost' ||
      callbackUrl.hostname === '127.0.0.1';

    return callbackUrl.protocol === 'https:' && !isLocalhost
      ? callbackUrl.toString()
      : null;
  } catch (error) {
    return null;
  }
};

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
    const callbackUrl = getPublicCallbackUrl(mandate._id);

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
      }
    };

    if (callbackUrl) {
      linkData.callback_url = callbackUrl;
      linkData.callback_method = 'get';
    }

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

    const syncedMandate = await syncMandateWithRazorpay(mandate, {
      paymentLinkId: req.body?.paymentLinkId,
      paymentLinkStatus: req.body?.paymentLinkStatus,
      paymentId: req.body?.paymentId,
    });

    let paymentLinkStatus = req.body?.paymentLinkStatus || null;
    if (syncedMandate.razorpayPaymentLinkId) {
      try {
        const paymentLink = await razorpay.paymentLink.fetch(
          syncedMandate.razorpayPaymentLinkId
        );
        paymentLinkStatus = paymentLink.status;
      } catch (fetchError) {
        console.error(
          'Could not fetch payment link after sync:',
          fetchError.error?.description || fetchError.message
        );
      }
    }

    return res.json({
      success: true,
      mandate: syncedMandate,
      paymentLinkStatus
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

exports.syncAllPendingMandates = async (req, res) => {
  try {
    await syncPendingMandatesForUser(req.user._id);

    const mandates = await Mandate.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: mandates.length,
      mandates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.error?.description ||
        error.message ||
        'Failed to sync pending mandates'
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

    const activateByPaymentLink = async (linkId, shortUrlFromWebhook) => {
      let mandate = linkId
        ? await Mandate.findOne({ razorpayPaymentLinkId: linkId })
        : null;

      if (!mandate && shortUrlFromWebhook) {
        mandate = await Mandate.findOne({ shortUrl: shortUrlFromWebhook });
      }

      if (!mandate) {
        console.log(
          '⚠️ Mandate activation skipped (no matching mandate found)'
        );
        return null;
      }

      await activateMandate(mandate);
      console.log('✅ Mandate activated:', mandate.mandateId);
      return mandate;
    };

    if (
      event === 'payment_link.paid' ||
      event === 'payment_link.partially_paid'
    ) {
      const entity = body.payload?.payment_link?.entity;
      await activateByPaymentLink(entity?.id, entity?.short_url);
    }

    if (event === 'payment.captured') {
      const payment = body.payload?.payment?.entity;
      const linkId = payment?.payment_link_id;

      if (linkId) {
        await activateByPaymentLink(linkId);
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
