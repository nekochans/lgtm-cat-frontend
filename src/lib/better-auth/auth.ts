import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { mapGithubProfileToUser } from "@/features/auth/functions/map-github-profile-to-user";
import {
  hasNonEmptyAccountScope,
  isScopeRequestForbidden,
} from "@/features/auth/functions/oauth-scope-policy";
import { authDb } from "./db";

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is not defined");
}

if (!betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL is not defined");
}

if (!githubClientId) {
  throw new Error("GITHUB_CLIENT_ID is not defined");
}

if (!githubClientSecret) {
  throw new Error("GITHUB_CLIENT_SECRET is not defined");
}

/**
 * authorize URL の改変等で広い scope の token が発行された場合でも DB へ保存しない。
 * databaseHooks の before は false を返すと当該 DB 操作だけが黙ってスキップされ
 * フローが継続するため、throw で処理全体を中止する（F39）。
 *
 * body の code は必須。1.6.23 の OAuth callback は e.body.code が存在する場合のみ
 * APIError を errorCallbackURL（言語対応 /login?error=...）への redirect に変換し、
 * 無ければ HTTP 400 のまま返してしまう（F42。既存アカウント再ログインの update 経路で効く）。
 */
const rejectNonEmptyAccountScope = (scope: string | null | undefined): void => {
  if (hasNonEmptyAccountScope(scope)) {
    throw new APIError("BAD_REQUEST", {
      code: "OAUTH_SCOPE_NOT_ALLOWED",
      message: "OAuth scopes must be empty",
    });
  }
};

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "sqlite",
    // 初回 OAuth の user + account 作成を原子化する（F41）。デフォルト false のままだと、
    // account.create.before（scope 拒否）の throw 時に user 行がロールバックされず、
    // 匿名化 email の UNIQUE 制約を持つ孤立 user が残ってしまう。
    transaction: true,
  }),
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  // OAuth の access token を account.access_token へ平文のまま保存しないための設定。
  // scope 空でも token 自体は発行されるため暗号化して保存する（F34。スキーマ変更不要）。
  account: {
    encryptOAuthTokens: true,
  },
  // state を復元できない OAuth コールバック失敗（state 欠落・verification 行欠落等）の
  // 遷移先（F11）。未設定だと Better Auth 組み込みのエラーページ（/api/auth/error）に
  // 飛ぶため、/login の再試行画面へ収束させる。この経路では言語が分からないため ja 版。
  onAPIError: {
    errorURL: `${betterAuthUrl}/login`,
  },
  // アカウント連携機能は提供しないため、追加 scope を要求できる /link-social を閉じる（F38。404 になる）。
  disabledPaths: ["/link-social"],
  hooks: {
    // /sign-in/social は body の scopes を authorize URL へ無条件追記するため（F37）、
    // 非空 scopes を BAD_REQUEST で拒否する（プライバシー設計の API 経路レベルの強制）。
    // 自前の loginAction は scopes を渡さないため影響しない。
    before: createAuthMiddleware((ctx) => {
      if (isScopeRequestForbidden(ctx.path, ctx.body)) {
        throw new APIError("BAD_REQUEST", {
          code: "OAUTH_SCOPE_NOT_ALLOWED",
          message: "Requesting additional OAuth scopes is not allowed",
        });
      }
      return Promise.resolve();
    }),
  },
  databaseHooks: {
    account: {
      create: {
        before: (account) => {
          rejectNonEmptyAccountScope(account.scope);
          return Promise.resolve();
        },
      },
      // 既存アカウントの再ログイン時は updateAccount() で scope が更新されるため（F39）、
      // create だけでなく update の直前にも検証する。
      update: {
        before: (account) => {
          rejectNonEmptyAccountScope(account.scope);
          return Promise.resolve();
        },
      },
    },
  },
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      // デフォルトスコープ（read:user, user:email）を要求しない。
      // options.scope はデフォルトへの追記のため、これが唯一の除去手段（Issue #480 プライバシー設計）。
      disableDefaultScope: true,
      // 戻り値はデフォルトのユーザーマッピングの後にスプレッドされるため email が確実に上書きされる。
      mapProfileToUser: mapGithubProfileToUser,
    },
  },
  // Server Action から呼ぶ signInSocial の state Cookie / signOut のセッション Cookie 削除を
  // Next.js の Cookie ストアへ反映するために必須。plugins 配列の最後に置く（公式ドキュメント指定）。
  plugins: [nextCookies()],
});
