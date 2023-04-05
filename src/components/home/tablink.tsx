import { useGlobal } from "@/contexts/Global/context";
import { TabDto, TabLinkProps } from "@/models";
import Link from "next/link";

export default function TabLink(props: TabLinkProps) {
  const { addsavedTab, removesavedTab } = useGlobal();
  return (
    <div className="max-w-xl flex my-4 mx-auto justify-between gap-2">
      <Link
        href={`/tab/${props.taburl}`}
        className="w-full text-black no-underline"
      >
        <div className="border-grey-500 border-2 p-4 rounded-xl  hover:shadow-md transition ease-in-out flex justify-between">
          <div>
            {props.name} - {props.artist}
            {props.version && (
              <span className="font-light text-xs"> (v{props.version})</span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={() =>
          props.saved ? removesavedTab(props) : addsavedTab(props)
        }
        className="flex items-center px-4 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
      >
        {props.saved ? "❌" : "💾"}
      </button>
    </div>
  );
}
