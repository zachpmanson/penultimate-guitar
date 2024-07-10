import { SunIcon } from "@heroicons/react/24/solid";

export default function LoadingSpinner() {
  return (
    <div className="m-auto w-12 h-12" role="status">
      <SunIcon className="animate-spin fill-blue-600" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
