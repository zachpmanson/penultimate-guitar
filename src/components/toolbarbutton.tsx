type ToolbarButton = {
  fn: () => void;
  icon: string;
};

export default function ToolbarButton({ fn, icon }: ToolbarButton) {
  return (
    <>
      <button
        onClick={fn}
        className="flex items-center justify-center w-10 h-10 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
      >
        {icon}
      </button>
    </>
  );
}
