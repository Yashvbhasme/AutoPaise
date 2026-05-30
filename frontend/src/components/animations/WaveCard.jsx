const WaveCard = ({
  title,
  value,
  icon,
  color = 'indigo',
  subtitle
}) => {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      wave: 'rgba(255,255,255,0.1)',
      shadow: 'rgba(99,102,241,0.3)'
    },
    emerald: {
      bg: 'from-emerald-500 to-emerald-600',
      wave: 'rgba(255,255,255,0.1)',
      shadow: 'rgba(16,185,129,0.3)'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      wave: 'rgba(255,255,255,0.1)',
      shadow: 'rgba(139,92,246,0.3)'
    },
    amber: {
      bg: 'from-amber-500 to-amber-600',
      wave: 'rgba(255,255,255,0.1)',
      shadow: 'rgba(245,158,11,0.3)'
    }
  };

  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-6 text-white hover:-translate-y-1 transition-transform duration-300 cursor-pointer`}
      style={{
        boxShadow: `0 8px 25px ${colors.shadow}`
      }}
    >
      {/* Wave animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wave 1 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-10%',
            width: '120%',
            height: '60px',
            background: colors.wave,
            borderRadius: '50%',
            animation: 'wave1 4s ease-in-out infinite'
          }}
        />
        {/* Wave 2 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '-10%',
            width: '120%',
            height: '50px',
            background: colors.wave,
            borderRadius: '50%',
            animationName: 'wave2',
            animationDuration: '4s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.5s'
          }}
        />

        {/* Circle decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/20 rounded-xl text-2xl">{icon}</div>
        </div>

        <div className="mt-2">
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-white/70 text-xs mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaveCard;
