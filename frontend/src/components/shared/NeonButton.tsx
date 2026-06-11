import { motion } from 'framer-motion';
import { type ComponentProps } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

type NeonButtonProps = ComponentProps<typeof Button> & {
  wrapperClassName?: string;
};

export function NeonButton({ wrapperClassName, ...props }: NeonButtonProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className={cn('inline-flex', wrapperClassName)}
    >
      <Button {...props} />
    </motion.div>
  );
}
