import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

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

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const isMobile = window.innerWidth < 768;
  const [razorpayForm, setRazorpayForm] = useState({
    keyId: '',
    keySecret: '',
    mode: 'test'
  });
  const [razorpayStatus, setRazorpayStatus] = useState('empty'); // empty, configured

  useEffect(() => {
    const fetchRazorpayAccount = async () => {
      try {
        const res = await authAPI.getRazorpayAccount();
        if (res.data.success && res.data.razorpayAccount) {
          setRazorpayForm({
            keyId: res.data.razorpayAccount.keyId || '',
            keySecret: '',
            mode: res.data.razorpayAccount.mode || 'test'
          });
          setRazorpayStatus(res.data.razorpayAccount.isConfigured ? 'configured' : 'empty');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRazorpayAccount();
  }, []);

  const handleRazorpayChange = (e) => setRazorpayForm({ ...razorpayForm, [e.target.name]: e.target.value });

  const handleRazorpaySubmit = async (e) => {
    e.preventDefault();
    setRazorpayLoading(true);
    try {
      const res = await authAPI.updateRazorpayAccount({
        keyId: razorpayForm.keyId.trim(),
        keySecret: razorpayForm.keySecret.trim(),
        mode: razorpayForm.mode
      });
      if (res.data.success) {
        toast.success("Razorpay account connected!");
        setRazorpayStatus('configured');
        setRazorpayForm(prev => ({ ...prev, keySecret: '' }));
        if (res.data.user) {
          updateUser(res.data.user);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save Razorpay account");
    } finally {
      setRazorpayLoading(false);
    }
  };

  const baseInputStyle = { width: '100%', padding: '14px 16px', background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '15px', color: '#FFFFFF', outline: 'none', transition: 'all 0.2s', marginTop: '6px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile && <Sidebar active="settings" />}

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : '260px', padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginBottom: '32px' }}>Settings ⚙️</h1>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
            {['profile', 'razorpay', 'password'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', background: activeTab === tab ? '#EEF2FF' : 'transparent', color: activeTab === tab ? '#6366F1' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s' }}>
                {tab}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', marginBottom: '24px' }}>Profile Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Full Name</label>
                    <input type="text" value={user?.name || ''} readOnly style={{ ...baseInputStyle, background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Email Address</label>
                    <input type="email" value={user?.email || ''} readOnly style={{ ...baseInputStyle, background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Mobile Number</label>
                    <input type="tel" value={user?.mobile || ''} readOnly style={{ ...baseInputStyle, background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'razorpay' && (
              <form onSubmit={handleRazorpaySubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>Razorpay Account</h2>
                  {razorpayStatus === 'configured' && <span style={{ background: '#D1FAE5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>Connected</span>}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px' }}>
                  Connect the shop owner's own Razorpay account. Customer payments created by this owner will be processed under these Razorpay keys and settled by Razorpay to this owner's KYC bank account.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Razorpay Key ID</label>
                    <input type="text" name="keyId" value={razorpayForm.keyId} onChange={handleRazorpayChange} required placeholder="rzp_test_..." style={baseInputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Razorpay Key Secret</label>
                    <input type="password" name="keySecret" value={razorpayForm.keySecret} onChange={handleRazorpayChange} required={razorpayStatus === 'empty'} placeholder={razorpayStatus === 'configured' ? 'Leave blank only if backend allows keeping existing secret' : 'Enter key secret'} style={baseInputStyle} />
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '8px' }}>
                      The secret is sent once to your backend and must be encrypted there. It should never be stored in the browser.
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Mode</label>
                    <select name="mode" value={razorpayForm.mode} onChange={handleRazorpayChange} style={baseInputStyle}>
                      <option value="test">Test</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                  <button type="submit" disabled={razorpayLoading} style={{ padding: '16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: razorpayLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: '16px' }}>
                    {razorpayLoading ? 'Connecting...' : 'Save Razorpay Account'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', marginBottom: '24px' }}>Change Password</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Current Password</label>
                    <input type="password" placeholder="********" style={baseInputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>New Password</label>
                    <input type="password" placeholder="********" style={baseInputStyle} />
                  </div>
                  <button onClick={() => toast.success("Password updated!")} style={{ padding: '16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '16px' }}>
                    Update Password
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
