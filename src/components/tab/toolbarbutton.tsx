type ToolbarButton = {
  onClick?: () => void;
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
      className={getToolbarButtonStyle(!!disabled)}
    >
      {children}
    </button>
  );
}

export const getToolbarButtonStyle = (disabled: boolean) => `
  border-gray-200 border rounded-xl transition duration-75
  flex items-center justify-center w-10 h-10 text-md text-lg 
  ${
    disabled
      ? "opacity-10"
      : "bg-white hover:border-gray-400 active:bg-gray-400"
  }`;
