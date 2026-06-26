import type { ReactNode } from 'react';

interface StateMessageProps {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: 'default' | 'error';
  compact?: boolean;
}

const toneClasses: Record<NonNullable<StateMessageProps['tone']>, string> = {
  default: 'border-mebel-border bg-white text-mebel-text-strong',
  error: 'border-mebel-border bg-mebel-surface text-mebel-text',
};

const StateMessage = ({
  title,
  description,
  action,
  tone = 'default',
  compact = false,
}: StateMessageProps) => {
  return (
    <div
      className={`rounded-2xl border px-5 py-6 shadow-sm ${toneClasses[tone]} ${
        compact ? 'text-center' : ''
      }`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <div className="mx-auto max-w-2xl">
        <h3 className="font-display text-lg font-semibold text-current">{title}</h3>
        <p className="font-sans mt-2 text-sm leading-6 text-current md:text-base">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
};

export default StateMessage;
