import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { LinkAttribute } from "@/types/link-attribute";
import { assertNever } from "@/utils/assert-never";

export function createGitHubAppLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "GitHub App",
        link: createIncludeLanguageAppPath("docs-github-app", language),
      };
    case "ja":
      return {
        text: "GitHub App",
        link: createIncludeLanguageAppPath("docs-github-app", language),
      };
    default:
      return assertNever(language);
  }
}
