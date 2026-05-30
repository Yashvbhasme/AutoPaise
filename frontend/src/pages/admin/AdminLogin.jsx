import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/adminApi';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (localStorage.getItem('recurpay_admin_token')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await adminAPI.login({ email, password });
      localStorage.setItem('recurpay_admin_token', res.data.token);
      localStorage.setItem('recurpay_admin', JSON.stringify(res.data.admin));
      toast.success('Welcome Admin! 👨‍💼');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0C29, #302B63, #24243E)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
    }}>
      {/* Animated background circles */}
      <div style={{
        position: 'fixed',
        top: '-100px', right: '-100px',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'rgba(99,102,241,0.1)',
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-80px', left: '-80px',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'rgba(139,92,246,0.1)',
        animation: 'pulse 4s ease-in-out infinite 1s',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.7s ease forwards',
      }}>
        {/* Admin badge */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            🛡️
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '900',
            color: 'white',
            marginBottom: '6px',
          }}>
            Admin Portal
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
          }}>
            RecurPay Administration Panel
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '6px',
              }}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@recurpay.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: 'white',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.border = '1px solid #6366F1'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.15)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '6px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'white',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => e.target.style.border = '1px solid #6366F1'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.15)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Logging in...' : '🛡️ Login to Admin Panel'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              textAlign: 'center',
              marginBottom: '4px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Demo Credentials
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '12px',
              textAlign: 'center',
            }}>
              admin@recurpay.com / Admin@123456
            </p>
          </div>
        </div>

        {/* Back link */}
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
        }}>
          <a href="/" style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            textDecoration: 'none',
          }}>
            ← Back to RecurPay
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
