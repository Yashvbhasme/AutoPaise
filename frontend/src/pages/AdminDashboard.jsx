import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { buildBackendUrl } from '../utils/apiConfig';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const AdminSidebar = ({ active, onNavigate }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Admin logged out successfully!');
    navigate('/login');
  };

  return (
    <div style={{ width: '260px', minHeight: '100vh', background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, boxShadow: '4px 0 20px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '8px 12px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <img src={logo} alt="AutoPaise Admin" style={{ height: '40px', width: 'auto' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '14px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: '#111827', fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</div>
          <div style={{ color: '#DC2626', fontSize: '11px', fontWeight: '600' }}>Super Admin</div>
        </div>
      </div>
      <nav style={{ flex: 1 }}>
        <div onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #EF4444, #B91C1C)', color: 'white', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(239,68,68,0.4)', borderLeft: '3px solid #FCA5A5' }}>
          <span style={{ fontSize: '18px' }}>🛡️</span>Verifications
        </div>
      </nav>
      <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', color: '#4B5563', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', marginTop: '8px' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#111827'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4B5563'; }}>
        <span style={{ fontSize: '18px' }}>🚪</span>Logout
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [stats, setStats] = useState({ all: 0, pending: 0, verified: 0 });
  const isMobile = window.innerWidth < 768;
  const getPassbookUrl = (path) => buildBackendUrl(path);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admins only.');
      navigate('/dashboard');
      return;
    }

    const fetchPending = async () => {
      try {
        const res = await adminAPI.getPending();
        if (res.data.success) {
          setUsers(res.data.users);
          if (res.data.stats) setStats(res.data.stats);
        }
      } catch (err) {
        toast.error('Failed to load pending verifications');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [user, navigate]);

  const handleVerify = async (userId) => {
    setVerifyingId(userId);
    try {
      const res = await adminAPI.verifyBank(userId);
      if (res.data.success) {
        toast.success('User bank details verified successfully!');
        setUsers(users.filter(u => u._id !== userId));
        setStats(prev => ({ 
          ...prev, 
          pending: Math.max(0, prev.pending - 1),
          verified: prev.verified + 1 
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile && <AdminSidebar active="verifications" />}

      <div style={{ flex: 1, marginLeft: isMobile ? 0 : '260px', padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', animation: 'fadeInDown 0.6s ease forwards' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Pending Verifications 🛡️</h1>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>Review and approve business owner bank details.</p>
            </div>
          </div>

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px', animation: 'fadeInUp 0.5s ease forwards' }}>
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>Total Applications</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>{stats.all}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #FDE68A', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#F59E0B' }} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#D97706', textTransform: 'uppercase', marginBottom: '8px' }}>Pending / New</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>{stats.pending}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #A7F3D0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669', textTransform: 'uppercase', marginBottom: '8px' }}>Verified & Active</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>{stats.verified}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {loading ? (
              <div style={{ color: '#4B5563', textAlign: 'center', padding: '40px' }}>Loading pending reviews...</div>
            ) : users.length === 0 ? (
              <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '60px', textAlign: 'center', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎉</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>All caught up!</h3>
                <p style={{ color: '#6B7280' }}>There are no pending bank verifications right now.</p>
              </div>
            ) : (
              users.map((u, i) => (
                <div key={u._id} style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', animation: `fadeInUp 0.5s ease ${i * 0.1}s forwards`, opacity: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    
                    {/* User Info */}
                    <div style={{ flex: '1 1 300px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        👤 {u.name}
                        <span style={{ fontSize: '11px', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', color: '#4B5563' }}>Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                      </h3>
                      <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Email</span><p style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>{u.email}</p></div>
                        <div><span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Phone</span><p style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>{u.mobile}</p></div>
                      </div>
                    </div>

                    {/* Bank Info */}
                    <div style={{ flex: '1 1 300px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>🏦 Bank Details</h3>
                      <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Account Name</span><p style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>{u.bankDetails.accountName}</p></div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <div><span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>A/C No</span><p style={{ color: '#111827', fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{u.bankDetails.accountNumber}</p></div>
                          <div><span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>IFSC</span><p style={{ color: '#111827', fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{u.bankDetails.ifscCode}</p></div>
                        </div>
                        <div><span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Bank & Type</span><p style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>{u.bankDetails.bankName} - {u.bankDetails.accountType}</p></div>
                      </div>
                    </div>

                    {/* Passbook / Action */}
                    <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>📄 Proof</h3>
                      {u.bankDetails.passbookUrl ? (
                        <a href={getPassbookUrl(u.bankDetails.passbookUrl)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#F3F4F6', borderRadius: '12px', overflow: 'hidden', height: '140px', border: '1px solid #E5E7EB', position: 'relative', cursor: 'pointer' }}>
                          <img src={getPassbookUrl(u.bankDetails.passbookUrl)} alt="Passbook" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px', textAlign: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }}>Click to view full</div>
                        </a>
                      ) : (
                        <div style={{ background: '#FEF2F2', padding: '24px', borderRadius: '12px', textAlign: 'center', color: '#DC2626', fontSize: '13px', fontWeight: '600', border: '1px solid #FECACA' }}>
                          No proof uploaded
                        </div>
                      )}

                      <button 
                        onClick={() => handleVerify(u._id)} 
                        disabled={verifyingId === u._id}
                        style={{ 
                          width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: verifyingId === u._id ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s', marginTop: 'auto' 
                        }}
                      >
                        {verifyingId === u._id ? 'Verifying...' : '✅ Approve & Verify'}
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
