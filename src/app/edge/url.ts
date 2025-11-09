// 絶対厳守：編集前に必ずAI実装ルールを読む
import { headers } from "next/headers";
import { appBaseUrl, isUrl, type Url } from "@/features/url";

export const appBaseUrlHeaderName = "lgtmeow-app-base-url";

export async function extractAppBaseUrlFromHeader(): Promise<Url> {
  const incomingHeaders = await headers();
  const url = incomingHeaders.get(appBaseUrlHeaderName);
  if (isUrl(url)) {
    return url;
  }

  return appBaseUrl();
}
