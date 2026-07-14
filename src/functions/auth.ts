import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type {
  AppPathName,
  IncludeLanguageAppHref,
  IncludeLanguageAppPath,
} from "@/types/url";

const loginReturnPathNames = [
  "home",
  "upload",
  "terms",
  "privacy",
  "external-transmission-policy",
  "favorites",
  "my-cats",
  "docs-how-to-use",
  "docs-mcp",
  "docs-github-app",
] as const satisfies readonly AppPathName[];

interface CreateLoginAppPathOptions {
  readonly error?: string;
  readonly returnTo?: unknown;
}

/**
 * ログイン後の戻り先として許可する、言語に対応した正規パスを返す。
 * 任意の URL を受け取る境界で使うため、既知のアプリ内パスとの完全一致だけを許可する。
 */
export function resolveLoginReturnPath(
  returnTo: unknown,
  language: Language
): IncludeLanguageAppPath {
  const homePath = createIncludeLanguageAppPath("home", language);

  if (typeof returnTo !== "string") {
    return homePath;
  }

  const allowedReturnPaths: readonly IncludeLanguageAppPath[] =
    loginReturnPathNames.map((appPathName) =>
      createIncludeLanguageAppPath(appPathName, language)
    );

  return allowedReturnPaths.includes(returnTo as IncludeLanguageAppPath)
    ? (returnTo as IncludeLanguageAppPath)
    : homePath;
}

/**
 * ログインページへの内部リンクを組み立てる。
 * Home は既定の戻り先なので returnTo を付けず、既存の URL を維持する。
 */
export function createLoginAppPath(
  language: Language,
  options: CreateLoginAppPathOptions = {}
): IncludeLanguageAppHref {
  const loginPath = createIncludeLanguageAppPath("login", language);
  const homePath = createIncludeLanguageAppPath("home", language);
  const safeReturnTo = resolveLoginReturnPath(options.returnTo, language);
  const searchParams = new URLSearchParams();

  if (safeReturnTo !== homePath) {
    searchParams.set("returnTo", safeReturnTo);
  }

  if (options.error != null) {
    searchParams.set("error", options.error);
  }

  const queryString = searchParams.toString();

  if (queryString === "") {
    return loginPath;
  }

  return `${loginPath}?${queryString}` as IncludeLanguageAppHref;
}
