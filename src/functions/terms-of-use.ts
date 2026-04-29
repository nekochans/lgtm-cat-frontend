import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { LinkAttribute } from "@/types/link-attribute";
import { assertNever } from "@/utils/assert-never";

export function createTermsOfUseLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "Terms of Use",
        link: createIncludeLanguageAppPath("terms", language),
      };
    case "ja":
      return {
        text: "利用規約",
        link: createIncludeLanguageAppPath("terms", language),
      };
    default:
      return assertNever(language);
  }
}
