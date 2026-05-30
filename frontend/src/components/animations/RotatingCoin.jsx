import { useEffect, useRef } from 'react';

const RotatingCoin = ({ size = 80 }) => {
  const shineRef = useRef(null);

  // The shine should loop smoothly; this ensures the shine doesn't jump on first render
  useEffect(() => {
    if (shineRef.current) {
      shineRef.current.style.animation = 'coinShine 3s linear infinite';
    }
  }, []);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Coin outer ring */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
          boxShadow:
            '0 4px 15px rgba(255,165,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
          animation: 'coinRotate 3s linear infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.45,
          fontWeight: 'bold',
          color: '#B8860B',
          border: '3px solid #DAA520',
        }}
      >
        ₹
      </div>

      {/* Shine effect */}
      <div
        ref={shineRef}
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '30%',
          height: '20%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default RotatingCoin;
