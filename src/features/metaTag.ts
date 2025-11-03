import { assertNever } from "@/utils/assertNever";
import type { Language } from "./language";
import { type AppPathName, type AppUrl, appUrlList } from "./url";

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

function topPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} 猫好きのためのLGTM画像共有サービス`;
    case "en":
      return `${defaultTitle} | LGTM image share service for cat lovers`;
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

function description(language: Language): string {
  switch (language) {
    case "ja":
      return `${appName}は可愛い猫のLGTM画像を共有出来るサービスです。`;
    case "en":
      return `${appName} is a service that allows you to share LGTM images of cats.`;
    default:
      return assertNever(language);
  }
}

export type MetaTag = {
  title: string;
  ogpImgUrl: typeof appUrlList.ogpImg;
  ogpTargetUrl: AppUrl;
  appName: AppName;
  description?: string;
};

type MetaTagList = {
  [key in AppPathName]: MetaTag;
};

export function metaTagList(language: Language): MetaTagList {
  return {
    home: {
      title: topPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: appUrlList.home,
      appName,
      description: description(language),
    },
    upload: {
      title: uploadPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: appUrlList.upload,
      appName,
    },
    terms: {
      title: termsPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: appUrlList.terms,
      appName,
    },
    privacy: {
      title: privacyPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: appUrlList.privacy,
      appName,
    },
    maintenance: {
      title: maintenancePageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: appUrlList.maintenance,
      appName,
    },
    "external-transmission-policy": {
      title: externalTransmissionPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: appUrlList.externalTransmission,
      appName,
    },
    login: {
      title: externalTransmissionPageTitle(language),
      ogpImgUrl: appUrlList.ogpImg,
      ogpTargetUrl: appUrlList.terms,
      appName,
    },
  };
}

export function notFoundMetaTag(language: Language): MetaTag {
  return {
    title: custom404title(language),
    ogpImgUrl: appUrlList.ogpImg,
    ogpTargetUrl: appUrlList.home,
    appName,
  };
}

export function errorMetaTag(language: Language): MetaTag {
  return {
    title: customErrorTitle(language),
    ogpImgUrl: appUrlList.ogpImg,
    ogpTargetUrl: appUrlList.home,
    appName,
  };
}
