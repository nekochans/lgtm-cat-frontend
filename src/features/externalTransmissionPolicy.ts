import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assertNever";
import type { LinkAttribute } from "./linkAttribute";

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
