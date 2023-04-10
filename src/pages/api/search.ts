import { getSearch } from "@/lib/ug-interface/ug-interface";
import { SearchResult } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResult[]>
) {
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    return;
  }
  if (req.method === "POST") {
    if (!req.body["value"] || !req.body["search_type"] || !req.body["page"]) {
      res.status(400);
      return;
    }
    const results = await getSearch(
      req.body["value"],
      req.body["search_type"],
      req.body["page"]
    );
    res.status(200).json([...results]);
    return;
  }
}
