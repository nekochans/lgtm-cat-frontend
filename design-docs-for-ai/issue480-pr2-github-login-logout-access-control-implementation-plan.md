# Issue #480 PR2: GitHub ログイン本体 + ログアウト + アクセス制御 実装計画

- 対象 Issue: <https://github.com/nekochans/lgtm-cat-frontend/issues/480>
- 対象スコープ: Issue 内「PR2: GitHub ログイン本体 + ログアウト + アクセス制御」
- 前提 PR: PR #488（PR1: Coming Soon ページ追加 + Header ハードコード修正）はマージ済み

## 1. 概要

Better Auth の GitHub Social Provider を有効化し、以下を実装する。

1. `/login`（ja/en）にアクセスすると GitHub OAuth フローが自動開始される（ボタン押下不要）
2. `/logout`（ja/en）にアクセスすると sign out 処理が実行され、言語対応の Home へリダイレクトされる（想定外の失敗時はクライアント状態でエラーメッセージ + 再試行ボタンを表示する）
3. お気に入り（`/favorites`）・My Cats（`/my-cats`）・ログアウト（`/logout`）をアクセス制御ページ化する（未ログイン時は言語対応の Home へリダイレクト）。`/favorites`・`/my-cats` はセッション照会（DB）で判定し、`/logout` は DB 障害時でもログアウトできるようセッション Cookie の有無のみで判定する
4. Header のログイン状態表示を `auth.api.getSession()` の結果に基づいて切り替える（`hideLoginButton` と `isLoggedIn` ハードコードの撤去）
5. GitHub の email scope を要求せず、実 email を DB に永続化しない（匿名化メールアドレス `gh-<GitHub User ID>@no-email.lgtmeow.invalid` を `user.email` に格納。OAuth コールバック処理中に GitHub の公開 email がメモリ上を一時的に通過し得る事は許容する）
6. `logout` を URL 定数・型・メタタグに追加し、Header の `/logout` ハードコードを解消する
7. `src/proxy.ts` の matcher に認証系 12 パスを追加する（proxy ではセッション判定を行わない）。併せて、`/ja` 正規化リダイレクトの 302 応答にリクエストヘッダー（`cookie` を含む）を横流ししている既存の不具合を修正する（セッション Cookie 導入によりセッショントークンが応答へ写り込む経路になるため）
8. 追加の OAuth scope を要求できる経路を閉じる（`/link-social` の無効化、`/sign-in/social` への非空 `scopes` の拒否、`account.scope` の保存前検証）

認証処理はすべて Server Action 方式で統一する。**クライアント側 SDK（`createAuthClient()` / `auth-client.ts`）は作成しない。**

## 2. 検証済みの事実一覧（出典付き）

実装前に以下の事実を確認済みである。実装中に疑義が生じた場合は出典を再確認すること。

### 2.1 バージョン関連

| # | 事実 | 出典 |
| --- | --- | --- |
| F1 | インストール済みの `better-auth` / `@better-auth/drizzle-adapter` は共に `1.6.9`（exact 指定） | `package.json` |
| F2 | 最新安定版は `v1.6.23`（2026-06-29 公開）。`v1.7.0` は RC 段階（2026-07-12 時点） | GitHub Releases API（`repos/better-auth/better-auth/releases`） |
| F3 | `1.6.10`〜`1.6.23` に本 PR の使用範囲（`socialProviders.github` / `mapProfileToUser` / `disableDefaultScope` / `nextCookies` / `toNextJsHandler` / Drizzle adapter / コア 4 テーブル）への破壊的変更は無い。`1.6.10` にはソーシャルサインインのリダイレクト時に `Set-Cookie` が重複する不具合の修正が含まれる | 各バージョンの GitHub Release ノート本文を精査 |
| F4 | `@better-auth/drizzle-adapter` は better-auth モノレポから本体と同一バージョンでリリースされている（`v1.6.23` の Release ノートに drizzle-adapter の変更が含まれる） | `v1.6.23` Release ノート |

### 2.2 better-auth の実装仕様（インストール済み `1.6.9` のソースで確認）

| # | 事実 | 出典（node_modules 内） |
| --- | --- | --- |
| F5 | GitHub プロバイダのデフォルトスコープは `["read:user", "user:email"]`。`disableDefaultScope: true` で空になる。`options.scope` はデフォルトへの**追記**であり、`scope: []` ではデフォルトを除去できない | `@better-auth/core/dist/social-providers/github.mjs` 14-16 行目 |
| F6 | `mapProfileToUser` の戻り値はデフォルトのユーザーマッピング（`id`/`name`/`email`/`image`/`emailVerified`）の**後にスプレッド**されるため、`email` 等を確実に上書きできる | 同上 75-84 行目 |
| F7 | `GithubProfile` 型の `id` は `string` と宣言されているが、GitHub API `/user` の実レスポンスでは数値。テンプレートリテラル `` `gh-${profile.id}` `` で使う分には型・実行時とも問題ない | `@better-auth/core/dist/social-providers/github.d.mts` / GitHub REST API 仕様 |
| F8 | OAuth の state は DB 構成時 `storeStateStrategy: "database"` がデフォルト。verification テーブルへの保存に**加えて署名付き state Cookie** が発行され、コールバック時に `skipStateCookieCheck`（デフォルト false）でない限り Cookie の一致検証が行われる。**state Cookie がブラウザに保存されないと `state_security_mismatch` でログインが失敗する**。なお 1.6.23 ではデフォルト決定の実装が `hasServerSessionStore(options)`（`!!options.database \|\| !!options.secondaryStorage`）ベースの `isStateful` に変わったが、database 構成での結果は同じ `"database"` である | `better-auth/dist/state.mjs` 47-58, 103-109 行目 / `better-auth/dist/context/create-context.mjs` 133-134 行目（1.6.9）/ 1.6.23 npm tarball の `dist/context/create-context.mjs` 47, 136 行目・`dist/context/store-capabilities.mjs` |
| F9 | したがって Server Action から `auth.api.signInSocial()` を呼ぶ場合、レスポンスの `Set-Cookie`（state Cookie）を Next.js の Cookie ストアへ反映する `nextCookies` プラグインが**必須**。sign out の Cookie 削除も同様 | `better-auth/dist/integrations/next-js.mjs`（`nextCookies` の after フックが `Set-Cookie` を `cookies()` に反映） |
| F10 | `auth.api.signInSocial()` は body に `provider` / `callbackURL` / `errorCallbackURL` / `newUserCallbackURL` / `disableRedirect` 等を受け取り、`idToken` 無しの場合 `{ url: string, redirect: boolean }` を返す | `better-auth/dist/api/routes/sign-in.mjs` 39-150 行目 |
| F11 | OAuth コールバックのエラーは 2 系統ある。(1) state を復元できた後のエラー（ユーザー拒否 `access_denied`・`email_not_found`・**state の期限切れ**（verification 行の取得・解析後に `expiresAt` を検査するため、復元済みの `errorURL` が StateError に引き継がれる）等）はフロー固有の `errorCallbackURL` へ、(2) state を復元できないエラー（state パラメータ欠落・verification 行の欠落や再利用・callback リクエストの schema 不正等）は `onAPIError.errorURL`（未設定時は `baseURL + "/error"` = Better Auth 組み込みエラーページ）へ、いずれも `?error=<コード>`（+ `error_description`）を付与してリダイレクトされる | 1.6.23 npm tarball の `dist/api/routes/callback.mjs` 32, 45-56 行目 / `dist/oauth2/state.mjs` 33-46 行目 / `dist/state.mjs` StateError クラス・126-129 行目（期限切れ StateError への `errorURL` 引き継ぎ）/ `dist/oauth2/errors.mjs`（`redirectOnError`）/ `@better-auth/core/dist/types/init-options.d.mts` 1246-1268 行目 |
| F12 | コールバック成功時はセッション Cookie を設定して `callbackURL` へリダイレクトする。`userInfo.email` が null だと `email_not_found` エラーになるため、email 匿名化（F6）は必須 | 同上 137-175 行目 |
| F13 | `auth.api.signOut()` は `requireHeaders: true`（`headers` の受け渡しが必須）。セッション Cookie が有れば DB のセッション行削除を**試みる**が、削除時の例外は内部で捕捉されログ出力のみ（**DB 行削除は best effort**）。その後 Cookie を削除し常に `{ success: true }` を返す。セッション Cookie が無い場合も throw しない。つまり DB 障害でも通常は throw せず、throw し得るのは想定外の異常時のみ | `better-auth/dist/api/routes/sign-out.mjs` 21-27 行目（1.6.9 / 1.6.23 で同一実装。1.6.23 は npm tarball で確認） |
| F14 | `auth.api.getSession()` も `requireHeaders: true`。セッション Cookie が無い場合は **DB へ問い合わせず** null を返す（匿名訪問者は Turso 負荷ゼロ） | `better-auth/dist/api/routes/session.mjs` 16 行目以降 |
| F15 | `toNextJsHandler(auth)` は `GET`/`POST` 等のハンドラを返す。公式ドキュメントの推奨は `api/auth/[...all]/route.ts` に `export const { GET, POST } = toNextJsHandler(auth)` | `better-auth/dist/integrations/next-js.mjs` / <https://www.better-auth.com/docs/integrations/next> |
| F16 | `nextCookies()` は「plugins 配列の最後に置く」ことが公式ドキュメントで指定されている | <https://www.better-auth.com/docs/integrations/next> |
| F17 | email を返さないプロバイダに対し `mapProfileToUser` でプレースホルダー email を合成するのは公式の案内された手法（「Synthesized emails are placeholders, not contact addresses」） | <https://www.better-auth.com/docs/concepts/oauth> |
| F18 | GitHub provider ドキュメントの「You MUST include the user:email scope」は email をプロバイダから取得する前提の注意書き。本設計は email scope を要求せず匿名化値で置き換えるため該当しない | <https://www.better-auth.com/docs/authentication/github> + F5/F6/F12 の組み合わせ |
| F33 | GitHub provider の `getUserInfo` は `/user` 取得後、scope の有無に関わらず `/user/emails` も呼ぶ（scope 無しでは失敗し、email の補完は行われない）。また `/user` 応答の `email` にはユーザーが公開設定した email が入り得る。したがって「実 email を一切取得しない」はコード上保証できず、保証できるのは **DB へ永続化しない事**（F6 の上書き）である | `@better-auth/core/dist/social-providers/github.mjs` 62-75 行目 |
| F34 | OAuth callback で取得した access token は `account.access_token` に保存される。`account.encryptOAuthTokens` はデフォルト false（平文保存）で、true を設定すると `symmetricEncrypt` により暗号化して保存される。スキーマ変更は不要 | `better-auth/dist/oauth2/utils.mjs` 12, 22 行目 / `@better-auth/core/dist/types/init-options.d.mts` 965 行目 |
| F36 | `getSessionCookie(headersOrRequest)` は `Headers` オブジェクトを直接受け取れる。Cookie ヘッダーから `better-auth.session_token`（`__Secure-` 接頭辞付き・`better-auth-session_token` 形式を含む）を文字列として探すだけで、DB アクセス・復号・署名検証は行わない | `better-auth/dist/cookies/index.mjs` 169-177 行目 |
| F37 | `/sign-in/social` の body スキーマは `scopes?: string[]` を受け取り、そのままプロバイダへ渡す。GitHub プロバイダは `disableDefaultScope: true` でも `if (scopes) _scopes.push(...scopes)` によりリクエスト由来の scope を無条件に authorize URL へ追記する。`/link-social`（`sessionMiddleware` 付き = 要ログイン）も同様に `scopes` を受け取る | `better-auth/dist/api/routes/sign-in.mjs` 34, 141 行目 / `@better-auth/core/dist/social-providers/github.mjs` 13-16 行目 / `better-auth/dist/api/routes/account.mjs` 67 行目以降 |
| F38 | `disabledPaths` に列挙したパスは正規化後に一致すると 404（Not Found）を返す | `better-auth/dist/api/index.mjs` 163-165 行目 |
| F39 | OAuth コールバックは、既存アカウントの再ログイン時に `updateAccount()` で `access_token` と `scope`（`tokens.scopes?.join(",")`）を更新する。したがって scope の保存前検証は `databaseHooks.account.create.before` だけでなく `update.before` にも必要。databaseHooks の before フックで `false` を返すと当該 DB 操作が黙ってスキップされるだけでフロー全体は継続するため、処理を中止させたい場合は例外を throw する | `better-auth/dist/api/routes/callback.mjs` 117-119 行目 / `@better-auth/core/dist/types/init-options.d.mts`（account hooks の JSDoc「If the hook returns false, the account will not be created/updated」） |
| F40 | `createAuthMiddleware` / `APIError` は `better-auth/api` から export されている。`hooks.before` は全エンドポイントの処理前に実行され、`auth.api.*` 経由のサーバー側呼び出しにも適用される | `better-auth/dist/api/index.mjs` 26, 216 行目 / `better-auth/dist/api/to-auth-endpoints.mjs` 73-93, 190-230 行目 |
| F41 | `createOAuthUser`（初回 OAuth の user + account 作成）は `runWithTransaction` でラップされているが、drizzle adapter の `transaction` オプションは**デフォルト false** のため、既定では user 作成後に account 作成が失敗しても user 行はロールバックされない（孤立 user が残る）。`drizzleAdapter(db, { transaction: true })` を設定すると `db.transaction()` で実行され原子化される | `better-auth/dist/db/internal-adapter.mjs`（`createOAuthUser` の `runWithTransaction`。1.6.9 / 1.6.23 とも）/ `@better-auth/drizzle-adapter` `dist/index.mjs`（1.6.9: 442 行目、1.6.23: 578 行目の `config.transaction ?? false`） |
| F42 | 1.6.23 の OAuth callback は `handleOAuthUserInfo` を try-catch で包み、伝播した APIError を **`e.body.code` が存在する場合のみ** `errorCallbackURL` への redirect に変換する（無ければ再 throw = HTTP 400 応答）。既存アカウント再ログイン時の `updateAccount`（= `databaseHooks.account.update.before` の throw 元）はこの経路を通る。一方、新規ユーザー作成（`createOAuthUser`）の APIError は `link-account.mjs` 内部で捕捉され `{ error: e.message }` として返り、`body.code` が無くても redirect になる | 1.6.23 npm tarball の `dist/api/routes/callback.mjs` 140-156 行目（`if (isAPIError(e) && e.body?.code) redirectOnError(...)`）/ `dist/oauth2/link-account.mjs` 115-121 行目 |

### 2.3 Next.js 16.2.6 の仕様（インストール済みパッケージ同梱ドキュメントで確認）

| # | 事実 | 出典（node_modules/next/dist/docs 内） |
| --- | --- | --- |
| F19 | 本プロジェクトは `next.config.ts` で `cacheComponents: true` が有効 | `next.config.ts` |
| F20 | `cacheComponents` 有効時、`headers()` / `cookies()` / `searchParams` 等の実行時 API にアクセスするコンポーネントは `<Suspense>` で包む必要がある（fallback が静的シェルに含まれ、実体はリクエスト時に streaming される） | `01-app/01-getting-started/08-caching.md` 129-160 行目 |
| F21 | `"use cache"` が付いた関数・コンポーネントの**内側**では `headers()` / `cookies()` を直接呼べない。「page ファイル内で import してネストしたコンポーネントは page のキャッシュ出力の一部になる」ため、`"use cache"` なページコンポーネントの内側にセッション参照コンポーネントを置くことはできない。children として**外から**渡す分はキャッシュを通過（pass-through）できる | `01-app/03-api-reference/01-directives/use-cache.md` 154-178, 196, 328 行目 |
| F22 | `redirect()` は Server Action / Server Component で使用可能。`NEXT_REDIRECT` を throw するため **try ブロックの外**で呼ぶ。絶対 URL（外部 URL）も渡せる | `01-app/03-api-reference/04-functions/redirect.md` 50-55 行目 |
| F23 | `cacheComponents` 有効時のクライアントナビゲーションでは React `<Activity>` により route が hidden になり、復帰時に **effect が再実行される**。マウント時 1 回だけ実行したい処理には ref ガードが必要 | `01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md` 32-46 行目 |
| F35 | `redirect()` は内部エラー（`NEXT_REDIRECT`）の throw で実装されており、アプリの try/catch で捕捉してはならない。捕捉し得る箇所では `unstable_rethrow`（next/navigation）で再送出する（対象として redirect / notFound / permanentRedirect が明記されている）。クライアントから Server Action を呼んだ場合、**成功時の redirect() も Action Promise の `NEXT_REDIRECT` rejection として観測される** | `01-app/03-api-reference/04-functions/unstable_rethrow.md` / 計画レビュー Round 3（Codex による Next.js 16.2.6 の挙動検証） |

### 2.4 リポジトリの現状（実ファイルで確認）

| # | 事実 | 出典 |
| --- | --- | --- |
| F24 | `appPathList` / `i18nUrlList` / `AppPathName` / `metaTagList` / `appUrlList` に `login` / `favorites` / `my-cats` は登録済み。**`logout` のみ未登録** | `src/constants/url.ts` / `src/types/url.ts` / `src/functions/meta-tag.ts` / `src/lib/config/app-base-url.ts` |
| F25 | Header の `/logout` ハードコードは `header-desktop.tsx`（Dropdown.Item、183 行目付近）と `header-mobile.tsx`（LoggedInMenu 内 Link、192 行目付近、TODO コメント付き）の 2 箇所 | 各ファイル |
| F26 | `hideLoginButton` は `header.tsx` / `header-desktop.tsx` / `header-mobile.tsx` / `page-layout.tsx` / `error-layout.tsx` と Header 系 stories 3 ファイル（`HiddenLoginButton*` Story）に存在 | 各ファイル |
| F27 | `PageLayout` に `isLoggedIn={false}` を渡している feature コンポーネントは 10 個: home / upload / terms / privacy / external-transmission-policy / docs-how-to-use / docs-mcp / docs-github-app / favorites / my-cats | `grep isLoggedIn src/features` |
| F28 | `docs/mcp` と `docs/github-app` の page.tsx（ja/en とも）は**ページコンポーネント自体**に `"use cache"` + `cacheLife("max")` が付いている。terms / privacy / external-transmission-policy はローカル関数 `loadMarkdown` のみ `"use cache"` でページ自体は非キャッシュ | 各 page.tsx |
| F29 | `src/lib/better-auth/auth.ts` は `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` 未定義で import 時に throw する（fail-fast）。テストは `vi.mock("@/lib/better-auth/auth")` でモック化する方針が Issue で確定済み | `src/lib/better-auth/auth.ts` / Issue #480 本文 |
| F30 | Better Auth 用 4 テーブル（`user` / `session` / `account` / `verification`）の Drizzle スキーマとマイグレーションは配置済み。`user.email` は NOT NULL + UNIQUE。スキーマ変更は不要 | `src/lib/better-auth/schema.ts` / `migrations/0000_init_auth_schema.sql` |
| F31 | GitHub OAuth App（本番 / staging / local の 3 つ）は作成済みで、`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` は Vercel（Production / Preview）と `.env.local` に登録済み。`.env.example` への追記のみ残っている | Issue #480 本文（2026-07-12 完了記載） |
| F43 | 現行の `src/proxy.ts` は `/ja` 正規化リダイレクトの 2 箇所で、リクエストヘッダー全体の複製（`cookie` を含む `requestHeaders`）を `NextResponse.redirect()` の**応答ヘッダー**として渡している。rewrite / next の分岐は正しく `{ request: { headers } }`（リクエストヘッダーの上書き）を使っており、redirect 分岐だけ応答ヘッダーへの横流しになっている | `src/proxy.ts` 51-52, 72-83 行目 / 計画レビュー Round 4（Cookie 付き `/ja/upload` リクエストの 302 応答に `cookie` ヘッダーが含まれる事を実地確認） |
| F44 | Home の page.tsx（`/`・`/en`）は、`searchParams`（`view`）を await する `HomePageContent` 全体を `<Suspense fallback={null}>` で包んでいる。ページ全体が searchParams の Suspense 境界内にあるため、この境界の内側に SessionHeader を置くと prerender 時に外側の境界で先に suspend し、Home の静的シェルに Header（fallback の未ログイン Header）が含まれなくなる | `src/app/(default)/page.tsx` 46-61 行目 / `src/app/(default)/en/page.tsx` |
| F32 | GitHub の OAuth authorize URL で scope が空の場合、**そのアプリに一度も scope を許可していないユーザーに限り**空 scope（公開情報のみ）の token が発行される。過去に scope を許可した事があるユーザーには**認可画面を表示せず、許可済み scope の集合で自動補完**した token が発行される（GitHub 側の grant は revoke するまで残る）。本アプリの OAuth App は本 Issue で新規作成しアプリ側から scope を一切要求しないため、通常フローで後者は発生しない。発生し得るのは authorize URL を意図的に改変した場合（§8.8 の検証を実施した開発者自身を含む）のみで、その grant は GitHub の Settings → Applications → Authorized OAuth Apps から Revoke する事で解消できる | GitHub Docs「Authorizing OAuth apps」scope パラメータの説明（"If not provided, scope defaults to an empty list for users that have not authorized any scopes for the application. For users who have authorized scopes for the application, ... this step of the flow will automatically complete with the set of scopes the user has authorized for the application"。2026-07-13 取得）+ F5 |

## 3. 設計方針

### 3.1 認証処理は Server Action 方式で統一

- ログイン: `loginAction`（`auth.api.signInSocial()` を呼び、返却された GitHub authorize URL へ `redirect()`）
- ログアウト: `logoutAction`（`auth.api.signOut()` を呼び、言語対応の Home へ `redirect()`）
- `src/lib/better-auth/auth.ts` に `nextCookies` プラグインを追加する。F8/F9 の通り、これが無いと OAuth の state Cookie / セッション Cookie の設定・削除がブラウザに反映されず**ログイン自体が成立しない**
- Server Action は `src/AGENTS.md` の型分離パターンに従い、`src/actions/auth/` 配下に配置する（型は `types/` サブディレクトリ、コンポーネントは型のみに依存し、実体は page.tsx から props で注入）

### 3.2 プライバシー設計: email scope を要求せず、実 email を DB に永続化しない

本設計が保証するのは「email scope を要求しない事」と「実 email を DB に永続化しない事」の 2 点である。better-auth の `getUserInfo` は `/user/emails` を無条件に呼び（scope 無しでは失敗する）、`/user` 応答の公開 email がメモリ上を一時的に通過し得るため、「一切取得しない」はコード上保証できない（F33）。Issue #480 本文のプライバシー設計セクションもこの整理に合わせて更新済みである（2026-07-13。旧文言「実 email を一切取得・保存しない」を「email scope を要求せず、実 email を DB に永続化しない」へ変更し、公開 email がメモリ上を一時的に通過し得る事を許容すると明記）。

- `disableDefaultScope: true` でデフォルトスコープ（`read:user`, `user:email`）を外す（F5）
- `mapProfileToUser` で `user.email` を `gh-<GitHub User ID>@no-email.lgtmeow.invalid` に置換する（F6）。スコープ無しでも公開プロフィールに public email を設定しているユーザーは `profile.email` に実 email が入り得るため、この上書きは必須（これが「DB へ永続化しない」の実体である）
- 変換ロジックは純粋関数 `mapGithubProfileToUser` として `src/features/auth/functions/` に切り出し、テストで匿名化値の格納を担保する
- OAuth の access token は `account.access_token` に保存される。scope が空のため権限は公開情報の読み取り相当だが、平文保存を避けるため `account: { encryptOAuthTokens: true }` を設定して暗号化保存する（F34。スキーマ変更は不要）
- 「email scope を要求しない」を API 経路レベルでも強制する。`/sign-in/social` と `/link-social` は body の `scopes` を受け取り、`disableDefaultScope: true` でもリクエスト由来の scope が authorize URL へ無条件に追記されるため（F37）、(1) 未使用の `/link-social` を `disabledPaths` で無効化し（F38）、(2) `/sign-in/social` への非空 `scopes` を `hooks.before` で拒否し（F40）、(3) `databaseHooks.account` の create / update 直前に `scope` が空である事を検証する。(3) は authorize URL を手元で改変して広い scope を付与するケースへの防御であり、再ログイン時に `updateAccount()` で scope が更新されるため update 側にも必要（F39）。違反検出時は `false` を返すのではなく throw で処理全体を中止する（F39）。判定ロジックは純粋関数 `oauth-scope-policy.ts` に切り出してテストを用意する
- scope 拒否の throw を安全に機能させるため、次の 2 点を併せて設定する。(a) **`drizzleAdapter` に `transaction: true` を設定する。** デフォルト false のままだと、初回 OAuth で user 作成後に `account.create.before` が throw しても user 行がロールバックされず、匿名化 email の UNIQUE 制約により孤立 user が残る（F41）。(b) **throw する `APIError` の body に安定したエラーコード（`code: "OAUTH_SCOPE_NOT_ALLOWED"`）を含める。** 1.6.23 の callback は `e.body.code` が存在する場合のみ APIError を `errorCallbackURL`（言語対応 `/login?error=...`）への redirect に変換し、無ければ HTTP 400 のまま返してしまう（F42。既存アカウント再ログイン時の update 経路で必須）
- 保存される情報: GitHub User ID（`account.accountId`）、GitHub username（`user.name`）、アバター URL（`user.image`）、匿名化 email（`user.email`）、暗号化された access token（`account.access_token`）。実名・実 email は保存しない
- `.invalid` TLD は RFC 6761 で予約済みのため誤送信事故が起きない

### 3.3 セッション取得はリクエスト単位でキャッシュする

`src/lib/better-auth/session.ts` に React の `cache()` でラップした `getCachedSession()` を新設する。1 リクエスト内で Header 表示用とアクセス制御用の 2 回 `getSession` が呼ばれても Turso への問い合わせが 1 回で済む。セッション Cookie を持たない匿名訪問者はそもそも DB 照会が発生しない（F14）。`session.cookieCache` は導入しない（Issue の決定事項）。

### 3.4 Header のセッション連動: 静的シェル + Suspense の穴 + コンポジション

`cacheComponents: true`（F19）の下でページ全体を動的化しないため、次の構成を取る。

```text
src/app/**/page.tsx（Storybook から参照されない、auth.ts に依存してよい層）
  └─ <SessionHeader currentUrlPath language />   ← 新設。内部に Suspense を持つ
       ├─ fallback: <Header isLoggedIn={false} />（静的シェルに含まれる）
       └─ <SessionHeaderContent>（async、getCachedSession() で isLoggedIn を解決し <Header> を描画）
  └─ <XxxPage header={上記ノード} ... />          ← feature ページは header を ReactNode として受け取るだけ
       └─ <PageLayout header={header}>            ← PageLayout は渡された header をそのまま描画
```

- **設計の要点**: `auth.ts` は import 時に環境変数チェックで throw する server-only モジュールのため（F29）、Storybook から到達する import 経路（`PageLayout` や feature コンポーネント）に含めてはならない。`SessionHeader` の合成（instantiate）を `src/app/` 配下の page.tsx に限定することでこの制約を満たす
- `Header` / `HeaderDesktop` / `HeaderMobile` は従来通り `isLoggedIn: boolean` を受け取る "use client" コンポーネントのまま維持する（モバイルの Drawer メニューはクライアント状態のコールバックとログイン状態の両方に依存するため、boolean を渡す構成が唯一 Storybook 互換・デザイン無変更で成立する）。**ログイン済み UI は現行デザインのまま変更しない**
- `PageLayout` の props を `currentUrlPath` / `isLoggedIn` から `header: ReactNode`（必須）に変更する。必須にすることで、対応漏れのページが TypeScript エラーとして検出される
- fallback は未ログイン Header（ログインボタン付き）。ログイン済みユーザーには初回描画の一瞬だけログインボタンが見えてから実体に置き換わるが、静的シェルを維持するための意図した挙動である
- `"use cache"` なページコンポーネント（docs-mcp / docs-github-app）の**内側**に `SessionHeader` は置けない（F21）ため、これらはページコンポーネントから `"use cache"` を外し、キャッシュはデータ読み込み関数側に付け替える（§5 Phase 6-3）
- Home（`/`・`/en`）は `searchParams`（`view`）の Suspense 境界がページ全体を包んでいる（F44）ため、そのまま境界の内側に `SessionHeader` を追加すると Home の静的シェルに Header が含まれなくなる。page.tsx を「ページ骨格（`HomePage` + `SessionHeader`）は境界の外、view に依存する LGTM 画像領域だけを `lgtmImages` スロットとして境界の内」へ再構成する（§5 Phase 6-2 代表例 1）
- Issue の当初案は「Header のユーザー領域のみを async Server Component 化し、"use client" の Header へ slot として渡す」であったが、モバイル Header の Drawer メニューがクライアント状態のコールバックとログイン状態の両方に依存するため、本計画では Header 全体を Suspense で包み boolean を渡す方式へ意図的に設計変更した。経緯は Issue #480 にコメントで記録済み: <https://github.com/nekochans/lgtm-cat-frontend/issues/480#issuecomment-4955939864>

### 3.5 アクセス制御: Server Component のガードコンポーネント

- `RequireLogin`（未ログインなら言語対応 Home へ `redirect()`）・`RequireAnonymous`（ログイン済みなら言語対応 Home へ `redirect()`）・`RequireSessionCookie`（セッション Cookie が無ければ言語対応 Home へ `redirect()`）を `src/features/auth/components/` に新設する
- お気に入り / My Cats は `RequireLogin`、`/login` は `RequireAnonymous`、`/logout` は `RequireSessionCookie` で包む
- **`/logout` に `RequireLogin` を使ってはならない。** `RequireLogin` は `getSession()` で Turso へ照会するため、有効な Cookie を持つユーザーの DB 障害時にガードの時点で例外となり、「DB 障害でも Cookie 削除でログアウトできる」はずの `signOut()`（F13）にも再試行画面にも到達できなくなる。`RequireSessionCookie` は `getSessionCookie`（F36）で Cookie の有無のみを判定し DB へ問い合わせないため、Turso 障害時でもログアウトが成立する。期限切れ等の無効 Cookie では LogoutPage が描画されるが、`signOut` は冪等（Cookie 削除 + best effort の行削除）のため実害はない
- **proxy ではセッション判定を行わない**。`src/proxy.ts` の変更は matcher へのパス追加と、`/ja` 正規化リダイレクトの応答へリクエストヘッダー（`cookie` を含む）を横流ししている既存不具合の修正（F43。§5 Phase 8-2）のみ
- async な Server Component（ガード・SessionHeaderContent）は関数としても呼べるため、`vi.mock` と組み合わせて単体テストする

### 3.6 `/login` ページ: 遷移した瞬間に OAuth を自動開始する通過点

- page.tsx（`RequireAnonymous` 内）でログイン済みなら Home へリダイレクト
- 未ログインなら「GitHubへリダイレクトしています…」表示のクライアントコンポーネント `LoginContent` を描画し、`useEffect` で `loginAction` を自動起動する
- 自動起動には ref ガードを入れる。React StrictMode の開発時二重実行と、`cacheComponents` の Activity 復帰による effect 再実行（F23）の両方への対策
- `?error=` クエリが付いている場合は自動開始を**抑止**し、エラーメッセージと再試行ボタンを表示する（自動開始のままだと「失敗 → /login に戻る → また自動開始」の無限ループになるため）。エラーコードの値は画面に表示せず、言語別の固定メッセージのみを表示する
- `loginAction` は `callbackURL` に言語対応 Home（`/` または `/en`）、`errorCallbackURL` に言語対応 `/login` の**相対パス**を渡す（相対パスは trustedOrigins 検証を常に通過する）
- `errorCallbackURL` が使われるのは state を復元できた後のエラーのみ（F11。**state の期限切れも通常はここに含まれ、言語対応の `/login` へ戻る**）。state を復元できないコールバック失敗（state パラメータ欠落・verification 行の欠落や再利用・schema 不正等）は `onAPIError.errorURL` へ送られるため、auth.ts で `onAPIError: { errorURL: `${betterAuthUrl}/login` }` を設定し、これらも `/login?error=...` の再試行画面へ収束させる。この経路では元の言語情報が失われているため ja 版 `/login` への遷移となる（意図した割り切り。稀な異常系であり、再試行ボタンから再ログインできる）
- メタデータに `robots: { index: false, follow: false }` を設定する

### 3.7 `/logout` ページ: 同じ自動実行パターン

- page.tsx（`RequireSessionCookie` 内）でセッション Cookie が無ければ Home へリダイレクト（DB へは問い合わせない。理由は §3.5）
- Cookie が有れば「ログアウトしています…」表示のクライアントコンポーネント `LogoutContent` を描画し、`useEffect` で `logoutAction` を自動起動する（ref ガード付き）
- Server Component からは Cookie を書き換えられない Next.js の制約があるため page.tsx 内で直接 signOut する実装は不可。GET の Route Handler 方式はプリフェッチで意図せずログアウトする危険があるため採用しない
- この設計により、Header の `/logout` リンクが Next.js の `<Link>` プリフェッチで事前描画されても安全である（`/logout` ページの Server Component 描画には副作用が無く、実際の sign out はクライアントの effect が `logoutAction` を呼んだ時にのみ実行される）。`/login` の自動開始も同じ理由でプリフェッチ安全（effect はプリフェッチでは実行されない）
- `auth.api.signOut()` は DB のセッション行削除を best effort で行い（削除失敗は better-auth 内部で捕捉されログ出力のみ）、Cookie を削除して常に success を返す（F13）。ログアウトの一次保証は **Cookie 削除**であり、DB に残った session 行は `expiresAt` で失効する。したがって「DB 行削除の失敗」でログアウト失敗画面に遷移することはない
- `logoutAction` は try-catch を持たない。成功時は言語対応の Home へ `redirect()` し、想定外の例外（F13 の通り通常は発生しない）はそのまま呼び出し元のクライアントへ伝播させる
- `LogoutContent` は `logoutAction` の rejection をクライアント側で catch し、クライアント状態（`useState`）で言語別の固定エラーメッセージと再試行ボタンを表示する。**成功時の redirect() も Action Promise の `NEXT_REDIRECT` rejection として観測される（F35）ため、catch の先頭で `unstable_rethrow` を呼んで内部エラーを transition へ再送出し、実際の失敗だけをエラー表示に落とす**。URL 遷移やサーバー再描画（ガードの再実行）を伴わないため、障害が継続していてもエラー表示できる。エラー内容の値は画面に表示しない

### 3.8 命名・配置の整理

| 対象 | 配置 | 理由 |
| --- | --- | --- |
| `loginAction` / `logoutAction` + 型 + テスト | `src/actions/auth/` | `src/AGENTS.md` の型分離パターンの例示と同じ配置。login / logout 両ページ（ja/en 計 4 ページ）から共通利用される |
| `mapGithubProfileToUser` + テスト | `src/features/auth/functions/` | 認証機能に閉じたビジネスロジック。`src/lib/` → `src/features/` の依存は許可されている（DDD のインフラ層→ドメイン層） |
| `isScopeRequestForbidden` / `hasNonEmptyAccountScope` + テスト | `src/features/auth/functions/oauth-scope-policy.ts` | scope 固定化の判定ロジック（純粋関数）。auth.ts のフックから利用する |
| `RequireLogin` / `RequireAnonymous` / `RequireSessionCookie` / `LoginPage` / `LoginContent` / `LogoutPage` / `LogoutContent` + stories + テスト | `src/features/auth/components/` | 認証機能に閉じた UI |
| `loginPageTexts` / `logoutPageTexts` + テスト | `src/features/auth/functions/auth-i18n.ts` | 機能内 i18n テキスト（`error-i18n.ts` と同パターン） |
| `getCachedSession` | `src/lib/better-auth/session.ts` | better-auth + next/headers + react に依存するため lib 層 |
| `hasSessionCookie` + テスト | `src/lib/better-auth/session-cookie.ts` | better-auth/cookies + next/headers に依存するため lib 層。auth.ts には依存しない（import 時 throw を持ち込まない） |
| `SessionHeader` | `src/components/session-header.tsx` | 複数ページ共通の Header 表示制御。`src/components/` → `src/lib/` の依存は許可されている。**stories は作らない**（auth.ts に依存するため） |

## 4. 変更ファイル一覧

### 新規（38 ファイル）

| # | パス | 内容 |
| --- | --- | --- |
| N1 | `src/actions/auth/types/login-action.ts` | `LoginAction` 型 |
| N2 | `src/actions/auth/types/logout-action.ts` | `LogoutAction` 型 |
| N3 | `src/actions/auth/login-action.ts` | ログイン Server Action |
| N4 | `src/actions/auth/logout-action.ts` | ログアウト Server Action |
| N5 | `src/actions/auth/__tests__/login-action/login-action.test.ts` | テスト |
| N6 | `src/actions/auth/__tests__/logout-action/logout-action.test.ts` | テスト |
| N7 | `src/features/auth/functions/map-github-profile-to-user.ts` | GitHub プロフィール変換（email 匿名化） |
| N8 | `src/features/auth/functions/auth-i18n.ts` | login / logout ページの i18n テキスト |
| N9 | `src/features/auth/functions/__tests__/map-github-profile-to-user/map-github-profile-to-user.test.ts` | テスト |
| N10 | `src/features/auth/functions/__tests__/auth-i18n/login-page-texts.test.ts` | テスト |
| N11 | `src/features/auth/functions/__tests__/auth-i18n/logout-page-texts.test.ts` | テスト |
| N12 | `src/features/auth/components/require-login.tsx` | ログイン必須ガード |
| N13 | `src/features/auth/components/require-anonymous.tsx` | 未ログイン必須ガード |
| N14 | `src/features/auth/components/__tests__/require-login/require-login.test.tsx` | テスト |
| N15 | `src/features/auth/components/__tests__/require-anonymous/require-anonymous.test.tsx` | テスト |
| N16 | `src/features/auth/components/login-content.tsx` | OAuth 自動開始 + エラー表示（"use client"） |
| N17 | `src/features/auth/components/login-page.tsx` | /login のページコンポーネント |
| N18 | `src/features/auth/components/login-page.stories.tsx` | stories（モック action 注入） |
| N19 | `src/features/auth/components/logout-content.tsx` | ログアウト自動実行（"use client"） |
| N20 | `src/features/auth/components/logout-page.tsx` | /logout のページコンポーネント |
| N21 | `src/features/auth/components/logout-page.stories.tsx` | stories（モック action 注入） |
| N22 | `src/lib/better-auth/session.ts` | `getCachedSession`（React cache） |
| N29 | `src/features/auth/components/__tests__/login-content/login-content.test.tsx` | `LoginContent` のテスト（redirect rejection の区別 + `?error=` 時の自動開始抑止） |
| N30 | `src/features/auth/components/__tests__/logout-content/logout-content.test.tsx` | `LogoutContent` のテスト（redirect rejection の区別） |
| N31 | `src/features/auth/functions/oauth-scope-policy.ts` | scope 固定化の判定ロジック（純粋関数） |
| N32 | `src/features/auth/functions/__tests__/oauth-scope-policy/is-scope-request-forbidden.test.ts` | テスト |
| N33 | `src/features/auth/functions/__tests__/oauth-scope-policy/has-non-empty-account-scope.test.ts` | テスト |
| N34 | `src/lib/better-auth/session-cookie.ts` | `hasSessionCookie`（Cookie 有無のみの判定、DB 非依存） |
| N35 | `src/lib/better-auth/__tests__/session-cookie/has-session-cookie.test.ts` | テスト |
| N36 | `src/features/auth/components/require-session-cookie.tsx` | `/logout` 専用の Cookie ベースガード |
| N37 | `src/features/auth/components/__tests__/require-session-cookie/require-session-cookie.test.tsx` | テスト |
| N38 | `src/__tests__/proxy/proxy.test.ts` | proxy のテスト（リダイレクト応答に `cookie` / `authorization` が含まれない事） |

さらに App Router のファイル:

| # | パス | 内容 |
| --- | --- | --- |
| N23 | `src/app/(default)/api/auth/[...all]/route.ts` | Better Auth のエンドポイント |
| N24 | `src/app/(default)/login/page.tsx` | ja ログインページ |
| N25 | `src/app/(default)/en/login/page.tsx` | en ログインページ |
| N26 | `src/app/(default)/logout/page.tsx` | ja ログアウトページ |
| N27 | `src/app/(default)/en/logout/page.tsx` | en ログアウトページ |
| N28 | `src/components/session-header.tsx` | セッション連動 Header（Suspense 内蔵） |

### 変更（既存ファイル）

| # | パス | 内容 |
| --- | --- | --- |
| M1 | `package.json` / `package-lock.json` | `better-auth` / `@better-auth/drizzle-adapter` を `1.6.23` へ（lock ファイルは `npm install` が自動更新するため必ず一緒にコミットする） |
| M2 | `.env.example` | `GITHUB_CLIENT_ID=` / `GITHUB_CLIENT_SECRET=` を追記 |
| M3 | `src/types/url.ts` | `AppPathName` に `logout` 追加 |
| M4 | `src/constants/url.ts` | `appPathList` / `i18nUrlList` に `logout` 追加 |
| M5 | `src/functions/meta-tag.ts` | `logoutPageTitle` + `metaTagList` に `logout` 追加 |
| M6 | `src/lib/config/app-base-url.ts` | `appUrlList` に `logout` 追加 |
| M7 | `src/functions/__tests__/url/create-include-language-app-path.test.ts` | `login` / `logout` のケース追加 |
| M8 | `src/functions/__tests__/meta-tag/meta-tag-list.test.ts` | `logout` タイトル検証追加 |
| M9 | `src/lib/better-auth/auth.ts` | GitHub プロバイダ + `nextCookies` + `account.encryptOAuthTokens` + `onAPIError.errorURL` + `disabledPaths` + `hooks.before`（scopes 拒否）+ `databaseHooks.account`（scope 検証、`code` 付き throw）+ `drizzleAdapter` の `transaction: true` 追加 |
| M10 | `src/components/page-layout.tsx` | `header: ReactNode` 必須 props 化 |
| M11 | `src/components/header.tsx` | `hideLoginButton` 撤去 |
| M12 | `src/components/header-desktop.tsx` | `hideLoginButton` 撤去 + `/logout` を関数化 |
| M13 | `src/components/header-mobile.tsx` | `hideLoginButton` 撤去 + `/logout` を関数化 + TODO 削除 |
| M14 | `src/components/header.stories.tsx` | `HiddenLoginButtonInJapanese` 削除 |
| M15 | `src/components/header-desktop.stories.tsx` | `HiddenLoginButtonDesktopInJapanese` 削除 |
| M16 | `src/components/header-mobile.stories.tsx` | `HiddenLoginButtonMobileInJapanese` 削除 |
| M17 | `src/features/errors/components/error-layout.tsx` | `hideLoginButton` 撤去（TODO 削除） |
| M18〜M27 | feature ページ 10 ファイル（F27 の一覧） | `currentUrlPath` / `isLoggedIn` を `header: ReactNode` に置換 |
| M28〜M47 | App Router page.tsx 20 ファイル（ja/en × home, upload, terms, privacy, external-transmission-policy, docs×3, favorites, my-cats） | `header` 注入。favorites / my-cats は `RequireLogin` + `Suspense` も追加。docs-mcp / docs-github-app は `"use cache"` の付け替えも実施 |
| M48 | `src/features/main/components/home-page.stories.tsx` | args を header 注入に変更 + `view` を削除（`lgtmImages` のモック注入は既存のまま維持） |
| M49 | `src/features/upload/components/upload-page.stories.tsx` | 同上 |
| M50 | `src/features/upload/components/upload-form.stories.tsx` | decorator の PageLayout を header 注入に変更 |
| M51〜M53 | docs 3 ページの stories | 同上 |
| M54 | `src/features/favorites/components/favorites-page.stories.tsx` | header 注入（ログイン済み Header） |
| M55 | `src/features/my-cats/components/my-cats-page.stories.tsx` | 同上 |
| M56 | `src/proxy.ts` | matcher に 12 パス追加 + `/ja` 正規化リダイレクトの応答ヘッダー横流し修正（F43） |

## 5. 実装手順

依存の向きに従い、以下の順で実装する。**Phase 5 と Phase 6 は完了するまで型エラーが残る**（`PageLayout` の props 変更が全ページに波及するため）。Phase 単位でテストを回すこと。

### Phase 1: パッケージ更新と環境変数

#### 1-1. better-auth を 1.6.23 へ更新

```bash
npm install --save-exact better-auth@1.6.23 @better-auth/drizzle-adapter@1.6.23
```

実行後、以下を確認する。

1. `package.json` の両エントリが `"1.6.23"`（`^` 無し）になっている事
2. `package-lock.json` 内の `better-auth` / `@better-auth/drizzle-adapter` も `1.6.23` に更新されている事（`npm ls better-auth @better-auth/drizzle-adapter` で確認）。lock ファイルは必ず `package.json` と一緒にコミットする（漏れると `npm ci` が失敗する）
3. `npm run test` が全パスする事
4. §2.2 の根拠となる実装が更新後も変わっていない事（本計画は 1.6.9 のソースで検証したため、念のため再確認する）:

```bash
# デフォルトスコープと mapProfileToUser のスプレッド位置（F5 / F6）
grep -n "disableDefaultScope\|userMap" node_modules/@better-auth/core/dist/social-providers/github.mjs
# state Cookie 検証のデフォルト（F8）
grep -n "storeStateStrategy\|skipStateCookieCheck" node_modules/better-auth/dist/context/create-context.mjs
# リクエスト由来 scopes の受け付け（F37）
grep -n "scopes" node_modules/better-auth/dist/api/routes/sign-in.mjs
# 再ログイン時の updateAccount による scope 更新（F39）
grep -n "updateAccount\|scope" node_modules/better-auth/dist/api/routes/callback.mjs
# getSessionCookie の Cookie 名解決（F36）
grep -n "getSessionCookie" node_modules/better-auth/dist/cookies/index.mjs
# drizzle adapter の transaction オプション（F41）
grep -n "config.transaction" node_modules/@better-auth/drizzle-adapter/dist/index.mjs
# callback の APIError → redirect 変換条件（F42）
grep -n "body?.code\|body.code" node_modules/better-auth/dist/api/routes/callback.mjs
```

出力が §2.2 の記載（デフォルトスコープの三項演算子、`...userMap` が末尾スプレッド、`storeStateStrategy: options.account?.storeStateStrategy || (isStateful ? "database" : "cookie")`。`isStateful` は `hasServerSessionStore(options)` = `!!options.database || !!options.secondaryStorage` であり、本構成は database 指定のため結果は `"database"`）と食い違う場合は実装を進めず、差分を調査して本計画を修正する事。

#### 1-2. `.env.example` に追記

`BETTER_AUTH_URL=http://localhost:2222` の行の直後に以下の 2 行を追記する。

```text
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

> 補足: エージェント環境によっては `.env.*` の読み取りがポリシーで拒否される。その場合は `git show HEAD:.env.example` で現状を確認し、`printf '\nGITHUB_CLIENT_ID=\nGITHUB_CLIENT_SECRET=\n' >> .env.example` のように読み取りを伴わない追記を行う。追記後は `git diff .env.example` で差分を確認する。

`.env.local` には登録済み（F31）のため作業不要。

### Phase 2: `logout` の URL 定数・型・メタタグ

#### 2-1. `src/types/url.ts`

`AppPathName` の `"login"` の直後に `"logout"` を追加する。

```typescript
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
```

#### 2-2. `src/constants/url.ts`

`appPathList` の `login` の直後に追加:

```typescript
  login: "/login",
  logout: "/logout",
```

`i18nUrlList` の `login` エントリの直後に追加:

```typescript
  logout: {
    ja: `${appPathList.logout}/`,
    en: `/en${appPathList.logout}/`,
  },
```

#### 2-3. `src/functions/meta-tag.ts`

`loginPageTitle` の直後に追加:

```typescript
function logoutPageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} ログアウト`;
    case "en":
      return `${defaultTitle} Logout`;
    default:
      return assertNever(language);
  }
}
```

`metaTagList` の戻り値オブジェクトの `login` エントリの直後に追加:

```typescript
    logout: {
      title: logoutPageTitle(language),
      ogpImgUrl,
      ogpTargetUrl: createI18nUrlFromBase(appBaseUrl, "logout", language),
      appName,
    },
```

> `MetaTagList` は `AppPathName` の Mapped Type のため、2-1 の追加によりこのエントリが必須になる。追加しないと型エラーになる（意図した安全装置）。

#### 2-4. `src/lib/config/app-base-url.ts`

`appUrlList` の `login` の直後に追加:

```typescript
  logout: `${appBaseUrl()}${appPathList.logout}` as const,
```

#### 2-5. テスト更新

`src/functions/__tests__/url/create-include-language-app-path.test.ts` のテーブルに 4 行追加する（`login` は既存テーブルに無いためこの機会に追加する）。`${"my-cats"}` の行の後に:

```typescript
    ${"login"}                        | ${"ja"}  | ${"/login"}
    ${"login"}                        | ${"en"}  | ${"/en/login"}
    ${"logout"}                       | ${"ja"}  | ${"/logout"}
    ${"logout"}                       | ${"en"}  | ${"/en/logout"}
```

`src/functions/__tests__/meta-tag/meta-tag-list.test.ts` の `PageTitleTestTable` に `readonly expectedLogoutTitle: string;` を追加し、`it.each` テーブルに `expectedLogoutTitle` 列（ja: `${"LGTMeow ログアウト"}`、en: `${"LGTMeow Logout"}`）を `expectedLoginTitle` の隣に追加、分割代入とアサーションも追加する:

```typescript
      expect(result.logout.title).toBe(expectedLogoutTitle);
```

ここで `npm run test` を実行し全パスを確認する。

### Phase 3: 認証基盤（変換関数 / auth.ts / session.ts / Route Handler）

#### 3-1. `src/features/auth/functions/map-github-profile-to-user.ts`（新規）

```typescript
/**
 * GitHub OAuth プロフィールから Better Auth の user レコードへ保存する値への変換。
 *
 * プライバシー設計（Issue #480）:
 * - 実 email は DB に永続化しない。user.email は NOT NULL + UNIQUE 制約があるため、
 *   GitHub User ID から導出した匿名化メールアドレスで埋める。
 * - `.invalid` TLD は RFC 6761 で予約済みであり、どの SMTP も配送できない。
 * - name には GitHub username（公開情報）、image にはアバター URL（公開情報）を保存する。
 *   実名（profile.name）は保存しない。
 *
 * 注意: better-auth の GithubProfile 型は id を string と宣言しているが、
 * GitHub API の実レスポンスでは数値が入る。テンプレートリテラルで文字列化するため
 * どちらでも同じ結果になる。
 */
interface GithubProfileForMapping {
  readonly avatar_url: string;
  readonly id: string;
  readonly login: string;
}

interface MappedGithubUser {
  readonly email: string;
  readonly image: string;
  readonly name: string;
}

export function mapGithubProfileToUser(
  profile: GithubProfileForMapping
): MappedGithubUser {
  return {
    email: `gh-${profile.id}@no-email.lgtmeow.invalid`,
    name: profile.login,
    image: profile.avatar_url,
  };
}
```

> `avatar_url` は外部 API（GitHub）レスポンスの境界層の型のため snake_case のままでよい（`docs/project-coding-guidelines.md` の「外部APIとの境界層で変換」に合致）。better-auth の `GithubProfile` はこの構造的部分型に代入可能であることを確認済み（F7）。

#### 3-1b. `src/features/auth/functions/oauth-scope-policy.ts`（新規）

```typescript
/**
 * OAuth scope の固定化ポリシー（Issue #480 プライバシー設計）。
 *
 * better-auth の /sign-in/social と /link-social は body の scopes を
 * disableDefaultScope の設定に関わらず authorize URL へ無条件に追記するため（F37）、
 * 追加 scope の要求をアプリケーション側で拒否する。auth.ts の hooks.before /
 * databaseHooks から利用する。
 */
const scopeRestrictedPaths: readonly string[] = [
  "/sign-in/social",
  "/link-social",
];

/**
 * 追加 scope を要求するリクエストかどうかを判定する。
 * /link-social は disabledPaths で無効化済みだが、多層防御として判定対象に含める。
 */
export function isScopeRequestForbidden(
  path: string,
  requestBody: unknown
): boolean {
  if (!scopeRestrictedPaths.includes(path)) {
    return false;
  }

  if (typeof requestBody !== "object" || requestBody == null) {
    return false;
  }

  const { scopes } = requestBody as { readonly scopes?: unknown };

  return Array.isArray(scopes) && scopes.length > 0;
}

/**
 * account.scope が空でない（= 何らかの OAuth scope が付与された token を
 * 保存しようとしている）事を判定する。GitHub は scope 未要求時の token 応答で
 * 空文字を返すため、null / undefined / 空白のみの文字列は「空」とみなす。
 */
export function hasNonEmptyAccountScope(
  scope: string | null | undefined
): boolean {
  return typeof scope === "string" && scope.trim() !== "";
}
```

#### 3-2. `src/lib/better-auth/auth.ts`（変更・全文）

```typescript
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
const rejectNonEmptyAccountScope = (
  scope: string | null | undefined
): void => {
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
```

> `src/lib/` → `src/features/` の依存は `src/AGENTS.md` で明示的に許可されている。

#### 3-3. `src/lib/better-auth/session.ts`（新規）

```typescript
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

/**
 * リクエスト単位でキャッシュされるセッション取得関数。
 *
 * 同一リクエスト内で SessionHeader（Header 表示切替）と RequireLogin（アクセス制御）の
 * 双方から呼ばれても、Turso への問い合わせは 1 回に抑えられる。
 * セッション Cookie を持たない匿名訪問者は DB 照会なしで null が返る。
 */
export const getCachedSession = cache(async () => {
  const requestHeaders = await headers();
  return await auth.api.getSession({ headers: requestHeaders });
});
```

#### 3-3b. `src/lib/better-auth/session-cookie.ts`（新規）

```typescript
import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";

/**
 * セッション Cookie の有無のみを判定する（DB への問い合わせ・復号は行わない）。
 *
 * /logout のガード（RequireSessionCookie）専用。getSessionCookie は Cookie ヘッダーから
 * better-auth.session_token（本番の __Secure- 接頭辞付きを含む）を探すだけなので（F36）、
 * Turso 障害時でも失敗しない。auth.ts に依存しないため import 時の環境変数チェックによる
 * throw も持ち込まない。
 *
 * 注意: Cookie の存在確認のみであり、セッションの有効性（期限・失効）は検証しない。
 * アクセス制御用途（favorites / my-cats の RequireLogin）には使用してはならない。
 */
export const hasSessionCookie = async (): Promise<boolean> => {
  const requestHeaders = await headers();
  return getSessionCookie(requestHeaders) != null;
};
```

> 本プロジェクトは `advanced.cookiePrefix` を設定しないため、`getSessionCookie` のデフォルト（prefix `better-auth`、cookie 名 `session_token`）がそのまま一致する。

#### 3-4. `src/app/(default)/api/auth/[...all]/route.ts`（新規）

```typescript
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/better-auth/auth";

export const { GET, POST } = toNextJsHandler(auth);
```

> パス `/api/auth/[...all]` は Better Auth のデフォルト規約。GitHub OAuth App の callback URL（`<origin>/api/auth/callback/github`）はこの規約前提で登録済み（F31）。`src/proxy.ts` の matcher には**追加しない**（OAuth コールバックに余計な処理を挟まないため）。

#### 3-5. テスト（§6.1 / §6.7 参照）を作成し `npm run test` で全パスを確認

### Phase 4: Server Action（login / logout）

#### 4-1. `src/actions/auth/types/login-action.ts`（新規）

```typescript
import type { Language } from "@/types/language";

/**
 * GitHub OAuth フローを開始する Server Action の型。
 *
 * 成功時は GitHub の authorize URL へ、失敗時は `/login?error=signin_failed` へ
 * redirect() するため、正常終了で resolve することはない（redirect は内部で throw する）。
 */
export type LoginAction = (language: Language) => Promise<void>;
```

#### 4-2. `src/actions/auth/types/logout-action.ts`（新規）

```typescript
import type { Language } from "@/types/language";

/**
 * ログアウトを実行する Server Action の型。
 *
 * 成功時は言語対応の Home へ redirect() する（正常終了で resolve することはない）。
 * 想定外の失敗時は例外がそのまま呼び出し元（クライアント）へ伝播する。
 */
export type LogoutAction = (language: Language) => Promise<void>;
```

#### 4-3. `src/actions/auth/login-action.ts`（新規）

```typescript
"use server";

import { redirect } from "next/navigation";
import type { LoginAction } from "@/actions/auth/types/login-action";
import { isLanguage } from "@/functions/language";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { auth } from "@/lib/better-auth/auth";
import type { Language } from "@/types/language";

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
  language: Language
): Promise<TryStartGithubLoginResult> => {
  try {
    const authorizationResponse = await auth.api.signInSocial({
      body: {
        provider: "github",
        // 相対パスは better-auth の trustedOrigins 検証を常に通過する
        callbackURL: createIncludeLanguageAppPath("home", language),
        errorCallbackURL: createIncludeLanguageAppPath("login", language),
      },
    });

    return { githubAuthorizationUrl: authorizationResponse.url };
  } catch {
    return {};
  }
};

export const loginAction: LoginAction = async (
  language: Language
): Promise<void> => {
  // Server Action は HTTP 経由で任意の値を送り込めるため、実行時にも言語を検証する
  const safeLanguage = isLanguage(language) ? language : "ja";
  const { githubAuthorizationUrl } = await tryStartGithubLogin(safeLanguage);

  if (!githubAuthorizationUrl) {
    redirect(
      `${createIncludeLanguageAppPath("login", safeLanguage)}?error=signin_failed`
    );
  }

  redirect(githubAuthorizationUrl);
};
```

#### 4-4. `src/actions/auth/logout-action.ts`（新規）

```typescript
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { LogoutAction } from "@/actions/auth/types/logout-action";
import { isLanguage } from "@/functions/language";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { auth } from "@/lib/better-auth/auth";
import type { Language } from "@/types/language";

/**
 * auth.api.signOut はセッション行の削除（best effort。削除失敗は better-auth 内部で
 * 捕捉されログ出力のみ）とセッション Cookie の削除を行い、常に success を返す（F13）。
 * したがってここで throw が起きるのは想定外の異常時のみ。その場合は catch せず
 * 呼び出し元（LogoutContent）へ伝播させ、クライアント側でエラー表示する。
 */
export const logoutAction: LogoutAction = async (
  language: Language
): Promise<void> => {
  const safeLanguage = isLanguage(language) ? language : "ja";
  const requestHeaders = await headers();

  await auth.api.signOut({ headers: requestHeaders });

  redirect(createIncludeLanguageAppPath("home", safeLanguage));
};
```

#### 4-5. テスト（§6.2 参照）を作成し `npm run test` で全パスを確認

### Phase 5: Header / PageLayout の再構成

> この Phase の途中は feature ページ側が旧 props のままなので型エラーになる。Phase 6 まで連続して実施する。

#### 5-1. `src/components/page-layout.tsx`（変更・全文）

```typescript
import type { ReactNode } from "react";
import type { Language } from "@/types/language";
import { Footer } from "./footer";

interface Props {
  readonly children: ReactNode;
  /**
   * Header 領域のスロット。
   * - 通常ページ: page.tsx から <SessionHeader> を注入する（セッション状態に応じて表示が切り替わる）
   * - /login, /logout: セッション状態が確定しているため静的な <Header> を注入する
   * - Storybook: <Header isLoggedIn={...}> を直接注入する
   * PageLayout 自身が Header を組み立てない理由: セッション取得は auth.ts（import 時に
   * 環境変数検証で throw する server-only モジュール）に依存し、Storybook から到達する
   * import 経路に含められないため。
   */
  readonly header: ReactNode;
  readonly language: Language;
  readonly mainClassName?: string;
}

const defaultMainClassName =
  "relative flex w-full flex-1 flex-col items-center px-4 py-8";

/**
 * アプリケーション共通のページレイアウトコンポーネント
 * Header、main、Footerを含む基本構造を提供
 */
export function PageLayout({
  children,
  header,
  language,
  mainClassName = defaultMainClassName,
}: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {header}
      <main className={mainClassName}>{children}</main>
      <Footer language={language} />
    </div>
  );
}
```

#### 5-2. `src/components/session-header.tsx`（新規）

```typescript
import { type JSX, Suspense } from "react";
import { Header } from "@/components/header";
import { getCachedSession } from "@/lib/better-auth/session";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
}

async function SessionHeaderContent({
  currentUrlPath,
  language,
}: Props): Promise<JSX.Element> {
  const session = await getCachedSession();

  return (
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={session != null}
      language={language}
    />
  );
}

/**
 * セッション状態に応じて Header の表示（ログインボタン / ログイン済みメニュー）を
 * 切り替える Server Component。
 *
 * cacheComponents 有効時、headers() へのアクセスは Suspense 境界内で行う必要があるため
 * Suspense を内蔵している。fallback の未ログイン Header が静的シェルに含まれ、
 * 実際のセッション状態はリクエスト時に streaming で差し替わる。
 *
 * 注意:
 * - このファイルは import 時に環境変数検証で throw する auth.ts に依存する。
 *   Storybook から到達するモジュール（src/components/ の他コンポーネントや
 *   src/features/ 配下）から import してはならない。使用箇所は src/app/ 配下の
 *   page.tsx に限定する。stories も作成しない。
 * - "use cache" が付いたページコンポーネントの内側でこのコンポーネントを
 *   組み立ててはならない（headers() がキャッシュスコープ内で呼ばれてエラーになる）。
 */
export function SessionHeader(props: Props): JSX.Element {
  return (
    <Suspense
      fallback={
        <Header
          currentUrlPath={props.currentUrlPath}
          isLoggedIn={false}
          language={props.language}
        />
      }
    >
      <SessionHeaderContent {...props} />
    </Suspense>
  );
}
```

#### 5-3. `src/components/header.tsx`（変更・全文）

`hideLoginButton` と TODO コメントを撤去する。

```typescript
"use client";

import type { JSX } from "react";
import { HeaderDesktop } from "@/components/header-desktop";
import { HeaderMobile } from "@/components/header-mobile";
import type { Language } from "@/types/language";
import type { IncludeLanguageAppPath } from "@/types/url";

interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
  readonly language: Language;
}

export function Header({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
  return (
    <>
      {/* モバイル: md未満で表示 */}
      <div className="md:hidden">
        <HeaderMobile
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
      {/* デスクトップ: md以上で表示 */}
      <div className="hidden md:block">
        <HeaderDesktop
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
    </>
  );
}
```

#### 5-4. `src/components/header-desktop.tsx`（変更・4 箇所）

1. `Props` から `hideLoginButton` と直上の TODO コメントを削除:

```typescript
interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
  readonly language: Language;
}
```

2. 関数の分割代入から `hideLoginButton` を削除:

```typescript
export function HeaderDesktop({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
```

3. ログアウトの `Dropdown.Item` の `href` を関数化:

```typescript
                    <Dropdown.Item
                      className="data-[hovered=true]:!bg-orange-300 !min-h-0 !gap-0 !rounded-lg !px-3 !py-2 font-bold text-background text-sm"
                      href={createIncludeLanguageAppPath("logout", language)}
                      id="logout"
                      textValue={logoutText(language)}
                    >
                      {logoutText(language)}
                    </Dropdown.Item>
```

4. 未ログイン側の分岐を無条件の `LoginButton` 表示に変更（TODO コメントも削除）:

```typescript
            ) : (
              <LoginButton language={language} />
            )}
```

#### 5-5. `src/components/header-mobile.tsx`（変更・5 箇所）

1. `Props` から `hideLoginButton` と TODO コメントを削除（5-4 と同じ形）。
2. `UnloggedInMenuProps` から `hideLoginButton` と TODO コメントを削除。
3. `UnloggedInMenu` のログインリンクを無条件表示に変更（`{!hideLoginButton && (...)}` の条件と TODO コメントを外し、`Link` を直接置く）。分割代入からも `hideLoginButton` を削除。
4. `LoggedInMenu` のログアウトリンクを関数化し、TODO コメントを削除:

```typescript
      <Link
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-6 py-2 font-bold text-text-br text-xl"
        href={createIncludeLanguageAppPath("logout", language)}
        onClick={onCloseMenus}
      >
        {logoutText(language)}
      </Link>
```

5. `HeaderMobile` の分割代入と `UnloggedInMenu` への props 受け渡しから `hideLoginButton` を削除。

#### 5-6. `src/features/errors/components/error-layout.tsx`（変更）

`Header` から `hideLoginButton={true}` と TODO コメントを削除する（`isLoggedIn={false}` は維持）。エラー系ページ・メンテナンスページの Header は静的な未ログイン表示のままとする（error.tsx は "use client" でありセッション取得不可。ログインボタンは表示されるようになるが、/login が実装されるため正しい導線である）。なお「エラー系・メンテナンスページではログイン済みユーザーにも未ログイン Header が表示される」挙動は、計画レビューで合意済みの意図した制限である（not-found / maintenance をセッション連動させる対応は本 PR のスコープ外とする）。

```typescript
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
```

#### 5-7. Header 系 stories の更新

- `src/components/header.stories.tsx`: `HiddenLoginButtonInJapanese` Story と直上の TODO コメントを削除
- `src/components/header-desktop.stories.tsx`: `HiddenLoginButtonDesktopInJapanese` を削除
- `src/components/header-mobile.stories.tsx`: `HiddenLoginButtonMobileInJapanese` を削除

既存の `HeaderInJapanese`（未ログイン）/ `LoggedInHeaderInJapanese`（ログイン済み）等はそのまま残り、「Storybook 上でログイン済み・未ログイン両方の状態が表示できる事」の Done を満たす。

### Phase 6: 既存ページへの header スロット適用

#### 6-1. feature ページコンポーネント 10 ファイルの共通変更

以下 10 ファイルに同一パターンの変更を適用する。

| ファイル | 現在の props |
| --- | --- |
| `src/features/main/components/home-page.tsx` | `currentUrlPath`, `language`, `lgtmImages?`, `view` |
| `src/features/upload/components/upload-page.tsx` | `currentUrlPath`, `language`, （UploadForm props のスプレッド） |
| `src/features/terms/components/terms-page.tsx` | `currentUrlPath`, `language`, `markdownContent` |
| `src/features/privacy/components/privacy-page.tsx` | 同上 |
| `src/features/external-transmission-policy/components/external-transmission-policy-page.tsx` | 同上 |
| `src/features/docs/components/docs-how-to-use-page.tsx` | `currentUrlPath`, `language` |
| `src/features/docs/components/docs-mcp-page.tsx` | `currentUrlPath`, `externalCodes`, `language` |
| `src/features/docs/components/docs-github-app-page.tsx` | `currentUrlPath`, `language` |
| `src/features/favorites/components/favorites-page.tsx` | `language`（currentUrlPath は内部生成） |
| `src/features/my-cats/components/my-cats-page.tsx` | 同上 |

変更内容（全ファイル共通）:

1. `Props` から `readonly currentUrlPath: IncludeLanguageAppPath;` を削除し、`readonly header: ReactNode;` を追加する。`IncludeLanguageAppPath` の import が不要になったら削除し、`import type { ReactNode } from "react";` を追加する（既に `JSX` を import している場合は `import type { JSX, ReactNode } from "react";` にまとめる）
2. `PageLayout` への `currentUrlPath={...}` と `isLoggedIn={false}` を削除し、`header={header}` を渡す
3. favorites / my-cats は内部の `createIncludeLanguageAppPath(...)` 呼び出しと import も削除する
4. home-page.tsx はさらに `view` prop を廃止し、`lgtmImages` を必須の `ReactNode` に変更する（searchParams への依存を page.tsx 側の Suspense スロットに閉じ込め、Header を含むページ骨格を searchParams の Suspense 境界の外へ出すため。F44。変更後全文は下記）

代表例として `src/features/favorites/components/favorites-page.tsx` の変更後全文:

```typescript
import type { ReactNode } from "react";
import { ComingSoonContent } from "@/components/coming-soon-content";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/types/language";

interface Props {
  readonly header: ReactNode;
  readonly language: Language;
}

export function FavoritesPage({ header, language }: Props) {
  return (
    <PageLayout
      header={header}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center"
    >
      <ComingSoonContent language={language} />
    </PageLayout>
  );
}
```

`src/features/main/components/home-page.tsx` の変更後全文:

```typescript
import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { Language } from "@/types/language";

interface Props {
  readonly header: ReactNode;
  readonly language: Language;
  /**
   * LGTM画像表示領域のReactNode。
   * page.tsx 側で searchParams の view に応じたサーバーコンポーネントを
   * Suspense 付きで注入する（Storybook ではモックを注入する）。
   * searchParams への依存をこのスロットに閉じ込める事で、Header を含む
   * ページ骨格が searchParams の Suspense 境界の外に出て静的シェルに含まれる（F44）。
   */
  readonly lgtmImages: ReactNode;
}

export const HomePage = ({ header, language, lgtmImages }: Props) => {
  return (
    <PageLayout
      header={header}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1300px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
        <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
          <ServiceDescription language={language} />
          <HomeActionButtons language={language} />
        </div>
        {lgtmImages}
      </div>
    </PageLayout>
  );
};
```

> `view` prop と `RandomLgtmImages` / `LatestLgtmImages` の import は page.tsx 側へ移す（下記 §6-2 代表例 1）。

`src/features/upload/components/upload-page.tsx` の変更後全文（props スプレッドがある特殊ケース）:

```typescript
import type { ComponentProps, ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import { UploadForm } from "@/features/upload/components/upload-form";
import type { Language } from "@/types/language";

/**
 * UploadForm の Props から language を除外した型
 * UploadPage から UploadForm へ props を伝播するために使用
 */
type UploadFormProps = Omit<ComponentProps<typeof UploadForm>, "language">;

interface Props extends UploadFormProps {
  readonly header: ReactNode;
  readonly language: Language;
}

export function UploadPage(props: Props) {
  const { language, header, ...uploadFormProps } = props;

  return (
    <PageLayout header={header} language={language}>
      {/* モーダル風の背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" />
      {/* フォームコンテナ (オーバーレイの上に表示) */}
      <div className="relative z-10 w-full max-w-[700px]">
        <UploadForm language={language} {...uploadFormProps} />
      </div>
    </PageLayout>
  );
}
```

terms / privacy / external-transmission-policy / docs 3 ページも同じ規則で変更する（`markdownContent` や `externalCodes` 等の既存 props はそのまま）。

#### 6-2. App Router page.tsx 16 ファイル（アクセス制御なしページ）の変更

対象と `SessionHeader` に渡す `currentUrlPath` の一覧:

| ファイル | currentUrlPath |
| --- | --- |
| `src/app/(default)/page.tsx` | `"/"`（リテラル。§6-2 代表例 1 の Suspense 再構成も必要） |
| `src/app/(default)/en/page.tsx` | `"/en"`（リテラル。同上） |
| `src/app/(default)/upload/page.tsx` | `createIncludeLanguageAppPath("upload", language)` |
| `src/app/(default)/en/upload/page.tsx` | 同上 |
| `src/app/(default)/terms/page.tsx` | `createIncludeLanguageAppPath("terms", language)` |
| `src/app/(default)/en/terms/page.tsx` | 同上 |
| `src/app/(default)/privacy/page.tsx` | `createIncludeLanguageAppPath("privacy", language)` |
| `src/app/(default)/en/privacy/page.tsx` | 同上 |
| `src/app/(default)/external-transmission-policy/page.tsx` | `createIncludeLanguageAppPath("external-transmission-policy", language)` |
| `src/app/(default)/en/external-transmission-policy/page.tsx` | 同上 |
| `src/app/(default)/docs/how-to-use/page.tsx` | `createIncludeLanguageAppPath("docs-how-to-use", language)` |
| `src/app/(default)/en/docs/how-to-use/page.tsx` | 同上 |
| `src/app/(default)/docs/mcp/page.tsx` | `createIncludeLanguageAppPath("docs-mcp", language)`（§6-3 の再構成も必要） |
| `src/app/(default)/en/docs/mcp/page.tsx` | 同上 |
| `src/app/(default)/docs/github-app/page.tsx` | `createIncludeLanguageAppPath("docs-github-app", language)`（§6-3 の再構成も必要） |
| `src/app/(default)/en/docs/github-app/page.tsx` | 同上 |

いずれも既存コードが feature コンポーネントへ渡している `currentUrlPath` の値と同一である（値を変えない）。

共通の変更:

1. `import { SessionHeader } from "@/components/session-header";` を追加
2. feature コンポーネントへ渡していた `currentUrlPath={...}` を `header={<SessionHeader currentUrlPath={...} language={language} />}` に変更（`createIncludeLanguageAppPath` の呼び出しはそのまま流用する。home は文字列リテラル `"/"` / `"/en"` のまま）
3. `metadata` は一切変更しない

代表例 1: `src/app/(default)/page.tsx`（home ja）のコンポーネント部分の変更後。Home は `searchParams`（`view`）の Suspense 境界がページ全体を包んでいる（F44）ため、return の差し替えだけでは `SessionHeader` が境界の内側に入り、静的シェルに Header が含まれなくなる。ページ骨格を境界の外へ出し、view に依存する LGTM 画像領域だけを `lgtmImages` スロットとして境界の内側に残す（`HomePageContent` は廃止）:

```typescript
const HomeLgtmImages = async ({
  searchParams,
}: {
  readonly searchParams: Props["searchParams"];
}) => {
  const params = await searchParams;
  const view = params.view ?? "random";

  return view === "random" ? <RandomLgtmImages /> : <LatestLgtmImages />;
};

const Home: NextPage<Props> = ({ searchParams }) => (
  <HomePage
    header={<SessionHeader currentUrlPath="/" language={language} />}
    language={language}
    lgtmImages={
      <Suspense fallback={null}>
        <HomeLgtmImages searchParams={searchParams} />
      </Suspense>
    }
  />
);
```

import には以下を追加する:

```typescript
import { LatestLgtmImages } from "@/features/main/components/latest-lgtm-images";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
```

> 画像領域の fallback は従来のページ全体 fallback と同じ `null`（遅延が画像領域のみに縮小される）。en 版（`src/app/(default)/en/page.tsx`）は `currentUrlPath="/en"` とコンポーネント名のみ異なる同一構造。

代表例 2: `src/app/(default)/terms/page.tsx` のコンポーネント部分のみ変更:

```typescript
const Terms: NextPage = async () => {
  const markdownContent = await loadMarkdown("terms", language);

  return (
    <TermsPage
      header={
        <SessionHeader
          currentUrlPath={createIncludeLanguageAppPath("terms", language)}
          language={language}
        />
      }
      language={language}
      markdownContent={markdownContent}
    />
  );
};
```

> terms / privacy / external-transmission-policy は `"use cache"` が**ローカル関数 `loadMarkdown` のみ**に付いておりページコンポーネント自体は非キャッシュのため、この変更だけでよい（F28）。upload / docs-how-to-use は同期コンポーネントのためそのまま props を差し替える。

#### 6-3. `"use cache"` 付きページ（docs-mcp / docs-github-app、ja/en 計 4 ファイル）の再構成

F21 の通り、ページコンポーネントに `"use cache"` が付いたままだと内側の `SessionHeader` が `headers()` を呼べずエラーになる。キャッシュをデータ読み込み側に付け替える。

`src/app/(default)/docs/mcp/page.tsx` のコンポーネント部分の変更後:

```typescript
async function loadExternalCodes(): Promise<McpExternalCodes> {
  "use cache";
  cacheLife("max");
  return await loadAllMcpExternalCodes();
}

const DocsMcp: NextPage = async () => {
  // 外部コードファイルの読み込み結果のみキャッシュし、ページ自体は
  // SessionHeader（実行時 API 使用）を含むためキャッシュしない
  const externalCodes = await loadExternalCodes();

  return (
    <DocsMcpPage
      externalCodes={externalCodes}
      header={
        <SessionHeader
          currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
          language={language}
        />
      }
      language={language}
    />
  );
};
```

import に `McpExternalCodes` 型を追加する:

```typescript
import {
  loadAllMcpExternalCodes,
  type McpExternalCodes,
} from "@/features/docs/functions/mcp-code-loader";
```

`src/app/(default)/docs/github-app/page.tsx` はデータ読み込みが無いため、`"use cache"` / `cacheLife("max")` を削除して同期コンポーネントにする（`cacheLife` の import も削除）:

```typescript
const DocsGitHubApp: NextPage = () => (
  <DocsGitHubAppPage
    header={
      <SessionHeader
        currentUrlPath={createIncludeLanguageAppPath("docs-github-app", language)}
        language={language}
      />
    }
    language={language}
  />
);
```

en 版 2 ファイルも同じ変更（`language` と canonical のみ異なる）。

#### 6-4. stories の更新（8 ファイル）

`PageLayout` / feature ページの props 変更に追従する。共通パターン: args の `currentUrlPath: "..."` を削除し、以下を追加する。

```typescript
import { Header } from "@/components/header";
```

```typescript
    header: (
      <Header currentUrlPath="/" isLoggedIn={false} language="ja" />
    ),
```

| ファイル | header の値 |
| --- | --- |
| `home-page.stories.tsx`（全 6 Stories） | ja 系: `currentUrlPath="/"`, en 系: `currentUrlPath="/en"`、いずれも `isLoggedIn={false}`。args から `view` を削除する（`lgtmImages` のモック注入は既存のまま維持） |
| `upload-page.stories.tsx`（全 Stories） | ja: `currentUrlPath="/upload"`, en: `currentUrlPath="/en/upload"`、`isLoggedIn={false}` |
| `upload-form.stories.tsx` | decorator 内の `<PageLayout currentUrlPath={currentUrlPath} isLoggedIn={false} language={language}>` を `<PageLayout header={<Header currentUrlPath={currentUrlPath} isLoggedIn={false} language={language} />} language={language}>` に変更し、`import { Header } from "@/components/header";` を追加 |
| `docs-how-to-use-page.stories.tsx` / `docs-mcp-page.stories.tsx` / `docs-github-app-page.stories.tsx` | 各 Story が現在 args に持つ `currentUrlPath` 値をそのまま `Header` に移す。`isLoggedIn={false}` |
| `favorites-page.stories.tsx` | `currentUrlPath="/favorites"`（en は `/en/favorites`）、**`isLoggedIn={true}`**（アクセス制御ページのためログイン済み表示が実態） |
| `my-cats-page.stories.tsx` | `currentUrlPath="/my-cats"`（en は `/en/my-cats`）、**`isLoggedIn={true}`** |

> **Chromatic の視覚差分について**: 本 PR では以下の意図した差分が広範囲に発生する（PR レビュー時に承認する差分）。
>
> 1. `hideLoginButton` 撤去により、未ログイン Header を使う**全ページ・全 Stories でログインボタンが出現**する（PageLayout 系に加え、ErrorLayout を使う error / not-found / maintenance 系 Stories も対象）
> 2. favorites / my-cats の Stories はログイン済み Header 表示に変わる
> 3. `HiddenLoginButton*` 系 3 Stories は削除される

ここまでで `npm run test` と型チェック（`npm run build` でも可）を実行し、エラーが無い事を確認する。

### Phase 7: 認証ガード + /login + /logout + アクセス制御

#### 7-1. `src/features/auth/components/require-login.tsx`（新規）

```typescript
import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { getCachedSession } from "@/lib/better-auth/session";
import type { Language } from "@/types/language";

interface Props {
  readonly children: ReactNode;
  readonly language: Language;
}

/**
 * アクセス制御ページ用のガード。未ログイン時は言語対応の Home へリダイレクトする。
 *
 * 実行時 API（headers 経由のセッション取得）を使うため、利用側は
 * <Suspense> 境界の内側に置くこと（cacheComponents の制約）。
 */
export async function RequireLogin({
  language,
  children,
}: Props): Promise<JSX.Element> {
  const session = await getCachedSession();

  if (session == null) {
    redirect(createIncludeLanguageAppPath("home", language));
  }

  return <>{children}</>;
}
```

#### 7-2. `src/features/auth/components/require-anonymous.tsx`（新規）

```typescript
import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { getCachedSession } from "@/lib/better-auth/session";
import type { Language } from "@/types/language";

interface Props {
  readonly children: ReactNode;
  readonly language: Language;
}

/**
 * /login 用のガード。ログイン済みの場合は言語対応の Home へリダイレクトする。
 *
 * 実行時 API（headers 経由のセッション取得）を使うため、利用側は
 * <Suspense> 境界の内側に置くこと（cacheComponents の制約）。
 */
export async function RequireAnonymous({
  language,
  children,
}: Props): Promise<JSX.Element> {
  const session = await getCachedSession();

  if (session != null) {
    redirect(createIncludeLanguageAppPath("home", language));
  }

  return <>{children}</>;
}
```

#### 7-2b. `src/features/auth/components/require-session-cookie.tsx`（新規）

```typescript
import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { createIncludeLanguageAppPath } from "@/functions/url";
import { hasSessionCookie } from "@/lib/better-auth/session-cookie";
import type { Language } from "@/types/language";

interface Props {
  readonly children: ReactNode;
  readonly language: Language;
}

/**
 * /logout 専用のガード。セッション Cookie の有無のみで判定し、DB へは問い合わせない。
 *
 * RequireLogin（getSession() = Turso 照会）を使うと、DB 障害時にガードの時点で例外となり、
 * Cookie 削除でログアウトできるはずの signOut()（F13）にも再試行画面にも到達できない（§3.5）。
 * 期限切れ等の無効 Cookie では children（LogoutPage）が描画されるが、signOut は冪等のため安全。
 *
 * 実行時 API（headers 経由の Cookie 参照）を使うため、利用側は
 * <Suspense> 境界の内側に置くこと（cacheComponents の制約）。
 */
export async function RequireSessionCookie({
  language,
  children,
}: Props): Promise<JSX.Element> {
  const sessionCookieExists = await hasSessionCookie();

  if (!sessionCookieExists) {
    redirect(createIncludeLanguageAppPath("home", language));
  }

  return <>{children}</>;
}
```

#### 7-3. `src/features/auth/functions/auth-i18n.ts`（新規）

```typescript
import type { Language } from "@/types/language";
import { assertNever } from "@/utils/assert-never";

interface LoginPageTexts {
  readonly failedMessage: string;
  readonly redirectingMessage: string;
  readonly retryButtonText: string;
}

export function loginPageTexts(language: Language): LoginPageTexts {
  switch (language) {
    case "ja":
      return {
        redirectingMessage: "GitHubへリダイレクトしています…",
        failedMessage:
          "ログインに失敗しました。時間をおいて再度お試しください。",
        retryButtonText: "再試行",
      };
    case "en":
      return {
        redirectingMessage: "Redirecting to GitHub…",
        failedMessage: "Login failed. Please try again later.",
        retryButtonText: "Retry",
      };
    default:
      return assertNever(language);
  }
}

interface LogoutPageTexts {
  readonly failedMessage: string;
  readonly loggingOutMessage: string;
  readonly retryButtonText: string;
}

export function logoutPageTexts(language: Language): LogoutPageTexts {
  switch (language) {
    case "ja":
      return {
        loggingOutMessage: "ログアウトしています…",
        failedMessage:
          "ログアウトに失敗しました。時間をおいて再度お試しください。",
        retryButtonText: "再試行",
      };
    case "en":
      return {
        loggingOutMessage: "Signing out…",
        failedMessage: "Sign out failed. Please try again later.",
        retryButtonText: "Retry",
      };
    default:
      return assertNever(language);
  }
}
```

#### 7-4. `src/features/auth/components/login-content.tsx`（新規）

```typescript
"use client";

import { unstable_rethrow } from "next/navigation";
import {
  type JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { LoginAction } from "@/actions/auth/types/login-action";
import { IconButton } from "@/components/icon-button";
import { loginPageTexts } from "@/features/auth/functions/auth-i18n";
import type { Language } from "@/types/language";

interface Props {
  readonly hasError: boolean;
  readonly language: Language;
  readonly loginAction: LoginAction;
}

export function LoginContent({
  hasError,
  language,
  loginAction,
}: Props): JSX.Element {
  const texts = loginPageTexts(language);
  // React StrictMode（開発時）の二重実行と、cacheComponents の Activity 復帰による
  // effect 再実行で OAuth フローが多重起動しないようにガードする
  const hasStartedRef = useRef(false);
  // Server Action の呼び出し自体が失敗した場合（ネットワーク断等）のクライアント状態。
  // OAuth コールバック起点の失敗（?error= クエリ）とは別系統。
  const [hasClientError, setHasClientError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 成功時（GitHub への redirect()）も Action Promise は NEXT_REDIRECT で reject される
  // （F35）。unstable_rethrow で内部エラーを transition へ再送出し、Next.js のルーターに
  // 遷移として処理させる。catch に残るのは Server Action 呼び出し自体の失敗のみ。
  const startLogin = useCallback(() => {
    startTransition(async () => {
      try {
        await loginAction(language);
      } catch (error) {
        unstable_rethrow(error);
        setHasClientError(true);
      }
    });
  }, [language, loginAction]);

  useEffect(() => {
    if (hasError || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    startLogin();
  }, [hasError, startLogin]);

  if (hasError || hasClientError) {
    return (
      <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:py-[60px]">
        <p className="text-center text-base text-orange-900 md:text-xl">
          {texts.failedMessage}
        </p>
        <IconButton
          displayText={texts.retryButtonText}
          isLoading={isPending}
          onPress={startLogin}
          showGithubIcon={true}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:py-[60px]">
      <p
        className="text-center text-base text-orange-900 md:text-xl"
        role="status"
      >
        {texts.redirectingMessage}
      </p>
    </div>
  );
}
```

> `?error=` の具体的な値（`access_denied` / `signin_failed` 等）は画面に表示しない。再試行ボタンは連打防止のため `useTransition` の pending 状態で `isLoading` にする。成功時も Action Promise が `NEXT_REDIRECT` で reject される（F35）ため、自動開始・再試行とも transition 内で `unstable_rethrow` を通す（旧設計の `void loginAction(language)` は成功のたびに未処理の rejection を発生させるため不可）。Server Action の呼び出し自体が失敗した場合のみ `hasClientError` でエラー表示に切り替える。

#### 7-5. `src/features/auth/components/login-page.tsx`（新規）

```typescript
import type { JSX } from "react";
import type { LoginAction } from "@/actions/auth/types/login-action";
import { Header } from "@/components/header";
import { PageLayout } from "@/components/page-layout";
import { LoginContent } from "@/features/auth/components/login-content";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly hasError: boolean;
  readonly language: Language;
  readonly loginAction: LoginAction;
}

/**
 * /login はログイン済みユーザーが RequireAnonymous でリダイレクトされた後にのみ
 * 描画されるため、Header は静的な未ログイン表示でよい（SessionHeader は不要）。
 */
export function LoginPage({
  hasError,
  language,
  loginAction,
}: Props): JSX.Element {
  const currentUrlPath = createIncludeLanguageAppPath("login", language);

  return (
    <PageLayout
      header={
        <Header
          currentUrlPath={currentUrlPath}
          isLoggedIn={false}
          language={language}
        />
      }
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center justify-center"
    >
      <LoginContent
        hasError={hasError}
        language={language}
        loginAction={loginAction}
      />
    </PageLayout>
  );
}
```

#### 7-6. `src/features/auth/components/logout-content.tsx`（新規）

```typescript
"use client";

import { unstable_rethrow } from "next/navigation";
import {
  type JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { LogoutAction } from "@/actions/auth/types/logout-action";
import { IconButton } from "@/components/icon-button";
import { logoutPageTexts } from "@/features/auth/functions/auth-i18n";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
  readonly logoutAction: LogoutAction;
}

export function LogoutContent({ language, logoutAction }: Props): JSX.Element {
  const texts = logoutPageTexts(language);
  // React StrictMode（開発時）の二重実行と、cacheComponents の Activity 復帰による
  // effect 再実行でログアウト処理が多重起動しないようにガードする
  const hasStartedRef = useRef(false);
  // 想定外の signOut 失敗はクライアント状態で保持する。URL 遷移を伴わないため、
  // エラー表示にサーバー再描画（ガードの再実行）を経由しない（§3.7）。
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 成功時の redirect() も Action Promise は NEXT_REDIRECT で reject される（F35）。
  // unstable_rethrow で内部エラーを transition へ再送出し、Next.js のルーターに
  // 遷移として処理させる。catch に残るのは実際の失敗のみ。
  const runLogout = useCallback(() => {
    startTransition(async () => {
      try {
        await logoutAction(language);
      } catch (error) {
        unstable_rethrow(error);
        setHasError(true);
      }
    });
  }, [language, logoutAction]);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    runLogout();
  }, [runLogout]);

  if (hasError) {
    return (
      <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:py-[60px]">
        <p className="text-center text-base text-orange-900 md:text-xl">
          {texts.failedMessage}
        </p>
        <IconButton
          displayText={texts.retryButtonText}
          isLoading={isPending}
          onPress={runLogout}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:py-[60px]">
      <p
        className="text-center text-base text-orange-900 md:text-xl"
        role="status"
      >
        {texts.loggingOutMessage}
      </p>
    </div>
  );
}
```

> 成功時の redirect() も Action Promise が `NEXT_REDIRECT` で reject される（F35）。catch の先頭の `unstable_rethrow` が内部エラーを transition へ再送出し、Next.js のルーターが遷移として処理するため、`setHasError(true)` に到達するのは実際の失敗のみ。再試行ボタンは連打防止のため `useTransition` の pending 状態で `isLoading` にする。再試行が再度失敗した場合もエラー表示が維持される。エラー内容の値は画面に表示しない。redirect rejection と通常の rejection の区別は §6.5 のテストで担保する。

#### 7-7. `src/features/auth/components/logout-page.tsx`（新規）

```typescript
import type { JSX } from "react";
import type { LogoutAction } from "@/actions/auth/types/logout-action";
import { Header } from "@/components/header";
import { PageLayout } from "@/components/page-layout";
import { LogoutContent } from "@/features/auth/components/logout-content";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
  readonly logoutAction: LogoutAction;
}

/**
 * /logout はセッション Cookie を持たないユーザーが RequireSessionCookie で
 * リダイレクトされた後にのみ描画されるため、Header は静的なログイン済み表示でよい
 * （SessionHeader は不要）。期限切れ等の無効 Cookie でも描画され得るが、直後に
 * logoutAction が Cookie を削除して Home へ遷移するため一瞬の表示に留まる。
 */
export function LogoutPage({ language, logoutAction }: Props): JSX.Element {
  const currentUrlPath = createIncludeLanguageAppPath("logout", language);

  return (
    <PageLayout
      header={
        <Header
          currentUrlPath={currentUrlPath}
          isLoggedIn={true}
          language={language}
        />
      }
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center justify-center"
    >
      <LogoutContent language={language} logoutAction={logoutAction} />
    </PageLayout>
  );
}
```

#### 7-8. `src/app/(default)/login/page.tsx`（新規・全文）

```typescript
import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { loginAction } from "@/actions/auth/login-action";
import { i18nUrlList } from "@/constants/url";
import { LoginPage } from "@/features/auth/components/login-page";
import { RequireAnonymous } from "@/features/auth/components/require-anonymous";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).login.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).login.title,
    url: metaTagList(language, appBaseUrl()).login.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).login.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).login.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.login.ja,
    languages: {
      ja: i18nUrlList.login.ja,
      en: i18nUrlList.login.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

interface Props {
  readonly searchParams: Promise<{
    readonly error?: string;
  }>;
}

const LoginPageContent = async ({
  searchParams,
}: {
  readonly searchParams: Props["searchParams"];
}) => {
  const params = await searchParams;
  const hasError = params.error != null;

  return (
    <RequireAnonymous language={language}>
      <LoginPage
        hasError={hasError}
        language={language}
        loginAction={loginAction}
      />
    </RequireAnonymous>
  );
};

const Login: NextPage<Props> = ({ searchParams }) => (
  <Suspense fallback={null}>
    <LoginPageContent searchParams={searchParams} />
  </Suspense>
);

export default Login;
```

#### 7-9. `src/app/(default)/en/login/page.tsx`（新規）

7-8 と同一構造で以下のみ変更する。

- `const language: Language = "en";`
- `alternates.canonical: i18nUrlList.login.en`
- コンポーネント名を `EnLoginPageContent` / `EnLogin` にする

#### 7-10. `src/app/(default)/logout/page.tsx`（新規・全文）

```typescript
import type { Metadata, NextPage } from "next";
import { Suspense } from "react";
import { logoutAction } from "@/actions/auth/logout-action";
import { i18nUrlList } from "@/constants/url";
import { LogoutPage } from "@/features/auth/components/logout-page";
import { RequireSessionCookie } from "@/features/auth/components/require-session-cookie";
import { appName, metaTagList } from "@/functions/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/functions/open-graph-locale";
import { appBaseUrl } from "@/lib/config/app-base-url";
import type { Language } from "@/types/language";

const language: Language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language, appBaseUrl()).logout.title,
  openGraph: {
    title: metaTagList(language, appBaseUrl()).logout.title,
    url: metaTagList(language, appBaseUrl()).logout.ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language, appBaseUrl()).logout.ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language, appBaseUrl()).logout.title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList.logout.ja,
    languages: {
      ja: i18nUrlList.logout.ja,
      en: i18nUrlList.logout.en,
    },
  },
  robots: {
    index: false,
    follow: false,
  },
};

const Logout: NextPage = () => (
  <Suspense fallback={null}>
    <RequireSessionCookie language={language}>
      <LogoutPage language={language} logoutAction={logoutAction} />
    </RequireSessionCookie>
  </Suspense>
);

export default Logout;
```

> `/logout` のガードは `RequireLogin` ではなく `RequireSessionCookie` を使う（DB 非依存。理由は §3.5）。`RequireLogin` は favorites / my-cats 専用である。

#### 7-11. `src/app/(default)/en/logout/page.tsx`（新規）

7-10 と同一構造で `language = "en"`、canonical、コンポーネント名 `EnLogout` のみ変更。

#### 7-12. favorites / my-cats のアクセス制御（4 ファイル）

`src/app/(default)/favorites/page.tsx` の変更（metadata は不変、import 追加 + コンポーネント差し替え）:

```typescript
import { Suspense } from "react";
import { SessionHeader } from "@/components/session-header";
import { RequireLogin } from "@/features/auth/components/require-login";
import { createIncludeLanguageAppPath } from "@/functions/url";
```

```typescript
const Favorites: NextPage = () => (
  <Suspense fallback={null}>
    <RequireLogin language={language}>
      <FavoritesPage
        header={
          <SessionHeader
            currentUrlPath={createIncludeLanguageAppPath("favorites", language)}
            language={language}
          />
        }
        language={language}
      />
    </RequireLogin>
  </Suspense>
);

export default Favorites;
```

en 版と my-cats（ja/en）も同じ構造（`appPathName` とコンポーネント名のみ差し替え）。

> `RequireLogin` を通過した時点でログイン済みが確定しているが、Header は他ページと同じ `SessionHeader` を使う。`getCachedSession` の React cache により同一リクエスト内のセッション照会は 1 回で済むため無駄はない。

#### 7-13. stories（新規 2 ファイル）

`src/features/auth/components/login-page.stories.tsx`:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./login-page";

/**
 * Storybook 用のモック loginAction。
 * 自動開始 Story ではマウント時にこの関数が呼ばれるが、リダイレクトは発生しない。
 */
const mockLoginAction = async (): Promise<void> => {
  await Promise.resolve();
};

const meta = {
  component: LoginPage,
  title: "features/auth/LoginPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    hasError: false,
    language: "ja",
    loginAction: mockLoginAction,
  },
};

export const English: Story = {
  args: {
    hasError: false,
    language: "en",
    loginAction: mockLoginAction,
  },
};

export const ErrorJapanese: Story = {
  args: {
    hasError: true,
    language: "ja",
    loginAction: mockLoginAction,
  },
};

export const ErrorEnglish: Story = {
  args: {
    hasError: true,
    language: "en",
    loginAction: mockLoginAction,
  },
};
```

`src/features/auth/components/logout-page.stories.tsx`:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { LogoutPage } from "./logout-page";

const mockLogoutAction = async (): Promise<void> => {
  await Promise.resolve();
};

/**
 * エラー表示 Story 用のモック。自動実行時の catch に入り、
 * エラーメッセージと再試行ボタンが表示される。
 */
const mockFailingLogoutAction = async (): Promise<void> => {
  await Promise.reject(new Error("mock sign out failure"));
};

const meta = {
  component: LogoutPage,
  title: "features/auth/LogoutPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LogoutPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
    logoutAction: mockLogoutAction,
  },
};

export const English: Story = {
  args: {
    language: "en",
    logoutAction: mockLogoutAction,
  },
};

export const ErrorJapanese: Story = {
  args: {
    language: "ja",
    logoutAction: mockFailingLogoutAction,
  },
};

export const ErrorEnglish: Story = {
  args: {
    language: "en",
    logoutAction: mockFailingLogoutAction,
  },
};
```

> **未確認事項**: `LoginContent` / `LogoutContent` は next/navigation の `unstable_rethrow` を import する。@storybook/nextjs-vite は next/navigation のモックを提供するが、`unstable_rethrow` がそのモックに含まれるかは実装時に Storybook を起動して確認する事。含まれない場合は Storybook 側のモック設定で補う。

#### 7-14. テスト（§6.3 / §6.4 / §6.5 参照）を作成し `npm run test` で全パスを確認

### Phase 8: proxy の matcher 追加とリダイレクト応答ヘッダーの修正

#### 8-1. matcher に 12 パスを追加

`src/proxy.ts` の `config.matcher` に 12 パスを追加する（変更後全文）:

```typescript
export const config = {
  matcher: [
    "/",
    "/en",
    "/ja",
    "/upload",
    "/en/upload",
    "/ja/upload",
    "/terms",
    "/en/terms",
    "/ja/terms",
    "/privacy",
    "/en/privacy",
    "/ja/privacy",
    "/maintenance",
    "/en/maintenance",
    "/ja/maintenance",
    "/login",
    "/en/login",
    "/ja/login",
    "/logout",
    "/en/logout",
    "/ja/logout",
    "/favorites",
    "/en/favorites",
    "/ja/favorites",
    "/my-cats",
    "/en/my-cats",
    "/ja/my-cats",
  ],
};
```

matcher は Next.js のビルド時静的解析対象のため、リテラル配列のまま記述する（スプレッドや変数参照は不可）。

> これにより `/ja/login` 等は既存の `/ja` 正規化リダイレクトの対象になり、メンテナンスモード時はこれらのページも maintenance へ rewrite される。`/api/auth/*` は追加しない。セッション判定は引き続き行わない。

#### 8-2. `/ja` 正規化リダイレクトの応答ヘッダー横流しを修正

現行実装は `/ja` 正規化リダイレクトの 2 箇所で、`cookie` を含むリクエストヘッダー全体の複製（`requestHeaders`）を `NextResponse.redirect()` の**応答ヘッダー**として渡している（F43）。PR2 でセッション Cookie が導入されると、Cookie 付きで `/ja/*` にアクセスした際の 302 応答に `cookie: better-auth.session_token=...` が写り込み、応答の監視・中継・ログへセッショントークンが漏れる経路になる。redirect のオプションから `headers` を外す（`language === "ja"` 分岐の変更後全文）:

```typescript
  if (language === "ja") {
    const removedLanguagePath = removeLanguageFromAppPath(nextUrl.pathname);
    if (nextUrl.pathname !== "/ja") {
      return NextResponse.redirect(new URL(removedLanguagePath, request.url), {
        status: httpStatusCode.found,
        statusText: "Found",
      });
    }

    return NextResponse.redirect(new URL("/", request.url), {
      status: httpStatusCode.found,
      statusText: "Found",
    });
  }
```

> `requestHeaders` は rewrite / next の `{ request: { headers } }`（リクエストヘッダーの上書きとしての伝搬）にのみ使う。redirect 後はブラウザが新 URL を再リクエストして proxy が再実行されるため、`appBaseUrlHeaderName` の付与が redirect 応答から消えても機能上の影響は無い。

#### 8-3. テスト（§6.8 参照）を作成し `npm run test` で全パスを確認

## 6. テストコード

describe 名・`it.each`・`should` プレフィックス等は `docs/project-coding-guidelines.md` の規約に従う。

### 6.1 `src/features/auth/functions/__tests__/map-github-profile-to-user/map-github-profile-to-user.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { mapGithubProfileToUser } from "@/features/auth/functions/map-github-profile-to-user";

describe("src/features/auth/functions/map-github-profile-to-user.ts mapGithubProfileToUser TestCases", () => {
  interface TestTable {
    readonly avatarUrl: string;
    readonly expectedEmail: string;
    readonly githubUserId: string;
    readonly login: string;
  }

  it.each`
    githubUserId  | login          | avatarUrl                                              | expectedEmail
    ${"11032365"} | ${"keitakn"}   | ${"https://avatars.githubusercontent.com/u/11032365"} | ${"gh-11032365@no-email.lgtmeow.invalid"}
    ${"1"}        | ${"octocat"}   | ${"https://avatars.githubusercontent.com/u/1"}        | ${"gh-1@no-email.lgtmeow.invalid"}
  `(
    "should map GitHub profile to anonymized user when id is $githubUserId",
    ({ githubUserId, login, avatarUrl, expectedEmail }: TestTable) => {
      const mappedUser = mapGithubProfileToUser({
        id: githubUserId,
        login,
        avatar_url: avatarUrl,
      });

      expect(mappedUser).toStrictEqual({
        email: expectedEmail,
        name: login,
        image: avatarUrl,
      });
    }
  );

  it("should create anonymized email when GitHub API returns numeric id at runtime", () => {
    // better-auth の GithubProfile 型では id は string だが、GitHub API の実レスポンスは数値。
    // テンプレートリテラルで文字列化されるため同じ結果になる事を担保する。
    const numericIdProfile = {
      id: 11_032_365 as unknown as string,
      login: "keitakn",
      avatar_url: "https://avatars.githubusercontent.com/u/11032365",
    };

    expect(mapGithubProfileToUser(numericIdProfile).email).toBe(
      "gh-11032365@no-email.lgtmeow.invalid"
    );
  });
});
```

### 6.2 Server Action のテスト

#### `src/actions/auth/__tests__/login-action/login-action.test.ts`

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/actions/auth/login-action";

const mockSignInSocial = vi.fn();

vi.mock("@/lib/better-auth/auth", () => ({
  auth: {
    api: {
      signInSocial: (options: unknown) => mockSignInSocial(options),
    },
  },
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe("src/actions/auth/login-action.ts loginAction TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInSocial.mockResolvedValue({
      url: "https://github.com/login/oauth/authorize?client_id=xxx",
      redirect: true,
    });
  });

  it("should call signInSocial with Japanese callback URLs and redirect to GitHub when language is ja", async () => {
    await expect(loginAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/",
        errorCallbackURL: "/login",
      },
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      "https://github.com/login/oauth/authorize?client_id=xxx"
    );
  });

  it("should call signInSocial with English callback URLs and redirect to GitHub when language is en", async () => {
    await expect(loginAction("en")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/en",
        errorCallbackURL: "/en/login",
      },
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      "https://github.com/login/oauth/authorize?client_id=xxx"
    );
  });

  it("should redirect to login page with error query when signInSocial throws", async () => {
    mockSignInSocial.mockRejectedValue(new Error("network error"));

    await expect(loginAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login?error=signin_failed");
  });

  it("should redirect to English login page with error query when signInSocial throws and language is en", async () => {
    mockSignInSocial.mockRejectedValue(new Error("network error"));

    await expect(loginAction("en")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/en/login?error=signin_failed");
  });

  it("should redirect to login page with error query when signInSocial returns no url", async () => {
    mockSignInSocial.mockResolvedValue({ redirect: false, url: undefined });

    await expect(loginAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login?error=signin_failed");
  });

  it("should fall back to Japanese when language is invalid at runtime", async () => {
    await expect(
      loginAction("fr" as unknown as Parameters<typeof loginAction>[0])
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignInSocial).toHaveBeenCalledWith({
      body: {
        provider: "github",
        callbackURL: "/",
        errorCallbackURL: "/login",
      },
    });
  });
});
```

#### `src/actions/auth/__tests__/logout-action/logout-action.test.ts`

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logoutAction } from "@/actions/auth/logout-action";

const mockSignOut = vi.fn();

vi.mock("@/lib/better-auth/auth", () => ({
  auth: {
    api: {
      signOut: (options: unknown) => mockSignOut(options),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers({ cookie: "dummy" })),
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe("src/actions/auth/logout-action.ts logoutAction TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ success: true });
  });

  it("should sign out with request headers and redirect to Japanese home when language is ja", async () => {
    await expect(logoutAction("ja")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockSignOut).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should sign out and redirect to English home when language is en", async () => {
    await expect(logoutAction("en")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/en");
  });

  it("should propagate error to caller when signOut throws unexpectedly", async () => {
    mockSignOut.mockRejectedValue(new Error("unexpected failure"));

    await expect(logoutAction("ja")).rejects.toThrow("unexpected failure");

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
```

### 6.3 ガードコンポーネントのテスト

#### `src/features/auth/components/__tests__/require-login/require-login.test.tsx`

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireLogin } from "@/features/auth/components/require-login";

const mockGetCachedSession = vi.fn();

vi.mock("@/lib/better-auth/session", () => ({
  getCachedSession: () => mockGetCachedSession(),
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe("src/features/auth/components/require-login.tsx RequireLogin TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to Japanese home when session does not exist", async () => {
    mockGetCachedSession.mockResolvedValue(null);

    await expect(
      RequireLogin({ children: "protected", language: "ja" })
    ).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should redirect to English home when session does not exist and language is en", async () => {
    mockGetCachedSession.mockResolvedValue(null);

    await expect(
      RequireLogin({ children: "protected", language: "en" })
    ).rejects.toThrow("NEXT_REDIRECT:/en");

    expect(mockRedirect).toHaveBeenCalledWith("/en");
  });

  it("should render children when session exists", async () => {
    mockGetCachedSession.mockResolvedValue({
      user: { id: "user-1" },
      session: { id: "session-1" },
    });

    const element = await RequireLogin({
      children: "protected",
      language: "ja",
    });

    expect(element.props.children).toBe("protected");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
```

#### `src/features/auth/components/__tests__/require-anonymous/require-anonymous.test.tsx`

RequireLogin のテストと対になる 3 ケース（セッション有り → `/` へリダイレクト、セッション有り + en → `/en` へリダイレクト、セッション無し → children を描画）。構造は同一のため `RequireAnonymous` に読み替えて作成する。

#### `src/features/auth/components/__tests__/require-session-cookie/require-session-cookie.test.tsx`

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireSessionCookie } from "@/features/auth/components/require-session-cookie";

const mockHasSessionCookie = vi.fn();

vi.mock("@/lib/better-auth/session-cookie", () => ({
  hasSessionCookie: () => mockHasSessionCookie(),
}));

const mockRedirect = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

// 注意: このテストでは @/lib/better-auth/auth と @/lib/better-auth/session を意図的に
// vi.mock しない。auth.ts は import されると環境変数チェックで throw するため、
// モック無しでテストが成立する事自体が「RequireSessionCookie が DB（セッション API）に
// 依存していない」事の担保になる。
describe("src/features/auth/components/require-session-cookie.tsx RequireSessionCookie TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to Japanese home when session cookie does not exist", async () => {
    mockHasSessionCookie.mockResolvedValue(false);

    await expect(
      RequireSessionCookie({ children: "logout page", language: "ja" })
    ).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should redirect to English home when session cookie does not exist and language is en", async () => {
    mockHasSessionCookie.mockResolvedValue(false);

    await expect(
      RequireSessionCookie({ children: "logout page", language: "en" })
    ).rejects.toThrow("NEXT_REDIRECT:/en");

    expect(mockRedirect).toHaveBeenCalledWith("/en");
  });

  it("should render children when session cookie exists", async () => {
    mockHasSessionCookie.mockResolvedValue(true);

    const element = await RequireSessionCookie({
      children: "logout page",
      language: "ja",
    });

    expect(element.props.children).toBe("logout page");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
```

### 6.4 auth-i18n のテスト

#### `src/features/auth/functions/__tests__/auth-i18n/login-page-texts.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { loginPageTexts } from "@/features/auth/functions/auth-i18n";
import type { Language } from "@/types/language";

describe("src/features/auth/functions/auth-i18n.ts loginPageTexts TestCases", () => {
  interface TestTable {
    readonly expectedFailedMessage: string;
    readonly expectedRedirectingMessage: string;
    readonly expectedRetryButtonText: string;
    readonly language: Language;
  }

  it.each`
    language | expectedRedirectingMessage             | expectedFailedMessage                                      | expectedRetryButtonText
    ${"ja"}  | ${"GitHubへリダイレクトしています…"}   | ${"ログインに失敗しました。時間をおいて再度お試しください。"} | ${"再試行"}
    ${"en"}  | ${"Redirecting to GitHub…"}            | ${"Login failed. Please try again later."}                 | ${"Retry"}
  `(
    "should return $language login page texts",
    ({
      language,
      expectedRedirectingMessage,
      expectedFailedMessage,
      expectedRetryButtonText,
    }: TestTable) => {
      expect(loginPageTexts(language)).toStrictEqual({
        redirectingMessage: expectedRedirectingMessage,
        failedMessage: expectedFailedMessage,
        retryButtonText: expectedRetryButtonText,
      });
    }
  );
});
```

#### `src/features/auth/functions/__tests__/auth-i18n/logout-page-texts.test.ts`

同じ構造で `logoutPageTexts` の ja / en を検証する（`loggingOutMessage` / `failedMessage` / `retryButtonText` の 3 つ）。

### 6.5 LoginContent / LogoutContent のテスト（redirect rejection の区別）

F35 の通り、成功時の redirect() も Action Promise の `NEXT_REDIRECT` rejection として観測されるため、「redirect による rejection ではエラー表示しない / 実際の失敗では表示する」の区別をテストで担保する。既存のコンポーネントテスト（`upload-success.test.tsx` 等）と同じく `@testing-library/react` を使う。

#### `src/features/auth/components/__tests__/logout-content/logout-content.test.tsx`

```typescript
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoutContent } from "@/features/auth/components/logout-content";

// unstable_rethrow の契約（Next.js 内部エラーのみ再送出する）を再現するモック。
// NEXT_REDIRECT は digest が "NEXT_REDIRECT" で始まる Error として表現される。
vi.mock("next/navigation", () => ({
  unstable_rethrow: (error: unknown) => {
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
  },
}));

interface RedirectBoundaryProps {
  readonly children: ReactNode;
}

interface RedirectBoundaryState {
  readonly caughtRedirect: boolean;
}

/**
 * 再送出された NEXT_REDIRECT を受け止める境界。
 * 実環境では Next.js のルーターが遷移として処理する部分の代役。
 */
class RedirectBoundary extends Component<
  RedirectBoundaryProps,
  RedirectBoundaryState
> {
  state: RedirectBoundaryState = { caughtRedirect: false };

  static getDerivedStateFromError(): RedirectBoundaryState {
    return { caughtRedirect: true };
  }

  render() {
    if (this.state.caughtRedirect) {
      return <p>redirected</p>;
    }
    return this.props.children;
  }
}

const createRedirectError = (): Error =>
  Object.assign(new Error("NEXT_REDIRECT"), {
    digest: "NEXT_REDIRECT;push;/;307;",
  });

describe("src/features/auth/components/logout-content.tsx LogoutContent TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should not show error message when logoutAction rejects with NEXT_REDIRECT", async () => {
    const redirectingLogoutAction = vi
      .fn()
      .mockRejectedValue(createRedirectError());

    render(
      <RedirectBoundary>
        <LogoutContent language="ja" logoutAction={redirectingLogoutAction} />
      </RedirectBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText("redirected")).toBeInTheDocument();
    });
    expect(
      screen.queryByText(
        "ログアウトに失敗しました。時間をおいて再度お試しください。"
      )
    ).not.toBeInTheDocument();
  });

  it("should show error message and retry button when logoutAction rejects with an unexpected error", async () => {
    const failingLogoutAction = vi
      .fn()
      .mockRejectedValue(new Error("unexpected failure"));

    render(
      <RedirectBoundary>
        <LogoutContent language="ja" logoutAction={failingLogoutAction} />
      </RedirectBoundary>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "ログアウトに失敗しました。時間をおいて再度お試しください。"
        )
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("should call logoutAction again when retry button is pressed", async () => {
    const failingLogoutAction = vi
      .fn()
      .mockRejectedValue(new Error("unexpected failure"));

    render(
      <RedirectBoundary>
        <LogoutContent language="ja" logoutAction={failingLogoutAction} />
      </RedirectBoundary>
    );

    const retryButton = await screen.findByRole("button", {
      name: "再試行",
    });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(failingLogoutAction).toHaveBeenCalledTimes(2);
    });
  });
});
```

#### `src/features/auth/components/__tests__/login-content/login-content.test.tsx`

LogoutContent のテストと同じ構造で `LoginContent` を検証する（`logoutAction` → `loginAction` に読み替え、props に `hasError: false` を追加で渡す）。NEXT_REDIRECT rejection ではエラーメッセージが表示されない事、通常の rejection では表示される事（`hasClientError` 経由）、再試行ボタンで `loginAction` が再実行される事の 3 ケースに加え、**`?error=` 時の OAuth 自動開始抑止（無限ループ防止の受け入れ基準）** を検証する以下の 2 ケースを作成する。

```typescript
  it("should not call loginAction on initial render when hasError is true", async () => {
    const loginAction = vi.fn().mockResolvedValue(undefined);

    render(
      <LoginContent hasError={true} language="ja" loginAction={loginAction} />
    );

    // エラー表示（自動開始の抑止画面）が描画され、自動開始は行われない
    expect(
      await screen.findByText(
        "ログインに失敗しました。時間をおいて再度お試しください。"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "再試行" })
    ).toBeInTheDocument();
    expect(loginAction).not.toHaveBeenCalled();
  });

  it("should call loginAction once when retry button is pressed after error", async () => {
    const loginAction = vi.fn().mockResolvedValue(undefined);

    render(
      <LoginContent hasError={true} language="ja" loginAction={loginAction} />
    );

    const retryButton = await screen.findByRole("button", { name: "再試行" });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(loginAction).toHaveBeenCalledTimes(1);
    });
  });
```

### 6.6 既存テストの更新

§5 Phase 2 の 2-5 に記載済み（`create-include-language-app-path.test.ts` / `meta-tag-list.test.ts`）。

### 6.7 scope 固定化と session-cookie のテスト

#### `src/features/auth/functions/__tests__/oauth-scope-policy/is-scope-request-forbidden.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { isScopeRequestForbidden } from "@/features/auth/functions/oauth-scope-policy";

describe("src/features/auth/functions/oauth-scope-policy.ts isScopeRequestForbidden TestCases", () => {
  interface TestTable {
    readonly expected: boolean;
    readonly path: string;
    readonly requestBody: unknown;
  }

  it.each`
    path                  | requestBody                                          | expected
    ${"/sign-in/social"}  | ${{ provider: "github", scopes: ["user:email"] }}    | ${true}
    ${"/sign-in/social"}  | ${{ provider: "github", scopes: ["repo", "user"] }}  | ${true}
    ${"/sign-in/social"}  | ${{ provider: "github", scopes: [] }}                | ${false}
    ${"/sign-in/social"}  | ${{ provider: "github" }}                            | ${false}
    ${"/sign-in/social"}  | ${null}                                              | ${false}
    ${"/link-social"}     | ${{ provider: "github", scopes: ["user:email"] }}    | ${true}
    ${"/sign-out"}        | ${{ scopes: ["user:email"] }}                        | ${false}
  `(
    "should return $expected when path is $path",
    ({ path, requestBody, expected }: TestTable) => {
      expect(isScopeRequestForbidden(path, requestBody)).toBe(expected);
    }
  );
});
```

#### `src/features/auth/functions/__tests__/oauth-scope-policy/has-non-empty-account-scope.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { hasNonEmptyAccountScope } from "@/features/auth/functions/oauth-scope-policy";

describe("src/features/auth/functions/oauth-scope-policy.ts hasNonEmptyAccountScope TestCases", () => {
  interface TestTable {
    readonly expected: boolean;
    readonly scope: string | null | undefined;
  }

  it.each`
    scope                    | expected
    ${"read:user"}           | ${true}
    ${"read:user,user:email"}| ${true}
    ${" "}                   | ${false}
    ${""}                    | ${false}
    ${null}                  | ${false}
    ${undefined}             | ${false}
  `("should return $expected when scope is $scope", ({ scope, expected }: TestTable) => {
    expect(hasNonEmptyAccountScope(scope)).toBe(expected);
  });
});
```

#### `src/lib/better-auth/__tests__/session-cookie/has-session-cookie.test.ts`

`next/headers` のみモックし、`better-auth/cookies` の `getSessionCookie` は実物を使う（`__Secure-` 接頭辞の解決を含めた実挙動を検証するため）。`@/lib/better-auth/auth` はモックしない（session-cookie.ts が auth.ts に依存していない事の担保。依存していれば import 時に throw してテストが失敗する）。

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasSessionCookie } from "@/lib/better-auth/session-cookie";

const mockHeaders = vi.fn();

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(mockHeaders()),
}));

describe("src/lib/better-auth/session-cookie.ts hasSessionCookie TestCases", () => {
  interface TestTable {
    readonly cookieHeader: string;
    readonly expected: boolean;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each`
    cookieHeader                                     | expected
    ${"better-auth.session_token=abc123"}            | ${true}
    ${"__Secure-better-auth.session_token=abc123"}   | ${true}
    ${"other=value; better-auth.session_token=abc"}  | ${true}
    ${"other=value"}                                 | ${false}
  `(
    "should return $expected when cookie header is $cookieHeader",
    async ({ cookieHeader, expected }: TestTable) => {
      mockHeaders.mockReturnValue(new Headers({ cookie: cookieHeader }));

      expect(await hasSessionCookie()).toBe(expected);
    }
  );

  it("should return false when cookie header does not exist", async () => {
    mockHeaders.mockReturnValue(new Headers());

    expect(await hasSessionCookie()).toBe(false);
  });
});
```

### 6.8 proxy のテスト

#### `src/__tests__/proxy/proxy.test.ts`

`/ja` 正規化リダイレクトの応答にリクエストヘッダー（`cookie` / `authorization`）が写り込まない事（Phase 8-2 の修正の検証）を担保する。Vercel Edge Config に依存する `isBanCountry` / `isInMaintenance` はモックする。

```typescript
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

vi.mock("@/lib/vercel/edge-functions/country", () => ({
  isBanCountry: () => Promise.resolve(false),
}));

vi.mock("@/lib/vercel/edge-functions/maintenance", () => ({
  isInMaintenance: () => Promise.resolve(false),
}));

describe("src/proxy.ts proxy TestCases", () => {
  it("should not reflect cookie and authorization headers in redirect response when ja path is normalized", async () => {
    const request = new NextRequest("http://localhost:2222/ja/upload", {
      headers: {
        authorization: "Bearer dummy-token",
        cookie: "better-auth.session_token=dummy-session-token",
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://localhost:2222/upload"
    );
    expect(response.headers.get("cookie")).toBeNull();
    expect(response.headers.get("authorization")).toBeNull();
  });

  it("should not reflect cookie header in redirect response when /ja is normalized to home", async () => {
    const request = new NextRequest("http://localhost:2222/ja", {
      headers: {
        cookie: "better-auth.session_token=dummy-session-token",
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost:2222/");
    expect(response.headers.get("cookie")).toBeNull();
  });
});
```

## 7. 品質管理の手順

`CLAUDE.md` 記載の標準手順に従い、全 Phase 完了後に以下を順に実行する。

1. `npm run format`
2. `npm run lint`（エラー 0）
3. `npm run test`（全パス。Storybook 連携テストで全 stories の描画も検証される）
4. `npm run build`（`cacheComponents` 下で `headers()` / `"use cache"` の配置ミスはここでエラーになるため必ず実行する）

## 8. 動作確認の手順

前提: `npm run dev`（port 2222）は起動済み。`.env.local` に `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`（LGTMeow (local) の OAuth App）と `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL=http://localhost:2222` が設定済み（F31）。ブラウザ確認には chrome-devtools MCP を使用する。複雑な操作が必要な場合は agent-browser Skill を使う。

### 8.1 未ログイン状態の確認

1. `http://localhost:2222/` を開き、Header に**ログインボタンが表示される**事を確認（従来は `hideLoginButton` で非表示だった）
2. `http://localhost:2222/favorites` へ直接アクセス → `/` へリダイレクトされる事を確認
3. `http://localhost:2222/my-cats` → `/` へリダイレクト
4. `http://localhost:2222/logout` → `/` へリダイレクト
5. en 変種（`/en/favorites` `/en/my-cats` `/en/logout`）→ `/en` へリダイレクト
6. `http://localhost:2222/ja/login` → `/login` へ 302（proxy の `/ja` 正規化が効いている事）。併せて chrome-devtools のネットワーク記録で、この 302 応答のヘッダーに `cookie` が含まれていない事を確認する（Phase 8-2 の修正の実地確認）

### 8.2 ログインフロー

1. Header のログインボタンをクリック → `/login` に遷移し「GitHubへリダイレクトしています…」表示の後、GitHub の authorize 画面へ遷移する事を確認
2. **GitHub の authorize URL の `scope` パラメータが空（または `scope` パラメータ自体が無い）事を確認する**（プライバシー要件の実地検証。chrome-devtools MCP のネットワーク記録、または authorize 画面表示中のアドレスバーの URL で `github.com/login/oauth/authorize` のクエリ文字列を確認する）
3. authorize 画面で許可 → `http://localhost:2222/`（Home）に戻り、Header がログイン済み表示（GitHub アイコンのドロップダウンメニュー）に切り替わる事を確認
4. DB の匿名化を確認する。**値そのものは SELECT せず、期待値 0 の COUNT クエリで検査する**（まさに匿名化・暗号化が失敗しているケースでこの確認が行われるため、値を出力すると実 email や有効な token が端末・エージェントのログに残ってしまう。`name` / `image` は公開情報だが、マッピング失敗時に実名が入り得るため同様に直接出力しない）:

```bash
# 匿名化パターン外の email を持つ user 行数（期待値 0）
turso db shell <ローカル開発用DB名> "SELECT COUNT(*) AS non_anonymized_users FROM user WHERE email NOT LIKE 'gh-%@no-email.lgtmeow.invalid';"
```

5. access token が暗号化されて保存されている事と、scope が空である事を確認する（期待値はいずれも 0）:

```bash
# GitHub の平文 token 形式（gho_ / ghu_ / ghp_）のまま保存されている行数（期待値 0）
turso db shell <ローカル開発用DB名> "SELECT COUNT(*) AS plaintext_tokens FROM account WHERE provider_id = 'github' AND (access_token LIKE 'gho_%' OR access_token LIKE 'ghu_%' OR access_token LIKE 'ghp_%');"

# 非空 scope が保存されている行数（scope 固定化の検証。期待値 0）
turso db shell <ローカル開発用DB名> "SELECT COUNT(*) AS non_empty_scopes FROM account WHERE provider_id = 'github' AND scope IS NOT NULL AND TRIM(scope) != '';"
```

> カラム名は `src/lib/better-auth/schema.ts` の定義（`provider_id` / `access_token` / `scope`）に一致させている。COUNT が 0 でない場合も値の SELECT はせず、実装（`mapProfileToUser` / `encryptOAuthTokens` / scope フック）を修正して再ログインからやり直す事。

### 8.3 ログイン済み状態の確認

1. Header メニューから「お気に入り」→ `/favorites` が Coming Soon 表示で開ける事（リダイレクトされない事）
2. 同様に My Cats → `/my-cats` が開ける事
3. `http://localhost:2222/login` へ直接アクセス → `/` へリダイレクトされる事
4. `/en` を開き、Header がログイン済み表示である事（言語間でセッションが共有される事）

### 8.4 ログアウトフロー

1. Header メニューから「ログアウト」→ `/logout` に遷移し「ログアウトしています…」表示の後、`/` へリダイレクトされる事
2. Header が未ログイン表示（ログインボタン）に戻る事
3. `/favorites` へアクセスし、Home へリダイレクトされる事

> **ログアウト成功の主たる確認は 2 と 3（Cookie 削除の帰結）である。** DB の session 行削除は best effort（F13）のため、ログアウト成功の必須条件として扱わない。

4. （補助確認・任意）ログアウトしたユーザーの session 行が残っていない事を、対象ユーザーに絞った COUNT で確認する。session テーブル全体の COUNT は別ブラウザや他ユーザーの行が混ざり判定にならないため使わない:

```bash
turso db shell <ローカル開発用DB名> "SELECT COUNT(*) AS remaining_sessions FROM session WHERE user_id = (SELECT id FROM user WHERE email = 'gh-<GitHub User ID>@no-email.lgtmeow.invalid');"
```

期待値 0。ただし同一ユーザーが別ブラウザ等でログインしたままの場合は 0 にならない事があり、その場合も 2 と 3 が確認できていればログアウトは成功である。

5. en フローの確認: `http://localhost:2222/en/login` へアクセスしてログイン → **`/en`（英語版 Home）に戻る事**を確認（`callbackURL` の言語対応の検証）。その後 `/en/logout` でログアウトし `/en` に戻る事を確認

### 8.5 エラーフロー

1. `http://localhost:2222/login?error=access_denied` へ直接アクセス → OAuth が自動開始**されず**、エラーメッセージと再試行ボタンが表示される事
2. 再試行ボタンをクリック → GitHub authorize 画面へ遷移する事
3. （可能なら）GitHub authorize 画面で「Cancel」を選択 → `/login?error=access_denied` に戻り、無限ループにならない事
4. ログアウト失敗時の表示（エラーメッセージ + 再試行ボタン）は、ローカルで DB 障害等を再現できないため Storybook の `ErrorJapanese` / `ErrorEnglish` Story で確認する（§8.6）
5. `http://localhost:2222/api/auth/callback/github?state=invalid` へ直接アクセス → `/login?error=...` にリダイレクトされ、エラーメッセージと再試行ボタンが表示される事（state を復元できない失敗が `onAPIError.errorURL` により /login へ収束する事の確認）

### 8.6 Storybook

`npm run storybook`（port 6006）で以下を確認する。

1. `features/auth/LoginPage` の Japanese / English / ErrorJapanese / ErrorEnglish
2. `features/auth/LogoutPage` の Japanese / English / ErrorJapanese / ErrorEnglish（Error 系は失敗する logoutAction モックによりエラーメッセージ + 再試行ボタンが表示される事）
3. `Header` 系の未ログイン / ログイン済み Stories（`HiddenLoginButton*` が消えている事）
4. `features/favorites/FavoritesPage` / `features/my-cats/MyCatsPage` がログイン済み Header 付きで表示される事
5. HomePage / UploadPage / docs 系の既存 Stories が壊れていない事

### 8.7 一連の動作の通し確認

Done 定義の「ログイン → Header 表示切替 → ログアウト → 未ログインリダイレクト」を 8.2 → 8.3 → 8.4 → 8.1(2) の順で通しで実施し、スクリーンショットを取得して PR に添付する。

### 8.8 scope 固定化の確認

auth.ts のフック（§5 Phase 3-2）が実際に効いている事を HTTP レベルで確認する。

1. `/link-social` が無効化されている事（`disabledPaths`。期待値: HTTP 404）:

```bash
curl -i -X POST http://localhost:2222/api/auth/link-social \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:2222" \
  -d '{"provider":"github","callbackURL":"/"}'
```

2. `/sign-in/social` への非空 `scopes` が拒否される事（`hooks.before`。期待値: HTTP 400）:

```bash
curl -i -X POST http://localhost:2222/api/auth/sign-in/social \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:2222" \
  -d '{"provider":"github","scopes":["user:email"]}'
```

3. `scopes` 無しの正規リクエストは従来どおり成功する事（degradation が無い事。期待値: HTTP 200 + `url` に GitHub の authorize URL）:

```bash
curl -i -X POST http://localhost:2222/api/auth/sign-in/social \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:2222" \
  -d '{"provider":"github","callbackURL":"/"}'
```

4. ログアウト → 再ログイン（§8.2 → §8.4 → §8.2）を行った後も、§8.2(5) の `non_empty_scopes` COUNT が 0 のままである事（正常系で scope が空のまま維持される事の確認）

次に、**拒否経路そのもの**を実 OAuth フローで検証する（フックの配線・throw・保存阻止・ロールバックが壊れていても §6.7 の純粋関数テストだけでは検出できないため）。手順は create 経路（新規ユーザー）→ update 経路（既存ユーザー）の順で行う。

5. **create 経路の拒否とロールバックの確認（`databaseHooks.account.create.before` + `transaction: true`）:**
   1. 対象 GitHub アカウントの行を削除して未登録状態にする（`account` → `session` → `user` の順に、`account_id = '<GitHub User ID>'` / それに紐づく `user_id` で絞って DELETE）。事前に件数を控える:

      ```bash
      turso db shell <ローカル開発用DB名> "SELECT (SELECT COUNT(*) FROM user) AS users, (SELECT COUNT(*) FROM account) AS accounts, (SELECT COUNT(*) FROM session) AS sessions;"
      ```

   2. **GitHub 側の grant を取り消す**: <https://github.com/settings/applications> の Authorized OAuth Apps から LGTMeow (local) を Revoke する。**手順 4 までの通常ログインで grant が残っており、grant がある間は GitHub が認可画面を表示せず自動完了する（F32）ため、Revoke しないと次の手順で URL を書き換える機会そのものが訪れない**
   3. `/login` から OAuth を開始し、GitHub の authorize 画面が表示されたら、アドレスバーの URL に必ず含まれる**空の `scope=` パラメータの値を `scope=user%3Aemail` に置き換えて**開き直してから「Authorize」する（better-auth は scope 空でも `scope=` パラメータ自体は URL に含めるため、末尾への追加ではなく置換で行う。二重に `scope` パラメータを付けない）
   4. `/login?error=...` に戻り、エラーメッセージと再試行ボタンが表示される事
   5. 手順 1 の COUNT を再実行し、**3 テーブルとも件数が増えていない事**（user 行のロールバック = F41 の `transaction: true` の検証。ここで user だけ増えている場合は原子化が効いていないので実装を見直す事）
   6. **手順 2 と同様に再度 Revoke する**（手順 3 の改変認可で `user:email` 付きの grant が新たに残っており、これがあると以降の scope 無指定ログインが「許可済み scope の集合」で自動補完され（F32）、フックに拒否され続けて手順 6-1 の通常ログインが成立しないため）

6. **update 経路の拒否の確認（`databaseHooks.account.update.before` + `body.code` の redirect 変換）:**
   1. 通常ログイン（§8.2）→ ログアウト（§8.4）を実施し、対象アカウントが登録済みの状態にする（手順 5-6 の Revoke 済みが前提。認可画面が表示されず即座にエラーへ戻る場合は grant が残っているので Revoke からやり直す）
   2. **GitHub 側の grant を再度 Revoke する**（手順 6-1 の通常ログインで空 scope の grant が再作成されており、Revoke しないと認可画面が表示されず URL を書き換えられない。F32。Revoke してもローカル DB の account 行は残るため、次の手順は既存アカウントの update 経路を通る）
   3. 手順 5-3 と同様に authorize URL の空の `scope=` を `scope=user%3Aemail` に置き換えて再ログインを試みる
   4. HTTP 400 の白画面では**なく**、言語対応の `/login?error=...`（再試行画面）へ戻る事（F42 の `code: "OAUTH_SCOPE_NOT_ALLOWED"` による redirect 変換の検証）
   5. §8.2(5) の `non_empty_scopes` COUNT が 0 のままである事
   6. GitHub 側の grant をもう一度 Revoke した後、通常ログイン（scope 改変なし）が成功する事（検証後のクリーンアップを兼ねる）

> GitHub の grant はアプリ側の拒否や DB ロールバックでは消えず、ユーザー（ここでは検証者）が Revoke するまで GitHub 側に残り続ける（F32）。この状態は authorize URL を意図的に改変しない限り発生しないため、一般ユーザー向けの案内 UI は作らない（開発責任者の判断で確定）。

| Done 定義（Issue #480 PR2 分） | 本計画の対応箇所 |
| --- | --- |
| Better Auth の GitHub Social Provider が有効化 | §5 Phase 3-2 |
| `/api/auth/*` エンドポイントが正常動作 | §5 Phase 3-4 / §8.2 |
| `/login`（ja/en）で OAuth 自動開始（ボタン押下不要） | §5 Phase 7-4〜7-9 / §8.2 |
| OAuth 失敗時 `/login?error=...` で自動開始抑止 + 再試行（state を復元できない失敗も `onAPIError.errorURL` で /login へ収束） | §3.6 / §5 Phase 3-2, 7-4 / §8.5 |
| Header のログイン状態表示が `getSession()` 連動（`hideLoginButton` / `isLoggedIn` ハードコード撤去。ErrorLayout のみ未ログイン固定表示とする合意済みの例外あり、§5 Phase 5-6 参照） | §5 Phase 5, 6 / §8.1, 8.3 |
| proxy matcher に認証系パス追加（セッション判定はしない） | §5 Phase 8 |
| Storybook でログイン済み・未ログイン両状態 | §5 Phase 5-7, 6-4, 7-13 / §8.6 |
| テストコードが用意されている | §6 |
| ローカルで一連の動作を実ブラウザ確認 | §8.7 |
| 実 email を DB に保存しない | §3.2 / §5 Phase 3-1, 3-2 / §8.2(4) |
| `user.email` に匿名化値（`gh-<id>@no-email.lgtmeow.invalid`） | 同上 |
| `disableDefaultScope: true` でデフォルトスコープを要求しない | §5 Phase 3-2 / §8.2(2) |
| `mapProfileToUser` の匿名化をテストで担保 | §6.1 |
| `/logout`（ja/en）で sign out + 言語対応 Home へリダイレクト（想定外の失敗時はクライアント状態でエラー表示 + 再試行） | §5 Phase 7-6, 7-7, 7-10, 7-11 / §8.4, 8.5, 8.6 |
| お気に入り / My Cats / ログアウトの未ログイン時 Home リダイレクト（Server Component 側で判定。favorites / my-cats はセッション照会、/logout は Cookie 有無のみで判定） | §5 Phase 7-1, 7-2b, 7-10, 7-12 / §8.1 |
| `/logout` の href ハードコード解消（`logout` を定数・型・メタタグへ追加） | §5 Phase 2, 5-4, 5-5 |
| `better-auth` / `@better-auth/drizzle-adapter` を `1.6.23` へ更新 | §5 Phase 1-1 |
| `.env.example` にプレースホルダ追記 | §5 Phase 1-2 |

### 9.1 計画レビュー指摘由来の追加対応

Issue の Done 定義には含まれないが、計画レビュー（Codex）の指摘を受けて本 PR のスコープに含める対応。

| 追加対応 | 本計画の対応箇所 |
| --- | --- |
| `/logout` ガードの DB 非依存化（Turso 障害時でも Cookie 削除でログアウト可能） | §3.5 / §5 Phase 3-3b, 7-2b / §6.3 |
| OAuth scope 固定化（`/link-social` 無効化・非空 `scopes` 拒否・`account.scope` の create/update 保存前検証・`transaction: true` による user 作成の原子化・`code` 付き throw による再試行画面への redirect） | §3.2 / §5 Phase 3-1b, 3-2 / §6.7 / §8.8（拒否経路の実フロー検証を含む） |
| `?error=` 時の OAuth 自動開始抑止のテスト | §6.5 |
| 動作確認 SQL の秘匿値非出力化（期待値 0 の COUNT 検査へ変更） | §8.2(4)(5) / §8.4(4) |
| proxy の `/ja` 正規化リダイレクト応答へのリクエストヘッダー横流し修正（セッショントークンの応答への写り込み防止） | §5 Phase 8-2, 8-3 / §6.8 / §8.1(6) |

## 10. 禁止事項・注意点

1. **クライアント側 SDK（`createAuthClient()` / `auth-client.ts`）を作成しない。** クライアントコンポーネントは better-auth に一切依存させない
2. **DB スキーマを変更しない。** `usePlural` / `fields` マッピングも使わない（#483 の決定事項）。`user.email` を nullable にするアプローチは採らない
3. **`user:email` スコープや `scope` オプションを追加しない。** プライバシー設計の根幹
4. **proxy でセッション判定を行わない。** matcher に `/api/auth/*` を追加しない
5. **ログイン済み UI（GithubIcon トリガー + ドロップダウン）のデザインを変更しない。** アバター画像・ユーザー名の表示は行わない
6. **`VERCEL_URL` への fallback を実装しない**（Issue の決定事項。staging 以外の Preview は「閲覧可・ログイン不可」が仕様）
7. **`session.cookieCache` を導入しない**（負荷が問題になった時点で再検討）
8. **`SessionHeader` を Storybook から到達するモジュール（`src/components/` の他コンポーネント、`src/features/` 配下）から import しない。** stories も作らない
9. **`"use cache"` が付いた関数・コンポーネントの内側に `SessionHeader` / `RequireLogin` / `RequireSessionCookie` / `getCachedSession` / `hasSessionCookie` を置かない**（F21。いずれも実行時 API の `headers()` に依存する）
10. **`redirect()` を try ブロックの中で呼ばない**（F22。本計画のローカル関数パターンを崩さない）
11. **`/logout` のガードに DB 照会を持ち込まない。** `RequireSessionCookie`（Cookie 有無のみ）を `RequireLogin`（`getSession()` = Turso 照会）へ置き換えてはならない（§3.5）
12. **scope 固定化のフックを緩めない。** `disabledPaths` から `/link-social` を外したり、`hooks.before` / `databaseHooks.account` の scope 検証を削除・迂回したりしない。databaseHooks の before で `false` を返す実装に変えない（黙ってスキップされフローが継続してしまう。F39）。throw する `APIError` から `code` を外さない（redirect 変換されず HTTP 400 になる。F42）。`drizzleAdapter` の `transaction: true` を外さない（scope 拒否時に孤立 user が残る。F41）
13. JWT プラグインは本 Issue では扱わない（backend 連携の別 Issue で対応）
14. 依頼内容と関係のないリファクタリングを混入させない
13. 認証系エンドポイントのレート制限は本 PR のスコープ外とする（<https://github.com/nekochans/lgtm-cat-frontend/issues/490> で別途対応）
