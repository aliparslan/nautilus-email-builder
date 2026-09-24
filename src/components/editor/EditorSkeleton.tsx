export function EditorSkeleton() {
  return (
    <div
      className="flex h-dvh flex-col bg-white dark:bg-neutral-950"
      aria-busy="true"
      aria-label="Loading editor"
    >
      <div className="grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-divide px-3 dark:border-neutral-800">
        <div className="h-6 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-neutral-800" />
        <div className="h-5 w-44 animate-pulse rounded-md bg-gray-200 dark:bg-neutral-800" />
        <div className="ml-auto h-8 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-neutral-800" />
      </div>
      <div className="flex flex-1">
        <div className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-divide p-2 dark:border-neutral-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800"
            />
          ))}
        </div>
        <div className="w-[280px] shrink-0 border-r border-divide p-3 dark:border-neutral-800">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="mb-2 h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800"
            />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-center bg-gray-200/60 p-10 dark:bg-neutral-900">
          <div className="h-[520px] w-full max-w-[600px] animate-pulse rounded-lg bg-white shadow-card dark:bg-neutral-800" />
        </div>
        <div className="w-[300px] shrink-0 border-l border-divide p-4 dark:border-neutral-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
