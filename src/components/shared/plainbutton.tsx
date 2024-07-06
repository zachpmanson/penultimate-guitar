import {
  ReactElement,
  JSXElementConstructor,
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
}) {
  return (
    <div
      className="border-gray-200 bg-white border-2 p-3 rounded-xl  hover:border-gray-400 active:bg-gray-400 transition duration-75"
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
