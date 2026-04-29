import { describe, expect, it } from "vitest";
import { metaTagList } from "@/functions/meta-tag";
import type { Language } from "@/types/language";
import type { Url } from "@/types/url";

describe("src/functions/meta-tag.ts metaTagList TestCases", () => {
  const appBaseUrl = "https://lgtmeow.com" as Url;

  interface TitleTestTable {
    readonly expectedHomeTitle: string;
    readonly expectedUploadTitle: string;
    readonly language: Language;
  }

  it.each`
    language | expectedHomeTitle                                          | expectedUploadTitle
    ${"ja"}  | ${"LGTMeow | 猫好きのためのLGTM画像作成・共有サービス"}    | ${"LGTMeow 猫ちゃん画像アップロード"}
    ${"en"}  | ${"LGTMeow | Generate & Share LGTM Images for Cat Lovers"} | ${"LGTMeow Cat Image Upload"}
  `(
    "should return correct titles when language is $language",
    ({ language, expectedHomeTitle, expectedUploadTitle }: TitleTestTable) => {
      const result = metaTagList(language, appBaseUrl);
      expect(result.home.title).toBe(expectedHomeTitle);
      expect(result.upload.title).toBe(expectedUploadTitle);
    }
  );

  interface PageTitleTestTable {
    readonly expectedDocsGitHubAppTitle: string;
    readonly expectedDocsHowToUseTitle: string;
    readonly expectedDocsMcpTitle: string;
    readonly expectedExternalTransmissionTitle: string;
    readonly expectedLoginTitle: string;
    readonly expectedMaintenanceTitle: string;
    readonly expectedPrivacyTitle: string;
    readonly expectedTermsTitle: string;
    readonly language: Language;
  }

  it.each`
    language | expectedTermsTitle        | expectedPrivacyTitle              | expectedMaintenanceTitle  | expectedExternalTransmissionTitle         | expectedLoginTitle    | expectedDocsHowToUseTitle | expectedDocsMcpTitle        | expectedDocsGitHubAppTitle
    ${"ja"}  | ${"LGTMeow 利用規約"}     | ${"LGTMeow プライバシーポリシー"} | ${"LGTMeow メンテナンス"} | ${"LGTMeow 外部送信ポリシー"}             | ${"LGTMeow ログイン"} | ${"LGTMeow 使い方"}       | ${"LGTMeow MCPの使い方"}    | ${"LGTMeow GitHub Appの使い方"}
    ${"en"}  | ${"LGTMeow Terms of Use"} | ${"LGTMeow Privacy Policy"}       | ${"LGTMeow Maintenance"}  | ${"LGTMeow External Transmission Policy"} | ${"LGTMeow Login"}    | ${"LGTMeow How to Use"}   | ${"LGTMeow How to Use MCP"} | ${"LGTMeow How to Use GitHub App"}
  `(
    "should return correct page titles when language is $language",
    ({
      language,
      expectedTermsTitle,
      expectedPrivacyTitle,
      expectedMaintenanceTitle,
      expectedExternalTransmissionTitle,
      expectedLoginTitle,
      expectedDocsHowToUseTitle,
      expectedDocsMcpTitle,
      expectedDocsGitHubAppTitle,
    }: PageTitleTestTable) => {
      const result = metaTagList(language, appBaseUrl);
      expect(result.terms.title).toBe(expectedTermsTitle);
      expect(result.privacy.title).toBe(expectedPrivacyTitle);
      expect(result.maintenance.title).toBe(expectedMaintenanceTitle);
      expect(result["external-transmission-policy"].title).toBe(
        expectedExternalTransmissionTitle
      );
      expect(result.login.title).toBe(expectedLoginTitle);
      expect(result["docs-how-to-use"].title).toBe(expectedDocsHowToUseTitle);
      expect(result["docs-mcp"].title).toBe(expectedDocsMcpTitle);
      expect(result["docs-github-app"].title).toBe(expectedDocsGitHubAppTitle);
    }
  );

  it("should return ogpImgUrl containing the base URL for ja", () => {
    const result = metaTagList("ja", appBaseUrl);
    expect(result.home.ogpImgUrl).toBe(
      "https://lgtmeow.com/opengraph-image.png"
    );
  });

  it("should return ogpImgUrl containing the base URL for en", () => {
    const result = metaTagList("en", appBaseUrl);
    expect(result.home.ogpImgUrl).toBe(
      "https://lgtmeow.com/opengraph-image.png"
    );
  });

  it("should return ogpTargetUrl containing the base URL for ja", () => {
    const result = metaTagList("ja", appBaseUrl);
    expect(result.home.ogpTargetUrl).toBe("https://lgtmeow.com/");
  });

  it("should return ogpTargetUrl containing the base URL for en", () => {
    const result = metaTagList("en", appBaseUrl);
    expect(result.home.ogpTargetUrl).toBe("https://lgtmeow.com/en/");
  });

  it("should return appName as LGTMeow for all entries", () => {
    const result = metaTagList("ja", appBaseUrl);
    expect(result.home.appName).toBe("LGTMeow");
    expect(result.upload.appName).toBe("LGTMeow");
    expect(result.terms.appName).toBe("LGTMeow");
  });

  it("should return description for home entry when language is ja", () => {
    const result = metaTagList("ja", appBaseUrl);
    expect(result.home.description).toBe(
      "LGTMeowは可愛い猫のLGTM画像を作成して共有できるサービスです。"
    );
  });

  it("should return description for home entry when language is en", () => {
    const result = metaTagList("en", appBaseUrl);
    expect(result.home.description).toBe(
      "LGTMeow is a service for generating and sharing cute cat LGTM images."
    );
  });
});
