// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";

interface ServiceDescriptionText {
  readonly line1: string;
  readonly line2: string;
}

export function getServiceDescriptionText(
  language: Language
): ServiceDescriptionText {
  switch (language) {
    case "ja":
      return {
        line1: "可愛い猫のLGTM画像を作成して共有できるサービスです。",
        line2: "画像をクリックするとGitHub Markdownがコピーされます。",
      };
    case "en":
      return {
        line1: "A service for generating and sharing cute cat LGTM images.",
        line2: "Click on an image to copy the GitHub Markdown.",
      };
    default:
      return assertNever(language);
  }
}

export function getActionButtonText(language: Language): {
  readonly randomCopy: string;
  readonly refreshCats: string;
  readonly latestCats: string;
} {
  switch (language) {
    case "ja":
      return {
        randomCopy: "ランダムコピー",
        refreshCats: "ねこリフレッシュ",
        latestCats: "ねこ新着順",
      };
    case "en":
      return {
        randomCopy: "Copy Random Cat",
        refreshCats: "Refresh Cats",
        latestCats: "Show Latest Cats",
      };
    default:
      return assertNever(language);
  }
}
