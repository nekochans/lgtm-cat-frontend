export type GoogleTagManagerId = `GTM-${string}`;

const isGoogleTagManagerId = (value: unknown): value is GoogleTagManagerId => {
  if (typeof value !== 'string') {
    return false;
  }

  const startPosition = 0;

  const endPosition = 4;

  return value.slice(startPosition, endPosition) === 'GTM-';
};

export const googleTagManagerId = (): GoogleTagManagerId => {
  if (isGoogleTagManagerId(process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID)) {
    return process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
  }

  return 'GTM-T9VPVTR';
};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export const sendClickTopFetchRandomCatButton = (): void => {
  window.dataLayer.push({
    event: 'ClickTopFetchRandomCatButton',
  });
};

export const sendClickTopFetchNewArrivalCatButton = (): void => {
  window.dataLayer.push({
    event: 'ClickTopFetchNewArrivalCatButton',
  });
};

export const sendClickLanguageMenuJaButton = (): void => {
  window.dataLayer.push({
    event: 'ClickLanguageMenuJaButton',
  });
};

export const sendClickLanguageMenuEnButton = (): void => {
  window.dataLayer.push({
    event: 'ClickLanguageMenuEnButton',
  });
};

export const sendUploadedCatImage = (): void => {
  window.dataLayer.push({
    event: 'UploadedCatImage',
  });
};

export const sendCopyMarkdownFromTopImages = (): void => {
  window.dataLayer.push({
    event: 'CopyMarkdownFromTopImages',
  });
};

export const sendCopyMarkdownFromCreatedImage = (): void => {
  window.dataLayer.push({
    event: 'CopyMarkdownFromCreatedImage',
  });
};

export const sendCopyMarkdownFromCopyButton = (): void => {
  window.dataLayer.push({
    event: 'CopyMarkdownFromCopyButton',
  });
};
