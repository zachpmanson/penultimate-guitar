import { useGlobal } from "@/contexts/Global/context";
import { TabDto } from "@/models";
import TabLink from "./tablink";

export default function PinnedTabs() {
  const { pinnedTabs } = useGlobal();
  console.log(pinnedTabs);
  return (
    <div>
      {Object.keys(pinnedTabs).length === 0 || (
        <h1 className="text-center text-2xl my-4">Pinned Tabs</h1>
      )}
      {pinnedTabs.map((pinnedTab: TabDto, i) => (
        <TabLink key={i} {...pinnedTab} pinned={true} />
      ))}
    </div>
  );
}
