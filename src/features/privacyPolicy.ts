import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assertNever";
import type { LinkAttribute } from "./linkAttribute";

export function createPrivacyPolicyLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "Privacy Policy",
        link: createIncludeLanguageAppPath("privacy", language),
      };
    case "ja":
      return {
        text: "プライバシーポリシー",
        link: createIncludeLanguageAppPath("privacy", language),
      };
    default:
      return assertNever(language);
  }
}
