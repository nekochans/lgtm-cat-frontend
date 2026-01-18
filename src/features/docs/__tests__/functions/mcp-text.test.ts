// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import { getMcpTexts } from "@/features/docs/functions/mcp-text";
import type { Language } from "@/features/language";

describe("src/features/docs/functions/mcp-text.ts getMcpTexts TestCases", () => {
  interface TestTable {
    readonly language: Language;
    readonly expectedOverviewTitle: string;
    readonly expectedAvailableToolsTitle: string;
    readonly expectedClientConfigTitle: string;
    readonly expectedGithubActionsTitle: string;
  }

  it.each`
    language | expectedOverviewTitle    | expectedAvailableToolsTitle | expectedClientConfigTitle      | expectedGithubActionsTitle
    ${"ja"}  | ${"LGTMeow MCPサーバー"} | ${"利用可能ツール"}         | ${"MCPクライアントの設定方法"} | ${"GitHub Actionsで LGTM画像を自動コメントする"}
    ${"en"}  | ${"LGTMeow MCP Server"}  | ${"Available Tools"}        | ${"MCP Client Configuration"}  | ${"Auto-comment LGTM Images with GitHub Actions"}
  `(
    "should return correct section titles when language is $language",
    ({
      language,
      expectedOverviewTitle,
      expectedAvailableToolsTitle,
      expectedClientConfigTitle,
      expectedGithubActionsTitle,
    }: TestTable) => {
      const result = getMcpTexts(language);

      expect(result.overview.title).toBe(expectedOverviewTitle);
      expect(result.availableTools.title).toBe(expectedAvailableToolsTitle);
      expect(result.clientConfig.title).toBe(expectedClientConfigTitle);
      expect(result.githubActions.title).toBe(expectedGithubActionsTitle);
    }
  );

  it("should return 3 available tools", () => {
    const result = getMcpTexts("ja");

    expect(result.availableTools.tools).toHaveLength(3);
    expect(result.availableTools.tools[0].name).toBe("get_random_lgtm_images");
    expect(result.availableTools.tools[1].name).toBe(
      "get_recently_created_lgtm_images"
    );
    expect(result.availableTools.tools[2].name).toBe(
      "get_random_lgtm_markdown"
    );
  });

  it("should return 3 client config patterns", () => {
    const result = getMcpTexts("ja");

    expect(result.clientConfig.patterns).toHaveLength(3);
  });

  it("should return 2 GitHub Actions examples", () => {
    const result = getMcpTexts("ja");

    expect(result.githubActions.examples).toHaveLength(2);
    expect(result.githubActions.examples[0].title).toContain("Claude Code");
    expect(result.githubActions.examples[1].title).toContain("Codex");
  });

  it("should include correct server URL in client config", () => {
    const result = getMcpTexts("ja");

    expect(result.clientConfig.intro.serverUrl).toBe(
      "https://api.lgtmeow.com/sse"
    );
  });

  it("should include correct screenshot paths and dimensions", () => {
    const result = getMcpTexts("ja");

    expect(result.githubActions.examples[0].screenshotPath).toBe(
      "/screenshots/claude-auto-review-with-lgtmeow-mcp.webp"
    );
    expect(result.githubActions.examples[0].screenshotWidth).toBe(700);
    expect(result.githubActions.examples[0].screenshotHeight).toBe(496);

    expect(result.githubActions.examples[1].screenshotPath).toBe(
      "/screenshots/codex-auto-review-with-lgtmeow-mcp.webp"
    );
    expect(result.githubActions.examples[1].screenshotWidth).toBe(700);
    expect(result.githubActions.examples[1].screenshotHeight).toBe(406);
  });

  it("should return Japanese texts with correct structure", () => {
    const result = getMcpTexts("ja");

    expect(result.overview.intro).toContain("MCP");
    expect(result.overview.useCases).toHaveLength(2);

    expect(result.clientConfig.intro.authTitle).toBe("認証について");
    expect(result.clientConfig.intro.authDescription).toContain("認証不要");

    expect(result.githubActions.examples[0].description).toContain(
      "Claude Code"
    );
    expect(result.githubActions.examples[1].folderNote).toContain("Codex");
  });

  it("should return English texts with correct structure", () => {
    const result = getMcpTexts("en");

    expect(result.overview.intro).toContain("MCP");
    expect(result.overview.useCases).toHaveLength(2);

    expect(result.clientConfig.intro.authTitle).toBe("Authentication");
    expect(result.clientConfig.intro.authDescription).toContain(
      "No authentication"
    );

    expect(result.githubActions.examples[0].description).toContain(
      "Claude Code"
    );
    expect(result.githubActions.examples[1].folderNote).toContain("Codex");
  });
});
