import { NewTab, TabDto, TabLinkDto, TabType } from "@/models/models";
import { UGApi } from "@/server/ug-interface/ug-api";
import { cleanUrl } from "./url";

export function mapTabDtoToTabLink(tabDto: TabDto): TabLinkDto {
  return {
    taburl: tabDto.taburl,
    name: tabDto.song.name,
    artist: tabDto.song.artist,
    version: tabDto.version,
  };
}

export function mapApiResultToTabDto(tabInfo: UGApi.TabInfo) {
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
    contributors: tabInfo.contributor ? [tabInfo.contributor.username] : [],
    taburl: cleanUrl(tabInfo.urlWeb),
    tab: tabInfo.content,
    song: {
      id: tabInfo.song_id,
      name: tabInfo.song_name,
      artist: tabInfo.artist_name,
      versions: tabInfo.versions,
    }, // Song structure needs to be defined based on `TabDto`
    version: tabInfo.version,
    songId: tabInfo.song_id,
    type: tabInfo.type as TabType, // Assume string can be cast to TabType
  };
}

export function mapTabInfoToNewTab(tabInfo: UGApi.TabInfo): NewTab {
  // Split tuning into its components if it's provided
  const tuningParts = tabInfo.tuning ? tabInfo.tuning.split(" ") : null;

  return {
    type: tabInfo.type,
    taburl: cleanUrl(tabInfo.urlWeb),
    tab: tabInfo.content,
    songId: tabInfo.song_id,
    contributors: [tabInfo.contributor.username],
    capo: tabInfo.capo,
    tuning: tuningParts
      ? {
          name: tuningParts[0] || "Standard",
          value: tabInfo.tuning,
          index: 0, // You can compute this if needed
        }
      : undefined,
    rating: tabInfo.rating,
    version: tabInfo.version,
  };
}
