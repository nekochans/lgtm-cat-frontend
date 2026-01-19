# Issue #391: MCPドキュメントページの改善 - 詳細実装計画書

## 概要

### 目的

既に実装されているMCPドキュメントページに対して、以下の4つの改善を行う:

1. **コードブロックからコードがはみ出してしまう問題の修正**
2. **MCPのメニュー文言変更** - 「MCPの使い方」「How to use MCP」→「MCP」に変更
3. **コードをTSファイルから外部ファイルに分離** - GitHubActionsのYAMLやJSONを純粋なファイルとして管理
4. **シンタックスハイライトの導入** - コードブロックに言語別のカラーリングを適用

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/391

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: HeroUI v2.8.7 (Snippet コンポーネント)
- **シンタックスハイライト**: prism-react-renderer (新規導入)
- **サーバー限定パッケージ**: server-only (新規導入)

---

## 現状分析

### 問題1: コードブロックからコードがはみ出す

**原因**: `src/features/docs/components/code-snippet.tsx` の `whitespace-pre` スタイルにより、長い行が折り返されずに親要素からはみ出している。

**現在のコード** (code-snippet.tsx:34-48):
```typescript
return (
  <Snippet
    className="w-full max-w-full"
    classNames={{
      base: "bg-orange-50 border border-orange-200",
      pre: "font-mono text-orange-900 whitespace-pre text-sm",
      copyButton: "text-orange-600 hover:text-orange-800",
      content: "overflow-x-auto",
    }}
    hideSymbol
    variant="flat"
  >
    {code}
  </Snippet>
);
```

**解決策**: **横スクロール優先**で対応します。`whitespace-pre` を維持しつつ、`base` に `overflow-hidden` を追加して親要素からのはみ出しを防止し、`content` に `overflow-x-auto` と `max-w-full` を適用して横スクロールを有効にします。

**方針決定の理由**:
- コードの可読性を保つため、折り返しではなく横スクロールを採用
- YAML等のインデントが意味を持つコードでは、折り返しにより構造が分かりづらくなる
- モバイルでも横スクロールで対応し、UXを損なわない

### 問題2: MCPメニューの文言

**現在の文言**:
- 日本語: 「MCPの使い方」
- 英語: 「How to Use MCP」

**変更後**:
- 日本語: 「MCP」
- 英語: 「MCP」

**対象ファイル**:
- `src/components/header-i18n.ts` (115-124行目)
- `src/features/docs/functions/mcp.ts` (10行目、17行目)

### 問題3: コードを外部ファイルに分離

**現状**: `src/features/docs/functions/mcp-text.ts` 内で以下のコードが文字列として管理されている:
- MCP Server Configuration (JSON)
- GitHub Actions Workflow (YAML) - Claude Code用
- GitHub Actions Workflow (YAML) - Codex用

**変更後のファイル構成**:
```
src/
├── app/(default)/docs/mcp/
│   └── page.tsx                             # 非同期ファイル読み込みをここで実行
├── features/docs/
│   ├── code-examples/
│   │   └── mcp/
│   │       ├── mcp-servers.json              # MCP設定ファイル例 (唯一のソース)
│   │       ├── claude-auto-review.yml        # Claude Code用ワークフロー (唯一のソース)
│   │       └── codex-auto-review.yml         # Codex用ワークフロー (唯一のソース)
│   ├── functions/
│   │   ├── mcp-text.ts                       # getMcpTexts は同期関数のまま維持
│   │   └── mcp-code-loader.ts                # **新規作成** - 外部ファイル読み込み関数 (server-only)
│   └── components/
│       └── docs-mcp-page.tsx                 # コード文字列をpropsで受け取る
```

**アーキテクチャ変更のポイント**:
1. **非同期ファイル読み込みは `page.tsx` で実行**
   - Next.js App RouterのServer Componentとして `page.tsx` が非同期処理を担当
   - `Promise.all` で複数ファイルをパラレル取得し、パフォーマンスを最適化
   - Next.jsの強力なキャッシュ機能を活用可能

2. **`getMcpTexts` は同期関数のまま維持**
   - 既存テストへの影響を最小化
   - 外部ファイルのコードは `page.tsx` から props として渡される

3. **ファイル読み込み関数は別モジュールに分離**
   - `mcp-code-loader.ts` に配置し、`server-only` で明示的にサーバー限定
   - 関心の分離によりテスタビリティと保守性が向上

**Next.js公式ドキュメントに基づく技術的な実現方法**:

参照: [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

1. **Server Componentでの非同期I/O**: Server Componentsでは `fetch` API、ORM/DB、Node.js API (`fs`) などの非同期I/Oが使用可能
2. **パラレルデータフェッチ**: `Promise.all` を使用して複数のリクエストを同時に開始し、効率的に取得
3. **React `cache()` による重複排除**: `fetch` 以外のデータソース（ファイルシステムなど）には React の `cache` 関数で重複読み込みを防止
4. **`server-only` パッケージ**: サーバーでのみ実行されることを保証し、Client Componentからの誤った参照を防止

この方式のメリット:
- **単一ソース**: 二重管理によるドリフト（乖離）のリスクを完全に排除
- 純粋なJSON/YAMLファイルとして管理できる (エディタの構文チェック、フォーマット機能が使える)
- **構成が簡潔**: webpack設定や型定義ファイルが不要
- **Vitest環境の懸念なし**: Next.js webpack設定に依存しないため、テスト環境で問題が発生しない
- **既存テストへの影響なし**: `getMcpTexts` は同期関数のまま維持
- **パフォーマンス最適化**: `Promise.all` によるパラレル取得 + React `cache()` による重複排除
- **サーバー限定の明示**: `server-only` パッケージにより Client Component からの誤参照を防止

### 問題4: シンタックスハイライトの導入

**選定ライブラリ**: `prism-react-renderer`

**選定理由**:
- 軽量 (必要な言語のみバンドル可能)
- React-firstな設計でrender propsパターン採用
- VS Codeライクなテーマを提供
- High Reputation、活発にメンテナンスされている

**対象言語**: json, yaml

---

## 修正対象ファイル一覧

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/docs/components/code-snippet.tsx` | コードはみ出し修正 + シンタックスハイライト対応 |
| `src/components/header-i18n.ts` | MCPメニュー文言変更 |
| `src/features/docs/functions/mcp.ts` | MCPメニュー文言変更 |
| `src/features/docs/functions/mcp-text.ts` | 文字列定数 (`sseDirectConfigCode`, `claudeWorkflowCode`, `codexWorkflowCode`) の削除 |
| `src/features/docs/functions/mcp-code-loader.ts` | **新規作成** - 外部ファイル読み込み関数 (server-only) |
| `src/features/docs/code-examples/mcp/mcp-servers.json` | **新規作成** - MCP設定JSONファイル (唯一のソース) |
| `src/features/docs/code-examples/mcp/claude-auto-review.yml` | **新規作成** - Claude Codeワークフロー (唯一のソース) |
| `src/features/docs/code-examples/mcp/codex-auto-review.yml` | **新規作成** - Codexワークフロー (唯一のソース) |
| `src/features/docs/components/docs-mcp-page.tsx` | CodeSnippetにlanguage propを追加 + 外部コードをpropsで受け取る |
| `src/app/(default)/docs/mcp/page.tsx` | 非同期ファイル読み込み + `Promise.all` でパラレル取得 |
| `src/app/(default)/en/docs/mcp/page.tsx` | 非同期ファイル読み込み + `Promise.all` でパラレル取得 |
| `package.json` | prism-react-renderer, prismjs, server-only 追加 |
| `src/features/docs/components/docs-mcp-page.stories.tsx` | externalCodes props の追加（mockデータ含む） |

---

## 依存関係の追加

### prism-react-renderer, prismjs, server-only のインストール

```bash
npm install prism-react-renderer prismjs server-only
```

**各パッケージの役割**:
- **prism-react-renderer**: React向けシンタックスハイライトライブラリ（Highlight コンポーネント提供）
- **prismjs**: カスタム言語（YAML等）の登録に必要（prism-react-rendererのデフォルトバンドルに含まれない言語を使用するため必須）
- **server-only**: サーバー限定モジュールの明示に使用

**バージョン**: 最新の安定版を使用

---

## 設計方針

### 方針1: コードはみ出し修正 (横スクロール優先)

CodeSnippetコンポーネントのスタイリングを以下のように修正:

1. `whitespace-pre` を維持してコードの構造を保持
2. `base` に `overflow-hidden` を追加して親要素からのはみ出しを防止
3. `content` に `overflow-x-auto` と `max-w-full` を追加して横スクロールを有効化
4. モバイル表示でも横スクロールで対応 (折り返しではなくスクロール)

### 方針2: シンタックスハイライト対応

1. `prism-react-renderer` の `Highlight` コンポーネントを使用
2. テーマは `themes.github` (ライトテーマ) をベースにカスタマイズ
3. JSONとYAML言語のサポート追加
4. **YAML言語登録は動的import + 初期化完了後に描画** (順序保証のため)
5. **HeroUIのSnippetコンポーネントのコピー機能を維持** (UIの一貫性を保つため)
6. **原文保持**: `trim()` は使用せず、コードの原文をそのまま渡す

**YAML言語登録の実装** (code-snippet.tsx内で実施):
```typescript
import { useEffect, useState } from "react";
import { Highlight, Prism, themes } from "prism-react-renderer";

// YAML言語の初期化状態を管理
let isPrismYamlInitialized = false;

/**
 * YAML言語をPrismに登録する初期化関数
 * 動的importを使用して順序保証を確保
 */
async function initPrismYaml(): Promise<void> {
  if (isPrismYamlInitialized) return;

  // グローバルPrismを設定してから言語モジュールをインポート
  (typeof globalThis !== "undefined" ? globalThis : window).Prism = Prism;
  await import("prismjs/components/prism-yaml");
  isPrismYamlInitialized = true;
}
```

**順序保証の方針**:
- ESMの静的importは評価順序が保証されないため、**動的import + 初期化完了後に描画**を標準とする
- `globalThis.Prism = Prism` の後に `await import("prismjs/components/prism-yaml")` を行い、順序保証を明示
- `isPrismReady` を state で管理し、初期化完了まで `HighlightedCode` を描画しない
- **`language` 変更時の再評価**: `isPrismReady` の初期値は `language` に依存するため、`language` 変更時に `useEffect` で状態を同期する
- `require()` ではなく動的 `import` を使用してESM互換性を確保

### 方針3: 外部ファイル管理 (page.tsx での非同期読み込み + Promise.all パラレル取得)

1. `.json` と `.yml` ファイルを `src/features/docs/code-examples/mcp/` に配置 (**唯一のソースとして管理**)
2. `src/features/docs/functions/mcp-code-loader.ts` に外部ファイル読み込み関数を配置
3. **`server-only` をインポートしてサーバー限定を明示**
4. React の `cache()` を使用して同一リクエスト内での重複読み込みを防止
5. `page.tsx` で `Promise.all` を使って複数ファイルをパラレル取得
6. `DocsMcpPage` コンポーネントには外部コードを props として渡す
7. `getMcpTexts` は同期関数のまま維持（既存テストへの影響なし）
8. webpack設定や型定義ファイルは**不要** (構成が簡潔)

---

## 変更内容

### 1. src/features/docs/components/code-snippet.tsx の全面書き換え

**ファイルパス**: `src/features/docs/components/code-snippet.tsx`

**変更規模**: 現在の約50行のシンプルな実装を、シンタックスハイライト機能を含む約130行の実装に全面書き換えします。コードはみ出し修正とシンタックスハイライト対応を同時に実装します。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { useEffect, useState } from "react";
import { Snippet } from "@heroui/react";
import { Highlight, Prism, themes } from "prism-react-renderer";

// YAML言語の初期化状態を管理（モジュールスコープで共有）
let isPrismYamlInitialized = false;

/**
 * YAML言語をPrismに登録する初期化関数
 * 動的importを使用して順序保証を確保
 */
async function initPrismYaml(): Promise<void> {
  if (isPrismYamlInitialized) return;

  // グローバルPrismを設定してから言語モジュールをインポート
  (typeof globalThis !== "undefined" ? globalThis : window).Prism = Prism;
  await import("prismjs/components/prism-yaml");
  isPrismYamlInitialized = true;
}

// サポートする言語の型定義
type SupportedLanguage = "json" | "yaml" | "typescript" | "plaintext";

interface CodeSnippetProps {
  readonly code: string;
  readonly variant?: "block" | "inline";
  readonly language?: SupportedLanguage;
}

/**
 * 言語に応じたPrism言語名を返す
 */
function getPrismLanguage(
  language: SupportedLanguage
): "json" | "yaml" | "typescript" | "markup" {
  switch (language) {
    case "json":
      return "json";
    case "yaml":
      return "yaml";
    case "typescript":
      return "typescript";
    case "plaintext":
    default:
      return "markup";
  }
}

/**
 * シンタックスハイライト済みのコードをレンダリングする内部コンポーネント
 * 原文保持: trim() は使用せず、コードの原文をそのまま渡す
 */
function HighlightedCode({
  code,
  language,
}: {
  readonly code: string;
  readonly language: "json" | "yaml" | "typescript" | "markup";
}) {
  return (
    <Highlight code={code} language={language} theme={themes.github}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => {
            const lineProps = getLineProps({ line });
            return (
              <div key={i} {...lineProps}>
                {line.map((token, key) => {
                  const tokenProps = getTokenProps({ token });
                  return <span key={key} {...tokenProps} />;
                })}
              </div>
            );
          })}
        </>
      )}
    </Highlight>
  );
}

/**
 * コードブロックを表示するクライアントコンポーネント
 * HeroUI の Snippet コンポーネントと prism-react-renderer を組み合わせて使用
 * Snippetの標準コピーボタン機能を維持してUIの一貫性を保つ
 * 原文保持: trim() は使用せず、コードの原文をそのまま渡す
 */
export function CodeSnippet({
  code,
  variant = "block",
  language = "plaintext",
}: CodeSnippetProps) {
  // YAML言語の初期化完了を管理するstate
  const [isPrismReady, setIsPrismReady] = useState(
    // JSON/typescript/plaintextはデフォルトで利用可能、YAMLのみ初期化が必要
    language !== "yaml" || isPrismYamlInitialized
  );

  // language変更時にisPrismReadyを再評価（レビュー指摘対応）
  // 初期値はlanguage依存のため、language変更時に状態を同期する必要がある
  useEffect(() => {
    setIsPrismReady(language !== "yaml" || isPrismYamlInitialized);
  }, [language]);

  // YAML言語の場合は初期化を実行
  useEffect(() => {
    if (language === "yaml" && !isPrismYamlInitialized) {
      initPrismYaml().then(() => {
        setIsPrismReady(true);
      });
    }
  }, [language]);

  if (variant === "inline") {
    return (
      <Snippet
        className="w-fit"
        classNames={{
          base: "bg-white border border-orange-200",
          pre: "font-mono text-orange-900",
          copyButton: "text-orange-600 hover:text-orange-800",
        }}
        hideSymbol
        variant="flat"
      >
        {code}
      </Snippet>
    );
  }

  // プレーンテキストの場合はシンタックスハイライトなし
  if (language === "plaintext") {
    return (
      <Snippet
        className="w-full max-w-full"
        classNames={{
          base: "bg-orange-50 border border-orange-200 overflow-hidden",
          pre: "font-mono text-orange-900 whitespace-pre text-sm",
          copyButton: "text-orange-600 hover:text-orange-800",
          content: "overflow-x-auto max-w-full",
        }}
        hideSymbol
        variant="flat"
      >
        {code}
      </Snippet>
    );
  }

  // シンタックスハイライト付きのコードブロック
  // HeroUI Snippetのコピー機能を維持しつつ、内部でHighlightを使用
  const prismLanguage = getPrismLanguage(language);

  return (
    <Snippet
      className="w-full max-w-full"
      classNames={{
        base: "bg-orange-50 border border-orange-200 overflow-hidden",
        pre: "font-mono whitespace-pre text-sm",
        copyButton: "text-orange-600 hover:text-orange-800",
        content: "overflow-x-auto max-w-full",
      }}
      codeString={code}
      hideSymbol
      variant="flat"
    >
      {isPrismReady ? (
        <HighlightedCode code={code} language={prismLanguage} />
      ) : (
        // YAML初期化完了まではプレーンテキストとして表示
        // Snippetの標準preに任せるため、codeをそのまま渡す
        code
      )}
    </Snippet>
  );
}
```

**ポイント**:
- **YAML言語登録**: `initPrismYaml()` 関数を用意し、動的importで順序保証。`useEffect` で初期化を実行し、`isPrismReady` stateで初期化完了を管理
- **language変更時の再評価**: `isPrismReady` の初期値は `language` に依存するため、`language` 変更時に `useEffect` で状態を同期する（将来的な拡張への対応）
- **初期化完了後に描画**: `isPrismReady` が `false` の間は `code` をそのまま渡して Snippet の標準 `pre` に任せ、初期化完了後にシンタックスハイライトを適用（二重 `pre` ネストを回避）
- **Snippetのコピー機能維持**: `codeString` propを使用してSnippetの標準コピーボタンを活用
- **横スクロール対応**: `overflow-hidden` + `overflow-x-auto` で確実にはみ出しを防止
- **原文保持**: `trim()` は使用せず、コードの原文をそのまま渡す

---

### 2. src/components/header-i18n.ts の修正

**ファイルパス**: `src/components/header-i18n.ts`

**変更箇所** (114-123行目):

```typescript
// 変更前
export function mcpText(language: Language): string {
  switch (language) {
    case "ja":
      return "MCPの使い方";
    case "en":
      return "How to Use MCP";
    default:
      return assertNever(language);
  }
}

// 変更後
export function mcpText(language: Language): string {
  switch (language) {
    case "ja":
      return "MCP";
    case "en":
      return "MCP";
    default:
      return assertNever(language);
  }
}
```

---

### 3. src/features/docs/functions/mcp.ts の修正

**ファイルパス**: `src/features/docs/functions/mcp.ts`

**変更箇所** (6-21行目):

```typescript
// 変更前
export function createMcpLinksFromLanguages(language: Language): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "How to Use MCP",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    case "ja":
      return {
        text: "MCPの使い方",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    default:
      return assertNever(language);
  }
}

// 変更後
export function createMcpLinksFromLanguages(language: Language): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "MCP",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    case "ja":
      return {
        text: "MCP",
        link: createIncludeLanguageAppPath("docs-mcp", language),
      };
    default:
      return assertNever(language);
  }
}
```

---

### 4. 外部コードファイルの新規作成

#### 4-1. src/features/docs/code-examples/mcp/mcp-servers.json

**ファイルパス**: `src/features/docs/code-examples/mcp/mcp-servers.json`

```json
{
  "mcpServers": {
    "lgtmeow": {
      "type": "sse",
      "url": "https://api.lgtmeow.com/sse"
    }
  }
}
```

#### 4-2. src/features/docs/code-examples/mcp/claude-auto-review.yml

**ファイルパス**: `src/features/docs/code-examples/mcp/claude-auto-review.yml`

```yaml
name: Claude Code Auto Review on PR Open

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-auto-review:
    runs-on: ubuntu-latest
    concurrency:
      group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
      cancel-in-progress: false
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            リポジトリ: ${{ github.repository }}
            PR番号: ${{ github.event.pull_request.number }}

            このPRの変更内容をレビューしてください。

            レビュー完了後、必ず mcp__github__add_issue_comment ツールを使用して、
            上記のPR番号にレビュー結果をコメントとして投稿してください。

            マージ可能と判断した場合は、
            mcp__lgtmeow__get_random_lgtm_markdown で LGTM画像を取得し、
            レビューコメントに含めてください。

            問題がある場合は、改善点を具体的に指摘してください。

          claude_args: |
            --mcp-config .github/mcp-servers.json
            --allowedTools "Bash(git diff),Read,LS,Glob,Grep,mcp__github__pull_request_read,mcp__github__get_pull_request,mcp__github__get_pull_request_files,mcp__github__get_pull_request_diff,mcp__github__add_issue_comment,mcp__github__get_issue,mcp__lgtmeow__get_random_lgtm_markdown"

        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 4-3. src/features/docs/code-examples/mcp/codex-auto-review.yml

**ファイルパス**: `src/features/docs/code-examples/mcp/codex-auto-review.yml`

```yaml
name: Codex Auto Review on PR Open

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  codex:
    runs-on: ubuntu-latest
    concurrency:
      group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
      cancel-in-progress: false
    permissions:
      contents: read
    outputs:
      final_message: ${{ steps.run_codex.outputs.final-message }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge

      - name: Pre-fetch base and head refs for the PR
        run: |
          git fetch --no-tags origin \
            ${{ github.event.pull_request.base.ref }} \
            +refs/pull/${{ github.event.pull_request.number }}/head

      - name: Install mcp-proxy for SSE bridge
        run: pip install mcp-proxy

      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          codex-args: |
            --config mcp_servers={"lgtmeow"={"command"="mcp-proxy","args"=["https://api.lgtmeow.com/sse"]}}
          prompt: |
            リポジトリ: ${{ github.repository }}
            PR番号: ${{ github.event.pull_request.number }}

            このPRの変更内容をレビューしてください。

            マージ可能な品質と判断した場合は、lgtmeow MCPサーバーの get_random_lgtm_markdown でLGTM画像を取得し、レビュー結果に含めてください。
            問題がある場合は、改善点を具体的に指摘してください。

            PRタイトルと本文:
            ----
            ${{ github.event.pull_request.title }}
            ${{ github.event.pull_request.body }}

  post_feedback:
    runs-on: ubuntu-latest
    needs: codex
    if: needs.codex.outputs.final_message != ''
    permissions:
      issues: write
      pull-requests: write

    steps:
      - name: Post review comment to PR
        uses: actions/github-script@v7
        env:
          CODEX_FINAL_MESSAGE: ${{ needs.codex.outputs.final_message }}
        with:
          github-token: ${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            });
```

---

### 5. src/features/docs/functions/mcp-code-loader.ts の新規作成

**ファイルパス**: `src/features/docs/functions/mcp-code-loader.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

// server-only: このモジュールはサーバーでのみ実行される
// Client Componentからインポートしようとするとビルドエラーになる
import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";

// 外部ファイルからコードサンプルを読み込み (単一ソース運用)
// code-examples/mcp/ ディレクトリの .json/.yml ファイルを唯一のソースとして管理
const codeExamplesDir = join(
  process.cwd(),
  "src/features/docs/code-examples/mcp"
);

/**
 * MCP設定ファイルのサンプルを読み込む (SSE直接サポート版)
 * ソース: code-examples/mcp/mcp-servers.json
 * React cache() で同一リクエスト内の重複読み込みを防止
 */
export const loadMcpServersJson = cache(async (): Promise<string> => {
  const content = await readFile(
    join(codeExamplesDir, "mcp-servers.json"),
    "utf-8"
  );
  return JSON.stringify(JSON.parse(content), null, 2);
});

/**
 * Claude Code Action用のGitHub Actionsワークフローを読み込む
 * ソース: code-examples/mcp/claude-auto-review.yml
 * React cache() で同一リクエスト内の重複読み込みを防止
 */
export const loadClaudeAutoReviewYaml = cache(async (): Promise<string> => {
  return await readFile(
    join(codeExamplesDir, "claude-auto-review.yml"),
    "utf-8"
  );
});

/**
 * Codex Action用のGitHub Actionsワークフローを読み込む
 * ソース: code-examples/mcp/codex-auto-review.yml
 * React cache() で同一リクエスト内の重複読み込みを防止
 */
export const loadCodexAutoReviewYaml = cache(async (): Promise<string> => {
  return await readFile(
    join(codeExamplesDir, "codex-auto-review.yml"),
    "utf-8"
  );
});

/**
 * 外部コードファイルの型定義
 * DocsMcpPageコンポーネントにpropsとして渡す
 */
export interface McpExternalCodes {
  readonly mcpServersJson: string;
  readonly claudeAutoReviewYaml: string;
  readonly codexAutoReviewYaml: string;
}

/**
 * 全ての外部コードファイルをパラレルで読み込む
 * page.tsxから呼び出してPromise.allで並列取得
 * React cache()により同一リクエスト内で複数回呼び出しても重複読み込みしない
 */
export async function loadAllMcpExternalCodes(): Promise<McpExternalCodes> {
  const [mcpServersJson, claudeAutoReviewYaml, codexAutoReviewYaml] =
    await Promise.all([
      loadMcpServersJson(),
      loadClaudeAutoReviewYaml(),
      loadCodexAutoReviewYaml(),
    ]);

  return {
    mcpServersJson,
    claudeAutoReviewYaml,
    codexAutoReviewYaml,
  };
}
```

**ポイント**:
- **`server-only` をインポート**: Client Componentからの誤ったインポートを防止
- **React `cache()` で重複排除**: 同一リクエスト内での重複読み込みを防止
- **`Promise.all` でパラレル取得**: 複数ファイルを並列に読み込んでパフォーマンス最適化
- **型定義 `McpExternalCodes`**: propsとして渡す際の型安全性を確保

---

### 6. src/features/docs/functions/mcp-text.ts の修正

**ファイルパス**: `src/features/docs/functions/mcp-text.ts`

#### 6-1. 削除する定数 (65-161行目付近)

以下の3つの定数を削除:

- `sseDirectConfigCode` (65-72行目)
- `claudeWorkflowCode` (112-161行目)
- `codexWorkflowCode` (163行目以降)

**注意**: 以下の定数は `mcpServerUrl` 変数を使って動的生成しているため、そのまま維持:
- `mcpServerUrl` (63行目)
- `nodeConfigCode` (74-81行目)
- `pythonConfigCode` (83-93行目)
- `lgtmImagesResponseExample` (95-106行目)
- `markdownResponseExample` (108-110行目)

#### 6-2. getMcpTexts関数の修正

`getMcpTexts` 関数は**同期関数のまま維持**します。外部ファイルのコードは `page.tsx` から props として渡されるため、この関数内では外部ファイルを読み込みません。

代わりに、以下のプレースホルダー値を設定し、実際の値は `DocsMcpPage` コンポーネントで上書きします:

```typescript
// getMcpTexts内の変更箇所（日本語版・英語版両方）
// 変更前
mcpConfigCode: sseDirectConfigCode,
workflowCode: claudeWorkflowCode,
// ...
workflowCode: codexWorkflowCode,

// 変更後（プレースホルダー）
// 実際の値は page.tsx から props として渡される
mcpConfigCode: "", // page.tsxからpropsで上書き
workflowCode: "",  // page.tsxからpropsで上書き
```

**重要**: `getMcpTexts` は同期関数のまま維持することで、既存テストへの影響を完全に排除します。

---

### 7. src/features/docs/components/docs-mcp-page.tsx の修正

**ファイルパス**: `src/features/docs/components/docs-mcp-page.tsx`

#### 7-1. propsの追加

**注意**: 既存コードでは `Props` という名前で定義されています。本修正では `DocsMcpPageProps` にリネームし、`externalCodes` プロパティを追加します。

```typescript
// 変更前（現在のコード）
interface Props {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
}

// 変更後
// 重要: import type を使用してサーバー専用モジュールの混入を防止
import type { McpExternalCodes } from "../functions/mcp-code-loader";

// Props から DocsMcpPageProps にリネーム
interface DocsMcpPageProps {
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly language: Language;
  readonly externalCodes: McpExternalCodes;
}
```

#### 7-2. テキストデータの外部コード合成（不変な方法で）

**重要**: `getMcpTexts` で返されたオブジェクトを直接ミューテーションせず、不変な合成（スプレッド構文でコピー）で新しいオブジェクトを作成します。これにより副作用を防止します。

```typescript
export function DocsMcpPage({
  currentUrlPath,
  language,
  externalCodes,
}: DocsMcpPageProps) {
  const baseTexts = getMcpTexts(language);

  // 不変な合成で外部コードをマージ（直接ミューテーションを避ける）
  const texts = {
    ...baseTexts,
    clientConfig: {
      ...baseTexts.clientConfig,
      patterns: baseTexts.clientConfig.patterns.map((pattern, index) =>
        index === 0
          ? { ...pattern, code: externalCodes.mcpServersJson }
          : pattern
      ),
    },
    githubActions: {
      ...baseTexts.githubActions,
      examples: baseTexts.githubActions.examples.map((example, index) => {
        if (index === 0) {
          // Claude Code Action用
          return {
            ...example,
            mcpConfigCode: externalCodes.mcpServersJson,
            workflowCode: externalCodes.claudeAutoReviewYaml,
          };
        }
        if (index === 1) {
          // Codex Action用
          return {
            ...example,
            workflowCode: externalCodes.codexAutoReviewYaml,
          };
        }
        return example;
      }),
    },
  };

  // ... 以降は既存のコード（textsを使用）
}
```

#### 7-3. CodeSnippetにlanguage propを追加

```typescript
// ToolSection内 (行86付近)
// 変更前
<CodeSnippet code={tool.responseExample} />
// 変更後
<CodeSnippet code={tool.responseExample} language="json" />

// ConfigPatternSection内 (行103付近)
// 変更前
<CodeSnippet code={pattern.code} />
// 変更後
<CodeSnippet code={pattern.code} language="json" />

// GitHubActionsExampleSection内 (行141, 149, 155付近)
// folderStructure
<CodeSnippet code={example.folderStructure} language="plaintext" />
// mcpConfigCode
<CodeSnippet code={example.mcpConfigCode} language="json" />
// workflowCode
<CodeSnippet code={example.workflowCode} language="yaml" />
```

---

### 8. src/app/(default)/docs/mcp/page.tsx の修正

**ファイルパス**: `src/app/(default)/docs/mcp/page.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsMcpPage } from "@/features/docs/components/docs-mcp-page";
import { loadAllMcpExternalCodes } from "@/features/docs/functions/mcp-code-loader";
import { appName, metaTagList } from "@/features/meta-tag";
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
import {
  appBaseUrl,
  createIncludeLanguageAppPath,
  i18nUrlList,
} from "@/features/url";

const language = "ja";

export const metadata: Metadata = {
  title: metaTagList(language)["docs-mcp"].title,
  openGraph: {
    title: metaTagList(language)["docs-mcp"].title,
    url: metaTagList(language)["docs-mcp"].ogpTargetUrl,
    siteName: appName,
    images: [
      {
        url: metaTagList(language)["docs-mcp"].ogpImgUrl,
        width: 1200,
        height: 630,
        alt: metaTagList(language)["docs-mcp"].title,
      },
    ],
    locale: convertLanguageToOpenGraphLocale(language),
    type: "website",
  },
  metadataBase: new URL(appBaseUrl()),
  alternates: {
    canonical: i18nUrlList["docs-mcp"].ja,
    languages: {
      ja: i18nUrlList["docs-mcp"].ja,
      en: i18nUrlList["docs-mcp"].en,
    },
  },
};

const DocsMcp: NextPage = async () => {
  // 外部コードファイルをパラレルで読み込み
  // Promise.all により複数ファイルを並列取得してパフォーマンス最適化
  const externalCodes = await loadAllMcpExternalCodes();

  return (
    <DocsMcpPage
      currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
      externalCodes={externalCodes}
      language={language}
    />
  );
};

export default DocsMcp;
```

**ポイント**:
- **`async` コンポーネント**: Next.js App RouterのServer Componentは非同期関数として定義可能
- **`loadAllMcpExternalCodes()` の呼び出し**: 内部で `Promise.all` を使用してパラレル取得
- **`externalCodes` を props として渡す**: `DocsMcpPage` コンポーネントで外部コードを使用

---

### 9. src/app/(default)/en/docs/mcp/page.tsx の修正

**ファイルパス**: `src/app/(default)/en/docs/mcp/page.tsx`

日本語版と同様の修正を適用:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata, NextPage } from "next";
import { DocsMcpPage } from "@/features/docs/components/docs-mcp-page";
import { loadAllMcpExternalCodes } from "@/features/docs/functions/mcp-code-loader";
// ... 省略（既存のimport）

const language = "en";

// ... metadata は既存のまま

const DocsMcp: NextPage = async () => {
  // 外部コードファイルをパラレルで読み込み
  const externalCodes = await loadAllMcpExternalCodes();

  return (
    <DocsMcpPage
      currentUrlPath={createIncludeLanguageAppPath("docs-mcp", language)}
      externalCodes={externalCodes}
      language={language}
    />
  );
};

export default DocsMcp;
```

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: 依存関係の追加

1. `npm install prism-react-renderer prismjs server-only` を実行

### Phase 2: code-snippet.tsx の全面書き換え

2. `src/features/docs/components/code-snippet.tsx` を全面書き換え
   - コードはみ出し修正（overflow-hidden + overflow-x-auto）
   - シンタックスハイライト機能追加（prism-react-renderer使用）
   - YAML言語の動的登録機能追加
   - language prop の追加

### Phase 3: メニュー文言変更

3. `src/components/header-i18n.ts` の `mcpText` 関数を修正
4. `src/features/docs/functions/mcp.ts` の `createMcpLinksFromLanguages` 関数を修正

### Phase 4: 外部ファイル作成 (page.tsx での非同期読み込み + Promise.all パラレル取得)

5. `src/features/docs/code-examples/mcp/` ディレクトリを作成
6. `mcp-servers.json` を作成 (唯一のソース)
7. `claude-auto-review.yml` を作成 (唯一のソース)
8. `codex-auto-review.yml` を作成 (唯一のソース)
9. `src/features/docs/functions/mcp-code-loader.ts` を新規作成:
   - `server-only` をインポートしてサーバー限定を明示
   - React の `cache()` で重複読み込みを防止
   - `loadAllMcpExternalCodes()` で `Promise.all` によるパラレル取得
10. `src/features/docs/functions/mcp-text.ts` の文字列定数を削除
11. `src/features/docs/components/docs-mcp-page.tsx` に `externalCodes` props を追加
12. `src/app/(default)/docs/mcp/page.tsx` を `async` コンポーネントに変更し、外部コードを読み込み
13. `src/app/(default)/en/docs/mcp/page.tsx` も同様に修正

### Phase 5: docs-mcp-page.tsx の language prop 追加

14. `src/features/docs/components/docs-mcp-page.tsx` の `CodeSnippet` コンポーネント呼び出しに `language` prop を追加
    - ToolSection内: `language="json"`
    - ConfigPatternSection内: `language="json"`
    - GitHubActionsExampleSection内: folderStructure → `language="plaintext"`, mcpConfigCode → `language="json"`, workflowCode → `language="yaml"`

### Phase 6: 品質管理

15. `npm run format` を実行
16. `npm run lint` を実行
17. `npm run test` を実行
18. Chrome DevTools MCP で `http://localhost:2222/docs/mcp` の表示確認
19. Chrome DevTools MCP で `http://localhost:2222/en/docs/mcp` の英語版表示確認
20. Chrome DevTools MCP で `http://localhost:6006/` のStorybook表示確認

---

## 品質管理手順

実装完了後、**必ず以下の順番**で品質管理を実行すること:

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

### 4. 開発サーバーでの表示確認

Chrome DevTools MCP を使って以下のURLにアクセスし確認:

#### 日本語版 (`http://localhost:2222/docs/mcp`)

- [ ] コードブロックがはみ出さずに表示される
- [ ] コードブロックに横スクロールが適用されている (長いコードの場合)
- [ ] JSONコードにシンタックスハイライトが適用されている
- [ ] YAMLコードにシンタックスハイライトが適用されている
- [ ] コピーボタンが正常に動作する
- [ ] モバイル表示でもコードブロックが正常に表示される

#### 英語版 (`http://localhost:2222/en/docs/mcp`)

- [ ] 日本語版と同様の確認項目

#### メニュー確認

- [ ] デスクトップのドキュメントドロップダウンで「MCP」と表示される
- [ ] モバイルのナビゲーションメニューで「MCP」と表示される

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし確認:

- [ ] DocsMcpPage コンポーネントが正常に表示される
- [ ] シンタックスハイライトが適用されている

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のテストファイルの削除禁止** (必要に応じて更新は可)
3. **コードスニペット以外のコンポーネントへのシンタックスハイライト適用禁止**

---

## 実装上の注意点

### 既存テストへの影響

`src/features/docs/__tests__/functions/mcp-text.test.ts` が存在しますが、`getMcpTexts` 関数は**同期関数のまま維持**するため、**既存テストへの影響はありません**。

テストの修正は不要です。

### `server-only` パッケージの重要性

`mcp-code-loader.ts` では `import "server-only";` を使用しています。これにより:

1. **ビルド時のエラー検出**: Client Component から誤ってインポートしようとするとビルドエラーになる
2. **fs モジュールの安全な使用**: サーバーサイドでのみ `fs/promises` が使用されることを保証
3. **セキュリティ**: ファイルシステムアクセスがクライアントに露出しない

### Storybookファイルへの影響

`src/features/docs/components/docs-mcp-page.stories.tsx` は `externalCodes` props の追加に伴い、**更新が必要**です。

**重要（server-only混入防止）**: `McpExternalCodes` 型をインポートする際は、**必ず `import type` を使用**してください。値インポートすると `server-only` モジュールがクライアントに混入し、ビルドエラーになります。

```typescript
// docs-mcp-page.stories.tsx の修正例
// 重要: import type を使用してサーバー専用モジュールの混入を防止
import type { McpExternalCodes } from "../functions/mcp-code-loader";

const mockExternalCodes: McpExternalCodes = {
  mcpServersJson: '{\n  "mcpServers": {\n    "lgtmeow": {\n      "type": "sse",\n      "url": "https://api.lgtmeow.com/sse"\n    }\n  }\n}',
  claudeAutoReviewYaml: "name: Claude Code Auto Review...",
  codexAutoReviewYaml: "name: Codex Auto Review...",
};

export const Default: Story = {
  args: {
    currentUrlPath: "/docs/mcp",
    language: "ja",
    externalCodes: mockExternalCodes,
  },
};
```

### prism-react-rendererの言語サポート

prism-react-renderer v2.x以降では、デフォルトで以下の言語がバンドルされています:
- markup, jsx, tsx, json, bash, typescript

**YAML言語**はデフォルトバンドルに含まれていないため、**本実装では動的import + 初期化完了後に描画**の方式でYAML言語を登録しています。

**実装方式**:
1. `initPrismYaml()` 関数で `globalThis.Prism = Prism` を設定後、`await import("prismjs/components/prism-yaml")` を実行
2. `useEffect` で初期化を実行し、`isPrismReady` stateで初期化完了を管理
3. 初期化完了までは `code` をそのまま渡して Snippet の標準 `pre` に任せ、完了後にシンタックスハイライトを適用（二重 `pre` ネストを回避）
4. `language` 変更時に `isPrismReady` を再評価する `useEffect` を追加（将来的な拡張への対応）

**ESM互換性**: `require()` ではなく動的 `import` を使用することで、Next.js ESM環境での警告や制約を回避しつつ、順序保証を確保します。

### コピーボタンの実装

シンタックスハイライト適用時も**HeroUI Snippetの標準コピーボタン機能を維持**しています。これは:

1. UIの一貫性を保つため
2. アクセシビリティの統一を保つため

という理由からです。`Snippet` コンポーネントの `codeString` propを使用して、コピー対象の文字列を指定しています。

---

## 成功基準

以下を全て満たすこと:

### 機能要件

- [ ] コードブロックが親要素からはみ出さない (横スクロールで対応)
- [ ] MCPメニューの文言が「MCP」になっている (日英両方)
- [ ] JSON/YAMLコードにシンタックスハイライトが適用されている
- [ ] GitHubActionsとMCP設定が外部ファイルで管理されている (page.tsx での Promise.all パラレル取得)
- [ ] 原文保持が機能している (trim() を使用していない)

### 品質要件

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 表示確認

- [ ] デスクトップ表示で正常動作
- [ ] モバイル表示で正常動作
- [ ] Storybookで正常表示

---

## トラブルシューティング

### 外部ファイルの読み込みエラーが発生する場合

`fs/promises` の `readFile` でファイルが見つからないエラーが発生する場合は、以下を確認してください:

1. `src/features/docs/code-examples/mcp/` ディレクトリが存在するか
2. `mcp-servers.json`, `claude-auto-review.yml`, `codex-auto-review.yml` が正しいパスに配置されているか
3. `process.cwd()` が期待通りのディレクトリを返しているか (通常はプロジェクトルート)
4. 開発サーバーを再起動したか

### `server-only` 関連のエラーが発生する場合

`mcp-code-loader.ts` を Client Component からインポートしようとすると、以下のエラーが発生します:

```
Error: This module cannot be imported from a Client Component module.
It should only be used from a Server Component.
```

このエラーが発生した場合は、インポート元が Server Component であることを確認してください。`page.tsx` は Server Component なので問題ありません。

### コードブロックのスタイルが崩れる場合

HeroUI SnippetとPrism Highlightの組み合わせでスタイルの競合が起きる可能性があります。以下を確認してください:

1. `Snippet` の `classNames.pre` に `whitespace-pre` が指定されているか
2. Highlightコンポーネントが返すスタイルを適切に適用しているか

### YAML言語のシンタックスハイライトが適用されない場合

YAML言語が正しく登録されていない可能性があります。

**確認事項**:
1. `initPrismYaml()` 関数が正しく実行されているか（ブラウザの開発者ツールでネットワークタブを確認）
2. `prismjs` パッケージが明示的にインストールされているか（`npm install prismjs` で個別インストール可能）
3. ブラウザコンソールでエラーが出ていないか
4. `isPrismReady` stateが `true` に変わっているか（React DevToolsで確認）

**動的import + 初期化完了後に描画の仕組み**:
1. `initPrismYaml()` で `globalThis.Prism = Prism` を設定後、`await import("prismjs/components/prism-yaml")` を実行
2. `isPrismYamlInitialized` フラグで重複初期化を防止
3. `isPrismReady` stateで初期化完了を管理し、完了までは `code` をそのまま Snippet に渡す（二重 `pre` ネスト回避）

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### Phase 1: 依存関係の追加
- [ ] `npm install prism-react-renderer prismjs server-only` を実行

### Phase 2: code-snippet.tsx の全面書き換え
- [ ] `src/features/docs/components/code-snippet.tsx` を全面書き換え
  - [ ] コードはみ出し修正（overflow-hidden + overflow-x-auto）
  - [ ] シンタックスハイライト機能追加（prism-react-renderer使用）
  - [ ] YAML言語の動的登録機能追加
  - [ ] language prop の追加

### Phase 3: メニュー文言変更
- [ ] `src/components/header-i18n.ts` の `mcpText` 関数を修正
- [ ] `src/features/docs/functions/mcp.ts` の `createMcpLinksFromLanguages` 関数を修正

### Phase 4: 外部ファイル作成 (page.tsx での非同期読み込み + Promise.all パラレル取得)
- [ ] `src/features/docs/code-examples/mcp/` ディレクトリを作成
- [ ] `mcp-servers.json` を作成 (唯一のソース)
- [ ] `claude-auto-review.yml` を作成 (唯一のソース)
- [ ] `codex-auto-review.yml` を作成 (唯一のソース)
- [ ] `src/features/docs/functions/mcp-code-loader.ts` を新規作成 (server-only + React cache())
- [ ] `src/features/docs/functions/mcp-text.ts` の文字列定数を削除
- [ ] `src/features/docs/components/docs-mcp-page.tsx` に `externalCodes` props を追加
- [ ] `src/app/(default)/docs/mcp/page.tsx` を async コンポーネントに変更
- [ ] `src/app/(default)/en/docs/mcp/page.tsx` を async コンポーネントに変更

### Phase 5: docs-mcp-page.tsx の language prop 追加
- [ ] `docs-mcp-page.tsx` の `CodeSnippet` コンポーネント呼び出しに `language` prop を追加
  - [ ] ToolSection内: `language="json"`
  - [ ] ConfigPatternSection内: `language="json"`
  - [ ] GitHubActionsExampleSection内: folderStructure → `language="plaintext"`, mcpConfigCode → `language="json"`, workflowCode → `language="yaml"`

### Phase 6: 品質管理
- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] Chrome DevTools MCP で日本語版の表示確認完了
- [ ] Chrome DevTools MCP で英語版の表示確認完了
- [ ] Chrome DevTools MCP でStorybookの表示確認完了

### 最終確認
- [ ] コードブロックがはみ出していない (横スクロールで対応)
- [ ] メニュー文言が「MCP」になっている
- [ ] シンタックスハイライトが適用されている
- [ ] 外部ファイル管理が正常に機能している (page.tsx での Promise.all パラレル取得)
- [ ] 原文保持が機能している (trim() を使用していない)
