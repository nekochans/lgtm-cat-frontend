// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";

type ErrorPageTexts = {
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
};

export function notFoundPageTexts(language: Language): ErrorPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "404 ページが見つかりません",
        message:
          "お探しのページは見つかりません。一時的にアクセス出来ない状態か、移動もしくは削除されてしまった可能性があります。",
        buttonText: "Go to HOME",
      };
    case "en":
      return {
        title: "404 Not Found",
        message:
          "The page you are looking for cannot be found. It is temporarily inaccessible or has been removed.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}

export function errorPageTexts(language: Language): ErrorPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "500 システムエラー",
        message:
          "システムエラーが発生しました。しばらくお待ちいただいてから再度お試しください。",
        buttonText: "Go to HOME",
      };
    case "en":
      return {
        title: "500 Internal Server Error",
        message:
          "A system error has occurred. Please wait a moment and try again.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}

export function maintenancePageTexts(language: Language): ErrorPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "503 メンテナンス",
        message: "ただいまメンテナンス中です。しばらくお待ちください。",
        buttonText: "Go to HOME",
      };
    case "en":
      return {
        title: "503 Service Unavailable",
        message: "We are currently under maintenance. Please wait a moment.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}
