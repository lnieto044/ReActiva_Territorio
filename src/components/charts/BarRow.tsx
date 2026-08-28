import { useEffect, useRef, useState } from 'react';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

/** Horizontal bar chart: thin rounded bars, direct value labels, animates
 * in on scroll. One brand hue by default (magnitude); pass per-item `color`
 * for status data (e.g. priority), where each bar is still text-labeled. */
export function BarRow({ data, defaultColor = '#0E9488', unit = '' }: { data: BarDatum[]; defaultColor?: string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
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
    <div ref={ref} className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="font-medium" style={{ color: '#4B565D' }}>{d.label}</span>
            <span className="font-bold" style={{ color: '#16202B' }}>{d.value}{unit}</span>
          </div>
          <div className="h-2 w-full rounded-full" style={{ background: '#EEF0F0' }}>
            <div
              className="h-2 rounded-full transition-all ease-out"
              style={{
                width: visible ? `${Math.max(3, (d.value / max) * 100)}%` : '0%',
                background: d.color ?? defaultColor,
                transitionDuration: '900ms',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
