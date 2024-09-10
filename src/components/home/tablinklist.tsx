import { TabLinkDto } from "@/models/models";
import TabLink from "./tablink";

export default function TablinkList({
  tablinks,
  title,
}: {
  tablinks: TabLinkDto[];
  title: string;
}) {
  return (
    <details open>
      <summary>
        <h1 className="text-center text-xl my-4">{title}</h1>
      </summary>
      <div className="flex flex-col gap-1 mt-2">
        {tablinks.map((r: TabLinkDto, i) => (
          <TabLink key={i} tablink={{ ...r }} recent={true} />
        ))}
      </div>
    </details>
  );
}
