import Link from "next/link";
import { MouseEventHandler, ReactNode } from "react";
import LoadingSpinner from "../loadingspinner";

export default function PlainButton({
  noPadding = false,
  children,
  onClick,
  disabled,
  className,
  title,
  href,
  prefetch,
  isLoading,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  className?: string;
  title?: string;
  noPadding?: boolean;
  href?: string;
  prefetch?: boolean;
  isLoading?: boolean;
}) {
  const clsname =
    "relative border-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 border rounded-xl transition duration-75 dark:border-gray-600 " +
    (disabled ? "" : "hover:border-gray-400 active:bg-gray-400 ") +
    (noPadding ? "" : "py-2 px-3 ") +
    className;

  return href ? (
    <Link href={href} className={clsname} prefetch={prefetch} title={title}>
      {children}
    </Link>
  ) : (
    <button
      className={clsname}
      onClick={disabled ? undefined : onClick}
      title={title}
    >
      {isLoading ? <div className="invisible">{children}</div> : children}
      {isLoading && (
        <div className="absolute top-0 right-0 flex justify-center items-center h-full w-full p-2">
          <LoadingSpinner className="max-h-8" />
        </div>
      )}
    </button>
  );
}
