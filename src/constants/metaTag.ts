import { AppPathName, urlList } from './url';

type AppName = 'LGTMeow';

const appName: AppName = 'LGTMeow';

const defaultTitle = appName;

export const custom404title = `ページが見つかりません | ${appName}`;
export const customErrorTitle = `エラー | ${appName}`;

const defaultDescription =
  'LGTMeowは可愛い猫のLGTM画像を共有出来るサービスです。';

export type MetaTag = {
  title: string;
  ogpImgUrl: string;
  ogpTargetUrl: string;
  appName: AppName;
  description?: string;
};

type MetaTagList = {
  [key in AppPathName]: MetaTag;
};

export const metaTagList = (): MetaTagList => ({
  top: {
    title: `${defaultTitle} | LGTM image share service for cat lovers`,
    ogpImgUrl: urlList.ogpImg,
    ogpTargetUrl: urlList.top,
    appName,
    description: defaultDescription,
  },
  upload: {
    title: `${defaultTitle} 猫ちゃん画像アップロード`,
    ogpImgUrl: urlList.ogpImg,
    ogpTargetUrl: urlList.top,
    appName,
  },
  terms: {
    title: `${defaultTitle} 利用規約`,
    ogpImgUrl: urlList.ogpImg,
    ogpTargetUrl: urlList.terms,
    appName,
  },
  privacy: {
    title: `${defaultTitle} プライバシーポリシー`,
    ogpImgUrl: urlList.ogpImg,
    ogpTargetUrl: urlList.privacy,
    appName,
  },
});
