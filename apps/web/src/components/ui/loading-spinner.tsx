// Loading spinner for async/suspense boundaries

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

export default function LoadingSpinner({ size = 'md', label = 'Đang tải...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8" role="status">
      <div
        className={`${sizeClasses[size]} rounded-full border-green-200 border-t-green-700 animate-spin`}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
