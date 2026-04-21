// 絶対厳守：編集前に必ずAI実装ルールを読む

import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { LinkAttribute } from "@/types/link-attribute";
import { assertNever } from "@/utils/assert-never";

export function createExternalTransmissionPolicyLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "External Transmission Policy",
        link: createIncludeLanguageAppPath(
          "external-transmission-policy",
          language
        ),
      };
    case "ja":
      return {
        text: "外部送信ポリシー",
        link: createIncludeLanguageAppPath(
          "external-transmission-policy",
          language
        ),
      };
    default:
      return assertNever(language);
  }
}
