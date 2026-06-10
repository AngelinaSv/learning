import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export function NeonCard({ children, className, interactive }: NeonCardProps) {
  return (
    <motion.section
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn('glass-panel neon-border rounded-lg', className)}
    >
      {children}
    </motion.section>
  );
}
