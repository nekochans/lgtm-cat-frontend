// 絶対厳守：編集前に必ずAI実装ルールを読む
export type GoogleTagManagerId = `GTM-${string}`;

export type CustomDataAttrGtmClick =
  | "header-app-title"
  | "top-upload-cat-button"
  | "footer-terms-link"
  | "footer-privacy-link"
  | "global-menu-top-link"
  | "global-menu-upload-cat-link"
  | "global-menu-terms-link"
  | "global-menu-privacy-link"
  | "language-menu-en-link"
  | "language-menu-ja-link";

function isGoogleTagManagerId(value: unknown): value is GoogleTagManagerId {
  if (typeof value !== "string") {
    return false;
  }

  const startPosition = 0;

  const endPosition = 4;

  return value.slice(startPosition, endPosition) === "GTM-";
}

export function googleTagManagerId(): GoogleTagManagerId {
  if (isGoogleTagManagerId(process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID)) {
    return process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
  }

  return "GTM-T9VPVTR";
}

type WindowWithDataLayer = Window & {
  dataLayer?: Record<string, unknown>[];
};

function pushDataLayerEvent(event: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const dataLayerWindow = window as WindowWithDataLayer;
  dataLayerWindow.dataLayer?.push({ event });
}

export function sendClickTopFetchRandomCatButton(): void {
  pushDataLayerEvent("ClickTopFetchRandomCatButton");
}

export function sendClickTopFetchNewArrivalCatButton(): void {
  pushDataLayerEvent("ClickTopFetchNewArrivalCatButton");
}

export function sendUploadedCatImage(): void {
  pushDataLayerEvent("UploadedCatImage");
}

export function sendCopyMarkdownFromTopImages(): void {
  pushDataLayerEvent("CopyMarkdownFromTopImages");
}

export function sendCopyMarkdownFromCreatedImage(): void {
  pushDataLayerEvent("CopyMarkdownFromCreatedImage");
}

export function sendCopyMarkdownFromCopyButton(): void {
  pushDataLayerEvent("CopyMarkdownFromCopyButton");
}

export function sendCopyMarkdownFromRandomButton(): void {
  pushDataLayerEvent("CopyMarkdownFromRandomButton");
}
