import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
import logo from '../assets/logo.png';

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / totalHeight) * 100;
      setProgress(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${progress}%`,
      height: '3px',
      background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #10B981)',
      zIndex: 9999,
      transition: 'width 0.1s ease',
      boxShadow: '0 0 10px rgba(99,102,241,0.5)',
    }} />
  );
};

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let rafId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 3 + 1.5,
        opacity: Math.random() * 0.5 + 0.25,
        color: Math.random() > 0.5 ? '99,102,241' : '139,92,246',
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color}, 0.4)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / maxDist) * 0.35})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.55,
      }}
    />
  );
};

const InteractiveCoin = ({ size = 80, delay = '0s' }) => {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const update = (clientX, clientY) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((clientX - centerX) / (size / 2)) * 25;
    const rotateX = -((clientY - centerY) / (size / 2)) * 25;
    setRotation({ x: rotateX, y: rotateY });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setRotation({ x: 0, y: 0 });
      }}
      onMouseMove={(e) => update(e.clientX, e.clientY)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: hover
          ? 'linear-gradient(135deg, #FFE64D, #FFB800, #FF8C00)'
          : 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: '900',
        color: '#7B4F00',
        border: `3px solid ${hover ? '#FFB800' : '#DAA520'}`,
        boxShadow: hover
          ? '0 18px 42px rgba(255,165,0,0.7), 0 0 28px rgba(255,215,0,0.4)'
          : '0 8px 25px rgba(255,165,0,0.45)',
        cursor: 'pointer',
        userSelect: 'none',
        transform: hover
          ? `perspective(300px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.15)`
          : 'perspective(300px) rotateX(0) rotateY(0) scale(1)',
        transition: hover ? 'transform 0.1s, box-shadow 0.1s' : 'all 0.4s ease',
        animationName: hover ? 'none' : 'coinSpin, coinFloat',
        animationDuration: hover ? '0s' : '3s, 2s',
        animationTimingFunction: hover ? 'ease' : 'linear, ease-in-out',
        animationIterationCount: hover ? '1' : 'infinite, infinite',
        animationDelay: delay,
      }}
    >
      ₹
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [heroRef, heroVisible] = useScrollAnimation(0.1);
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation(0.1);
  const [whoUsesRef, whoUsesVisible] = useScrollAnimation(0.1);
  const [featuresRef, featuresVisible] = useScrollAnimation(0.1);
  const [ctaRef, ctaVisible] = useScrollAnimation(0.1);

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#0A0A0F',
      position: 'relative',
    }}>
      <ScrollProgress />
      <ParticleBackground />

      {/* ===== NAVBAR ===== */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <img
            src={logo}
            alt="AutoPaise Logo"
            style={{
              height: '45px',
              width: 'auto',
              objectFit: 'contain',
              opacity: 0,
              animation: 'fadeInLeft 0.8s ease forwards',
            }}
            onError={(e) => {
              console.warn('Logo failed to load', e);
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Nav Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          opacity: 0,
          animation: 'fadeInRight 0.8s ease forwards',
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 24px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(255,255,255,0.05)';
              e.target.style.color = 'white';
            }}>
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e =>
              (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={e =>
              (e.target.style.transform = 'translateY(0)')}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION WITH VIDEO BG ===== */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>

        {/* Dark hero background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(10,10,15,1) 0%, rgba(30,27,75,0.95) 50%, rgba(10,10,15,1) 100%)',
          zIndex: 1,
        }} />

        {/* Hero Content - above video */}
        <div 
          ref={heroRef}
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: '80px 24px',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
          }}
        >

          {/* 3 Interactive Coins */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            marginBottom: '40px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'scale(1)' : 'scale(0.5)',
            transition: 'all 0.8s ease 0.1s',
          }}>
            <InteractiveCoin size={70} delay="0s" />
            <InteractiveCoin size={100} delay="0.4s" />
            <InteractiveCoin size={70} delay="0.8s" />
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '999px',
            padding: '8px 20px',
            fontSize: '13px',
            color: 'white',
            fontWeight: '600',
            marginBottom: '24px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease 0.2s',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'inline-block',
              boxShadow: '0 0 8px #10B981',
            }} />
            Powered by Razorpay UPI AutoPay
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 62px)',
            fontWeight: '900',
            color: 'white',
            lineHeight: '1.1',
            marginBottom: '20px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.7s ease 0.3s',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            Collect Recurring Payments
            <span style={{
              display: 'block',
              background:
                'linear-gradient(135deg, #A5B4FC, #C4B5FD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Effortlessly
            </span>
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: '1.7',
            maxWidth: '560px',
            margin: '0 auto 40px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.7s ease 0.4s',
          }}>
            Set up UPI AutoPay mandates for your 
            customers. They approve once — you 
            collect automatically every month 
            or quarter. No manual work needed!
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '56px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.7s ease 0.5s',
          }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 40px',
                background: 'white',
                color: '#6366F1',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow =
                  '0 12px 30px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow =
                  '0 8px 25px rgba(0,0,0,0.2)';
              }}>
              Start Collecting Free →
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '16px 40px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform =
                  'translateY(-3px)';
                e.currentTarget.style.background =
                  'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform =
                  'translateY(0)';
                e.currentTarget.style.background =
                  'rgba(255,255,255,0.15)';
              }}>
              Login to Dashboard
            </button>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '48px',
            flexWrap: 'wrap',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.7s ease 0.6s',
          }}>
            {[
              { value: '₹0', label: 'Platform Fee' },
              { value: '100%', label: 'UPI Compatible' },
              { value: '2 Min', label: 'Setup Time' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '30px',
                  fontWeight: '900',
                  color: 'white',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: '500',
                  marginTop: '4px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{
            marginTop: '48px',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease 1.5s forwards',
          }}>
            <div style={{
              width: '30px',
              height: '50px',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '15px',
              margin: '0 auto',
              position: 'relative',
            }}>
              <div style={{
                width: '4px',
                height: '10px',
                background: 'white',
                borderRadius: '2px',
                position: 'absolute',
                left: '50%',
                top: '8px',
                transform: 'translateX(-50%)',
                animation: 'scrollDot 1.5s ease-in-out infinite',
              }} />
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              marginTop: '8px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              Scroll Down
            </p>
          </div>

        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        ref={howItWorksRef}
        style={{
          padding: '80px 24px',
          background: 'transparent',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Section heading slides from left */}
          <div style={{
            opacity: howItWorksVisible ? 1 : 0,
            transform: howItWorksVisible 
              ? 'translateX(0)' : 'translateX(-80px)',
            transition: 'all 0.7s ease 0.1s',
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            <h2
              style={{
                fontSize: '36px',
                fontWeight: '900',
                color: 'white',
                marginBottom: '12px',
              }}
            >
              How It Works
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '16px',
              }}
            >
              Set up in minutes, collect forever
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              {
                step: '01',
                icon: '📝',
                title: 'Create Account',
                desc: 'Register as a business owner or service provider in 2 minutes',
              },
              {
                step: '02',
                icon: '👤',
                title: 'Add Customer',
                desc: 'Enter your customer name and UPI ID to create a mandate',
              },
              {
                step: '03',
                icon: '📱',
                title: 'Customer Approves',
                desc: 'They get a link and approve ONCE on GPay, PhonePe or Paytm',
              },
              {
                step: '04',
                icon: '💰',
                title: 'Auto Collect',
                desc: 'Money is automatically collected and settled to your bank',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '32px 20px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  opacity: howItWorksVisible ? 1 : 0,
                  transform: howItWorksVisible 
                    ? 'translateY(0)' : 'translateY(60px)',
                  transition: `all 0.6s ease ${i * 0.15}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(99,102,241,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#6366F1',
                    letterSpacing: '2px',
                    marginBottom: '12px',
                  }}
                >
                  STEP {item.step}
                </div>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '10px',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO USES RECURPAY ===== */}
      <section
        ref={whoUsesRef}
        style={{
          padding: '80px 24px',
          background: 'transparent',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Heading from right */}
          <div style={{
            opacity: whoUsesVisible ? 1 : 0,
            transform: whoUsesVisible 
              ? 'translateX(0)' : 'translateX(80px)',
            transition: 'all 0.7s ease 0.1s',
            marginBottom: '48px',
          }}>
            <h2
              style={{
                fontSize: '36px',
                fontWeight: '900',
                color: 'white',
                marginBottom: '12px',
              }}
            >
              Who Uses AutoPaise?
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              Perfect for any recurring payment need
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              { icon: '🏠', title: 'Landlords', desc: 'Collect rent automatically every month' },
              { icon: '📚', title: 'Tutors', desc: 'Automate monthly fee collection from students' },
              { icon: '🏪', title: 'Suppliers', desc: 'Set up quarterly payment mandates' },
              { icon: '💼', title: 'Freelancers', desc: 'Collect recurring retainer fees from clients' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '28px 20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  opacity: whoUsesVisible ? 1 : 0,
                  transform: whoUsesVisible 
                    ? 'translateY(0) scale(1)' 
                    : 'translateY(50px) scale(0.9)',
                  transition: `all 0.6s ease ${i * 0.12}s`,
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = 'translateY(-6px)')}
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '8px',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section
        ref={featuresRef}
        style={{
          padding: '80px 24px',
          background: 'transparent',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Heading */}
          <h2 style={{
            fontSize: '36px',
            fontWeight: '900',
            color: 'white',
            marginBottom: '48px',
            opacity: featuresVisible ? 1 : 0,
            transform: featuresVisible 
              ? 'translateY(0)' : 'translateY(-40px)',
            transition: 'all 0.7s ease 0s',
          }}>
            Everything You Need
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                icon: '⚡',
                title: 'Zero Manual Work',
                desc: 'Create a mandate once. Payments are collected automatically every cycle.',
                bg: 'rgba(99,102,241,0.15)',
              },
              {
                icon: '🔐',
                title: 'Bank Grade Security',
                desc: 'Protected by Razorpay and RBI regulated UPI infrastructure.',
                bg: 'rgba(16,185,129,0.15)',
              },
              {
                icon: '📊',
                title: 'Real Time Dashboard',
                desc: 'Track all mandates, payments and customers in one place.',
                bg: 'rgba(139,92,246,0.15)',
              },
              {
                icon: '📱',
                title: 'QR Code Sharing',
                desc: 'Share QR code with customer. They scan and approve instantly.',
                bg: 'rgba(245,158,11,0.15)',
              },
              {
                icon: '🏦',
                title: 'Direct Settlement',
                desc: 'Payments settle directly to your bank account via Razorpay.',
                bg: 'rgba(239,68,68,0.15)',
              },
              {
                icon: '🔔',
                title: 'Smart Notifications',
                desc: 'Get notified on every payment success, failure or mandate update.',
                bg: 'rgba(6,182,212,0.15)',
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  textAlign: 'left',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible 
                    ? 'translateY(0)' 
                    : 'translateY(70px)',
                  transition: `all 0.6s ease ${i * 0.1}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 35px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: f.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    marginBottom: '16px',
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '8px',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section ref={ctaRef} style={{
        padding: '80px 24px',
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible 
            ? 'scale(1)' : 'scale(0.85)',
          transition: 'all 0.8s ease 0s',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {/* Coin in CTA */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: '900',
            color: '#7B4F00',
            border: '3px solid #DAA520',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            animation: 'coinSpin 3s linear infinite, coinFloat 2s ease-in-out infinite',
            margin: '0 auto 32px',
          }}>
            ₹
          </div>

          <h2 style={{
            fontSize: '36px',
            fontWeight: '900',
            color: 'white',
            marginBottom: '16px',
          }}>
            Start Collecting Today
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '16px',
            marginBottom: '40px',
            lineHeight: '1.7',
          }}>
            Join hundreds of business owners who 
            automate their payment collection 
            with AutoPaise
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '18px 48px',
              background: 'white',
              color: '#6366F1',
              border: 'none',
              borderRadius: '14px',
              fontSize: '18px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e =>
              (e.target.style.transform = 'translateY(-3px) scale(1.02)')}
            onMouseLeave={e =>
              (e.target.style.transform = 'translateY(0) scale(1)')}
          >
            Create Free Account →
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: '40px 24px',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
      }}>
        <div style={{
          fontSize: '22px',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #A5B4FC, #C4B5FD)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
        }}>
          AutoPaise
        </div>
        <img
          src={logo}
          alt="AutoPaise"
          style={{
            height: '36px',
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            opacity: 0.8,
            marginBottom: '12px',
          }}
        />
        <p style={{ marginBottom: '8px' }}>
          Collect Recurring Payments. Effortlessly.
        </p>
        <p>© 2026 AutoPaise. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;
