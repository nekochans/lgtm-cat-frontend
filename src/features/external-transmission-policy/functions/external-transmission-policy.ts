// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import type { LinkAttribute } from "@/features/link-attribute";
import { createIncludeLanguageAppPath } from "@/features/url";
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
