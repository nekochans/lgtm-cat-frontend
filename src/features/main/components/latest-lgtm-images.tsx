// 絶対厳守：編集前に必ずAI実装ルールを読む
import { cacheLife, cacheTag } from "next/cache";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import { CACHE_TAG_LGTM_IMAGES_LATEST } from "@/features/main/constants/cache-tags";
import { fetchLgtmImagesInRecentlyCreated } from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

const fetchLgtmImages = async () => {
  "use cache";
  cacheTag(CACHE_TAG_LGTM_IMAGES_LATEST);
  cacheLife({
    // 最新画像はアップロード時/手動の updateTag で無効化する前提で長期保持
    stale: 86_400, // 24時間フレッシュ扱い
    revalidate: 86_400, // 24時間ごとに再検証
    expire: 2_592_000, // 30日で強制失効
  });

  const accessToken = await issueClientCredentialsAccessToken();

  return fetchLgtmImagesInRecentlyCreated(accessToken);
};

export const LatestLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();

  return <LgtmImages images={lgtmImages} />;
};
