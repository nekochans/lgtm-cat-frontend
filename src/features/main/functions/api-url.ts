import { isUrl, type Url } from "@/features/url";

export function lgtmeowApiUrl(): Url {
  if (isUrl(process.env.LGTMEOW_API_URL)) {
    return process.env.LGTMEOW_API_URL;
  }

  throw new Error("LGTMEOW_API_URL is not defined");
}

export function fetchLgtmImagesInRandomUrl(): Url {
  return `${lgtmeowApiUrl()}/lgtm-images`;
}

export function fetchLgtmImagesInRecentlyCreatedUrl(): Url {
  return `${lgtmeowApiUrl()}/lgtm-images/recently-created`;
}
