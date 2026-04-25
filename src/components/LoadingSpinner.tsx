interface LoadingSpinnerProps {
  label?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  className?: string;
}

const LoadingSpinner = ({
  label = 'Loading...',
  fullscreen = false,
  overlay = false,
  className = '',
}: LoadingSpinnerProps) => {
  const containerClass = overlay
    ? 'absolute inset-0 z-30 bg-white/85 backdrop-blur-sm'
    : fullscreen
      ? 'min-h-screen bg-[#F8F5F0]'
      : '';

  return (
    <div
      className={`flex items-center justify-center ${containerClass} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#E7DED2]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#7C5A3A] border-r-[#7C5A3A] animate-spin" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C5A3A]" />
        </div>
        <span className="text-sm font-medium tracking-[0.18em] uppercase text-[#7A6F64]">
          {label}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
