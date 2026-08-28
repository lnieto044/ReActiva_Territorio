import type { InputHTMLAttributes, ReactNode, SVGProps, TextareaHTMLAttributes } from 'react';

type IconType = (props: SVGProps<SVGSVGElement>) => ReactNode;

const wrapperClass =
  'relative flex items-center rounded-[10px] border border-[#DCE1E2] bg-[#FBFCFC] transition-all duration-150 focus-within:border-[#0E9488] focus-within:shadow-[0_0_0_3px_rgba(14,148,136,0.15)]';
const iconClass = 'pointer-events-none absolute left-3.5 text-[#97A3AA]';
const fieldClass = 'w-full bg-transparent py-3 pl-10 pr-3.5 text-sm outline-none placeholder:text-[#97A3AA]';

export function AuthInput({ icon: Icon, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: IconType }) {
  return (
    <div className={wrapperClass}>
      <span className={iconClass}>
        <Icon width={17} height={17} />
      </span>
      <input {...props} className={`${fieldClass} ${props.className ?? ''}`} />
    </div>
  );
}

export function AuthTextArea({ icon: Icon, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { icon: IconType }) {
  return (
    <div className={wrapperClass}>
      <span className={`${iconClass} top-3.5`}>
        <Icon width={17} height={17} />
      </span>
      <textarea {...props} className={`${fieldClass} resize-none ${props.className ?? ''}`} />
    </div>
  );
}
