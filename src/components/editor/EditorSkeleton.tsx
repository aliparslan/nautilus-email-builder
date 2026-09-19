export function EditorSkeleton() {
  return (
    <div
      className="flex h-screen flex-col bg-white dark:bg-neutral-950"
      aria-busy="true"
      aria-label="Loading editor"
    >
      <div className="flex h-14 items-center gap-4 border-b border-divide px-4 dark:border-neutral-800">
        <div className="h-6 w-28 animate-pulse rounded-md bg-gray-200 dark:bg-neutral-800" />
        <div className="h-8 w-72 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800" />
        <div className="ml-auto h-8 w-24 animate-pulse rounded-xl bg-gray-200 dark:bg-neutral-800" />
      </div>
      <div className="flex flex-1">
        <div className="w-64 border-r border-divide p-4 dark:border-neutral-800">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800"
            />
          ))}
        </div>
        <div className="flex flex-1 items-start justify-center bg-gray-200/60 p-10 dark:bg-neutral-900">
          <div className="h-[520px] w-[600px] animate-pulse rounded-lg bg-white shadow-card dark:bg-neutral-800" />
        </div>
        <div className="w-80 border-l border-divide p-4 dark:border-neutral-800">
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
