export const blacklist = ["Pro", "Video", "Official", "Power"];

export const GuitaleleStyle = "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600";

export const ROUTES = {
  TAB: (id: string) => `/tab/${id}` as const,
  BEST_TAB: (id: string) => `/best/tab/${id}` as const,
  ID: (id: string) => `/id/${id}` as const,
  BEST_ID: (id: string) => `/best/id/${id}` as const,
  TRACK: (id: string) => `/track/${id}` as const,
};
