import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-slate-300">
      <Loader2 className="h-4 w-4 animate-spin text-plasma" />
      {label}
    </div>
  );
}
