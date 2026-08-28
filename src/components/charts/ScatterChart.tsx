import { useEffect, useRef, useState } from 'react';

export interface ScatterPoint {
  x: number;
  y: number;
  label: string;
}

/** Scatter plot — relationship between two numeric measures across
 * individual cases/offers (e.g. impacto vs. prioridad). Position encodes
 * both variables; a single hue since points aren't separate identities. */
export function ScatterChart({
  points,
  xLabel,
  yLabel,
  color = '#0E9488',
}: {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  color?: string;
}) {
  const width = 300;
  const height = 190;
  const pad = { top: 10, right: 16, bottom: 30, left: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = 0;
  const xMax = Math.max(1, ...xs);
  const yMin = 0;
  const yMax = Math.max(1, ...ys);

  const px = (x: number) => pad.left + (plotW * (x - xMin)) / (xMax - xMin || 1);
  const py = (y: number) => pad.top + plotH - (plotH * (y - yMin)) / (yMax - yMin || 1);

  const ref = useRef<SVGSVGElement>(null);
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
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className="w-full">
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#E2E5E4" strokeWidth={1} />
      <line x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH} y2={pad.top + plotH} stroke="#E2E5E4" strokeWidth={1} />

      <text x={pad.left} y={height - 6} fontSize={9} fill="#97A3AA">{xLabel} →</text>
      <text x={4} y={pad.top + 8} fontSize={9} fill="#97A3AA" transform={`rotate(-90 12 ${pad.top + 8})`}>{yLabel} →</text>

      {points.map((p, i) => (
        <circle
          key={p.label + i}
          cx={px(p.x)}
          cy={py(p.y)}
          r={visible ? 5 : 0}
          fill={color}
          fillOpacity={0.75}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          style={{ transition: `r 400ms ease-out ${i * 60}ms` }}
        >
          <title>{`${p.label}: ${xLabel} ${p.x}, ${yLabel} ${p.y}`}</title>
        </circle>
      ))}
    </svg>
  );
}
