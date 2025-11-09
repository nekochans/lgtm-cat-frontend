# Issue 358: Linter違反解消 実装計画

## 1. 背景・目的

- ユーザープロンプト `@user-prompt/202511031247_issue358.md` の要請により、リポジトリ全体に散在するフォーマット／Lint違反を解消する。
- 作業手順は必ず「`npm run format` → `npm run lint` → `npm run test` → Playwrightで `http://localhost:2222` → Playwrightで `http://localhost:6006`」の順に実施する。
- 過去に `@biome.jsonc` のルール改変という禁止行為があったため、**設定ファイルを変更せずソースを修正する**ことが最優先課題。

## 2. スコープ

- **対象**: `npm run format` が触る全ファイル（主に `.ts`, `.tsx`, `.css`, `.md`）、`npm run lint` で報告される項目、テストコード、Storybook用ファイル、`package-lock.json` の自動更新。
- **対象外**: 依頼に含まれない機能追加やAPI変更、Lint設定（`biome.jsonc`／`ultracite`プリセットを含む）への手入れ、MSWやSentry等の設定刷新。

## 3. 参照・制約

- `AGENTS.md` の指示（特に `.ts/.tsx` 先頭への `// 絶対厳守：編集前に必ずAI実装ルールを読む` 追記義務、Serena MCP優先、Gemini CLIによるWeb検索手順）。
- `docs/basic-coding-guidelines.md`: Ultraciteの基本方針（型安全性、React 19のベストプラクティス等）。
- `docs/project-coding-guidelines.md`: `type`優先、readonly徹底、Zod v4 関数API利用、カスタムエラー命名など。
- Tailwind利用時は `docs/tailwind-css-v4-coding-guidelines.md` を確認してクラス順序・トークンを守る。
- **不明点は必ず依頼者へ確認**（勝手な判断禁止）。

## 4. 作業フェーズ

### 4.1 事前準備

1. `git status` でクリーンな作業ツリーを確認。残差があれば別ブランチへ退避。
2. `npm ci`（またはプロジェクト標準の `mise`, `corepack` 等があればそれら）で依存を再インストール。
3. `.ts/.tsx` を編集する場面が想定されるため、該当ファイルに先頭コメントがなければ追記する旨をメモしておく。
4. Serena MCPを用いたコード閲覧に慣れておき、探索には `mcp__serena__find_file` や `search_for_pattern` を使う。Markdown/JSONは通常コマンドで閲覧してよい。

### 4.2 自動整形 (`npm run format`)

1. `npm run format` は `ultracite fix` → `npm run prettier` の2段構成。TS/TSX/JS/JSON/CSSに加えMarkdownも整形されるため、変更が大量発生する点を事前共有。
2. 実行後すぐに `git status` を取り、変更ファイル一覧をスクリーンショットまたはテキストで控える。大量変更でレビューが困難な場合は、ディレクトリ単位で `git add -p` を使い分ける。
3. 自動整形でTS/TSXが更新された場合は、**各ファイルの先頭コメント有無を確認し、欠けていれば追加**（Ultraciteはここを自動で入れてくれない）。
4. `package-lock.json` の差分が大きい場合は `npm ci` の再実行で収束するかを確認。不要な依存が増えていないか diff を確認する。

### 4.3 Lint結果の手動修正 (`npm run lint`)

1. `npm run lint` は `ultracite check` + `lint:prettier`。`ultracite check` が失敗した場合はログの `file:line` を控えて1件ずつ対応。
2. 代表的な指摘への対処方針:
   - **未使用import/変数**: 該当行を削除。必要なら `// eslint-disable-next-line` 等で逃げず、正しくロジックを修正。
   - **命名/型ルール**: `docs/project-coding-guidelines.md` を参照し、`type` + `readonly` を守る。Zod v4 ではトップレベル関数を使用。
   - **React 19 ルール**: フック呼び出し順や依存配列を見直す。`useEffect` などで `lint` が示す依存を追加。
   - **Tailwind クラス順**: `docs/tailwind-css-v4-coding-guidelines.md` に沿って並び替え。必要に応じて Tailwind IntelliSense を活用。
   - **アクセシビリティ系**: `alt` 属性や `aria-*` を補う。
3. 同じ種類の警告が多い場合でも、一括置換を行う前に `rg` などで該当箇所を洗い出し、実際に存在するファイルのみ触る（存在しないファイルのimport禁止）。
4. 手修正後は再度 `npm run format`（必要なファイルのみ `npx ultracite fix src/対象.tsx` でも可）をかけ、`npm run lint` が完全にグリーンになるまで繰り返す。

### 4.4 テスト実行 (`npm run test`)

1. 依頼の品質手順3番目として `npm run test` を実行し、Vitestの結果を保存。
2. フレークを避けるため、`CI=true npm run test` などの追加フラグは不要。失敗時はテスト名と失敗内容をログに残し、必要なら関連ファイルのみを修正。

### 4.5 UI確認（Playwright MCP）

1. `npm run dev` を別ターミナルで起動（ポート `2222`）。起動完了ログ（`ready - started server on 0.0.0.0:2222`）を確認。
2. Playwright MCP (`mcp__playwright__browser_navigate`) で `http://localhost:2222` を開き、以下をチェック:
   - 初期表示でエラーが出ていない（ブラウザコンソールに赤ログがない）。
   - `src/app/(default)/page.tsx` が描画する `HomePageContainer` の主要要素（ヒーローセクション、CTAボタン等）が崩れていない。
   - Lint修正で触れたコンポーネントがある場合は、それらの UI 挙動も確認。
3. `npm run storybook` を別ターミナルで起動し、Playwright MCP で `http://localhost:6006` にアクセス。
   - `git status` で変更された `*.stories.tsx` / `src/components/**` / `src/features/**` を抽出し、該当 Story を Storybook で開いて表示崩れやエラーを確認。
   - Storybook 終了後は `Ctrl+C` でプロセスを停止。

### 4.6 仕上げ

1. `git status` で不要な変更がないか再確認。`biome.jsonc` や設定ファイルに変更が入っていないか特に注意。
2. 変更内容・テスト結果・UI確認ログをまとめ、必要ならスクリーンショットを添付。
3. コミットメッセージ例: `chore: fix lint violations via ultracite format`（英語運用の場合）。指示があれば日本語に合わせる。

## 5. リスクと対策

- **大量差分によるレビュー困難**: ディレクトリ単位で段階的に `git add -p`、あるいは `npm run format -- src/components` のように対象を分割。
- **`ultracite fix` での意図しない論理変更**: フォーマッタは構文レベルの変更に留まるが、`??`, `?.` の補正などが入る場合は必ず差分を肉眼確認。
- **Playwright確認の取りこぼし**: 起動URLが2つ（2222/6006）あるため、チェックリストに2URLを明記して交差チェック。
- **トップコメントの入れ忘れ**: Diffレビュー時に `// 絶対厳守：...` が先頭にあるか検索し、不足しているファイルには追記して再度 `npm run format`。
- **依頼者への確認漏れ**: 仕様・範囲で迷ったら必ず質問し、自己判断はしない。

## 6. 成果物

- フォーマット／Lint／テスト／UI確認を完了したコード差分（`biome.jsonc` 無改変）。
- 実行ログ要約（各コマンドの成功を示す抜粋）。
- 必要に応じて Playwright で取得した画面キャプチャ。
