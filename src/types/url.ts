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
  | "docs-how-to-use"
  | "docs-mcp"
  | "docs-github-app";

type AppPath = (typeof appPathList)[keyof typeof appPathList];

export type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | "/";
