import { useGlobal } from "@/contexts/Global/context";
import { TabDto } from "@/models";
import Link from "next/link";

/* TODO change Tablink props type to not use TabDto */
type TabLinkProps = TabDto & {
  pinned: boolean;
};

export default function TabLink(props: TabLinkProps) {
  const { addPinnedTab, removePinnedTab } = useGlobal();
  return (
    <div className="max-w-xl flex my-4 mx-auto justify-between gap-2">
      <Link href={`/tab/${props.taburl}`} className="w-full text-black">
        <div className="border-grey-500 border-2 p-4 rounded-xl  hover:shadow-md transition ease-in-out flex justify-between">
          <div>
            {props.name} - {props.artist}
          </div>
        </div>
      </Link>
      <button
        onClick={() =>
          props.pinned ? removePinnedTab(props) : addPinnedTab(props)
        }
        className="flex items-center px-4 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
      >
        {props.pinned ? "❌" : "📌"}
      </button>
    </div>
  );
}
