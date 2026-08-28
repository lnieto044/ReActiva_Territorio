import { Card } from './ui';
import { CountUp } from './CountUp';

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-stone-900">
        <CountUp value={value} />
      </p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </Card>
  );
}
