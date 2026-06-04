const DEMO_DB_KEY = 'recurpay_demo_db';

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const nowIso = () => new Date().toISOString();

const createDemoUser = () => ({
  _id: 'owner-demo-1',
  name: 'Rohit Traders',
  email: 'owner@autopaise.com',
  password: 'Owner@123456',
  mobile: '9876543210',
  role: 'owner',
  createdAt: '2026-03-14T10:00:00.000Z',
  isActive: true,
  bankDetails: {
    accountName: 'Rohit Traders',
    accountNumber: '123456789012',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    accountType: 'Current',
    isVerified: true,
    verificationStatus: 'verified',
    passbookUrl: '/demo/passbook-rohit.png'
  },
  razorpayAccount: {
    keyId: 'rzp_test_demoowner123',
    mode: 'test',
    isConfigured: true,
    updatedAt: '2026-03-18T09:00:00.000Z'
  }
});

const createPendingOwner = () => ({
  _id: 'owner-demo-2',
  name: 'Kiran Home Needs',
  email: 'kiran@autopaise.com',
  password: 'Owner@123456',
  mobile: '9898989898',
  role: 'owner',
  createdAt: '2026-04-02T11:30:00.000Z',
  isActive: true,
  bankDetails: {
    accountName: 'Kiran Home Needs',
    accountNumber: '987654321000',
    ifscCode: 'SBIN0004567',
    bankName: 'State Bank of India',
    accountType: 'Savings',
    isVerified: false,
    verificationStatus: 'pending_review',
    passbookUrl: '/demo/passbook-kiran.png'
  },
  razorpayAccount: {
    keyId: '',
    mode: 'test',
    isConfigured: false,
    updatedAt: null
  }
});

const createDemoMandates = () => ([
  {
    _id: 'mandate-demo-1',
    mandateId: 'MANDATE-1001',
    ownerId: 'owner-demo-1',
    payeeName: 'Aman Kulkarni',
    payeeUpiId: 'aman@okicici',
    customerEmail: 'aman@example.com',
    customerPhone: '9988776655',
    amount: 1500,
    maxAmountPerDebit: 2000,
    frequency: 'Monthly',
    startDate: '2026-04-01T00:00:00.000Z',
    endDate: '2027-03-31T00:00:00.000Z',
    purpose: 'Monthly Grocery Subscription',
    status: 'Active',
    completedPayments: 2,
    shortUrl: 'https://rzp.io/i/demoactive1001',
    createdAt: '2026-03-28T08:30:00.000Z'
  },
  {
    _id: 'mandate-demo-2',
    mandateId: 'MANDATE-1002',
    ownerId: 'owner-demo-1',
    payeeName: 'Neha Sharma',
    payeeUpiId: 'neha@oksbi',
    customerEmail: 'neha@example.com',
    customerPhone: '9876501234',
    amount: 799,
    maxAmountPerDebit: 1000,
    frequency: 'Monthly',
    startDate: '2026-05-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
    purpose: 'Monthly Milk Supply',
    status: 'Pending Approval',
    completedPayments: 0,
    shortUrl: 'https://rzp.io/i/demopending1002',
    createdAt: '2026-04-26T10:15:00.000Z'
  },
  {
    _id: 'mandate-demo-3',
    mandateId: 'MANDATE-1003',
    ownerId: 'owner-demo-1',
    payeeName: 'Pooja Nair',
    payeeUpiId: 'pooja@ybl',
    customerEmail: 'pooja@example.com',
    customerPhone: '9123456780',
    amount: 2200,
    maxAmountPerDebit: 2500,
    frequency: 'Quarterly',
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2027-02-01T00:00:00.000Z',
    purpose: 'Quarterly Wellness Box',
    status: 'Paused',
    completedPayments: 1,
    shortUrl: 'https://rzp.io/i/demopaused1003',
    createdAt: '2026-01-20T09:00:00.000Z'
  }
]);

const buildInitialDb = () => {
  const owner = createDemoUser();
  const pendingOwner = createPendingOwner();

  return {
    users: [owner, pendingOwner],
    admin: {
      _id: 'admin-demo-1',
      name: 'Admin AutoPaise',
      email: 'admin@recurpay.com',
      password: 'Admin@123456',
      role: 'admin'
    },
    mandates: createDemoMandates()
  };
};

const getDb = () => {
  const saved = localStorage.getItem(DEMO_DB_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  const initial = buildInitialDb();
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(initial));
  return initial;
};

const saveDb = (db) => {
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db));
  return db;
};

const getCurrentUserId = () => localStorage.getItem('recurpay_demo_user_id') || 'owner-demo-1';

const setCurrentUserId = (userId) => {
  localStorage.setItem('recurpay_demo_user_id', userId);
};

const getCurrentUser = (db = getDb()) => db.users.find((user) => user._id === getCurrentUserId()) || db.users[0];

const buildResponse = (data) => Promise.resolve({ data: deepClone(data) });

const buildError = (message, status = 400) => Promise.reject({
  response: {
    status,
    data: { message }
  }
});

const buildAdminStats = (db) => {
  const owners = db.users.filter((user) => user.role !== 'admin');
  const pendingVerification = owners.filter((owner) => owner.bankDetails?.verificationStatus === 'pending_review').length;
  const verifiedOwners = owners.filter((owner) => owner.bankDetails?.verificationStatus === 'verified').length;
  const deactivatedOwners = owners.filter((owner) => owner.isActive === false).length;
  const activeMandates = db.mandates.filter((mandate) => mandate.status === 'Active').length;

  return {
    totalOwners: owners.length,
    pendingVerification,
    verifiedOwners,
    deactivatedOwners,
    totalMandates: db.mandates.length,
    activeMandates
  };
};

const buildLegacyPendingStats = (db) => {
  const stats = buildAdminStats(db);
  return {
    all: db.users.filter((user) => user.role !== 'admin').length,
    pending: stats.pendingVerification,
    verified: stats.verifiedOwners
  };
};

const enrichMandate = (db, mandate) => ({
  ...mandate,
  user: db.users.find((user) => user._id === mandate.ownerId)
});

export const mockAuthAPI = {
  register: async (payload) => {
    const db = getDb();
    if (db.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
      return buildError('User already exists');
    }

    const user = {
      _id: `owner-demo-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      mobile: payload.mobile,
      role: 'owner',
      createdAt: nowIso(),
      isActive: true,
      bankDetails: {
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountType: 'Savings',
        isVerified: false,
        verificationStatus: 'not_submitted',
        passbookUrl: ''
      },
      razorpayAccount: {
        keyId: '',
        mode: 'test',
        isConfigured: false,
        updatedAt: null
      }
    };

    db.users.push(user);
    saveDb(db);
    setCurrentUserId(user._id);

    return buildResponse({
      token: `demo-token-${user._id}`,
      user
    });
  },

  login: async ({ email, password }) => {
    const db = getDb();
    const user = db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);

    if (!user) {
      return buildError('Invalid email or password', 401);
    }

    setCurrentUserId(user._id);
    return buildResponse({
      token: `demo-token-${user._id}`,
      user
    });
  },

  getProfile: async () => {
    const db = getDb();
    return buildResponse({
      success: true,
      user: getCurrentUser(db)
    });
  },

  updateBankDetails: async (formData) => {
    const db = getDb();
    const user = getCurrentUser(db);
    user.bankDetails = {
      ...user.bankDetails,
      accountName: formData.get('accountName') || '',
      accountNumber: formData.get('accountNumber') || '',
      ifscCode: (formData.get('ifscCode') || '').toUpperCase(),
      bankName: formData.get('bankName') || '',
      accountType: formData.get('accountType') || 'Savings',
      isVerified: false,
      verificationStatus: 'pending_review',
      passbookUrl: user.bankDetails?.passbookUrl || '/demo/passbook-uploaded.png'
    };
    saveDb(db);

    return buildResponse({
      success: true,
      user
    });
  },

  getBankDetails: async () => {
    const db = getDb();
    return buildResponse({
      success: true,
      bankDetails: getCurrentUser(db).bankDetails
    });
  },

  updateRazorpayAccount: async ({ keyId, keySecret, mode }) => {
    if (!keyId || !keySecret) {
      return buildError('Razorpay key ID and key secret are required');
    }

    const db = getDb();
    const user = getCurrentUser(db);
    user.razorpayAccount = {
      keyId,
      mode,
      isConfigured: true,
      updatedAt: nowIso()
    };
    saveDb(db);

    return buildResponse({
      success: true,
      user,
      razorpayAccount: {
        keyId,
        mode,
        isConfigured: true
      }
    });
  },

  getRazorpayAccount: async () => {
    const db = getDb();
    const account = getCurrentUser(db).razorpayAccount || { keyId: '', mode: 'test', isConfigured: false };

    return buildResponse({
      success: true,
      razorpayAccount: account
    });
  }
};

export const mockMandateAPI = {
  create: async (payload) => {
    const db = getDb();
    const currentUser = getCurrentUser(db);
    const nextIndex = db.mandates.length + 1001;
    const mandate = {
      _id: `mandate-demo-${Date.now()}`,
      mandateId: `MANDATE-${nextIndex}`,
      ownerId: currentUser._id,
      payeeName: payload.payeeName,
      payeeUpiId: payload.payeeUpiId,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      amount: Number(payload.amount),
      maxAmountPerDebit: Number(payload.maxAmountPerDebit),
      frequency: payload.frequency,
      startDate: payload.startDate,
      endDate: payload.endDate,
      purpose: payload.purpose,
      status: 'Pending Approval',
      completedPayments: 0,
      shortUrl: '',
      createdAt: nowIso()
    };

    db.mandates.unshift(mandate);
    saveDb(db);

    return buildResponse({
      success: true,
      mandate
    });
  },

  getAll: async () => {
    const db = getDb();
    const currentUser = getCurrentUser(db);
    const mandates = db.mandates.filter((mandate) => mandate.ownerId === currentUser._id);
    return buildResponse({
      success: true,
      mandates
    });
  },

  getById: async (id) => {
    const db = getDb();
    const mandate = db.mandates.find((entry) => entry._id === id);
    if (!mandate) {
      return buildError('Mandate not found', 404);
    }
    return buildResponse({
      success: true,
      mandate
    });
  },

  updateStatus: async (id, status) => {
    const db = getDb();
    const mandate = db.mandates.find((entry) => entry._id === id);
    if (!mandate) {
      return buildError('Mandate not found', 404);
    }
    mandate.status = status;
    saveDb(db);

    return buildResponse({
      success: true,
      mandate
    });
  }
};

export const mockRazorpayAPI = {
  initiate: async ({ mandateId }) => {
    const db = getDb();
    const mandate = db.mandates.find((entry) => entry.mandateId === mandateId);
    if (!mandate) {
      throw new Error('Mandate not found');
    }

    mandate.shortUrl = `https://rzp.io/i/${mandate._id}`;
    saveDb(db);

    return buildResponse({
      success: true,
      data: {
        shortUrl: mandate.shortUrl
      }
    });
  },

  getLink: async (id) => {
    const db = getDb();
    const mandate = db.mandates.find((entry) => entry._id === id || entry.mandateId === id);
    if (!mandate) {
      return buildError('Payment link not found', 404);
    }

    return buildResponse({
      success: true,
      data: {
        shortUrl: mandate.shortUrl
      }
    });
  },

  syncStatus: async (id) => {
    const db = getDb();
    const mandate = db.mandates.find((entry) => entry._id === id || entry.mandateId === id);
    if (!mandate) {
      return buildError('Payment link not found', 404);
    }

    if (mandate.shortUrl) {
      mandate.status = 'Active';
      saveDb(db);
    }

    return buildResponse({
      success: true,
      mandate,
      paymentLinkStatus: mandate.shortUrl ? 'paid' : 'created'
    });
  },

  syncPending: async () => {
    const db = getDb();
    db.mandates.forEach((mandate) => {
      if (mandate.shortUrl && mandate.status !== 'Active') {
        mandate.status = 'Active';
      }
    });
    saveDb(db);

    return buildResponse({
      success: true,
      count: db.mandates.length,
      mandates: db.mandates
    });
  }
};

export const mockLegacyAdminAPI = {
  getPending: async () => {
    const db = getDb();
    const users = db.users.filter((user) => user.role !== 'admin' && user.bankDetails?.verificationStatus === 'pending_review');
    return buildResponse({
      success: true,
      users,
      stats: buildLegacyPendingStats(db)
    });
  },

  verifyBank: async (id) => {
    const db = getDb();
    const user = db.users.find((entry) => entry._id === id);
    if (!user) {
      return buildError('User not found', 404);
    }
    user.bankDetails.isVerified = true;
    user.bankDetails.verificationStatus = 'verified';
    saveDb(db);
    return buildResponse({
      success: true,
      user
    });
  }
};

export const mockAdminAPI = {
  login: async ({ email, password }) => {
    const db = getDb();
    if (email.toLowerCase() !== db.admin.email.toLowerCase() || password !== db.admin.password) {
      return buildError('Invalid credentials', 401);
    }
    localStorage.setItem('recurpay_admin_token', 'demo-admin-token');
    localStorage.setItem('recurpay_admin', JSON.stringify(db.admin));
    return buildResponse({
      token: 'demo-admin-token',
      admin: db.admin
    });
  },

  getStats: async () => {
    const db = getDb();
    return buildResponse({
      stats: buildAdminStats(db)
    });
  },

  getAllOwners: async (status) => {
    const db = getDb();
    let owners = db.users.filter((user) => user.role !== 'admin');
    if (status) {
      owners = owners.filter((owner) => owner.bankDetails?.verificationStatus === status);
    }
    return buildResponse({
      owners
    });
  },

  getOwnerById: async (id) => {
    const db = getDb();
    const owner = db.users.find((user) => user._id === id);
    if (!owner) {
      return buildError('Owner not found', 404);
    }
    return buildResponse({
      owner
    });
  },

  verifyOwner: async (id) => {
    const db = getDb();
    const owner = db.users.find((user) => user._id === id);
    if (!owner) {
      return buildError('Owner not found', 404);
    }
    owner.bankDetails.isVerified = true;
    owner.bankDetails.verificationStatus = 'verified';
    saveDb(db);
    return buildResponse({
      success: true,
      owner
    });
  },

  rejectOwner: async (id, reason) => {
    const db = getDb();
    const owner = db.users.find((user) => user._id === id);
    if (!owner) {
      return buildError('Owner not found', 404);
    }
    owner.bankDetails.isVerified = false;
    owner.bankDetails.verificationStatus = 'rejected';
    owner.bankDetails.rejectionReason = reason;
    saveDb(db);
    return buildResponse({
      success: true,
      owner
    });
  },

  toggleOwnerStatus: async (id) => {
    const db = getDb();
    const owner = db.users.find((user) => user._id === id);
    if (!owner) {
      return buildError('Owner not found', 404);
    }
    owner.isActive = !owner.isActive;
    saveDb(db);
    return buildResponse({
      message: owner.isActive ? 'Owner activated successfully' : 'Owner deactivated successfully'
    });
  },

  getAllMandates: async () => {
    const db = getDb();
    return buildResponse({
      mandates: db.mandates.map((mandate) => enrichMandate(db, mandate))
    });
  }
};
