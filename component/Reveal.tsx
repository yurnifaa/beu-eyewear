'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface RevealProps {
  children: ReactNode;
  className?: string;
  mode?: 'mount' | 'inView';
  delay?: number;
}

export default function Reveal({ children, className = '', mode = 'inView', delay = 0 }: RevealProps) {
  const initial = { opacity: 0, y: mode === 'mount' ? 16 : 24 };
  const transition = { duration: 0.6, ease: 'easeOut' as const, delay };

  if (mode === 'mount') {
    return (
      <motion.div
        className={className}
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
