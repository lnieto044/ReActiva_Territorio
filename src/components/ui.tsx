import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, SVGProps, TextareaHTMLAttributes } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-emerald-700 text-white hover:bg-emerald-800 hover:-translate-y-0.5 hover:shadow-md',
    secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200',
    ghost: 'bg-transparent text-emerald-700 hover:bg-emerald-50',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'alta' | 'media' | 'regular' | 'success' }) {
  const tones = {
    neutral: 'bg-stone-100 text-stone-700',
    alta: 'bg-red-100 text-red-700',
    media: 'bg-amber-100 text-amber-800',
    regular: 'bg-stone-100 text-stone-600',
    success: 'bg-emerald-100 text-emerald-800',
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-stone-700">{children}</label>;
}

const fieldBase =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition-all duration-150 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldBase} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldBase} ${props.className ?? ''}`} />;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/** Label + input with a leading icon inside the field. Pass an Input/Select/
 * TextArea (or plain element) as children — it gets left padding via `pl-9`. */
export function IconField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          <Icon width={17} height={17} />
        </span>
        {children}
      </div>
    </div>
  );
}
