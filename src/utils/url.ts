export function cleanUrl(url: string) {
  const taburl = url.split("tabs.ultimate-guitar.com/tab/").at(-1);
  if (!taburl) throw new Error("Couldn't find taburl");
  return taburl;
}

export function toParams(params: Record<string, any>) {
  const stringifiedParams = Object.fromEntries(
    Object.entries(params)
      .filter(([k, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  );
  return new URLSearchParams({
    ...stringifiedParams,
    tab_access_type: "public",
  }).toString();
}
