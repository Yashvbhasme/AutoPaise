import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/adminApi';
import toast from 'react-hot-toast';

const badgeStyle = (active) => ({
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: '700',
  background: active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
  color: active ? '#34D399' : '#F87171',
  whiteSpace: 'nowrap',
});

const InfoBadge = ({ configured }) => (
  <span
    style={{
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '700',
      background: configured ? 'rgba(99,102,241,0.18)' : 'rgba(148,163,184,0.18)',
      color: configured ? '#A5B4FC' : '#CBD5E1',
      whiteSpace: 'nowrap',
    }}
  >
    {configured ? 'Razorpay Connected' : 'Razorpay Missing'}
  </span>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [owners, setOwners] = useState([]);
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const admin = JSON.parse(localStorage.getItem('recurpay_admin') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('recurpay_admin_token')) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ownersRes, mandatesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllOwners(),
        adminAPI.getAllMandates(),
      ]);
      setStats(statsRes.data.stats);
      setOwners(ownersRes.data.owners);
      setMandates(mandatesRes.data.mandates);
      if (selectedOwner) {
        const refreshed = ownersRes.data.owners.find((owner) => owner._id === selectedOwner._id);
        setSelectedOwner(refreshed || null);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (owner) => {
    let reason = '';
    if (owner.isActive) {
      reason = window.prompt(`Please provide a reason for deactivating ${owner.name}'s account:`);
      if (reason === null) return;
      if (!reason.trim()) {
        toast.error('Reason is required to deactivate an account.');
        return;
      }
    } else if (!window.confirm(`Activate ${owner.name}'s account?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminAPI.toggleOwnerStatus(owner._id, reason);
      toast.success(res.data.message);
      await loadData();
    } catch (error) {
      toast.error('Failed to update account status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('recurpay_admin_token');
    localStorage.removeItem('recurpay_admin');
    navigate('/admin');
    toast.success('Logged out!');
  };

  const ownerMandates = selectedOwner
    ? mandates.filter((mandate) => mandate.user?._id === selectedOwner._id || mandate.ownerId === selectedOwner._id)
    : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '260px', minHeight: '100vh', background: 'linear-gradient(180deg, #0F0C29, #1E1B4B)', padding: '24px 16px', position: 'fixed', inset: '0 auto 0 0', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '8px 12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>S</div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>RecurPay</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Monitor</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800' }}>
            {admin.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>{admin.name || 'Admin'}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Platform Admin</div>
          </div>
        </div>

        <div style={{ padding: '11px 14px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', borderLeft: '2px solid #6366F1', fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>
          Monitoring Panel
        </div>

        <button onClick={handleLogout} style={{ marginTop: 'auto', width: '100%', padding: '11px 14px', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: 'rgba(239,68,68,0.8)', fontSize: '14px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>Shop Owner Monitoring</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
              View all shop owners, their account status, Razorpay setup, and mandate activity.
            </p>
          </div>
          <button onClick={loadData} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.3)', borderTop: '3px solid #6366F1', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Owners', value: stats.totalOwners, color: '#818CF8' },
                  { label: 'Owners With Razorpay', value: owners.filter((owner) => owner.razorpayAccount?.isConfigured).length, color: '#34D399' },
                  { label: 'Active Accounts', value: owners.filter((owner) => owner.isActive).length, color: '#FBBF24' },
                  { label: 'Total Mandates', value: stats.totalMandates, color: '#F9A8D4' },
                ].map((card) => (
                  <div key={card.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: card.color, marginBottom: '6px' }}>{card.value}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{card.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: selectedOwner ? '1.1fr 0.9fr' : '1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>All Shop Owners</h2>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Owner', 'Contact', 'Account', 'Razorpay', 'Mandates', 'Action'].map((heading) => (
                        <th key={heading} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {owners.map((owner) => {
                      const ownerMandateCount = mandates.filter((mandate) => mandate.user?._id === owner._id || mandate.ownerId === owner._id).length;
                      return (
                        <tr key={owner._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: selectedOwner?._id === owner._id ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                          <td style={{ padding: '14px 16px', color: 'white', fontWeight: '700', cursor: 'pointer' }} onClick={() => setSelectedOwner(owner)}>
                            {owner.name}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                            <div>{owner.email}</div>
                            <div>{owner.mobile}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={badgeStyle(owner.isActive)}>{owner.isActive ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <InfoBadge configured={owner.razorpayAccount?.isConfigured} />
                          </td>
                          <td style={{ padding: '14px 16px', color: 'white', fontWeight: '700' }}>{ownerMandateCount}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <button onClick={() => setSelectedOwner(owner)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '8px', color: '#A5B4FC', fontSize: '12px', cursor: 'pointer' }}>
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedOwner && (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', alignSelf: 'start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{selectedOwner.name}</h2>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>{selectedOwner.email}</p>
                    </div>
                    <span style={badgeStyle(selectedOwner.isActive)}>{selectedOwner.isActive ? 'Active' : 'Inactive'}</span>
                  </div>

                  <div style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Phone</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{selectedOwner.mobile}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Joined</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{new Date(selectedOwner.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Razorpay Key</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{selectedOwner.razorpayAccount?.keyId || 'Not connected yet'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Mandates</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{ownerMandates.length} total</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>Recent Mandates</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {ownerMandates.length === 0 ? (
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>No mandates created yet.</div>
                      ) : (
                        ownerMandates.slice(0, 3).map((mandate) => (
                          <div key={mandate._id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '700', fontSize: '13px' }}>{mandate.payeeName}</span>
                              <span style={{ color: '#A5B4FC', fontSize: '12px' }}>{mandate.status}</span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>
                              {mandate.mandateId} | Rs {mandate.amount} | {mandate.frequency}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button onClick={() => handleToggleStatus(selectedOwner)} disabled={actionLoading} style={{ width: '100%', padding: '12px', background: selectedOwner.isActive ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)', color: selectedOwner.isActive ? '#F87171' : '#34D399', border: selectedOwner.isActive ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                    {actionLoading ? 'Updating...' : selectedOwner.isActive ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
