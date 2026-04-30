import type { JwtAccessTokenString } from "@/types/oidc/access-token";

export type LgtmImageUrl = `https://${string}` & {
  readonly __brand: "lgtmImageUrl";
};

export function createLgtmImageUrl(url: string): LgtmImageUrl {
  return url as LgtmImageUrl;
}

export type LgtmImageId = number & { readonly __brand: "lgtmImageId" };

export function createLgtmImageId(id: number): LgtmImageId {
  return id as LgtmImageId;
}

export interface LgtmImage {
  id: LgtmImageId;
  imageUrl: LgtmImageUrl;
}

export type FetchLgtmImages = (
  accessToken: JwtAccessTokenString
) => Promise<LgtmImage[]>;
