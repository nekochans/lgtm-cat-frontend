export const googleTagManagerId =
  process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || '';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export const pageview = (url: string): void => {
  window.dataLayer.push({
    event: 'pageview',
    page: url,
  });
};

// Markdownソースがコピーされた際に実行する
type SendCopyMarkdownEventLabel = 'copy_markdown_button';

export const sendCopyMarkdownEvent = (
  label: SendCopyMarkdownEventLabel,
): void => {
  window.dataLayer.push({
    event: 'copy_markdown',
    copy_markdown_trigger: label,
  });
};

// ランダムでLGTM画像を表示させる機能が利用された際に実行する
type SendFetchRandomImagesLabel = 'fetch_random_images_button';

export const sendFetchRandomImages = (
  label: SendFetchRandomImagesLabel,
): void => {
  window.dataLayer.push({
    event: 'fetch_random_images',
    fetch_random_images_trigger: label,
  });
};
