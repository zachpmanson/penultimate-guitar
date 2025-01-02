import {
  JSXElementConstructor,
  MouseEventHandler,
  ReactElement,
  ReactFragment,
  ReactPortal,
} from "react";

export default function PlainButton({
  noPadding = false,
  ...props
}: {
  children:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  className?: string;
  title?: string;
  noPadding?: boolean;
}) {
  return (
    <button
      className={
        "border-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 border rounded-xl transition duration-75 dark:border-gray-600 " +
        (props.disabled ? "" : "hover:border-gray-400 active:bg-gray-400 ") +
        (noPadding ? "" : "py-2 px-3 ") +
        props.className
      }
      onClick={props.disabled ? undefined : props.onClick}
      title={props.title}
    >
      {props.children}
    </button>
  );
}
