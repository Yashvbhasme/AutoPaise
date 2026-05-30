import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

// Particle background component
const DarkParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const particles = Array.from(
      { length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      })
    );

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 
          `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 
              `rgba(139,92,246,${0.15 * (1-dist/100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailStep = (e) => {
    e.preventDefault();
    if (!formData.email || 
        !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Enter a valid email' });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      const { token, user } = response.data;
      login(user, token);
      toast.success(
        `Welcome back, ${user.name.split(' ')[0]}! 👋`
      );
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        'Invalid email or password'
      );
      setErrors({ 
        password: 'Invalid credentials' 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: hasError 
      ? '1px solid #EF4444'
      : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      padding: '24px',
    }}>

      {/* Particle Background */}
      <DarkParticles />

      {/* Gradient orbs */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '15%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 
          'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '20%',
        right: '15%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 
          'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Main Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '400px',
        background: 
          'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px 36px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 
          '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'fadeInUp 0.6s ease forwards',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '28px',
        }}>
          <img
            src={logo}
            alt="AutoPaise"
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain',
              background: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
            }}
          />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '6px',
        }}>
          Welcome to AutoPaise
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '13px',
          marginBottom: '28px',
        }}>
          UPI AutoPay Mandate Management
        </p>

        {/* Step 1 - Email */}
        {step === 1 && (
          <form onSubmit={handleEmailStep}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '8px',
                letterSpacing: '0.5px',
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="enter your email address..."
                style={inputStyle(errors.email)}
                onFocus={e => {
                  e.target.style.border = 
                    '1px solid rgba(99,102,241,0.6)';
                  e.target.style.background = 
                    'rgba(255,255,255,0.07)';
                  e.target.style.boxShadow = 
                    '0 0 0 3px rgba(99,102,241,0.1)';
                }}
                onBlur={e => {
                  e.target.style.border = 
                    errors.email 
                      ? '1px solid #EF4444'
                      : '1px solid rgba(255,255,255,0.1)';
                  e.target.style.background = 
                    'rgba(255,255,255,0.05)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <p style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  marginTop: '6px',
                }}>
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px',
                background: 
                  'rgba(255,255,255,0.08)',
                border: 
                  '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
                marginBottom: '8px',
              }}
              onMouseEnter={e => {
                e.target.style.background = 
                  'rgba(255,255,255,0.12)';
                e.target.style.borderColor = 
                  'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 
                  'rgba(255,255,255,0.08)';
                e.target.style.borderColor = 
                  'rgba(255,255,255,0.12)';
              }}
            >
              Continue with Email →
            </button>

          </form>
        )}

        {/* Step 2 - Password */}
        {step === 2 && (
          <form onSubmit={handleSubmit}
            style={{
              animation: 'fadeInUp 0.3s ease forwards',
            }}>
            
            {/* Email display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              cursor: 'pointer',
            }}
            onClick={() => setStep(1)}>
              <span style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '13px',
                flex: 1,
              }}>
                {formData.email}
              </span>
              <span style={{
                color: '#6366F1',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                Change
              </span>
            </div>

            <div style={{ 
              marginBottom: '16px',
              position: 'relative',
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="enter your password..."
                  autoFocus
                  style={{
                    ...inputStyle(errors.password),
                    paddingRight: '44px',
                  }}
                  onFocus={e => {
                    e.target.style.border = 
                      '1px solid rgba(99,102,241,0.6)';
                    e.target.style.background = 
                      'rgba(255,255,255,0.07)';
                    e.target.style.boxShadow = 
                      '0 0 0 3px rgba(99,102,241,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.border = 
                      errors.password
                        ? '1px solid #EF4444'
                        : '1px solid rgba(255,255,255,0.1)';
                    e.target.style.background = 
                      'rgba(255,255,255,0.05)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => 
                    setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '16px',
                    padding: '4px',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  marginTop: '6px',
                }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading
                  ? 'rgba(99,102,241,0.4)'
                  : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading 
                  ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 20px rgba(99,102,241,0.4)',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.target.style.transform = 
                    'translateY(-1px)';
                  e.target.style.boxShadow = 
                    '0 8px 25px rgba(99,102,241,0.5)';
                }
              }}
              onMouseLeave={e => {
                e.target.style.transform = 
                  'translateY(0)';
                e.target.style.boxShadow = 
                  '0 4px 20px rgba(99,102,241,0.4)';
              }}
            >
              {loading ? '⏳ Logging in...' : 'Login →'}
            </button>

          </form>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <span style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: '11px',
            letterSpacing: '1px',
          }}>
            OR
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
          }} />
        </div>

        {/* Register link */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '13px',
        }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#8B5CF6',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Create one free
          </Link>
        </p>

        {/* Back to home */}
        <p style={{
          textAlign: 'center',
          marginTop: '12px',
        }}>
          <Link
            to="/"
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '12px',
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
