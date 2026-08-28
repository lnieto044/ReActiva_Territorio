import { useEffect, useRef, useState } from 'react';

export interface TrendPoint {
  label: string;
  value: number;
}

/** Single-series line + area chart. Thin 2px line, rounded caps, recessive
 * gridlines, draws in on scroll. No legend needed — one series, titled by
 * the caller. Selectively direct-labels the most recent and peak points
 * (not every point — that would be clutter) so the numbers are visible
 * without needing to hover. */
export function TrendLine({ data, color = '#0E9488', height = 160 }: { data: TrendPoint[]; color?: string; height?: number }) {
  const width = 600;
  const padding = 8;
  const topPadding = 26;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = (width - padding * 2) / Math.max(1, data.length - 1);
  const plotH = height - topPadding - padding;

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = topPadding + plotH - (d.value / max) * plotH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? padding} ${height - padding} L ${padding} ${height - padding} Z`;

  const ref = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [data]);

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

  const gridLines = [0.25, 0.5, 0.75].map((f) => topPadding + plotH - f * plotH);

  const lastIdx = points.length - 1;
  const peakIdx = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);
  const labeledIndexes = new Set([lastIdx, points[peakIdx]?.value > 0 ? peakIdx : -1].filter((i) => i >= 0));

  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ overflow: 'visible' }}>
      {gridLines.map((y) => (
        <line key={y} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#EEF0F0" strokeWidth={1} />
      ))}
      <path d={areaPath} fill={color} opacity={visible ? 0.1 : 0} style={{ transition: 'opacity 900ms ease-out' }} />
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: visible ? 0 : pathLength,
          transition: 'stroke-dashoffset 1100ms ease-out',
        }}
      />
      {points.map((p, i) => (
        <g key={i} opacity={visible ? 1 : 0} style={{ transition: `opacity 300ms ease-out ${400 + i * 40}ms` }}>
          <circle cx={p.x} cy={p.y} r={labeledIndexes.has(i) ? 3.5 : 2.5} fill={color}>
            <title>{`${p.label}: ${p.value}`}</title>
          </circle>
          {labeledIndexes.has(i) && (
            <text
              x={i === lastIdx ? p.x - 4 : p.x}
              y={p.y - 9}
              textAnchor={i === lastIdx ? 'end' : 'middle'}
              fontSize={11}
              fontWeight={700}
              fill="#16202B"
            >
              {p.value}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
