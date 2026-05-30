import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mandateAPI, razorpayAPI, authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Copy, ExternalLink, MessageCircle } from 'lucide-react';

// ===== SIDEBAR COMPONENT =====
const Sidebar = ({ active, onNavigate }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { id: 'create', icon: '➕', label: 'Create Mandate', path: '/create-mandate' },
    { id: 'mandates', icon: '📋', label: 'My Mandates', path: '/dashboard' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div style={{
      width: '260px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #312E81 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
    }}>
      <div style={{ padding: '8px 12px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        <img
          src={logo}
          alt="AutoPaise"
          style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '14px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#7B4F00', flexShrink: 0 }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Business Owner</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer',
              background: active === item.id ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
              color: active === item.id ? 'white' : 'rgba(255,255,255,0.65)',
              fontWeight: active === item.id ? '700' : '500', fontSize: '14px', transition: 'all 0.2s',
              boxShadow: active === item.id ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
              borderLeft: active === item.id ? '3px solid #A5B4FC' : '3px solid transparent',
            }}
            onMouseEnter={e => { if (active !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; } }}
            onMouseLeave={e => { if (active !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>{item.label}
          </div>
        ))}
      </nav>

      <div
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
          color: 'rgba(255,100,100,0.8)', fontSize: '14px', fontWeight: '500', border: '1px solid rgba(255,100,100,0.2)', transition: 'all 0.2s', marginTop: '8px',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#FCA5A5'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.8)'; }}
      >
        <span style={{ fontSize: '18px' }}>🚪</span>Logout
      </div>
    </div>
  );
};

const CreateMandate = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Refresh profile on mount to ensure we have the very latest verification status
    authAPI.getProfile().then(res => {
      if (res.data.success && res.data.user) {
        updateUser(res.data.user);
      }
    }).catch(err => console.error('Failed to refresh profile:', err));
  }, []);

  const [createdMandate, setCreatedMandate] = useState(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    payeeName: '',
    payeeUpiId: '',
    customerEmail: '',
    customerPhone: '',
    amount: '',
    maxAmountPerDebit: '',
    frequency: 'Monthly',
    startDate: '',
    endDate: '',
    purpose: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isMobile = window.innerWidth < 768;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await mandateAPI.create(formData);
      if (response.data.success) {
        setCreatedMandate(response.data.mandate);
        const linkRes = await razorpayAPI.initiate({
          mandateId: response.data.mandate.mandateId,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          ownerPaymentAccount: 'connected-razorpay',
          preferUpiLink: true,
        });
        if (linkRes.data.success) {
          setPaymentLink(linkRes.data.data.shortUrl);
          setStep(2);
          if (linkRes.data.data.upiLinkSupported === false) {
            toast('Test Mode uses a standard Razorpay approval link. Use Live keys for UPI Payment Links.');
          } else {
            toast.success("Mandate created successfully!");
          }
        } else {
          toast.error("Failed to generate payment link.");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating mandate.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openPaymentLink = () => {
    if (!paymentLink) return;
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
  };

  const shareWhatsApp = () => {
    const text = `Hello! Please approve this UPI AutoPay mandate for ${createdMandate?.amount} INR. Link: ${paymentLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const baseInputStyle = {
    width: '100%', padding: '14px 16px', background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '15px', color: '#FFFFFF', outline: 'none', transition: 'all 0.2s', marginTop: '6px'
  };

  const hasRazorpayAccount = Boolean(user?.razorpayAccount?.isConfigured);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile && <Sidebar active="create" />}

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : '260px', padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', animation: 'fadeInDown 0.4s ease forwards' }}>Create New Mandate ⚡</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '32px', animation: 'fadeInDown 0.5s ease forwards' }}>Set up an auto-collect agreement and share it with your customer.</p>

          {!hasRazorpayAccount ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', animation: 'fadeInUp 0.6s ease forwards' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#6366F1', marginBottom: '16px' }}>RP</div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginBottom: '12px' }}>
                Connect Shop Owner Razorpay Account
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
                Option 2 needs every shop owner to use their own Razorpay account. Add this owner's Razorpay API keys so customer payments are processed under the owner's account and settle to the owner's KYC bank account.
              </p>
              <button onClick={() => navigate('/settings')} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Go to Settings
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', animation: 'fadeInUp 0.6s ease forwards' }}>
              {step === 1 ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Name *</label>
                    <input type="text" name="payeeName" value={formData.payeeName} onChange={handleChange} required placeholder="e.g. John Doe" style={baseInputStyle} />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer UPI ID *</label>
                    <input type="text" name="payeeUpiId" value={formData.payeeUpiId} onChange={handleChange} required placeholder="e.g. john@okicici" style={baseInputStyle} />
                    {formData.payeeUpiId && (
                      <div style={{ color: '#10B981', fontSize: '13px', fontWeight: '600', marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
                        ✓ Valid UPI ID format
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Email</label>
                    <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} placeholder="Optional for email alerts" style={baseInputStyle} />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Phone</label>
                    <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="Optional for SMS alerts" style={baseInputStyle} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0' }} />

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount (₹) *</label>
                    <input type="number" name="amount" min="1" value={formData.amount} onChange={handleChange} required placeholder="500" style={baseInputStyle} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Debit Limit (₹) *</label>
                    <input type="number" name="maxAmountPerDebit" min="1" value={formData.maxAmountPerDebit} onChange={handleChange} required placeholder="1000" style={baseInputStyle} />
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Frequency *</label>
                    <select name="frequency" value={formData.frequency} onChange={handleChange} style={baseInputStyle}>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date *</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required style={baseInputStyle} />
                  </div>
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Date *</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={baseInputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Purpose / Description</label>
                  <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="e.g. Monthly Gym Subscription" style={baseInputStyle} />
                </div>

                <button type="submit" disabled={loading} style={{
                  padding: '16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', transition: 'all 0.2s', marginTop: '16px', opacity: loading ? 0.8 : 1
                }}>
                  {loading ? 'Creating Mandate...' : 'Generate Pay Link →'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', animation: 'fadeInUp 0.5s ease' }}>
                <div style={{ width: '80px', height: '80px', background: '#D1FAE5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>
                  ✓
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>Mandate Created!</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '32px' }}>Your mandate <strong>{createdMandate?.mandateId}</strong> is ready for approval.</p>

                <div style={{ background: '#0A0A0F', padding: '32px', borderRadius: '20px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Scan to Approve</p>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    {paymentLink ? <QRCode value={paymentLink} size={180} /> : <div style={{ width: 180, height: 180, background: '#eee' }}></div>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={openPaymentLink} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #16A34A, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(5,150,105,0.3)' }}>
                    <ExternalLink size={18} />
                    Approve with UPI
                  </button>
                  <button onClick={copyToClipboard} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.03)', color: '#4F46E5', border: '2px solid #4F46E5', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Copy size={18} />
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                  <button onClick={shareWhatsApp} style={{ padding: '14px 28px', background: '#25D366', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}>
                    <MessageCircle size={18} />
                    Share on WhatsApp
                  </button>
                </div>
                
                <div style={{ marginTop: '32px' }}>
                  <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMandate;
