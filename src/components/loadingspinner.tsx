import { SunIcon } from "@heroicons/react/24/solid";

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={className}>
      <SunIcon className="animate-spin fill-blue-600 w-full h-full" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function Load({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  if (isLoading) {
    return (
      <div className="w-full h-full justify-center items-center flex">
        <LoadingSpinner className="h-8" />;
      </div>
    );
  }
  return <>{children}</>;
}
