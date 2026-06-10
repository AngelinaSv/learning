import { cn } from '../../lib/utils';

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageShell({ eyebrow, title, description, children, actions, className }: PageShellProps) {
  return (
    <div className={cn('mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8', className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-plasma">{eyebrow}</p> : null}
          <h1 className="text-3xl font-black tracking-normal text-white sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
