import { TabDto, TabLinkDto, TabType } from "@/models/models";
import { UGApi } from "@/server/ug-interface/ug-api";

export function convertToTabLink(tabDto: TabDto): TabLinkDto {
  return {
    taburl: tabDto.taburl,
    name: tabDto.song.name,
    artist: tabDto.song.artist,
    version: tabDto.version,
  };
}

export function convertApiResultToTabDto(tabInfo: UGApi.TabInfo): TabDto {
  return {
    rating: tabInfo.rating,
    capo: tabInfo.capo,
    tuning: tabInfo.tuning
      ? {
          name: tabInfo.tonality_name,
          value: tabInfo.tuning,
          index: 0, // Assume a default index, as TabInfo lacks this detail
        }
      : undefined,
    contributors: tabInfo.contributor
      ? [tabInfo.contributor.username]
      : undefined,
    taburl: tabInfo.urlWeb,
    tab: tabInfo.content,
    song: {
      id: tabInfo.song_id,
      name: tabInfo.song_name,
      artist: tabInfo.artist_name,
    }, // Song structure needs to be defined based on `TabDto`
    version: tabInfo.version,
    songId: tabInfo.song_id,
    type: tabInfo.type as TabType, // Assume string can be cast to TabType
  };
}
