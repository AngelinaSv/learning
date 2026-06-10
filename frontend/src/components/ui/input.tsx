import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-white/10 bg-[#10071b]/90 px-3 py-2 text-sm text-white shadow-inner transition placeholder:text-slate-500 focus:border-plasma/70 focus:outline-none focus:ring-2 focus:ring-plasma/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
