type ToolbarButton = {
  onClick?: () => void;
  children: string | JSX.Element;
  disabled?: boolean;
};

export default function ToolbarButton({ onClick, children, disabled }: ToolbarButton) {
  return (
    <button disabled={disabled} onClick={onClick} className={getToolbarButtonStyle(!!disabled)}>
      {children}
    </button>
  );
}

export const getToolbarButtonStyle = (disabled: boolean) => `
  border-gray-200 border rounded-xl transition duration-75 dark:border-gray-600
  flex items-center justify-center w-10 h-10 text-md text-lg
  ${
    disabled
      ? "opacity-10"
      : "bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
  }`;
