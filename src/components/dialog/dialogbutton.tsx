import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
} from "react";

type DialogButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  children:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal;
};

export default function DialogButton({
  onClick,
  disabled,
  children,
}: DialogButtonProps): JSX.Element {
  return (
    <>
      <button
        disabled={disabled}
        onClick={onClick}
        className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 ${
          disabled ? "text-slate-400" : "hover:shadow-md"
        }`}
      >
        {children}
      </button>
    </>
  );
}
