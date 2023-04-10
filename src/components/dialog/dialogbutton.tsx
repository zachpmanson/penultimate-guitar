type DialogButtonProps = {
  fn: () => void;
  disabled?: boolean;
  icon: string | JSX.Element;
};

export default function DialogButton({
  fn,
  disabled,
  icon,
}: DialogButtonProps) {
  return (
    <>
      <button
        disabled={disabled}
        onClick={fn}
        className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 ${
          disabled ? "text-slate-400" : "hover:shadow-md"
        }`}
      >
        {icon}
      </button>
    </>
  );
}
