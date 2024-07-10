import { SunIcon } from "@heroicons/react/24/solid";

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={className}>
      <SunIcon className="animate-spin fill-blue-600 w-full h-full" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
