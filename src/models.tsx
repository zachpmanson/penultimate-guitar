export type TabDto = {
  tab: string;
  name: string;
  artist: string;
};

export type TabLinks = {
  [link: string]: {
    name: string;
    artist: string;
  };
};
