export function cleanUrl(url: string) {
  return url.split("tabs.ultimate-guitar.com/tab/").at(-1);
}

export function toParams(params: Record<string, any>) {
  const stringifiedParams = Object.fromEntries(
    Object.entries(params)
      .filter(([k, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  );
  return new URLSearchParams({
    ...stringifiedParams,
    tab_access_type: "public",
  }).toString();
}
