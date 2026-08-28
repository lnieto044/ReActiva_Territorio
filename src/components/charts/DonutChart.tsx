import { useEffect, useRef, useState } from 'react';

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

/** Donut chart for part-of-whole composition (e.g. cases by estado). Center
 * shows the total. Always paired with a direct-labeled legend — color never
 * carries identity alone. */
export function DonutChart({ data, size = 140, strokeWidth = 20 }: { data: DonutDatum[]; size?: number; strokeWidth?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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

  let offsetAccumulated = 0;

  return (
    <div ref={ref} className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF0F0" strokeWidth={strokeWidth} />
          {total > 0 &&
            data.map((d, i) => {
              const fraction = d.value / total;
              const dash = circumference * fraction;
              const gap = circumference - dash;
              const dashOffset = -offsetAccumulated * circumference;
              offsetAccumulated += fraction;
              return (
                <circle
                  key={d.label + i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={visible ? `${dash} ${gap}` : `0 ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  style={{ transition: `stroke-dasharray 900ms ease-out ${i * 120}ms` }}
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#16202B' }}>{total}</span>
          <span style={{ fontSize: 10, color: '#97A3AA' }}>total</span>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: d.color }} />
            <span style={{ color: '#4B565D' }}>{d.label}</span>
            <span className="font-semibold" style={{ color: '#16202B' }}>{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
