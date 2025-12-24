import { UGApi } from "../ug-interface/ug-api";

export async function search({ value, type, cursor }: { value: string; type: string; cursor: number }) {
  let tabType = undefined;
  if (type === "all") tabType = undefined;
  if (type === "tabs") tabType = 200;
  if (type === "chords") tabType = 300;
  if (type === "ukulele") tabType = 800;
  if (type === "bass") tabType = 400;
  try {
    const items = await UGApi.getSearch({
      title: value,
      page: cursor,
      type: tabType,
    });

    return {
      items,
      nextCursor: items.length < 5 ? undefined : cursor + 1,
    };
  } catch (e) {
    console.error(e);
    return { items: [], nextCursor: undefined };
  }
}
