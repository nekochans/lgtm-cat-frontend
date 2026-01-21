// 絶対厳守：編集前に必ずAI実装ルールを読む
import { assertNever } from "@/utils/assert-never";
import type { Language } from "./language";
import { type AppPathName, appUrlList, createI18nUrl, type Url } from "./url";

type AppName = "LGTMeow";

export const appName: AppName = "LGTMeow";

const defaultTitle = appName;

export function custom404title(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} ページが見つかりません`;
    case "en":
      return `${defaultTitle} Page not found`;
    default:
      return assertNever(language);
  }
}

export function customErrorTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} エラー`;
    case "en":
      return `${defaultTitle} Error`;
    default:
      return assertNever(language);
  }
}

function homePageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} | 猫好きのためのLGTM画像作成・共有サービス`;
    case "en":
      return `${defaultTitle} | Generate & Share LGTM Images for Cat Lovers`;
    default:
      return assertNever(language);
  }
}

function uploadPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} 猫ちゃん画像アップロード`;
    case "en":
      return `${defaultTitle} Cat Image Upload`;
    default:
      return assertNever(language);
  }
}

function termsPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} 利用規約`;
    case "en":
      return `${defaultTitle} Terms of Use`;
    default:
      return assertNever(language);
  }
}

function privacyPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} プライバシーポリシー`;
    case "en":
      return `${defaultTitle} Privacy Policy`;
    default:
      return assertNever(language);
  }
}

function maintenancePageTitle(language: Language) {
  switch (language) {
    case "ja":
      return `${defaultTitle} メンテナンス`;
    case "en":
      return `${defaultTitle} Maintenance`;
    default:
      return assertNever(language);
  }
}

function externalTransmissionPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} 外部送信ポリシー`;
    case "en":
      return `${defaultTitle} External Transmission Policy`;
    default:
      return assertNever(language);
  }
}

function loginPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} ログイン`;
    case "en":
      return `${defaultTitle} Login`;
    default:
      return assertNever(language);
  }
}

function docsHowToUsePageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} 使い方`;
    case "en":
      return `${defaultTitle} How to Use`;
    default:
      return assertNever(language);
  }
}

function docsMcpPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} MCPの使い方`;
    case "en":
      return `${defaultTitle} How to Use MCP`;
    default:
      return assertNever(language);
  }
}

function docsGitHubAppPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} GitHub Appの使い方`;
    case "en":
      return `${defaultTitle} How to Use GitHub App`;
    default:
      return assertNever(language);
  }
}

function description(language: Language): string {
  switch (language) {
    case "ja":
      return `${appName}は可愛い猫のLGTM画像を作成して共有できるサービスです。`;
    case "en":
      return `${appName} is a service for generating and sharing cute cat LGTM images.`;
    default:
      return assertNever(language);
  }
}

interface MetaTag {
  title: string;
  ogpImgUrl: typeof appUrlList.ogpImg;
  ogpTargetUrl: Url;
  appName: AppName;
  description?: string;
}

type MetaTagList = {
  [key in AppPathName]: MetaTag;
};

export function metaTagList(language: Language): MetaTagList {
  return {
    home: {
      title: homePageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("home", language),
      appName,
      description: description(language),
    },
    upload: {
      title: uploadPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("upload", language),
      appName,
    },
    terms: {
      title: termsPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("terms", language),
      appName,
    },
    privacy: {
      title: privacyPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("privacy", language),
      appName,
    },
    maintenance: {
      title: maintenancePageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("maintenance", language),
      appName,
    },
    "external-transmission-policy": {
      title: externalTransmissionPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("external-transmission-policy", language),
      appName,
    },
    login: {
      title: loginPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("login", language),
      appName,
    },
    "docs-how-to-use": {
      title: docsHowToUsePageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("docs-how-to-use", language),
      appName,
    },
    "docs-mcp": {
      title: docsMcpPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("docs-mcp", language),
      appName,
    },
    "docs-github-app": {
      title: docsGitHubAppPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: createI18nUrl("docs-github-app", language),
      appName,
    },
  };
}

export function notFoundMetaTag(language: Language): MetaTag {
  return {
    title: custom404title(language),
    ogpImgUrl: appUrlList.ogpImg,
    ogpTargetUrl: createI18nUrl("home", language),
    appName,
  };
}

export function errorMetaTag(language: Language): MetaTag {
  return {
    title: customErrorTitle(language),
    ogpImgUrl: appUrlList.ogpImg,
    ogpTargetUrl: createI18nUrl("home", language),
    appName,
  };
}
