/** Shared motion variants. MotionConfig reducedMotion="user" (App) turns transforms off, leaving fades. */
import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const DUR = { 1: 0.12, 2: 0.22, 3: 0.42 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DUR[3], ease: EASE_OUT } },
};
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR[2], ease: EASE_OUT } },
};
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: DUR[3], ease: EASE_OUT } },
};
export const stagger = (children = 0.05): Variants => ({ hidden: {}, show: { transition: { staggerChildren: children } } });

/** A section that fades up once when 15% of it is in view. */
export function MotionSection({ children, className, id, style }: { children: ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  return (
    <motion.section id={id} className={className} style={style} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      {children}
    </motion.section>
  );
}
