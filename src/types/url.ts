import type { appPathList } from "@/constants/url";
import type { Language } from "@/types/language";

export type Url = `http://localhost${string}` | `https://${string}`;

export type AppPathName =
  | "home"
  | "upload"
  | "terms"
  | "privacy"
  | "maintenance"
  | "external-transmission-policy"
  | "login"
  | "logout"
  | "favorites"
  | "my-cats"
  | "docs-how-to-use"
  | "docs-mcp"
  | "docs-github-app";

type AppPath = (typeof appPathList)[keyof typeof appPathList];

export type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | "/";

export type IncludeLanguageAppHref =
  | IncludeLanguageAppPath
  | `${IncludeLanguageAppPath}?${string}`;

/**
 * ヘッダーの言語切替リンクの遷移先。
 * ログインページのようにクエリ（returnTo / error）を引き継ぐ必要があるページが、
 * 既定の pathname だけの切替を上書きするために使う。
 */
export type LanguageSwitchHrefs = Readonly<
  Record<Language, IncludeLanguageAppHref>
>;
