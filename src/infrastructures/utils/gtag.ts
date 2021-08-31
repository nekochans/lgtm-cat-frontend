export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const pageview = (url: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.gtag('config', gaMeasurementId, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
type GaEventProps = {
  action: string;
  category: string;
  label: string;
  value?: number;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const event = ({ action, category, label, value }: GaEventProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};

// Markdownソースがコピーされた際に実行する
type SendCopyMarkdownEventLabel = 'copy_markdown_button' | 'created_lgtm_image';

export const sendCopyMarkdownEvent = (
  label: SendCopyMarkdownEventLabel,
): void => {
  event({
    action: 'copy_markdown',
    category: 'copy_markdown',
    label,
    value: 1,
  });
};

// ランダムでLGTM画像を表示させる機能が利用された際に実行する

type SendFetchRandomImagesLabel = 'fetch_random_images_button';

export const sendFetchRandomImages = (
  label: SendFetchRandomImagesLabel,
): void => {
  event({
    action: 'fetch_random_images',
    category: 'fetch_random_images',
    label,
    value: 1,
  });
};

// ねこ画像がアップロードしLGTM画像を作成する機能が利用された際に実行する

type SendUploadCatImageLabel = 'upload_cat_image_button';

export const sendUploadCatImage = (label: SendUploadCatImageLabel): void => {
  event({
    action: 'upload_cat_image',
    category: 'upload_cat_image',
    label,
    value: 1,
  });
};
