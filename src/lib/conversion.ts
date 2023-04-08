import { TabDto, TabLinkDto } from "@/models";

export function convertToTabLink(tabDto: TabDto): TabLinkDto {
  return {
    taburl: tabDto.taburl,
    name: tabDto.song.name,
    artist: tabDto.song.artist,
    version: tabDto.version,
  };
}
