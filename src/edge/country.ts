// 絶対厳守：編集前に必ずAI実装ルールを読む

import { get } from "@vercel/edge-config";
import { geolocation } from "@vercel/functions";
import type { NextRequest } from "next/server";

export async function isBanCountry(req: NextRequest): Promise<boolean> {
  const bannedCountryCodeList = await get<string[]>("bannedCountryCodeList");
  if (bannedCountryCodeList) {
    const location = geolocation(req);
    const country = location?.country?.toUpperCase();
    if (country != null) {
      return bannedCountryCodeList.includes(country);
    }
  }

  return false;
}
