import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mandateAPI } from '../utils/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

// ===== SIDEBAR COMPONENT =====
const Sidebar = ({ active, onNavigate }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { id: 'create', icon: '➕', label: 'Create Mandate', path: '/create-mandate' },
    { id: 'mandates', icon: '📋', label: 'My Mandates', path: '/mandates' },
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
      background: 
        'linear-gradient(180deg, #FFFFFF 0%, #312E81 100%)',
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

      {/* Logo */}
      <div style={{
        padding: '8px 12px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '24px',
      }}>
        <img
          src={logo}
          alt="AutoPaise"
          style={{
            height: '40px',
            width: 'auto',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>

      {/* User info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '14px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 
            'linear-gradient(135deg, #FFD700, #FFA500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: '800',
          color: '#7B4F00',
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user?.name || 'User'}
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '11px',
          }}>
            Business Owner
          </div>
        </div>
      </div>

      {/* Menu items */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '4px',
              cursor: 'pointer',
              background: active === item.id
                ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                : 'transparent',
              color: active === item.id
                ? 'white'
                : 'rgba(255,255,255,0.65)',
              fontWeight: active === item.id
                ? '700' : '500',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: active === item.id
                ? '0 4px 15px rgba(99,102,241,0.4)'
                : 'none',
              borderLeft: active === item.id
                ? '3px solid #A5B4FC'
                : '3px solid transparent',
            }}
            onMouseEnter={e => {
              if (active !== item.id) {
                e.currentTarget.style.background = 
                  'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={e => {
              if (active !== item.id) {
                e.currentTarget.style.background = 
                  'transparent';
                e.currentTarget.style.color = 
                  'rgba(255,255,255,0.65)';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          cursor: 'pointer',
          color: 'rgba(255,100,100,0.8)',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid rgba(255,100,100,0.2)',
          transition: 'all 0.2s',
          marginTop: '8px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 
            'rgba(239,68,68,0.1)';
          e.currentTarget.style.color = '#FCA5A5';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 
            'transparent';
          e.currentTarget.style.color = 
            'rgba(255,100,100,0.8)';
        }}
      >
        <span style={{ fontSize: '18px' }}>🚪</span>
        Logout
      </div>
    </div>
  );
};

// ===== WAVE SUMMARY CARD =====
const WaveCard = ({ title, value, icon, gradient, subtitle, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const numValue = parseInt(
    String(value).replace(/[^0-9]/g, '')
  ) || 0;
  const prefix = String(value).includes('₹') ? '₹' : '';

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime - delay;
      if (elapsed < 0) return;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(numValue * eased);
      setCount(start);
      if (progress >= 1) {
        setCount(numValue);
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numValue, delay]);

  return (
    <div style={{
      background: gradient,
      borderRadius: '20px',
      padding: '24px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      transition: 'transform 0.3s',
      cursor: 'pointer',
      animation: `fadeInUp 0.6s ease ${delay/1000}s forwards`,
      opacity: 0,
    }}
    onMouseEnter={e => 
      e.currentTarget.style.transform = 
        'translateY(-6px)'}
    onMouseLeave={e => 
      e.currentTarget.style.transform = 
        'translateY(0)'}
    >
      {/* Wave effects */}
      <div style={{
        position: 'absolute',
        bottom: '-15px',
        left: '-10%',
        width: '120%',
        height: '50px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'wave1 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-5px',
        left: '-10%',
        width: '120%',
        height: '40px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '50%',
        animation: 'wave2 4s ease-in-out infinite',
      }} />
      {/* Circle deco */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '28px',
          marginBottom: '12px',
        }}>
          {icon}
        </div>
        <div style={{
          fontSize: '13px',
          opacity: 0.85,
          fontWeight: '500',
          marginBottom: '4px',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '30px',
          fontWeight: '900',
          letterSpacing: '-1px',
        }}>
          {prefix}{count.toLocaleString('en-IN')}
        </div>
        {subtitle && (
          <div style={{
            fontSize: '11px',
            opacity: 0.7,
            marginTop: '4px',
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== PULSE STATUS BADGE =====
const StatusBadge = ({ status }) => {
  const configs = {
    'Active': { 
      color: '#10B981', bg: '#D1FAE5', 
      border: '#A7F3D0', pulse: true 
    },
    'Pending Approval': { 
      color: '#F59E0B', bg: '#FEF3C7', 
      border: '#FDE68A', pulse: true 
    },
    'Pending': { 
      color: '#F59E0B', bg: '#FEF3C7', 
      border: '#FDE68A', pulse: true 
    },
    'Paused': { 
      color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.05)', 
      border: '#E5E7EB', pulse: false 
    },
    'Cancelled': { 
      color: '#EF4444', bg: '#FEE2E2', 
      border: '#FECACA', pulse: false 
    },
  };
  const c = configs[status] || configs['Pending'];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '600',
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        position: 'relative',
        display: 'inline-flex',
        width: '7px',
        height: '7px',
      }}>
        {c.pulse && (
          <span style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: c.color,
            opacity: 0.5,
            animation: 
              'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }} />
        )}
        <span style={{
          position: 'relative',
          borderRadius: '50%',
          width: '7px',
          height: '7px',
          background: c.color,
          display: 'inline-block',
        }} />
      </span>
      {status}
    </span>
  );
};

// ===== MAIN DASHBOARD =====
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => 
      setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => 
      window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Always refresh on Dashboard load so newly-paid mandates show as Active immediately.
    loadMandates();
  }, []);


  const loadMandates = async () => {
    try {
      const response = await mandateAPI.getAll();
      setMandates(response.data.mandates || []);
    } catch (error) {
      toast.error('Failed to load mandates');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const activeCount = mandates.filter(
    m => m.status === 'Active').length;
  const pendingCount = mandates.filter(
    m => m.status === 'Pending' || 
         m.status === 'Pending Approval').length;
  const totalCollected = mandates.reduce(
    (sum, m) => sum + (m.completedPayments * m.amount), 0
  );
  const uniqueCustomers = new Set(
    mandates.map(m => m.payeeUpiId)
  ).size;

  // Today's date
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0A0A0F',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Sidebar */}
      {!isMobile && <Sidebar active="dashboard" />}

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '260px',
        padding: '32px',
        overflowY: 'auto',
      }}>

        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          animation: 'fadeInDown 0.6s ease forwards',
        }}>
          <div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: '4px',
            }}>
              Good {new Date().getHours() < 12 
                ? 'Morning' 
                : new Date().getHours() < 17 
                  ? 'Afternoon' 
                  : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
            }}>
              {today}
            </p>
          </div>

          {/* Create mandate button */}
          <button
            onClick={() => navigate('/create-mandate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 
                'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 
                '0 4px 15px rgba(99,102,241,0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 
                'translateY(-2px)';
              e.currentTarget.style.boxShadow = 
                '0 8px 25px rgba(99,102,241,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 
                'translateY(0)';
              e.currentTarget.style.boxShadow = 
                '0 4px 15px rgba(99,102,241,0.4)';
            }}
          >
            ➕ Create Mandate
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <WaveCard
            title="Active Mandates"
            value={activeCount}
            icon="⚡"
            gradient=
              "linear-gradient(135deg, #6366F1, #4F46E5)"
            subtitle="Auto collecting"
            delay={0}
          />
          <WaveCard
            title="Total Collected"
            value={`₹${totalCollected}`}
            icon="💰"
            gradient=
              "linear-gradient(135deg, #10B981, #059669)"
            subtitle="All time"
            delay={150}
          />
          <WaveCard
            title="Total Customers"
            value={uniqueCustomers}
            icon="👥"
            gradient=
              "linear-gradient(135deg, #8B5CF6, #7C3AED)"
            subtitle="Unique customers"
            delay={300}
          />
          <WaveCard
            title="Pending Approval"
            value={pendingCount}
            icon="⏳"
            gradient=
              "linear-gradient(135deg, #F59E0B, #D97706)"
            subtitle="Awaiting customer"
            delay={450}
          />
        </div>

        {/* Mandates Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s ease 0.3s forwards',
          opacity: 0,
        }}>

          {/* Table header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#FFFFFF',
              }}>
                Your Mandates
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                marginTop: '2px',
              }}>
                {mandates.length} total mandates
              </p>
            </div>
            <button
              onClick={() => navigate('/create-mandate')}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.05)',
                color: '#6366F1',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              + New
            </button>
          </div>

          {/* Loading state */}
          {loading ? (
            <div style={{ padding: '40px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: '60px',
                  background: 
                    'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '10px',
                  marginBottom: '12px',
                }} />
              ))}
            </div>
          ) : mandates.length === 0 ? (
            /* Empty state */
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                📋
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#FFFFFF',
                marginBottom: '8px',
              }}>
                No mandates yet!
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                marginBottom: '24px',
              }}>
                Create your first mandate to start 
                collecting payments automatically
              </p>
              <button
                onClick={() => navigate('/create-mandate')}
                style={{
                  padding: '12px 28px',
                  background: 
                    'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: 
                    '0 4px 15px rgba(99,102,241,0.4)',
                }}
              >
                Create First Mandate →
              </button>
            </div>
          ) : (
            /* Table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    background: '#0A0A0F',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {['Mandate ID', 'Customer', 
                      'UPI ID', 'Amount', 
                      'Frequency', 'Status', 
                      'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mandates.map((mandate, i) => (
                    <tr
                      key={mandate._id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        transition: 'background 0.15s',
                        animation: 
                          `fadeInUp 0.5s ease ${i * 0.08}s forwards`,
                        opacity: 0,
                      }}
                      onMouseEnter={e => 
                        e.currentTarget.style.background = 
                          '#0A0A0F'}
                      onMouseLeave={e => 
                        e.currentTarget.style.background = 
                          'transparent'}
                    >
                      <td style={{
                        padding: '14px 16px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#6366F1',
                        whiteSpace: 'nowrap',
                      }}>
                        {mandate.mandateId}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#FFFFFF',
                      }}>
                        {mandate.payeeName}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'monospace',
                      }}>
                        {mandate.payeeUpiId}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: '#FFFFFF',
                        whiteSpace: 'nowrap',
                      }}>
                        ₹{mandate.amount
                          .toLocaleString('en-IN')}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.6)',
                      }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#6366F1',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          {mandate.frequency}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge 
                          status={mandate.status} 
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => {
                            localStorage.setItem(
                              'selected_mandate_id', 
                              mandate._id
                            );
                            navigate(
                              `/mandate/${mandate._id}`
                            );
                          }}
                          style={{
                            padding: '6px 14px',
                            background: 'transparent',
                            border: '2px solid #6366F1',
                            borderRadius: '8px',
                            color: '#6366F1',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.target.style.background = 
                              '#6366F1';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={e => {
                            e.target.style.background = 
                              'transparent';
                            e.target.style.color = 
                              '#6366F1';
                          }}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          animation: 
            'fadeInUp 0.8s ease 0.5s forwards',
          opacity: 0,
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#FFFFFF',
            marginBottom: '20px',
          }}>
            Recent Activity
          </h2>

          {mandates.length === 0 ? (
            <p style={{
              color: '#9CA3AF',
              fontSize: '14px',
              textAlign: 'center',
              padding: '20px',
            }}>
              No activity yet. Create your first mandate!
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {mandates.slice(0,5).map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#0A0A0F',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  animation: 
                    `fadeInLeft 0.5s ease ${i*0.1}s forwards`,
                  opacity: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 
                    '#EEF2FF';
                  e.currentTarget.style.transform = 
                    'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 
                    '#0A0A0F';
                  e.currentTarget.style.transform = 
                    'translateX(0)';
                }}
                onClick={() => navigate(
                  `/mandate/${m._id}`
                )}
                >
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 
                      m.status === 'Active' 
                        ? '#D1FAE5'
                        : m.status === 'Pending' || 
                          m.status === 'Pending Approval'
                          ? '#FEF3C7'
                          : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    {m.status === 'Active' ? '✅' 
                      : m.status === 'Pending' || 
                        m.status === 'Pending Approval'
                        ? '⏳' : '📋'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}>
                      {m.payeeName}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                    }}>
                      {m.mandateId} • {m.frequency}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{
                    textAlign: 'right',
                  }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '800',
                      color: '#FFFFFF',
                    }}>
                      ₹{m.amount.toLocaleString('en-IN')}
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating create button - mobile */}
        {isMobile && (
          <button
            onClick={() => navigate('/create-mandate')}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 
                'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: 
                '0 8px 25px rgba(99,102,241,0.5)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ➕
          </button>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
