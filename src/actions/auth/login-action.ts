"use server";

import { redirect } from "next/navigation";
import type { LoginAction } from "@/actions/auth/types/login-action";
import { createLoginAppPath, resolveLoginReturnPath } from "@/functions/auth";
import { isLanguage } from "@/functions/language";
import { auth } from "@/lib/better-auth/auth";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface TryStartGithubLoginResult {
  readonly githubAuthorizationUrl?: string;
}

/**
 * auth.api.signInSocial は OAuth の state を verification テーブルに保存し、
 * 署名付き state Cookie を発行した上で GitHub の authorize URL を返す。
 * state Cookie は auth.ts の nextCookies プラグインがレスポンスへ反映する。
 *
 * redirect() は throw で制御されるため try ブロックの外で呼ぶ必要がある。
 * そのため try-catch はローカル関数に閉じ込め、結果オブジェクトで返す。
 */
const tryStartGithubLogin = async (
  language: Language,
  returnTo: IncludeLanguageAppPath
): Promise<TryStartGithubLoginResult> => {
  try {
    const authorizationResponse = await auth.api.signInSocial({
      body: {
        provider: "github",
        // 相対パスは better-auth の trustedOrigins 検証を常に通過する
        callbackURL: returnTo,
        errorCallbackURL: createLoginAppPath(language, { returnTo }),
      },
    });

    return { githubAuthorizationUrl: authorizationResponse.url };
  } catch {
    return {};
  }
};

export const loginAction: LoginAction = async (
  language: Language,
  returnTo?: IncludeLanguageAppPath
): Promise<void> => {
  // Server Action は HTTP 経由で任意の値を送り込めるため、実行時にも入力を検証する
  const safeLanguage = isLanguage(language) ? language : "ja";
  const safeReturnTo = resolveLoginReturnPath(returnTo, safeLanguage);
  const { githubAuthorizationUrl } = await tryStartGithubLogin(
    safeLanguage,
    safeReturnTo
  );

  if (!githubAuthorizationUrl) {
    redirect(
      createLoginAppPath(safeLanguage, {
        error: "signin_failed",
        returnTo: safeReturnTo,
      })
    );
  }

  redirect(githubAuthorizationUrl);
};
