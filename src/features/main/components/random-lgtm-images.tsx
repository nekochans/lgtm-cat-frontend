// 絶対厳守：編集前に必ずAI実装ルールを読む
import { LgtmImages } from "@/features/main/components/lgtm-images";
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

const fetchLgtmImages = async () => {
  const accessToken = await issueClientCredentialsAccessToken();

  return fetchLgtmImagesInRandom(accessToken);
};

export const RandomLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();

  return <LgtmImages images={lgtmImages} />;
};
