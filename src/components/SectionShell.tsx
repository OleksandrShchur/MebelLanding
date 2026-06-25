import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SectionShellProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  titleAction?: ReactNode;
  className?: string;
  contentClassName?: string;
}

const SectionShell = ({
  id,
  title,
  description,
  children,
  titleAction,
  className = '',
  contentClassName = '',
}: SectionShellProps) => {
  const prefersReducedMotion = useReducedMotion();
  const headingId = id ? `${id}-heading` : undefined;
  const descriptionId = id && description ? `${id}-description` : undefined;

  const headerTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 240, damping: 24 };

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={`bg-mebel-cream py-10 md:py-16 ${className}`.trim()}
    >
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <motion.div
            className="max-w-3xl"
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={headerTransition}
          >
            <h2
              id={headingId}
              className="text-2xl font-bold text-mebel-text-strong md:text-3xl"
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-mebel-text-muted md:text-base">
                {description}
              </p>
            ) : null}
          </motion.div>
          {titleAction ? <div className="shrink-0">{titleAction}</div> : null}
        </div>

        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
};

export default SectionShell;
