import { useState, useEffect } from 'react';

// Inline all components to avoid import issues

// RotatingCoin
const RotatingCoin = ({ size = 80 }) => (
  <div style={{ 
    width: size, 
    height: size,
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 
        'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
      boxShadow: 
        '0 4px 15px rgba(255,165,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 'bold',
      color: '#7B4F00',
      animation: 'spin 3s linear infinite',
      border: '3px solid #DAA520',
    }}>
      ₹
    </div>
  </div>
);

// WaveCard
const WaveCard = ({ title, value, icon, gradient }) => (
  <div style={{
    background: gradient,
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  }}
  onMouseEnter={e => 
    e.currentTarget.style.transform = 'translateY(-4px)'}
  onMouseLeave={e => 
    e.currentTarget.style.transform = 'translateY(0)'}
  >
    {/* Wave */}
    <div style={{
      position: 'absolute',
      bottom: '-15px',
      left: '-10%',
      width: '120%',
      height: '50px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '50%',
      animation: 'wave1 4s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute',
      bottom: '-5px',
      left: '-10%',
      width: '120%',
      height: '40px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '50%',
      animation: 'wave2 4s ease-in-out infinite',
    }} />
    {/* Circle decorations */}
    <div style={{
      position: 'absolute',
      top: '-20px',
      right: '-20px',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
    }} />
    {/* Content */}
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '13px', 
        opacity: 0.85,
        marginBottom: '4px',
        fontWeight: '500'
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '28px', 
        fontWeight: '700' 
      }}>
        {value}
      </div>
    </div>
  </div>
);

// PulseBadge
const PulseBadge = ({ status }) => {
  const configs = {
    'Active': { color: '#10B981', bg: '#D1FAE5', border: '#A7F3D0' },
    'Pending Approval': { color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' },
    'Pending': { color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' },
    'Paused': { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
    'Cancelled': { color: '#EF4444', bg: '#FEE2E2', border: '#FECACA' },
    'Failed': { color: '#EF4444', bg: '#FEE2E2', border: '#FECACA' },
  };
  const c = configs[status] || configs['Pending'];
  const showPulse = ['Active','Pending','Pending Approval']
    .includes(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '600',
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
    }}>
      <span style={{ position: 'relative', 
        display: 'inline-flex',
        width: '8px', height: '8px' }}>
        {showPulse && (
          <span style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: c.color,
            opacity: 0.5,
            animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }} />
        )}
        <span style={{
          position: 'relative',
          borderRadius: '50%',
          width: '8px',
          height: '8px',
          background: c.color,
          display: 'inline-block',
        }} />
      </span>
      {status}
    </span>
  );
};

// AnimatedBar Chart
const AnimatedChart = () => {
  const [animated, setAnimated] = useState(false);
  const data = [
    { label: 'Jan', value: 65, color: '#6366F1' },
    { label: 'Feb', value: 45, color: '#6366F1' },
    { label: 'Mar', value: 80, color: '#8B5CF6' },
    { label: 'Apr', value: 55, color: '#6366F1' },
    { label: 'May', value: 90, color: '#10B981' },
    { label: 'Jun', value: 70, color: '#6366F1' },
  ];
  const max = Math.max(...data.map(d => d.value));

  useEffect(() => {
    setTimeout(() => setAnimated(true), 300);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-end', 
      gap: '12px',
      height: '180px',
      padding: '0 8px',
    }}>
      {data.map((item, i) => (
        <div key={i} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          height: '100%',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            background: item.color,
            borderRadius: '6px 6px 0 0',
            height: animated 
              ? `${(item.value/max)*150}px` 
              : '0px',
            transition: `height 1s ease ${i*0.15}s`,
            position: 'relative',
            boxShadow: '0 -2px 8px rgba(99,102,241,0.3)',
            minWidth: '30px',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 
                'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
              borderRadius: '6px 6px 0 0',
            }} />
          </div>
          <span style={{ 
            fontSize: '11px', 
            color: '#6B7280',
            fontWeight: '500',
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// CountUp
const CountUp = ({ end, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();
    
    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      setCount(current);
      if (progress < 1) requestAnimationFrame(update);
    };
    
    setTimeout(() => requestAnimationFrame(update), 200);
  }, [end]);

  return (
    <span>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
};

// MAIN TEST PAGE
const AnimationTest = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#F8FAFC',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800',
            color: '#1E1B4B',
            marginBottom: '8px',
          }}>
            🎨 AutoPaise Animations
          </h1>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>
            Preview of all money animations
          </p>
        </div>

        {/* Rotating Coins */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            color: '#374151',
            marginBottom: '24px',
            borderLeft: '4px solid #6366F1',
            paddingLeft: '12px',
          }}>
            🔄 Rotating Coin Animation
          </h2>
          <div style={{ 
            display: 'flex', 
            gap: '40px', 
            alignItems: 'center',
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            {[60, 80, 100, 120].map((size, i) => (
              <div key={i} style={{
                animationName: 'coinFloat',
                animationDuration: '2s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.4}s`,
              }}>
                <RotatingCoin size={size} />
              </div>
            ))}
          </div>
        </section>

        {/* Wave Cards */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            color: '#374151',
            marginBottom: '24px',
            borderLeft: '4px solid #6366F1',
            paddingLeft: '12px',
          }}>
            🌊 Wave Cards with Count Up
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 
              'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <WaveCard
              title="Active Mandates"
              value={<CountUp end={12} />}
              icon="⚡"
              gradient="linear-gradient(135deg, #6366F1, #4F46E5)"
            />
            <WaveCard
              title="Total Collected"
              value={<CountUp end={45000} prefix="₹" />}
              icon="💰"
              gradient="linear-gradient(135deg, #10B981, #059669)"
            />
            <WaveCard
              title="Customers"
              value={<CountUp end={8} />}
              icon="👥"
              gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
            />
            <WaveCard
              title="Pending"
              value={<CountUp end={3} />}
              icon="⏳"
              gradient="linear-gradient(135deg, #F59E0B, #D97706)"
            />
          </div>
        </section>

        {/* Animated Chart */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            color: '#374151',
            marginBottom: '24px',
            borderLeft: '4px solid #6366F1',
            paddingLeft: '12px',
          }}>
            📊 Animated Bar Chart
          </h2>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <p style={{ 
              color: '#374151',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              Monthly Collections (₹)
            </p>
            <AnimatedChart />
          </div>
        </section>

        {/* Pulse Badges */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            color: '#374151',
            marginBottom: '24px',
            borderLeft: '4px solid #6366F1',
            paddingLeft: '12px',
          }}>
            ⚡ Pulse Status Badges
          </h2>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
          }}>
            {['Active', 'Pending Approval', 
              'Pending', 'Paused', 
              'Cancelled', 'Failed'].map(s => (
              <PulseBadge key={s} status={s} />
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <p style={{ 
            color: '#6B7280',
            marginBottom: '16px',
          }}>
            All animations working! 🎉
          </p>
          <a href="/" style={{
            background: '#6366F1',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
          }}>
            Go to Landing Page →
          </a>
        </div>

      </div>
    </div>
  );
};

export default AnimationTest;
