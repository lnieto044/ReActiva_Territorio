import { useEffect, useRef, useState } from 'react';

/** Animates to the numeric part of `value` once scrolled into view, and
 * re-animates from the previous value whenever `value` changes afterwards
 * (data loads async from Firestore, so the target often isn't known yet at
 * the moment this first becomes visible). Preserves any non-numeric
 * prefix/suffix (e.g. "80%", "+150"). */
export function CountUp({ value, durationMs = 1200 }: { value: string | number; durationMs?: number }) {
  const str = String(value);
  const match = str.match(/-?\d+(\.\d+)?/);
  const target = match ? parseFloat(match[0]) : 0;
  const prefix = match ? str.slice(0, match.index) : '';
  const suffix = match ? str.slice((match.index ?? 0) + match[0].length) : str;
  const decimals = match && match[0].includes('.') ? match[0].split('.')[1].length : 0;

  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  // Reveal gate: flips true once scrolled into view, then stays true.
  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animates whenever visible (or the target itself) changes — covers async
  // data arriving after the initial reveal, and live updates thereafter.
  useEffect(() => {
    if (!visible || !match) return;
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, target]);

  if (!match) return <span ref={ref}>{str}</span>;

  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
