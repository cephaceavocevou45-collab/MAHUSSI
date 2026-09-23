export default function LoadingSpinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-3 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin`} />
      {label && <p className="text-sm text-ink-400">{label}</p>}
    </div>
  );
}
