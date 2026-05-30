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

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = 'Full name is required';
    if (!formData.email.trim())
      newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Enter valid email';
    if (!formData.mobile.trim())
      newErrors.mobile = 'Mobile is required';
    else if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = 'Enter 10 digit number';
    if (!formData.password)
      newErrors.password = 'Password required';
    else if (formData.password.length < 8)
      newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 
        'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });
      const { token, user } = response.data;
      login(user, token);
      toast.success('Account created! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        'Registration failed'
      );
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

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  };

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

      <DarkParticles />

      {/* Gradient orbs */}
      <div style={{
        position: 'fixed',
        top: '10%',
        right: '10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 
          'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 
          'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '36px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 
          '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'fadeInUp 0.6s ease forwards',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
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

        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '4px',
        }}>
          Create Account
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '13px',
          marginBottom: '24px',
        }}>
          Start automating your payments today
        </p>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="enter your full name..."
              style={inputStyle(errors.name)}
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
                  errors.name
                    ? '1px solid #EF4444'
                    : '1px solid rgba(255,255,255,0.1)';
                e.target.style.background = 
                  'rgba(255,255,255,0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.name && (
              <p style={{
                color: '#EF4444',
                fontSize: '11px',
                marginTop: '4px',
              }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com..."
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
                fontSize: '11px',
                marginTop: '4px',
              }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Mobile */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>
              Mobile Number
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '8px' 
            }}>
              <div style={{
                padding: '12px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: 
                  '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}>
                🇮🇳 +91
              </div>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10 digit number..."
                maxLength={10}
                style={{
                  ...inputStyle(errors.mobile),
                  flex: 1,
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
                    errors.mobile
                      ? '1px solid #EF4444'
                      : '1px solid rgba(255,255,255,0.1)';
                  e.target.style.background = 
                    'rgba(255,255,255,0.05)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            {errors.mobile && (
              <p style={{
                color: '#EF4444',
                fontSize: '11px',
                marginTop: '4px',
              }}>
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="min 8 characters..."
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
                fontSize: '11px',
                marginTop: '4px',
              }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="re-enter password..."
                style={{
                  ...inputStyle(errors.confirmPassword),
                  paddingRight: '44px',
                  border: formData.confirmPassword && 
                    formData.password === 
                    formData.confirmPassword
                      ? '1px solid rgba(16,185,129,0.5)'
                      : errors.confirmPassword
                        ? '1px solid #EF4444'
                        : '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => {
                  e.target.style.border = 
                    '1px solid rgba(99,102,241,0.6)';
                  e.target.style.background = 
                    'rgba(255,255,255,0.07)';
                }}
                onBlur={e => {
                  e.target.style.background = 
                    'rgba(255,255,255,0.05)';
                }}
              />
              <button
                type="button"
                onClick={() => 
                  setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px',
                }}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {formData.confirmPassword && 
             formData.password === 
             formData.confirmPassword && (
              <p style={{
                color: '#10B981',
                fontSize: '11px',
                marginTop: '4px',
              }}>
                ✅ Passwords match
              </p>
            )}
            {errors.confirmPassword && (
              <p style={{
                color: '#EF4444',
                fontSize: '11px',
                marginTop: '4px',
              }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
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
            {loading 
              ? '⏳ Creating Account...' 
              : 'Create Account →'}
          </button>

        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '16px 0',
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <span style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '11px',
          }}>
            OR
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
          }} />
        </div>

        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '13px',
        }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#8B5CF6',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Login here
          </Link>
        </p>

        <p style={{
          textAlign: 'center',
          marginTop: '10px',
        }}>
          <Link
            to="/"
            style={{
              color: 'rgba(255,255,255,0.2)',
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

export default Register;
