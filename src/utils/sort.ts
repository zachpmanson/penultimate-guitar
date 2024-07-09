import { TabType } from "@/models/models";

type SortableTab = { type: TabType; version: number };
/**
 * Sort by type, then version
 */
export const tabCompareFn = (a: SortableTab, b: SortableTab) => {
  if (a.type < b.type) {
    return -1;
  }
  if (a.type > b.type) {
    return 1;
  }
  return a.version - b.version;
};
