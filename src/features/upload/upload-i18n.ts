// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";
import { acceptableImageSizeThresholdText } from "./types/upload";

export function imageDropAreaText(language: Language): string {
  switch (language) {
    case "ja":
      return "ここに画像をドロップ";
    case "en":
      return "Drop image here";
    default:
      return assertNever(language);
  }
}

export function uploadInputButtonText(language: Language): string {
  switch (language) {
    case "ja":
      return "またはファイルの選択";
    case "en":
      return "Select an image file";
    default:
      return assertNever(language);
  }
}

export function cautionText(language: Language): string {
  switch (language) {
    case "ja":
      return "注意事項";
    case "en":
      return "Precautions";
    default:
      return assertNever(language);
  }
}

export function noteList(language: Language): readonly string[] {
  switch (language) {
    case "ja":
      return [
        "拡張子が png, jpg, jpeg の画像のみアップロード出来ます。",
        "猫が写っていない画像はアップロード出来ません。",
        "人の顔がはっきり写っている画像はアップロード出来ません。",
        "猫のイラスト等は正確に判定出来ない事があります。",
      ] as const;
    case "en":
      return [
        "png, jpg, jpeg images are available.",
        "Images without cats cannot be uploaded.",
        "Images that clearly show a person's face cannot be uploaded.",
        "Illustrations of cats may not be accurately determined.",
      ] as const;
    default:
      return assertNever(language);
  }
}

export function privacyPolicyAgreementText(language: Language): {
  readonly prefix: string;
  readonly linkText: string;
  readonly suffix: string;
} {
  switch (language) {
    case "ja":
      return {
        prefix: "アップロードするボタンを押下することで",
        linkText: "プライバシーポリシー",
        suffix: "に同意したと見なします",
      };
    case "en":
      return {
        prefix: "By clicking the upload button, you agree to the ",
        linkText: "Privacy Policy",
        suffix: "",
      };
    default:
      return assertNever(language);
  }
}

export function previewConfirmationText(language: Language): string {
  switch (language) {
    case "ja":
      return "この画像をアップロードします。よろしいですか？";
    case "en":
      return "Upload this image. Are you sure?";
    default:
      return assertNever(language);
  }
}

export function cancelButtonText(language: Language): string {
  switch (language) {
    case "ja":
      return "キャンセル";
    case "en":
      return "Cancel";
    default:
      return assertNever(language);
  }
}

export function uploadButtonText(language: Language): string {
  switch (language) {
    case "ja":
      return "アップロード";
    case "en":
      return "Upload";
    default:
      return assertNever(language);
  }
}

export function createNotAllowedImageExtensionErrorMessage(
  fileType: string,
  language: Language
): readonly string[] {
  switch (language) {
    case "ja":
      return [
        `${fileType} の画像は許可されていません。`,
        "png, jpg, jpeg の画像のみアップロード出来ます。",
      ] as const;
    case "en":
      return [
        `${fileType} is not allowed.`,
        "Only png, jpg, jpeg images can be uploaded.",
      ] as const;
    default:
      return assertNever(language);
  }
}

export function createImageSizeTooLargeErrorMessage(
  language: Language
): readonly string[] {
  switch (language) {
    case "ja":
      return [
        "画像サイズが大きすぎます。",
        `お手数ですが${acceptableImageSizeThresholdText}以下の画像を利用して下さい。`,
      ] as const;
    case "en":
      return [
        "Image size is too large.",
        `Please use images under ${acceptableImageSizeThresholdText}.`,
      ] as const;
    default:
      return assertNever(language);
  }
}

export function unexpectedErrorMessage(language: Language): readonly string[] {
  switch (language) {
    case "ja":
      return [
        "予期せぬエラーが発生しました。",
        "お手数ですが、しばらく時間が経ってからお試し下さい。",
      ] as const;
    case "en":
      return [
        "An unexpected error occurred during upload.",
        "Sorry, please try again after some time has passed.",
      ] as const;
    default:
      return assertNever(language);
  }
}

export function uploadingText(language: Language): string {
  switch (language) {
    case "ja":
      return "ただいまアップロード中...";
    case "en":
      return "Uploading...";
    default:
      return assertNever(language);
  }
}

export function uploadSuccessTitle(language: Language): string {
  switch (language) {
    case "ja":
      return "アップロード成功しました！";
    case "en":
      return "Upload successful!";
    default:
      return assertNever(language);
  }
}

export function uploadSuccessDescription(
  language: Language
): readonly string[] {
  switch (language) {
    case "ja":
      return [
        "LGTM画像を作成しているので少々お待ち下さい。",
        "「Markdownソースをコピー」ボタンか画像をクリック",
        "するとMarkdownソースがコピーされます。",
      ] as const;
    case "en":
      return [
        "Please wait while we create your LGTM image.",
        'Click the "Copy Markdown Source" button or the image',
        "to copy the Markdown source.",
      ] as const;
    default:
      return assertNever(language);
  }
}

/**
 * アップロード成功画面のリンク用テキスト
 */
export type ViewLatestImageLinkText = {
  readonly prefix: string;
  readonly linkText: string;
  readonly suffix: string;
};

/**
 * アップロード成功画面の「最新画像を見る」リンク用テキストを返す
 */
export function viewLatestImageLinkText(
  language: Language
): ViewLatestImageLinkText {
  switch (language) {
    case "ja":
      return {
        prefix: "",
        linkText: "こちら",
        suffix: "からアップロードした画像を確認できます。",
      };
    case "en":
      return {
        prefix: "You can view your uploaded image ",
        linkText: "here",
        suffix: ".",
      };
    default:
      return assertNever(language);
  }
}

export function closeButtonText(language: Language): string {
  switch (language) {
    case "ja":
      return "閉じる";
    case "en":
      return "Close";
    default:
      return assertNever(language);
  }
}

export function copyMarkdownButtonText(language: Language): string {
  switch (language) {
    case "ja":
      return "Markdownソースをコピー";
    case "en":
      return "Copy Markdown Source";
    default:
      return assertNever(language);
  }
}

export function copiedText(): string {
  return "Copied!";
}

export function copyFailedTitle(language: Language): string {
  switch (language) {
    case "ja":
      return "コピー失敗";
    case "en":
      return "Copy Failed";
    default:
      return assertNever(language);
  }
}

export function copyFailedDescription(language: Language): string {
  switch (language) {
    case "ja":
      return "クリップボードへのコピーに失敗しました。ブラウザの権限を確認してください。";
    case "en":
      return "Failed to copy to clipboard. Please check browser permissions.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: 猫画像ではない
 */
export function errorMessageNotCatImage(language: Language): string {
  switch (language) {
    case "ja":
      return "この画像は猫の画像として認識されませんでした。猫が写っている画像を選択してください。";
    case "en":
      return "This image was not recognized as a cat image. Please select an image with a cat.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: 不適切な画像
 */
export function errorMessageNotModerationImage(language: Language): string {
  switch (language) {
    case "ja":
      return "この画像は利用規約に違反する可能性があります。別の画像を選択してください。";
    case "en":
      return "This image may violate our terms of service. Please select a different image.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: 人の顔が含まれている
 */
export function errorMessagePersonFaceInImage(language: Language): string {
  switch (language) {
    case "ja":
      return "画像に人の顔が含まれています。猫だけが写っている画像を選択してください。";
    case "en":
      return "The image contains a human face. Please select an image with only a cat.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: 許可されていない拡張子
 */
export function errorMessageNotAcceptable(language: Language): string {
  switch (language) {
    case "ja":
      return "この画像形式は対応していません。JPEG、PNG、WebP形式の画像を選択してください。";
    case "en":
      return "This image format is not supported. Please select a JPEG, PNG, or WebP image.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: ファイルサイズが大きすぎる（API判定）
 */
export function errorMessagePayloadTooLarge(language: Language): string {
  switch (language) {
    case "ja":
      return "画像ファイルのサイズが大きすぎます。より小さいファイルを選択してください。";
    case "en":
      return "The image file is too large. Please select a smaller file.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: 不明なエラー
 */
export function errorMessageUnknown(language: Language): string {
  switch (language) {
    case "ja":
      return "アップロード中にエラーが発生しました。しばらく経ってから再度お試しください。";
    case "en":
      return "An error occurred during upload. Please try again later.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: MIMEタイプが許可されていない（サーバー側前検証）
 */
export function errorMessageInvalidMimeType(language: Language): string {
  switch (language) {
    case "ja":
      return "この画像形式は対応していません。JPEG、PNG形式の画像を選択してください。";
    case "en":
      return "This image format is not supported. Please select a JPEG or PNG image.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: ファイルサイズが大きすぎる（サーバー側前検証）
 */
export function errorMessageFileTooLarge(language: Language): string {
  switch (language) {
    case "ja":
      return "ファイルサイズが5MBを超えています。5MB以下の画像を選択してください。";
    case "en":
      return "File size exceeds 5MB. Please select an image under 5MB.";
    default:
      return assertNever(language);
  }
}

/**
 * エラーメッセージ: ストレージアップロード失敗
 */
export function errorMessageStorageUploadFailed(language: Language): string {
  switch (language) {
    case "ja":
      return "画像のアップロードに失敗しました。しばらく経ってから再度お試しください。";
    case "en":
      return "Failed to upload the image. Please try again later.";
    default:
      return assertNever(language);
  }
}
