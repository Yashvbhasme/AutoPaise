import { useEffect, useRef, useState } from 'react';

const AnimatedChart = ({ data = [], height = 200 }) => {
  const [animated, setAnimated] = useState(false);
  const chartRef = useRef(null);

  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { label: 'Jan', value: 65, color: '#6366F1' },
    { label: 'Feb', value: 45, color: '#6366F1' },
    { label: 'Mar', value: 80, color: '#6366F1' },
    { label: 'Apr', value: 55, color: '#6366F1' },
    { label: 'May', value: 90, color: '#10B981' },
    { label: 'Jun', value: 70, color: '#6366F1' },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={chartRef} className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-1">
            {/* Bar */}
            <div
              className="relative w-full flex items-end justify-center"
              style={{ height: height - 30 }}
            >
              <div
                className="w-full rounded-t-lg relative overflow-hidden cursor-pointer group"
                style={{
                  height: animated ? `${(item.value / maxValue) * 100}%` : '0%',
                  background: item.color || '#6366F1',
                  transition: `height 1s ease ${index * 0.1}s`,
                  minWidth: '20px',
                  boxShadow: '0 -2px 8px rgba(99,102,241,0.3)',
                }}
              >
                {/* Shine effect on bar */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

                {/* Tooltip on hover */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                >
                  ₹{item.value.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Label */}
            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedChart;
