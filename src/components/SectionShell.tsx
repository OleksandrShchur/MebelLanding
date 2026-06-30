import type { ReactNode } from 'react';

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
  const headingId = id ? `${id}-heading` : undefined;
  const descriptionId = id && description ? `${id}-description` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={`bg-mebel-cream py-10 md:py-16 ${className}`.trim()}
    >
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2
              id={headingId}
              className="font-display text-2xl font-bold text-mebel-text-strong md:text-3xl"
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="font-sans mt-2 text-sm leading-6 text-mebel-text-muted md:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {titleAction ? <div className="shrink-0">{titleAction}</div> : null}
        </div>

        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
};

export default SectionShell;
