// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { AppPathName, Url } from "@/types/url";

type AppName = "LGTMeow";

export interface MetaTag {
  appName: AppName;
  description?: string;
  ogpImgUrl: Url;
  ogpTargetUrl: Url;
  title: string;
}

export type MetaTagList = {
  [key in AppPathName]: MetaTag;
};
