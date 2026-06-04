const razorpay = require('../config/razorpay');

const PENDING_STATUSES = new Set(['Pending', 'Pending Approval']);
const PAID_LINK_STATUSES = new Set(['paid', 'partially_paid']);

const isPaymentLinkPaid = (paymentLink, hintStatus) => {
  if (hintStatus === 'paid') {
    return true;
  }

  if (!paymentLink) {
    return false;
  }

  if (PAID_LINK_STATUSES.has(paymentLink.status)) {
    return true;
  }

  return Number(paymentLink.amount_paid) > 0;
};

const activateMandate = async (mandate) => {
  if (mandate.status === 'Active') {
    return mandate;
  }

  mandate.status = 'Active';
  mandate.completedPayments = Math.max(mandate.completedPayments || 0, 1);
  await mandate.save();
  return mandate;
};

const syncMandateWithRazorpay = async (mandate, hints = {}) => {
  if (!mandate || mandate.status === 'Active') {
    return mandate;
  }

  if (!PENDING_STATUSES.has(mandate.status)) {
    return mandate;
  }

  const hintStatus = hints.paymentLinkStatus?.toLowerCase?.();
  if (hintStatus === 'paid') {
    return activateMandate(mandate);
  }

  const linkId =
    hints.paymentLinkId ||
    mandate.razorpayPaymentLinkId;

  if (!linkId) {
    return mandate;
  }

  try {
    const paymentLink = await razorpay.paymentLink.fetch(linkId);

    if (!mandate.razorpayPaymentLinkId && paymentLink?.id) {
      mandate.razorpayPaymentLinkId = paymentLink.id;
    }

    if (isPaymentLinkPaid(paymentLink, hintStatus)) {
      return activateMandate(mandate);
    }
  } catch (error) {
    console.error(
      `Payment sync failed for mandate ${mandate.mandateId}:`,
      error.error?.description || error.message
    );
  }

  return mandate;
};

const syncPendingMandatesForUser = async (userId, hintsByMandateId = {}) => {
  const Mandate = require('../models/Mandate');

  const pendingMandates = await Mandate.find({
    user: userId,
    status: { $in: Array.from(PENDING_STATUSES) },
    razorpayPaymentLinkId: { $ne: null },
  });

  await Promise.all(
    pendingMandates.map((mandate) =>
      syncMandateWithRazorpay(
        mandate,
        hintsByMandateId[mandate._id.toString()] || {}
      )
    )
  );
};

module.exports = {
  activateMandate,
  syncMandateWithRazorpay,
  syncPendingMandatesForUser,
  isPaymentLinkPaid,
};
