// 絶対厳守：編集前に必ずAI実装ルールを読む

import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { LinkAttribute } from "@/types/link-attribute";
import { assertNever } from "@/utils/assert-never";

export function createMcpLinksFromLanguages(language: Language): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "MCP",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    case "ja":
      return {
        text: "MCP",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    default:
      return assertNever(language);
  }
}
