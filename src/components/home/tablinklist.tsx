import { TabLinkDto } from "@/models/models";
import TabLink from "./tablink";
import { ReactNode } from "react";

export default function TablinkList({
  tablinks,
  title,
  emptyMessage,
}: {
  tablinks: TabLinkDto[];
  title: string;
  emptyMessage?: ReactNode;
}) {
  return (
    <>
      <div className="pt-4">
        <h1 className="text-left text-xl">{title}</h1>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {tablinks.length > 0
          ? tablinks.map((r: TabLinkDto, i) => <TabLink key={i} tablink={{ ...r }} recent={true} />)
          : emptyMessage}
      </div>
    </>
  );
}
