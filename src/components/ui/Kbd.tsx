import { ArrowBigUp, Command, CornerDownLeft } from "lucide-react";

export function Kbd({ children }: { children: string }) {
  const icon =
    children === "Cmd" ? (
      <Command className="size-3.5" />
    ) : children === "Shift" ? (
      <ArrowBigUp className="size-3.5" />
    ) : children === "Enter" ? (
      <CornerDownLeft className="size-3.5" />
    ) : null;

  return (
    <kbd
      aria-label={icon ? children : undefined}
      title={icon ? children : undefined}
      className="inline-flex h-6 min-w-6 items-center justify-center whitespace-nowrap rounded-md border border-divide bg-gray-100 px-1.5 font-sans text-[11px] leading-none font-medium tracking-normal text-charcoal-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
    >
      {icon ? <span aria-hidden="true">{icon}</span> : children}
    </kbd>
  );
}
