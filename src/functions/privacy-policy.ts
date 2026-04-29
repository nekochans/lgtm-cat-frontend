import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { LinkAttribute } from "@/types/link-attribute";
import { assertNever } from "@/utils/assert-never";

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
