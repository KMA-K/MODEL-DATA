import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme/useTheme';

export function AnimatedNumber({ value, format = number => Math.round(number).toLocaleString('vi-VN') }: { value: number; format?: (value: number) => string }) {
  const { reducedMotion } = useTheme();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const begin = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - begin) / 1200, 1);
        setDisplay(value * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { start(); observer.disconnect(); } });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, reducedMotion]);
  return <span ref={ref} className="animated-number" aria-label={format(value)}><span aria-hidden="true">{format(reducedMotion ? value : display)}</span></span>;
}
