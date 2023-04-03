type ToolbarButton = {
  fn: () => void;
  icon: string | JSX.Element;
  disabled?: boolean;
};

export default function ToolbarButton({ fn, icon, disabled }: ToolbarButton) {
  return (
    <>
      <button
        disabled={disabled}
        onClick={fn}
        className={`flex items-center justify-center w-10 h-10 text-md text-lg border-grey-500 border-2 rounded-xl transition ease-in-out bg-white ${
          disabled ? "text-slate-400" : "hover:shadow-md"
        }`}
      >
        {icon}
      </button>
    </>
  );
}
