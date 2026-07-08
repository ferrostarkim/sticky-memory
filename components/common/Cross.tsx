// A small, simple cross mark used as a gentle church accent.
export default function Cross({
  size = 16,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <rect x="10.2" y="2" width="3.6" height="20" rx="1.4" />
      <rect x="4" y="8.2" width="16" height="3.6" rx="1.4" />
    </svg>
  );
}
