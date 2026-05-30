import { useEffect, useRef, useState } from 'react';

const CountUp = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, end]);

  const animateCount = () => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = Number(end) || 0;

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setCount(decimals > 0 ? current.toFixed(decimals) : Math.floor(current));

      if (progress < 1) requestAnimationFrame(update);
      else setCount(endValue);
    };

    requestAnimationFrame(update);
  };

  return (
    <span ref={ref}>
      {prefix}
      {typeof count === 'number' ? count.toLocaleString('en-IN') : count}
      {suffix}
    </span>
  );
};

export default CountUp;
