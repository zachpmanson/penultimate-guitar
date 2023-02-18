import { TabLinks } from "@/models";
import { useEffect, useState } from "react";
import TabLink from "./tablink";

export default function RecentTabs() {
  const [recents, setRecents] = useState<TabLinks>({});

  useEffect(() => {
    setRecents(JSON.parse(localStorage?.getItem("recents") || "[]"));
  }, []);

  return (
    <div>
      {Object.keys(recents).length > 0 ? (
        <details open>
          <summary>
            <h1 className="text-center text-2xl my-4">Recent Tabs</h1>
          </summary>
          {Object.keys(recents)
            .reverse()
            .slice(0, 10)
            .map((taburl: string, i) => (
              <TabLink
                tab={""}
                taburl={taburl}
                key={i}
                {...recents[taburl]}
                pinned={false}
              />
            ))}
        </details>
      ) : (
        <p className="text-center">Recent tabs will show up here!</p>
      )}
    </div>
  );
}
