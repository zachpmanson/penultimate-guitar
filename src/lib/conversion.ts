import { TabDto, TabLinkProps } from "@/models";

export function convertToTabLink(tabDto: TabDto): TabLinkProps {
  return {
    taburl: tabDto.taburl,
    name: tabDto.song.name,
    artist: tabDto.song.artist,
    version: tabDto.version,
  };
}
