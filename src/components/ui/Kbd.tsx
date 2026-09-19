export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-divide bg-gray-100 px-1.5 font-mono text-[11px] font-medium text-charcoal-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
      {children}
    </kbd>
  );
}
