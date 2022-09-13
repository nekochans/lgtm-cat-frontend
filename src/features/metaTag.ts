import { assertNever } from '../utils';

import { appUrlList, type AppPathName, AppUrl } from './url';

import type { Language } from './language';

type AppName = 'LGTMeow';

const appName: AppName = 'LGTMeow';

const defaultTitle = appName;

export const custom404title = (language: Language): string => {
  switch (language) {
    case 'ja':
      return `${defaultTitle} ページが見つかりません`;
    case 'en':
      return `${defaultTitle} Page not found`;
    default:
      return assertNever(language);
  }
};

export const customErrorTitle = (language: Language): string => {
  switch (language) {
    case 'ja':
      return `${defaultTitle} エラー`;
    case 'en':
      return `${defaultTitle} Error`;
    default:
      return assertNever(language);
  }
};

const uploadPageTitle = (language: Language): string => {
  switch (language) {
    case 'ja':
      return `${defaultTitle} 猫ちゃん画像アップロード`;
    case 'en':
      return `${defaultTitle} Cat Image Upload`;
    default:
      return assertNever(language);
  }
};

const termsPageTitle = (language: Language): string => {
  switch (language) {
    case 'ja':
      return `${defaultTitle} 利用規約`;
    case 'en':
      return `${defaultTitle} Terms of Use`;
    default:
      return assertNever(language);
  }
};

const privacyPageTitle = (language: Language): string => {
  switch (language) {
    case 'ja':
      return `${defaultTitle} プライバシーポリシー`;
    case 'en':
      return `${defaultTitle} Privacy Policy`;
    default:
      return assertNever(language);
  }
};

const maintenancePageTitle = (language: Language) => {
  switch (language) {
    case 'ja':
      return `${defaultTitle} メンテナンス`;
    case 'en':
      return `${defaultTitle} Maintenance`;
    default:
      return assertNever(language);
  }
};

const description = (language: Language): string => {
  switch (language) {
    case 'ja':
      return `${appName}は可愛い猫のLGTM画像を共有出来るサービスです。`;
    case 'en':
      return `${appName} is a service that allows you to share LGTM images of cats.`;
    default:
      return assertNever(language);
  }
};

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

export const metaTagList = (language: Language): MetaTagList => ({
  top: {
    title: `${defaultTitle} | LGTM image share service for cat lovers`,
    ogpImgUrl: appUrlList.ogpImg,
    ogpTargetUrl: appUrlList.top,
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
});

export const notFoundMetaTag = (language: Language) => ({
  title: custom404title(language),
  ogpImgUrl: appUrlList.ogpImg,
  ogpTargetUrl: appUrlList.top,
  appName,
});

export const errorMetaTag = (language: Language) => ({
  title: customErrorTitle(language),
  ogpImgUrl: appUrlList.ogpImg,
  ogpTargetUrl: appUrlList.top,
  appName,
});
