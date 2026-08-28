import { useEffect, useRef, useState } from 'react';
import { CountUp } from '../CountUp';

/** Single-KPI radial gauge (0–100%). For a lone headline number, not a
 * multi-series comparison — no legend needed. */
export function RadialProgress({
  value,
  label,
  color = '#0E9488',
  size = 130,
  strokeWidth = 12,
}: {
  value: number;
  label: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF0F0" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={visible ? circumference - dash : circumference}
            style={{ transition: 'stroke-dashoffset 1100ms ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: '#16202B' }}>
            <CountUp value={`${Math.round(clamped)}%`} />
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs" style={{ color: '#647079' }}>{label}</p>
    </div>
  );
}
