# Issue 358: Next.js 16向けビルドエラー修正 実装計画（2025-11-08）

## 0. ゴールと前提

- ゴール: `npm run build` で発生している `NextRequest.geo` 未定義エラーと、`middleware` ファイル規約の非推奨警告を解消し、Next.js 16.0.1 上でビルド＆開発を安定させる。
- 参照元: `@user-prompt/202511082119_issue358.md`。不明点が出たら **必ず依頼者へ確認**（独断禁止）。
- 依存情報: Next.js 16 では `middleware` ではなく `proxy` 規約を使用し、`NextRequest` から `geo`/`ip` が削除された。公式ガイド（/vercel/next.js docs/01-app/02-guides/upgrading/version-16.mdx, version-15.mdx）と codemod 説明（/vercel/next.js docs/01-app/02-guides/upgrading/codemods.mdx）を根拠とする。
- 品質手順: 仕上げ時は `npm run format` → `npm run lint` → `npm run test` → Playwright (`http://localhost:2222`) → Playwright (`http://localhost:6006`) の順を厳守。加えて `npm run build` で再発確認。

## 1. 変更対象と成果物

| 種類           | 対象                                 | 目的                                                                          |
| -------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| 依存パッケージ | `package.json`, `package-lock.json`  | `@vercel/functions` を追加して geolocation API を利用可能にする               |
| ソース         | `src/edge/country.ts`                | `req.geo` 依存を排除し、`geolocation(req)` ベースの判定へ差し替え             |
| ソース         | `src/middleware.ts` → `src/proxy.ts` | Next.js 16 の新ファイル規約に合わせたリネーム＆`proxy` エクスポート化         |
| 共通ルール     | 全ての編集した `.ts/.tsx`            | 先頭に `// 絶対厳守：編集前に必ずAI実装ルールを読む` を追加（未記載なら必須） |
| ドキュメント   | この設計書                           | Claude Code の開発ガイドとしてリポジトリに保存                                |

## 2. `NextRequest.geo` 廃止対応（@vercel/functions の導入）

### 2.1 背景・要点

- Next.js 16 では `NextRequest` から `geo`/`ip` プロパティが削除されたため、Edge での位置情報取得は `@vercel/functions` の `geolocation()` を使用する（version-15 アップグレードガイド参照）。
- `geolocation(req)` は `{ country?: string | undefined }` 等を返し、ローカル開発では `undefined` になる可能性が高い。null セーフな実装が必須。

### 2.2 手順

1. **依存追加**
   - コマンド: `npm install @vercel/functions@latest`.
   - `package.json` の `dependencies` に `"@vercel/functions": "<取得されたバージョン>"` が追加される。`package-lock.json` も更新されるので忘れずコミット対象に。
2. **`src/edge/country.ts` の準備**
   - ファイル冒頭に必須コメントを追加（まだ無い場合）。
   - 既存インポートを以下に置換:
     ```ts
     import { geolocation, type Geolocation } from "@vercel/functions";
     import type { NextRequest } from "next/server";
     import { get } from "@vercel/edge-config";
     ```

     - `Geolocation` 型は optional だが、静的解析で `country` プロパティへのアクセスを明示できるため追加推奨。
3. **ロジック更新**
   - `const location = geolocation(req); const country = location?.country?.toUpperCase();` のようにラップし、従来の `req.geo` 部分を完全に置換。
   - `geolocation` は同期関数なので `await` は不要。非同期処理のネストを増やさないよう注意。
   - `bannedCountryCodeList` 未取得時や `country` 未検出時は `false` を返す現行仕様を維持。既存の `toUpperCase()` と `includes` ロジックは流用可能。
   - Optional: ローカル環境の動作保証として、`location?.country ?? req.headers.get("x-vercel-ip-country")` のフォールバックをコメント付きで検討しても良いが、仕様不明なら依頼者へ確認。
4. **型/インポート整理**
   - `NextRequest` 型は引き続き必要。
   - 使わなくなった識別子（もし `get` の位置を変える場合）は ESLint で警告されるため `npm run lint` で確認。

### 2.3 チェックポイント

- `rg -n "geo" src -g"*.ts*"` で `req.geo` や `request.geo` が残っていないこと。
- `npm run build` で `Property 'geo' does not exist on type 'NextRequest'` エラーが消えていること。
- `npm run lint` で `@vercel/functions` 未使用などの警告が出ないこと。

## 3. `middleware` → `proxy` への移行

### 3.1 背景・要点

- Next.js 16 アップグレードガイド（version-16.mdx）では、`middleware.ts` ファイルと `middleware` エクスポートが非推奨となり、`proxy.ts` / `export function proxy()` へ置き換える必要がある。
- `proxy` でも `export const config = { matcher: [...] }` はそのまま利用可能。
- Vercel 公式 codemod `npx @next/codemod@latest middleware-to-proxy .` と同等の差分を手で実装するイメージ。

### 3.2 手順

1. **ファイルリネーム**
   - `git mv src/middleware.ts src/proxy.ts`.
   - 新ファイルの先頭に必須コメントを追加。
2. **エクスポート修正**
   - `export const middleware: NextMiddleware = async (req: NextRequest) => { ... }` を、以下のように書き換え。
     ```ts
     export async function proxy(request: NextRequest) {
       // 旧 middleware 本体を request 変数名に合わせて移植
     }
     ```
   - `NextMiddleware` 型が不要になるので、`import { type NextMiddleware, type NextRequest, NextResponse } from "next/server";` を `import { type NextRequest, NextResponse } from "next/server";` へ整理。
   - 関数内部は `req` 変数名で依存しているため、`const nextUrl = request.nextUrl;` 等に rename する（VS Code rename などを活用）。ローカル変数が多いため、typoで `req` が残らないよう `rg -n "req"` を補助的に使用。
3. **動作確認の観点**
   - `config.matcher` は変更不要だが、差分確認時に JSON 文字列の trailing comma がフォーマッタで崩れないかチェック。
   - `isBanCountry(request)` 呼び出しは `request` へ引数名を合わせる。
   - `NextResponse.redirect(new URL(..., request.url))` など URL 生成部の第2引数が `req.url` のままになっていないか1件ずつ確認。
   - `requestHeaders` は `request.headers` を使用。
4. **ファイル参照箇所の確認**
   - `rg -n "middleware" -g"*.*"` でその他のファイルから `middleware` を import していないかチェック（通常は無し）。結果ゼロが期待値。
   - `next.config.ts` 等で `middleware` を参照する設定は存在しない前提。もし発見した場合は `proxy` へ名称変更する。

### 3.3 リスクと対策

- **コメント入れ忘れ**: `proxy.ts`, `edge/country.ts` ともに差分確認で冒頭コメントが入っているか再度目視。
- **リネーム漏れ**: 1箇所でも `req` が残ると未定義エラーになる。`rg -n "req"` を `proxy.ts` に限定して grep し、`const { nextUrl } = request;` のようにすべて揃える。
- **型エラー**: `export async function proxy` に型注釈を付けない場合でも TypeScript は `NextRequest` 推論をしないため、必ず `request: NextRequest` を明示。

## 4. 動作確認と品質保証フロー

1. `npm run build` — ビルドエラーが解消されたことを確認。エラーが出続ける場合はログ全文を依頼者へ共有して指示を仰ぐ。
2. `npm run format`
3. `npm run lint`
4. `npm run test`
5. `npm run dev` を別ターミナルで起動し、Playwright MCP で `http://localhost:2222` を確認（コンソールエラー/主要画面の崩れが無いか）。
6. `npm run storybook` を起動し、Playwright MCP で `http://localhost:6006` を確認（今回変更に関係するコンポーネントに絞って確認すればよい）。
7. すべて成功したら `git status` で `package-lock.json`, `src/edge/country.ts`, `src/proxy.ts`, `package.json`, この設計書のみが変更対象になっていることを確認。

## 5. 想定される質問と回答テンプレ（依頼者確認用）

| 想定質問                                                            | 推奨確認事項                                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `geolocation` がローカルで `undefined` になるがフォールバック必要か | 依頼者へローカル検証方針を質問（例: `x-vercel-ip-country` などヘッダー使用可否） |
| `proxy` へ移行後の matcher 仕様は現行のままで良いか                 | 特別なルーティング追加要望が無いことを明示的に再確認                             |

## 6. まとめ

- 依存追加 → Edge 判定更新 → ファイルリネーム の3段階で対応すれば、Next.js 16 の breaking changes を解消できる。
- すべての実装時に **既存リソースの import パス（例: `@/edge/country`）を正確に記載** し、存在しないファイルやカラムを生成しないこと。少しでも不明点があれば依頼者へ質問してから着手する。
