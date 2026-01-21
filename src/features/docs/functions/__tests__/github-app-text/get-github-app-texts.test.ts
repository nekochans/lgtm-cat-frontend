// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import {
  getBasicFeatureFullDescription,
  getGitHubAppTexts,
  installScreenshotHeight,
  installScreenshotPath,
  installScreenshotWidth,
  sampleLgtmScreenshotHeight,
  sampleLgtmScreenshotPath,
  sampleLgtmScreenshotWidth,
} from "@/features/docs/functions/github-app-text";
import type { Language } from "@/features/language";

describe("src/features/docs/functions/github-app-text.ts getGitHubAppTexts TestCases", () => {
  interface TestTable {
    readonly language: Language;
    readonly expectedOverviewTitle: string;
    readonly expectedInstallTitle: string;
    readonly expectedBasicFeatureTitle: string;
  }

  it.each`
    language | expectedOverviewTitle   | expectedInstallTitle | expectedBasicFeatureTitle
    ${"ja"}  | ${"LGTMeow GitHub App"} | ${"インストール"}    | ${"基本機能 LGTM画像の自動投稿"}
    ${"en"}  | ${"LGTMeow GitHub App"} | ${"Install"}         | ${"Basic Feature: Auto LGTM Image Posting"}
  `(
    "should return correct section titles from getGitHubAppTexts when language is $language",
    ({
      language,
      expectedOverviewTitle,
      expectedInstallTitle,
      expectedBasicFeatureTitle,
    }: TestTable) => {
      const result = getGitHubAppTexts(language);

      expect(result.overview.title).toBe(expectedOverviewTitle);
      expect(result.install.title).toBe(expectedInstallTitle);
      expect(result.basicFeature.title).toBe(expectedBasicFeatureTitle);
    }
  );

  it("should return correct GitHub App URL from getGitHubAppTexts", () => {
    const result = getGitHubAppTexts("ja");

    expect(result.overview.linkUrl).toBe("https://github.com/apps/lgtmeow");
    expect(result.install.linkUrl).toBe("https://github.com/apps/lgtmeow");
  });

  it("should return Japanese texts with correct structure from getGitHubAppTexts", () => {
    const result = getGitHubAppTexts("ja");

    expect(result.overview.afterLink).toContain("GitHub App");
    expect(result.overview.linkText).toBe("こちら");
    expect(result.overview.beforeLink).toBe("");
    expect(result.install.beforeLink).toBe("まずは");
    expect(result.install.afterLink).toContain("インストール");
    expect(result.basicFeature.intro).toContain("シンプル");
    expect(result.basicFeature.screenshotAlt).toContain("LGTM");
  });

  it("should return English texts with correct structure from getGitHubAppTexts", () => {
    const result = getGitHubAppTexts("en");

    expect(result.overview.beforeLink).toContain("GitHub App");
    expect(result.overview.linkText).toBe("here");
    expect(result.overview.afterLink).toBe(".");
    expect(result.install.beforeLink).toContain("install");
    expect(result.basicFeature.intro).toContain("simple");
    expect(result.basicFeature.screenshotAlt).toContain("LGTM");
  });

  it("should return Japanese description with correct structure from getBasicFeatureFullDescription", () => {
    const result = getBasicFeatureFullDescription("ja");

    expect(result.beforeApprove).toContain("PR");
    expect(result.approveText).toBe("Approve");
    expect(result.afterApprove).toContain("LGTM画像");
  });

  it("should return English description with correct structure from getBasicFeatureFullDescription", () => {
    const result = getBasicFeatureFullDescription("en");

    expect(result.beforeApprove).toBe("When you ");
    expect(result.approveText).toBe("Approve");
    expect(result.afterApprove).toContain("LGTM image");
  });

  it("should have correct install screenshot path and dimensions", () => {
    expect(installScreenshotPath).toBe("/screenshots/github app-Install.webp");
    expect(installScreenshotWidth).toBe(700);
    expect(installScreenshotHeight).toBe(358);
  });

  it("should have correct sample LGTM screenshot path and dimensions", () => {
    expect(sampleLgtmScreenshotPath).toBe(
      "/screenshots/github-app-sample-lgtm.webp"
    );
    expect(sampleLgtmScreenshotWidth).toBe(560);
    expect(sampleLgtmScreenshotHeight).toBe(439);
  });
});
