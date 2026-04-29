import { headers } from "next/headers";
import { isUrl } from "@/functions/url";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Url } from "@/types/url";

export const appBaseUrlHeaderName = "lgtmeow-app-base-url";

export async function extractAppBaseUrlFromHeader(): Promise<Url> {
  const incomingHeaders = await headers();
  const url = incomingHeaders.get(appBaseUrlHeaderName);
  if (isUrl(url)) {
    return url;
  }

  return appBaseUrl();
}
