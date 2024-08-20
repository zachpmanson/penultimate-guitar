import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
} from "react";

export default function PlainButton(props: {
  children:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={
        "border-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 border py-2 px-3 rounded-xl transition duration-75 " +
        (props.disabled ? "" : " hover:border-gray-400 active:bg-gray-400 ") +
        props.className
      }
      onClick={props.disabled ? undefined : props.onClick}
    >
      {props.children}
    </div>
  );
}
