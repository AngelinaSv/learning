import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface HealthBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function HealthBar({ value, max, label = 'HP', className }: HealthBarProps) {
  const percent = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  const color = percent > 55 ? 'from-green-400 to-emerald-500' : percent > 25 ? 'from-yellow-300 to-plasma' : 'from-red-500 to-plasma';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
        <span>{label}</span>
        <span className="text-white">
          {Math.max(0, value)} / {max}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r shadow-[0_0_16px_rgba(255,59,212,0.35)]', color)}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 110, damping: 20 }}
        />
      </div>
    </div>
  );
}
