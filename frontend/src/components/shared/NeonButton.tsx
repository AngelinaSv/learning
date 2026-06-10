import { motion } from 'framer-motion';
import { type ComponentProps } from 'react';
import { Button } from '../ui/button';

export function NeonButton(props: ComponentProps<typeof Button>) {
  return (
    <motion.div whileTap={{ scale: 0.96 }} className="inline-flex">
      <Button {...props} />
    </motion.div>
  );
}
