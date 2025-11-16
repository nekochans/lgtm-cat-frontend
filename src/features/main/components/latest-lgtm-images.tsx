import { Suspense } from "react";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import { fetchLgtmImagesInRecentlyCreated } from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

const fetchLgtmImages = async () => {
  const accessToken = await issueClientCredentialsAccessToken();

  return await fetchLgtmImagesInRecentlyCreated(accessToken);
};

export const LatestLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();

  return (
    <Suspense>
      <LgtmImages images={lgtmImages} />
    </Suspense>
  );
};
