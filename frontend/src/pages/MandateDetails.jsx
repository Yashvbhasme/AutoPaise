import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mandateAPI, razorpayAPI } from '../utils/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Copy, ExternalLink } from 'lucide-react';

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
    <div style={{ width: '260px', minHeight: '100vh', background: 'linear-gradient(180deg, #FFFFFF 0%, #312E81 100%)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, boxShadow: '4px 0 20px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '8px 12px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        <img src={logo} alt="AutoPaise" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '14px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#7B4F00', flexShrink: 0 }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Business Owner</div>
        </div>
      </div>
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div key={item.id} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer', background: active === item.id ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent', color: active === item.id ? 'white' : 'rgba(255,255,255,0.65)', fontWeight: active === item.id ? '700' : '500', fontSize: '14px', transition: 'all 0.2s', boxShadow: active === item.id ? '0 4px 15px rgba(99,102,241,0.4)' : 'none', borderLeft: active === item.id ? '3px solid #A5B4FC' : '3px solid transparent' }} onMouseEnter={e => { if (active !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; } }} onMouseLeave={e => { if (active !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>{item.label}
          </div>
        ))}
      </nav>
      <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,100,100,0.8)', fontSize: '14px', fontWeight: '500', border: '1px solid rgba(255,100,100,0.2)', transition: 'all 0.2s', marginTop: '8px' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#FCA5A5'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.8)'; }}>
        <span style={{ fontSize: '18px' }}>🚪</span>Logout
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const configs = {
    'Active': { color: '#10B981', bg: '#D1FAE5', border: '#A7F3D0', pulse: true },
    'Pending Approval': { color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', pulse: true },
    'Pending': { color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', pulse: true },
    'Paused': { color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.05)', border: '#E5E7EB', pulse: false },
    'Cancelled': { color: '#EF4444', bg: '#FEE2E2', border: '#FECACA', pulse: false },
  };
  const c = configs[status] || configs['Pending'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', color: c.color, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
        {c.pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: c.color, opacity: 0.5, animationName: 'ping', animationDuration: '1.5s', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)', animationIterationCount: 'infinite' }} />}
        <span style={{ position: 'relative', borderRadius: '50%', width: '8px', height: '8px', background: c.color, display: 'inline-block' }} />
      </span>{status}
    </span>
  );
};

const MandateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mandate, setMandate] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const fetchMandate = async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const returnedFromRazorpay =
          query.has('razorpay_payment_link_id') ||
          query.has('razorpay_payment_link_status') ||
          query.has('razorpay_payment_id');
        const res = returnedFromRazorpay
          ? await razorpayAPI.syncStatus(id)
          : await mandateAPI.getById(id);
        if (res.data.success) {
          setMandate(res.data.mandate);
          if (res.data.mandate?.status === 'Active') {
            toast.success('Mandate approved successfully');
          }
        }
      } catch (e) {
        toast.error('Failed to load mandate details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchMandate();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await mandateAPI.updateStatus(id, newStatus);
      if (res.data.success) {
        setMandate(res.data.mandate);
        toast.success(`Mandate ${newStatus.toLowerCase()} successfully`);
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const copyApprovalLink = () => {
    navigator.clipboard.writeText(mandate.shortUrl);
    toast.success('Link copied!');
  };

  const openApprovalLink = () => {
    window.open(mandate.shortUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F' }}>
        {!isMobile && <Sidebar active="mandates" />}
        <div style={{ flex: 1, marginLeft: isMobile ? 0 : '260px', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#6366F1', borderRadius: '50%', animationName: 'spin', animationDuration: '1s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />
        </div>
      </div>
    );
  }

  if (!mandate) return null;

  const isPending = mandate.status.includes('Pending');
  const isActive = mandate.status === 'Active';
  const isPaused = mandate.status === 'Paused';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile && <Sidebar active="mandates" />}

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : '260px', padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ marginBottom: '24px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span>←</span> Back
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {mandate.payeeName}
                <StatusBadge status={mandate.status} />
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontFamily: 'monospace' }}>{mandate.mandateId}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {isActive && (
                <button onClick={() => handleStatusChange('Paused')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.03)', color: '#F59E0B', border: '1px solid #F59E0B', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Pause Mandate</button>
              )}
              {isPaused && (
                <button onClick={() => handleStatusChange('Active')} style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Resume Mandate</button>
              )}
              {(isActive || isPaused) && (
                <button onClick={() => handleStatusChange('Cancelled')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.03)', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel Mandate</button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Customer Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>UPI ID</p>
                  <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '500' }}>{mandate.payeeUpiId}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Email</p>
                  <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '500' }}>{mandate.customerEmail || 'Not provided'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Phone</p>
                  <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '500' }}>{mandate.customerPhone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Payment Terms</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '600' }}>Amount</p>
                  <p style={{ fontSize: '16px', color: '#6366F1', fontWeight: '800' }}>₹{mandate.amount.toLocaleString('en-IN')}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '600' }}>Frequency</p>
                  <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '600' }}>{mandate.frequency}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '600' }}>Start Date</p>
                  <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '500' }}>{new Date(mandate.startDate).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '600' }}>End Date</p>
                  <p style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '500' }}>{new Date(mandate.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {isPending && mandate.shortUrl && (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '32px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>Action Required from Customer</h3>
              <p style={{ color: '#A5B4FC', fontSize: '14px', marginBottom: '24px' }}>Share this QR or link to get the mandate approved.</p>
              
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
                <QRCode value={mandate.shortUrl} size={150} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={openApprovalLink} style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ExternalLink size={16} />
                  Approve with UPI
                </button>
                <button onClick={copyApprovalLink} style={{ padding: '12px 24px', background: '#6366F1', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Copy size={16} />
                  Copy Payment Link
                </button>
              </div>
            </div>
          )}

          {/* Payment Timeline */}
          <div style={{ marginTop: '32px', background: 'rgba(255,255,255,0.03)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', marginBottom: '24px' }}>Payment Timeline & Settlement 💰</h3>
            <div style={{ display: 'flex', gap: '24px', flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ flex: 1, borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)', borderBottom: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: isMobile ? '16px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800' }}>1</div>
                  <h4 style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: 0 }}>Create Mandate</h4>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', paddingLeft: '32px' }}>Auto collecting set up by you.</p>
              </div>
              <div style={{ flex: 1, borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)', borderBottom: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: isMobile ? '16px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: (isActive || isPaused) ? '#10B981' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800' }}>2</div>
                  <h4 style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: 0 }}>Customer Approves</h4>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', paddingLeft: '32px' }}>Customer authorizes the mandate via UPI.</p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: (isActive || isPaused) ? '#F59E0B' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800' }}>3</div>
                  <h4 style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: 0 }}>Owner Settlement</h4>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', paddingLeft: '32px', margin: 0 }}>Razorpay settles funds to the shop owner's own KYC bank account for the connected Razorpay account.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MandateDetails;
