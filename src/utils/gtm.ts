export type GoogleTagManagerId = `GTM-${string}`;

export type CustomDataAttrGtmClick =
  | 'header-app-title'
  | 'top-upload-cat-button'
  | 'footer-terms-link'
  | 'footer-privacy-link'
  | 'global-menu-top-link'
  | 'global-menu-upload-cat-link'
  | 'global-menu-terms-link'
  | 'global-menu-privacy-link'
  | 'language-menu-en-link'
  | 'language-menu-ja-link';

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
    dataLayer: Array<Record<string, unknown>>;
  }
}

export const sendClickTopFetchRandomCatButton = (): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'ClickTopFetchRandomCatButton',
    });
  }
};

export const sendClickTopFetchNewArrivalCatButton = (): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'ClickTopFetchNewArrivalCatButton',
    });
  }
};

export const sendUploadedCatImage = (): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'UploadedCatImage',
    });
  }
};

export const sendCopyMarkdownFromTopImages = (): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'CopyMarkdownFromTopImages',
    });
  }
};

export const sendCopyMarkdownFromCreatedImage = (): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'CopyMarkdownFromCreatedImage',
    });
  }
};

export const sendCopyMarkdownFromCopyButton = (): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'CopyMarkdownFromCopyButton',
    });
  }
};

export const sendCopyMarkdownFromRandomButton = (): void => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'CopyMarkdownFromRandomButton',
    });
  }
};
