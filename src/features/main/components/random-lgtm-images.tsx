import { Suspense } from "react";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

const fetchLgtmImages = async () => {
  const accessToken = await issueClientCredentialsAccessToken();

  return await fetchLgtmImagesInRandom(accessToken);
};

export const RandomLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();

  return (
    <Suspense>
      <LgtmImages images={lgtmImages} />
    </Suspense>
  );
};
