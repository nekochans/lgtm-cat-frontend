# Issue #391: prismjs/components/prism-yaml 型定義エラー修正 - 実装計画書

## 概要

### 目的

`npm run build` 実行時に発生するTypeScriptエラー (TS7016) を修正し、ビルドを成功させる。

### 実装サマリー

**作業内容**: 型定義ファイル1つを新規作成するだけの簡潔な修正

| 項目 | 内容 |
|-----|------|
| 作成ファイル | `src/types/prismjs.d.ts` |
| 作成ファイル数 | 1ファイル |
| 変更ファイル | なし |
| 推定作業時間 | 5分以内 |

### エラー内容

```
Type error: Could not find a declaration file for module 'prismjs/components/prism-yaml'.
'/Users/keita/gitrepos/lgtm-cat-frontend/node_modules/prismjs/components/prism-yaml.js' implicitly has an 'any' type.
```

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/391

### 技術スタック

- **TypeScript**: 5.9.3
- **prismjs**: 1.30.0
- **prism-react-renderer**: 2.4.1
- **Next.js**: 16.1.1

---

## 実装前の確認事項

実装を開始する前に、以下の点を確認すること:

### 1. 現状のエラー確認

```bash
npm run build
```

以下のエラーが表示されることを確認:

```
Type error: Could not find a declaration file for module 'prismjs/components/prism-yaml'.
```

### 2. 開発サーバーの動作確認

```bash
npm run dev
```

開発サーバーが `http://localhost:2222` で正常に起動し、`/docs/mcp` ページが表示されることを確認。
（`npm run dev` では型エラーがあってもホットリロードで動作する）

### 3. 既存の型定義ファイル構造の確認

`src/types/` ディレクトリに既存の型定義ファイルが存在することを確認:

```
src/types/
└── image.d.ts   # 既存: 画像ファイルの型定義
```

新規作成する `prismjs.d.ts` も同じディレクトリに配置し、一貫性を保つ。

---

## 問題の分析

### 発生箇所

**ファイル**: `src/features/docs/components/code-snippet.tsx`
**行番号**: 25行目

```typescript
await import("prismjs/components/prism-yaml");
```

### 原因

1. **型定義が存在しない**: `prismjs/components/prism-yaml` モジュールには型定義ファイル (.d.ts) が存在しない
2. **@types/prismjs の制限**: npm パッケージ `@types/prismjs` をインストールしても、個別の言語コンポーネント（`prism-yaml`、`prism-bash` 等）の型定義は含まれていない
3. **strict モードの影響**: `tsconfig.json` で `strict: true` が設定されているため、暗黙的な `any` 型が許容されない

### prismjs 言語コンポーネントの特性

prismjs の言語コンポーネント（例: `prismjs/components/prism-yaml`）は以下の特性を持つ：

- **副作用のみ**: モジュールは何もエクスポートせず、グローバルな `Prism` オブジェクトに言語定義を追加する副作用のみを持つ
- **型エクスポートなし**: 関数やクラスをエクスポートしないため、詳細な型定義は不要
- **動的import対応**: 動的importで読み込み可能だが、TypeScriptが型を解決できない

---

## 解決策

### 選択した方法: カスタム型定義ファイルの作成

`src/types/prismjs.d.ts` を新規作成し、`prismjs/components/prism-yaml` モジュールの型宣言を追加する。

### 選択理由

| 方法 | メリット | デメリット | 採用 |
|-----|---------|-----------|------|
| カスタム型定義ファイル作成 | 明示的、保守性が高い、拡張容易 | ファイル追加が必要 | ✅ |
| `// @ts-expect-error` コメント | 簡単 | 警告を無視する悪習、保守性低下 | ❌ |
| `skipLibCheck: true` 変更 | 簡単 | 他のライブラリの型チェックも無効化 | ❌ |
| `@types/prismjs` インストールのみ | パッケージで管理 | 言語コンポーネントの型は含まれない | ❌ |
| ワイルドカード型定義 (`prismjs/components/*`) | 将来追加が不要 | 意図しないモジュールも許容、明示性低下 | ❌ |

### 補足: @types/prismjs について

`@types/prismjs` パッケージは Prism 本体（`prismjs`）の型定義を提供するが、以下の制限がある:

- `Prism.highlight()` や `Prism.languages` などのコアAPIの型は提供
- **言語コンポーネント（`prismjs/components/prism-*`）の個別モジュールの型定義は含まれない**
- 理由: 言語コンポーネントは副作用のみでエクスポートがないため、型定義を書いても意味がない

そのため、`@types/prismjs` をインストールしても本エラーは解消されない。

### 型定義ファイルの内容

prismjs の言語コンポーネントは副作用のみのモジュールであるため、空のモジュール宣言で十分である。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * prismjs 言語コンポーネントの型定義
 *
 * prismjs の言語コンポーネント（prism-yaml 等）は、
 * グローバルな Prism オブジェクトに言語定義を追加する副作用のみを持ち、
 * 何もエクスポートしない。そのため、空のモジュール宣言で型エラーを解消する。
 *
 * @see https://prismjs.com/
 * @see https://github.com/PrismJS/prism/tree/master/components
 */
declare module "prismjs/components/prism-yaml";
```

---

## 修正対象ファイル一覧

| ファイルパス | 変更内容 | 新規/既存 |
|-------------|----------|-----------|
| `src/types/prismjs.d.ts` | prismjs言語コンポーネントの型定義を追加 | 新規作成 |

---

## 実装手順

### Step 1: 型定義ファイルの作成

**ファイルパス**: `src/types/prismjs.d.ts`

**注意事項**:
- ファイルは **UTF-8（BOMなし）** で保存すること
- 改行コードは **LF** を使用すること（プロジェクトの他のファイルと同様）
- ファイル名は **小文字のケバブケース** ではなく、**小文字** で `prismjs.d.ts` とする（既存の `image.d.ts` と統一）

**内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * prismjs 言語コンポーネントの型定義
 *
 * prismjs の言語コンポーネント（prism-yaml 等）は、
 * グローバルな Prism オブジェクトに言語定義を追加する副作用のみを持ち、
 * 何もエクスポートしない。そのため、空のモジュール宣言で型エラーを解消する。
 *
 * @see https://prismjs.com/
 * @see https://github.com/PrismJS/prism/tree/master/components
 */
declare module "prismjs/components/prism-yaml";
```

### Step 2: TypeScript設定の確認

`tsconfig.json` の `include` 設定を確認し、`src/types/*.d.ts` が含まれていることを確認する。

現在の設定:
```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ]
}
```

`**/*.ts` により `src/types/prismjs.d.ts` は自動的に含まれるため、追加設定は不要。

---

## 品質管理手順

実装完了後、**必ず以下の順番**で品質管理を実行すること。

### 1. コードフォーマット

```bash
npm run format
```

### 2. Lintチェック

```bash
npm run lint
```

**全てのエラーと警告を解消すること**

### 3. テスト実行

```bash
npm run test
```

**全てのテストがパスすることを確認**

### 4. ビルド実行（最重要）

```bash
npm run build
```

**ビルドが成功することを確認** - これが本修正の主目的

### 5. 開発サーバーでの動作確認

Chrome DevTools MCP を使って以下のURLにアクセスし確認:

#### `http://localhost:2222/docs/mcp`

Chrome DevTools MCP を使用して以下の手順で確認:

1. **ページ表示確認**
   - `navigate_page` でURLにアクセス
   - ページが正常にレンダリングされることを確認

2. **コンソールエラー確認**
   - `list_console_messages` でコンソールメッセージを取得
   - エラー（error）や警告（warn）がないことを確認

3. **YAMLコードブロック確認**
   - `take_snapshot` でページのスナップショットを取得
   - YAMLコードブロックが存在し、シンタックスハイライトが適用されていることを確認

**確認チェックリスト（日本語版）**:

- [ ] ページが正常に表示される
- [ ] YAMLコードブロックが正常にシンタックスハイライトされている
- [ ] コンソールにエラーが出ていない

#### `http://localhost:2222/en/docs/mcp` （英語版）

日本語版と同様の手順で英語版ページも確認する。

**確認チェックリスト（英語版）**:

- [ ] ページが正常に表示される
- [ ] YAMLコードブロックが正常にシンタックスハイライトされている
- [ ] コンソールにエラーが出ていない

---

## トラブルシューティング

### 型定義ファイルを追加してもエラーが解消しない場合

1. **ファイルパスの確認**
   - `src/types/prismjs.d.ts` が正しいパスに作成されているか確認
   - ファイル名のタイポがないか確認

2. **tsconfig.json の include 確認**
   - `**/*.ts` パターンが `.d.ts` ファイルを含むことを確認
   - 必要に応じて `src/types/**/*.d.ts` を明示的に追加

3. **TypeScriptキャッシュのクリア**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   npm run build
   ```

4. **モジュール名の完全一致確認**
   - `declare module "prismjs/components/prism-yaml";` のモジュール名が
   - `import("prismjs/components/prism-yaml")` と完全に一致しているか確認

### ビルドは成功するがYAMLハイライトが動作しない場合

1. **開発者ツールでコンソールエラーを確認**
   - `Prism` オブジェクトが正しく初期化されているか
   - `Prism.languages.yaml` が定義されているか

2. **動的importの実行確認**
   - `initPrismYaml()` 関数が呼び出されているか
   - `isPrismYamlInitialized` フラグが `true` になっているか

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のコードへの変更は禁止** - 型定義ファイルの新規作成のみ
3. **`// @ts-expect-error` や `// @ts-ignore` の使用は禁止**
4. **`tsconfig.json` の `skipLibCheck` を `true` に変更することは禁止**

---

## 成功基準

以下を全て満たすこと:

### 必須要件

- [ ] `npm run build` がエラーなく成功する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする
- [ ] `npm run dev` で開発サーバーが正常起動する

### 動作確認

- [ ] `/docs/mcp` （日本語版）ページが正常に表示される
- [ ] `/en/docs/mcp` （英語版）ページが正常に表示される
- [ ] YAMLコードブロックのシンタックスハイライトが動作する

---

## 将来の拡張性

本実装計画では `prism-yaml` のみを対象としているが、将来的に他の言語コンポーネントを追加する場合は、同じ型定義ファイルに宣言を追加すれば良い。

```typescript
// 将来の拡張例
declare module "prismjs/components/prism-yaml";
declare module "prismjs/components/prism-bash";
declare module "prismjs/components/prism-json";
declare module "prismjs/components/prism-typescript";
```

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### 実装

- [ ] `src/types/prismjs.d.ts` を新規作成
- [ ] ファイル先頭に必須コメントを記載
- [ ] JSDocコメントで型定義の目的を説明
- [ ] `declare module "prismjs/components/prism-yaml";` を宣言

### 品質管理

- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] `npm run build` が成功
- [ ] Chrome DevTools MCP で `/docs/mcp` （日本語版）の表示確認完了
- [ ] Chrome DevTools MCP で `/en/docs/mcp` （英語版）の表示確認完了

### 最終確認

- [ ] ビルドが成功する
- [ ] 既存機能に影響がない
- [ ] 不要な変更が含まれていない

---

## 参考資料

- [TypeScript TS7016エラーの解決方法](https://pjausovec.medium.com/how-to-fix-error-ts7016-could-not-find-a-declaration-file-for-module-xyz-has-an-any-type-ecab588800a8)
- [@types/prismjs - npm](https://www.npmjs.com/package/@types/prismjs)
- [PrismJS Discussion: How to import types in typescript](https://github.com/orgs/PrismJS/discussions/3330)
- [W3Tutorials: How to Fix TS7016](https://www.w3tutorials.net/blog/how-to-properly-declare-a-module-ts7016/)

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0 | 2026-01-18 | 初版作成 |
| 1.1 | 2026-01-18 | レビュー1回目: 実装前確認事項追加、トラブルシューティングセクション追加、Chrome DevTools MCPによる動作確認手順の具体化 |
| 1.2 | 2026-01-18 | レビュー2回目: 代替案にワイルドカード型定義を追加、@types/prismjs の補足情報追加、ファイル作成時の注意事項追加、英語版ページの動作確認手順追加 |
| 1.3 | 2026-01-18 | レビュー3回目（最終）: 実装サマリーセクション追加、成功基準とチェックリストに英語版ページ確認を追加、全体の整合性確認完了 |
