import { useEffect, useRef, useState } from 'react';
import { CountUp } from '../CountUp';

/** Two-value headline comparison with a single split bar (a 2px surface gap
 * between segments, per the two-segment spacing rule). For "A vs B" framings
 * where a full bar-list would be overkill. */
export function ComparisonStat({
  a,
  b,
  colorA = '#0E9488',
  colorB = '#E2E5E4',
}: {
  a: { label: string; value: number };
  b: { label: string; value: number };
  colorA?: string;
  colorB?: string;
}) {
  const total = Math.max(1, a.value + b.value);
  const pctA = (a.value / total) * 100;
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
    <div ref={ref}>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: colorA }}>
            <CountUp value={a.value} />
          </p>
          <p className="text-xs" style={{ color: '#647079' }}>{a.label}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: '#4B565D' }}>
            <CountUp value={b.value} />
          </p>
          <p className="text-xs" style={{ color: '#647079' }}>{b.label}</p>
        </div>
      </div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        <div className="h-full rounded-full transition-all ease-out" style={{ width: visible ? `${pctA}%` : '0%', background: colorA, transitionDuration: '900ms' }} />
        <div className="h-full flex-1 rounded-full transition-all ease-out" style={{ background: colorB, transitionDuration: '900ms' }} />
      </div>
    </div>
  );
}
