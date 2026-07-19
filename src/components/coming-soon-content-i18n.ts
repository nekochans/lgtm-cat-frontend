import type { Language } from "@/types/language";
import { assertNever } from "@/utils/assert-never";

interface ComingSoonPageTexts {
  readonly buttonText: string;
  readonly message: string;
  readonly title: string;
}

export function comingSoonPageTexts(language: Language): ComingSoonPageTexts {
  switch (language) {
    case "ja":
      return {
        title: "Coming Soon",
        message: "この機能は現在準備中です",
        buttonText: "HOMEに戻る",
      };
    case "en":
      return {
        title: "Coming Soon",
        message: "This feature is coming soon.",
        buttonText: "Go to HOME",
      };
    default:
      return assertNever(language);
  }
}
