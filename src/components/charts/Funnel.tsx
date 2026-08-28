import { useEffect, useRef, useState } from 'react';

export interface FunnelStage {
  label: string;
  value: number;
}

/** Pipeline funnel — each stage's bar width is proportional to the first
 * stage's count, showing where cases/deliveries drop off. Single hue
 * (magnitude, not identity), direct value labels. */
export function Funnel({ stages, color = '#0E9488' }: { stages: FunnelStage[]; color?: string }) {
  const max = Math.max(1, ...stages.map((s) => s.value));
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
    <div ref={ref} className="space-y-2">
      {stages.map((s, i) => {
        const widthPct = Math.max(6, (s.value / max) * 100);
        const opacity = 1 - i * (0.5 / Math.max(1, stages.length - 1));
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex-1">
              <div
                className="flex items-center justify-end rounded-md px-2.5 transition-all ease-out"
                style={{
                  height: 22,
                  width: visible ? `${widthPct}%` : '0%',
                  background: color,
                  opacity,
                  transitionDuration: '800ms',
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                <span className="text-[11px] font-bold text-white">{s.value}</span>
              </div>
            </div>
            <span className="w-28 flex-shrink-0 text-right text-[11px]" style={{ color: '#647079' }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
