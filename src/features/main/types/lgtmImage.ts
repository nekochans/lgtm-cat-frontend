import type { JwtAccessTokenString } from "@/features/oidc/types/access-token";

export type LgtmImageUrl = `https://${string}`;

export type LgtmImage = { id: number; imageUrl: LgtmImageUrl };

export type FetchLgtmImages = (
  accessToken: JwtAccessTokenString
) => Promise<LgtmImage[]>;
