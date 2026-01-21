// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";

export interface GitHubAppTexts {
  readonly overview: {
    readonly title: string;
    readonly beforeLink: string;
    readonly linkText: string;
    readonly afterLink: string;
    readonly linkUrl: string;
  };
  readonly install: {
    readonly title: string;
    readonly beforeLink: string;
    readonly linkText: string;
    readonly afterLink: string;
    readonly linkUrl: string;
    readonly screenshotAlt: string;
  };
  readonly basicFeature: {
    readonly title: string;
    readonly intro: string;
    readonly screenshotAlt: string;
  };
}

const gitHubAppUrl = "https://github.com/apps/lgtmeow";

export function getGitHubAppTexts(language: Language): GitHubAppTexts {
  switch (language) {
    case "ja":
      return {
        overview: {
          title: "LGTMeow GitHub App",
          beforeLink: "",
          linkText: "こちら",
          afterLink: "からGitHub Appを利用できます。",
          linkUrl: gitHubAppUrl,
        },
        install: {
          title: "インストール",
          beforeLink: "まずは",
          linkText: "こちら",
          afterLink: "からインストールを行います。",
          linkUrl: gitHubAppUrl,
          screenshotAlt: "GitHub App インストール画面",
        },
        basicFeature: {
          title: "基本機能 LGTM画像の自動投稿",
          intro: "使い方はとてもシンプルです。",
          screenshotAlt: "GitHub AppによるLGTM画像の自動投稿例",
        },
      };
    case "en":
      return {
        overview: {
          title: "LGTMeow GitHub App",
          beforeLink: "You can use the GitHub App from ",
          linkText: "here",
          afterLink: ".",
          linkUrl: gitHubAppUrl,
        },
        install: {
          title: "Install",
          beforeLink: "First, install the app from ",
          linkText: "here",
          afterLink: ".",
          linkUrl: gitHubAppUrl,
          screenshotAlt: "GitHub App installation screen",
        },
        basicFeature: {
          title: "Basic Feature: Auto LGTM Image Posting",
          intro: "The usage is very simple.",
          screenshotAlt:
            "Example of automatic LGTM image posting by GitHub App",
        },
      };
    default:
      return assertNever(language);
  }
}

/**
 * 基本機能セクションの説明文を組み立てる
 * Approveをコードスタイルで表示するため、分割して返す
 */
export function getBasicFeatureFullDescription(language: Language): {
  readonly beforeApprove: string;
  readonly approveText: string;
  readonly afterApprove: string;
} {
  switch (language) {
    case "ja":
      return {
        beforeApprove: "GitHub上で作られたPRを",
        approveText: "Approve",
        afterApprove: "するとランダムで取得されたLGTM画像が投稿されます🐱",
      };
    case "en":
      return {
        beforeApprove: "When you ",
        approveText: "Approve",
        afterApprove:
          " a PR created on GitHub, a randomly selected LGTM image will be automatically posted 🐱",
      };
    default:
      return assertNever(language);
  }
}

/**
 * インストール画面のスクリーンショットパス
 * public/screenshots/github app-Install.webp を参照
 */
export const installScreenshotPath = "/screenshots/github app-Install.webp";

/**
 * インストール画面スクリーンショットの表示サイズ
 * 元画像サイズ: 1579 x 807
 * アスペクト比を維持して幅700pxに設定
 */
export const installScreenshotWidth = 700;
export const installScreenshotHeight = 358;

/**
 * LGTM投稿例のスクリーンショットパス
 * public/screenshots/github-app-sample-lgtm.webp を参照
 */
export const sampleLgtmScreenshotPath =
  "/screenshots/github-app-sample-lgtm.webp";

/**
 * LGTM投稿例スクリーンショットの表示サイズ
 * Issue指定サイズ: 560 x 439
 */
export const sampleLgtmScreenshotWidth = 560;
export const sampleLgtmScreenshotHeight = 439;
