// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHowToUseTexts,
  howToUseScreenshotPath,
} from "@/features/docs/functions/how-to-use-text";
import type { Language } from "@/features/language";

describe("src/features/docs/functions/how-to-use-text.ts getHowToUseTexts TestCases", () => {
  beforeEach(() => {
    // テスト用にデフォルトURLを設定 (環境変数が未設定の場合のデフォルト値を使用)
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://lgtmeow.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  interface TestTable {
    readonly language: Language;
    readonly expectedWhatIsLgtmTitle: string;
    readonly expectedContactTitle: string;
  }

  it.each`
    language | expectedWhatIsLgtmTitle | expectedContactTitle
    ${"ja"}  | ${"LGTMとは?"}          | ${"お問い合わせ"}
    ${"en"}  | ${"What is LGTM?"}      | ${"Contact"}
  `(
    "should return correct titles when language is $language",
    ({
      language,
      expectedWhatIsLgtmTitle,
      expectedContactTitle,
    }: TestTable) => {
      const result = getHowToUseTexts(language);

      expect(result.whatIsLgtm.title).toBe(expectedWhatIsLgtmTitle);
      expect(result.contact.title).toBe(expectedContactTitle);
    }
  );

  it("should return Japanese texts with correct structure when language is ja", () => {
    const result = getHowToUseTexts("ja");

    // whatIsLgtm section
    expect(result.whatIsLgtm.content).toHaveLength(2);
    expect(result.whatIsLgtm.content[0]).toContain("Looks Good To Me");

    // whatIsLgtmeow section
    expect(result.whatIsLgtmeow.title).toBe("LGTMeowとは");
    expect(result.whatIsLgtmeow.content).toHaveLength(2);

    // copyByClicking section
    expect(result.copyByClicking.title).toBe("LGTM画像を選んでコピーする");
    expect(result.copyByClicking.intro).toContain("[HOME]");
    expect(result.copyByClicking.buttonDescription).toHaveLength(3);
    expect(result.copyByClicking.buttonDescription[1]).toContain(
      "ねこリフレッシュ"
    );
    expect(result.copyByClicking.buttonDescription[2]).toContain("ねこ新着順");
    expect(result.copyByClicking.screenshotDescription).toBe(
      "GitHubにマークダウンソースを貼り付けると以下のようになります。"
    );

    // copyRandom section
    expect(result.copyRandom.title).toBe("LGTM画像をランダムでコピーする");
    expect(result.copyRandom.content).toContain("ランダムコピー");

    // uploadCatPhoto section
    expect(result.uploadCatPhoto.title).toBe(
      "猫画像をアップロードしてLGTM画像を作成する"
    );
    expect(result.uploadCatPhoto.content).toHaveLength(3);
    expect(result.uploadCatPhoto.content[0]).toContain("[アップロード]");

    // contact section
    expect(result.contact.intro).toBe("質問、機能リクエスト等は大歓迎です");
    expect(result.contact.methodsIntro).toBe(
      "お問い合わせは2つの手段があります。"
    );
    expect(result.contact.issueLabel).toBe(
      "以下のリポジトリからIssueを作成する"
    );
    expect(result.contact.issueLinkText).toBe("GitHub Issues");
    expect(result.contact.formLabel).toBe(
      "お問い合わせフォームに必要情報を入力"
    );
    expect(result.contact.formLinkText).toBe("お問い合わせフォーム");
    expect(result.contact.issueUrl).toBe(
      "https://github.com/nekochans/lgtm-cat/issues"
    );
    expect(result.contact.formUrl).toContain("docs.google.com/forms");
  });

  it("should return English texts with correct structure when language is en", () => {
    const result = getHowToUseTexts("en");

    // whatIsLgtm section
    expect(result.whatIsLgtm.content).toHaveLength(2);
    expect(result.whatIsLgtm.content[0]).toContain("Looks Good To Me");

    // whatIsLgtmeow section
    expect(result.whatIsLgtmeow.title).toBe("What is LGTMeow?");
    expect(result.whatIsLgtmeow.content).toHaveLength(2);

    // copyByClicking section
    expect(result.copyByClicking.title).toBe("Copy LGTM Image by Clicking");
    expect(result.copyByClicking.intro).toContain("[HOME]");
    expect(result.copyByClicking.buttonDescription).toHaveLength(3);
    expect(result.copyByClicking.buttonDescription[1]).toContain(
      "Refresh Cats"
    );
    expect(result.copyByClicking.buttonDescription[2]).toContain(
      "Show Latest Cats"
    );
    expect(result.copyByClicking.screenshotDescription).toBe(
      "When you paste the markdown source into GitHub, it will look like this:"
    );

    // copyRandom section
    expect(result.copyRandom.title).toBe("Copy Random LGTM Image");
    expect(result.copyRandom.content).toContain("Copy Random Cat");

    // uploadCatPhoto section
    expect(result.uploadCatPhoto.title).toBe(
      "Create LGTM Image by Uploading Cat Photo"
    );
    expect(result.uploadCatPhoto.content).toHaveLength(3);
    expect(result.uploadCatPhoto.content[0]).toContain("[Upload]");

    // contact section
    expect(result.contact.intro).toBe(
      "Questions and feature requests are always welcome!"
    );
    expect(result.contact.methodsIntro).toBe(
      "There are two ways to contact us:"
    );
    expect(result.contact.issueLabel).toBe("Create an issue in our repository");
    expect(result.contact.issueLinkText).toBe("GitHub Issues");
    expect(result.contact.formLabel).toBe("Fill out the contact form");
    expect(result.contact.formLinkText).toBe("Inquiry Form");
    expect(result.contact.issueUrl).toBe(
      "https://github.com/nekochans/lgtm-cat/issues"
    );
    expect(result.contact.formUrl).toContain("docs.google.com/forms");
  });

  it("should include correct URLs when NEXT_PUBLIC_APP_URL is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://custom-domain.com");

    const result = getHowToUseTexts("ja");

    expect(result.copyByClicking.intro).toContain(
      "[HOME](https://custom-domain.com)"
    );
    expect(result.uploadCatPhoto.content[0]).toContain(
      "[アップロード](https://custom-domain.com/upload)"
    );
  });

  it("should use default URL when NEXT_PUBLIC_APP_URL is lgtmeow.com", () => {
    // beforeEachでhttps://lgtmeow.comが設定されている
    const result = getHowToUseTexts("ja");

    expect(result.copyByClicking.intro).toContain(
      "[HOME](https://lgtmeow.com)"
    );
    expect(result.uploadCatPhoto.content[0]).toContain(
      "[アップロード](https://lgtmeow.com/upload)"
    );
  });

  it("should include English upload path when language is en", () => {
    const result = getHowToUseTexts("en");

    expect(result.uploadCatPhoto.content[0]).toContain(
      "[Upload](https://lgtmeow.com/en/upload)"
    );
  });

  it("should include English home path when language is en", () => {
    const result = getHowToUseTexts("en");

    expect(result.copyByClicking.intro).toContain(
      "[HOME](https://lgtmeow.com/en)"
    );
    expect(result.copyRandom.content).toContain(
      "[HOME](https://lgtmeow.com/en)"
    );
  });
});

describe("src/features/docs/functions/how-to-use-text.ts howToUseScreenshotPath TestCases", () => {
  it("should return correct screenshot path", () => {
    expect(howToUseScreenshotPath).toBe("/screenshots/lgtm-image-preview.webp");
  });
});
