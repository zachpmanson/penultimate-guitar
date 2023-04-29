import PlainButton from "../shared/plainbutton";

type ToolbarButton = {
  onClick: () => void;
  children: string | JSX.Element;
  disabled?: boolean;
};

export default function ToolbarButton({
  onClick,
  children,
  disabled,
}: ToolbarButton) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        border-gray-200 border-2 rounded-xl transition ease-in-out
        flex items-center justify-center w-10 h-10 text-md text-lg ${
          disabled
            ? "opacity-10"
            : "bg-white hover:border-gray-400 active:bg-gray-400"
        }
        }`}
    >
      {children}
    </button>
  );
}
