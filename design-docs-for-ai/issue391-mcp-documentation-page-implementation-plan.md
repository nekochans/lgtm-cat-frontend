# Issue #391: MCP用ドキュメントページ `GET /docs/mcp` の実装 - 詳細実装計画書

## 概要

### 目的

現在「Coming Soon」が表示されているMCPドキュメントページ (`/docs/mcp`, `/en/docs/mcp`) に、LGTMeow MCPサーバーの使い方に関する詳細なコンテンツを実装する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/391

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: HeroUI v2.8.7 (Snippet コンポーネント)
- **Storybook**: v10.1.11

**注意**: HeroUI v3 (Tailwind CSS v4 対応版) は現在ベータ版であり、Snippet コンポーネントが含まれていない可能性があります。本プロジェクトでは HeroUI v2 を使用しているため、Snippet コンポーネントは利用可能です。

---

## 現状分析

### 対象ファイル

| ファイルパス | 現状 | 変更内容 |
|-------------|------|----------|
| `src/features/docs/components/docs-mcp-page.tsx` | "Coming Soon" 表示 | コンテンツ実装 (サーバーコンポーネント) |
| `src/features/docs/components/code-snippet.tsx` | **新規作成** | コードブロック表示用クライアントコンポーネント |
| `src/features/docs/functions/mcp-text.ts` | **新規作成** | テキスト取得関数 |
| `src/features/docs/__tests__/functions/mcp-text.test.ts` | **新規作成** | テキスト取得関数のテスト |
| `src/features/docs/components/docs-mcp-page.stories.tsx` | **新規作成** | Storybook |
| `src/app/sitemap.xml` | 既存 | `/docs/mcp` エントリ追加 |

### 既存の関連ファイル (変更不要)

| ファイルパス | 役割 |
|-------------|------|
| `src/app/(default)/docs/mcp/page.tsx` | 日本語版ルーティング |
| `src/app/(default)/en/docs/mcp/page.tsx` | 英語版ルーティング |
| `src/features/docs/functions/mcp.ts` | リンク生成関数 (既存) |
| `src/features/url.ts` | URL生成関数 |
| `src/features/meta-tag.ts` | メタタグ定義 (既存) |
| `src/components/page-layout.tsx` | 共通レイアウト |
| `public/screenshots/claude-auto-review-with-lgtmeow-mcp.webp` | Claude Codeの出力例画像 |
| `public/screenshots/codex-auto-review-with-lgtmeow-mcp.webp` | Codexの出力例画像 |

### 参考にする既存実装

| ファイルパス | 参考ポイント |
|-------------|-------------|
| `src/features/docs/components/docs-how-to-use-page.tsx` | PageLayoutの使用パターン、Section構造、TextWithLinksコンポーネント |
| `src/features/docs/functions/how-to-use-text.ts` | テキスト取得関数の設計パターン |
| `src/features/docs/components/docs-how-to-use-page.stories.tsx` | Storybookの設定パターン |

---

## コンテンツソース

Atlassian Confluenceの「MCPサーバーの説明ページ(日本語)」を元に、日本語版・英語版のコンテンツを作成する。

---

## 仕様詳細

### デザイン方針

- PR #436の使い方ページ (`/docs/how-to-use`) の実装を参照
- Figmaデザインは不要
- HeroUIの `Snippet` コンポーネントを使用してコードブロックを表示

### セクション構成

| 順番 | セクション名 (日本語) | セクション名 (英語) |
|------|----------------------|---------------------|
| 1 | LGTMeow MCPサーバー | LGTMeow MCP Server |
| 2 | 利用可能ツール | Available Tools |
| 3 | MCPクライアントの設定方法 | MCP Client Configuration |
| 4 | GitHub Actionsで LGTM画像を自動コメントする | Auto-comment LGTM Images with GitHub Actions |

### 各セクションの詳細コンテンツ

#### 1. LGTMeow MCPサーバー (概要)

**日本語**:
```
LGTMeow は、MCP(Model Context Protocol)に対応したリモートMCPサーバーを提供しています。

MCPを利用すると、AIエージェントから猫のLGTM画像を簡単に呼び出すことができるようになります。
たとえば次のような使い方ができます。

- レビュー結果に応じてAIが自動でLGTM画像を挿入する
- 「LGTM画像ください」と依頼して、Markdownを受け取る
```

**英語**:
```
LGTMeow provides a remote MCP (Model Context Protocol) server.

With MCP, you can easily call cat LGTM images from AI agents.
Here are some example use cases:

- AI automatically inserts LGTM images based on review results
- Request "Please give me an LGTM image" and receive Markdown
```

#### 2. 利用可能ツール

3つのツールを説明:

##### get_random_lgtm_images

**日本語**:
```
ランダムに選択されたLGTM画像のリストを返します。
```

**英語**:
```
Returns a list of randomly selected LGTM images.
```

**レスポンス例** (JSON):
```json
{
  "lgtmImages": [
    {
      "id": "1",
      "url": "https://lgtm-images.lgtmeow.com/2021/03/16/23/5947f291-a46e-453c-a230-0d756d7174cb.webp"
    },
    {
      "id": "2",
      "url": "https://lgtm-images.lgtmeow.com/2021/03/16/23/6947f291-a46e-453c-a230-0d756d7174cb.webp"
    }
  ]
}
```

##### get_recently_created_lgtm_images

**日本語**:
```
最近作成されたLGTM画像のリストを返します。
```

**英語**:
```
Returns a list of recently created LGTM images.
```

**レスポンス例**: (上記と同じ形式)

##### get_random_lgtm_markdown

**日本語**:
```
Markdown 形式の LGTM 画像を 1 件返します。
PRコメントなどにそのまま貼り付け可能です。
```

**英語**:
```
Returns one LGTM image in Markdown format.
You can paste it directly into PR comments.
```

**レスポンス例** (JSON):
```json
{
  "markdown": "[![LGTMeow](https://lgtm-images.lgtmeow.com/2022/03/23/10/9738095a-f426-48e4-be8d-93f933c42917.webp)](https://lgtmeow.com)"
}
```

#### 3. MCPクライアントの設定方法

**イントロ (日本語)**:
```
LGTMeow MCP Server は、リモート(SSE)方式のみ提供しています。

【認証について】
認証不要で利用できます。
API キーやトークンの設定は不要です。

【サーバー URL】
https://api.lgtmeow.com/sse
```

**イントロ (英語)**:
```
LGTMeow MCP Server only supports remote (SSE) mode.

[Authentication]
No authentication required.
No API key or token configuration is needed.

[Server URL]
https://api.lgtmeow.com/sse
```

**サブセクション**: クライアントの SSE 対応状況に応じた設定パターン

##### 1. SSE を直接サポートするクライアントの場合

**日本語**: `SSEを直接サポートするクライアントの場合`
**英語**: `For clients that directly support SSE`

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

##### 2. Node 環境 / mcp-remote を使う場合

**日本語**:
```
クライアントが SSE を直接サポートしない場合、mcp-remote を利用して SSE → stdio をブリッジできます。
```

**英語**:
```
If your client doesn't directly support SSE, you can use mcp-remote to bridge SSE → stdio.
```

```json
{
  "mcpServers": {
    "lgtmeow": {
      "command": "npx",
      "args": ["mcp-remote", "https://api.lgtmeow.com/sse"]
    }
  }
}
```

**注意書き (日本語)**:
```
npx が見つからない場合は、Node.js がインストールされているか、PATH が通っているかをご確認ください。必要に応じて npx のフルパスを指定してください。
```

**注意書き (英語)**:
```
If npx is not found, please verify that Node.js is installed and PATH is configured. Specify the full path to npx if needed.
```

##### 3. Python / uvx + mcp-proxy を使う場合

**日本語**:
```
Python ユーザー向けの SSE → stdio ブリッジです。
```

**英語**:
```
This is an SSE → stdio bridge for Python users.
```

```json
{
  "mcpServers": {
    "lgtmeow": {
      "command": "uvx",
      "args": [
        "mcp-proxy",
        "https://api.lgtmeow.com/sse"
      ]
    }
  }
}
```

**注意書き (日本語)**:
```
uvx が見つからない場合は、インストール状況と PATH をご確認ください。必要に応じて uvx のフルパスを指定してください。
```

**注意書き (英語)**:
```
If uvx is not found, please verify installation and PATH. Specify the full path to uvx if needed.
```

#### 4. GitHub Actionsで LGTM画像を自動コメントする (利用例)

##### Claude Code Action を使った例

**日本語**:
```
PR が作成 or 更新された際に Claude Code がレビューを実行し、マージ可能と判断した場合に LGTMeow MCP Server から LGTM 画像を取得して自動でコメントする ワークフロー例です。
```

**英語**:
```
This is a workflow example where Claude Code performs a review when a PR is created or updated, and if it determines the PR is mergeable, it automatically fetches an LGTM image from LGTMeow MCP Server and posts a comment.
```

**フォルダ構成**:
```
.github
├── mcp-servers.json              # LGTMeow MCP Server の設定
└── workflows
    └── claude-auto-review.yml    # PR を自動レビューする GitHub Actions
```

**MCP サーバー設定 (.github/mcp-servers.json)**:
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

**GitHub Actions ワークフロー (claude-auto-review.yml)**:
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

**出力イメージの説明 (日本語)**:
```
マージ可能と判断された場合、Claude Code は LGTMeow MCP Server から取得した Markdown 形式の LGTM 画像 を含むコメントを自動で PR に投稿します。
```

**出力イメージの説明 (英語)**:
```
When determined as mergeable, Claude Code automatically posts a comment to the PR containing a Markdown-formatted LGTM image retrieved from LGTMeow MCP Server.
```

**スクリーンショット**: `/screenshots/claude-auto-review-with-lgtmeow-mcp.webp`

##### Codex Action を使った例

**日本語**:
```
PR が作成 or 更新された際に Codex Action がレビューを実行し、マージ可能と判断した場合に LGTMeow MCP Server から LGTM 画像を取得して自動でコメントする ワークフロー例です。
```

**英語**:
```
This is a workflow example where Codex Action performs a review when a PR is created or updated, and if it determines the PR is mergeable, it automatically fetches an LGTM image from LGTMeow MCP Server and posts a comment.
```

**フォルダ構成 (日本語)**:
```
Codex Action は MCP サーバー設定を codex-args で直接指定できるため、.github/mcp-servers.json は不要です。
```

**フォルダ構成 (英語)**:
```
Codex Action can specify MCP server configuration directly via codex-args, so .github/mcp-servers.json is not needed.
```

```
.github
└── workflows
    └── codex-auto-review.yml    # PR を自動レビューする GitHub Actions
```

**GitHub Actions ワークフロー (codex-auto-review.yml)**:
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

**出力イメージの説明 (日本語)**:
```
マージ可能と判断された場合、Codex Action は LGTMeow MCP Server から取得した Markdown 形式の LGTM 画像 を含むコメントを自動で PR に投稿します。
```

**出力イメージの説明 (英語)**:
```
When determined as mergeable, Codex Action automatically posts a comment to the PR containing a Markdown-formatted LGTM image retrieved from LGTMeow MCP Server.
```

**スクリーンショット**: `/screenshots/codex-auto-review-with-lgtmeow-mcp.webp`

---

## 依存関係の確認

### 使用する既存関数

#### `appBaseUrl()` (src/features/url.ts:19-24)

```typescript
export function appBaseUrl(): Url {
  if (isUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return defaultAppUrl; // "https://lgtmeow.com"
}
```

### 新規追加するHeroUIコンポーネント

#### Snippet (コードブロック表示用)

**インポート方法**:
```typescript
import { Snippet } from "@heroui/react";
```

**使用例**:
```tsx
<Snippet hideCopyButton hideSymbol>
  https://api.lgtmeow.com/sse
</Snippet>
```

**主要 Props**:

| Props | 型 | デフォルト | 説明 |
|-------|-----|-----------|------|
| `children` | `ReactNode \| ReactNode[]` | - | 表示するコード内容 |
| `codeString` | `string` | - | コピー用の代替テキスト (children とは別に指定可能) |
| `symbol` | `string \| ReactNode` | `"$"` | 行頭の記号 |
| `hideSymbol` | `boolean` | `false` | 記号を非表示 |
| `hideCopyButton` | `boolean` | `false` | コピーボタンを非表示 |
| `variant` | `bordered \| flat \| solid \| shadow` | - | スタイルバリアント |
| `color` | `default \| primary \| secondary \| success \| warning \| danger` | - | カラーテーマ |
| `classNames` | `Partial<Record<...>>` | - | スロット別カスタマイズ |

**classNames スロット**:
- `base`: メインコンテナ
- `content`: `<pre/>` のラッパー
- `pre`: `<pre/>` タグ
- `symbol`: 記号のラッパー
- `copyButton`: コピーボタン
- `copyIcon`: コピーアイコン
- `checkIcon`: 成功確認アイコン

**複数行コードの表示**:

長い JSON や YAML などの複数行コードを表示する場合は、`classNames` の `pre` スロットに `whitespace-pre` を指定し、`content` スロットに `overflow-x-auto` を指定することで正しく表示できます。

### 画像アセット

| 画像パス | 用途 | サイズ (px) |
|---------|------|------------|
| `/screenshots/claude-auto-review-with-lgtmeow-mcp.webp` | Claude Code Actionの出力例 | 1834 x 1300 |
| `/screenshots/codex-auto-review-with-lgtmeow-mcp.webp` | Codex Actionの出力例 | 1842 x 1068 |

**注意**: これらの画像は既に `public/screenshots/` に存在する。

**画像表示サイズ**: Next.js Image コンポーネントで表示する際は、アスペクト比を維持しながら幅を700pxに設定:
- Claude画像: `width={700} height={496}` (アスペクト比 1.41:1)
- Codex画像: `width={700} height={406}` (アスペクト比 1.72:1)

**遅延読み込み**: スクリーンショット画像はページ下部に配置されるため、`loading="lazy"` を指定して遅延読み込みを行う。これによりLCP (Largest Contentful Paint) への影響を軽減し、初期ロードパフォーマンスを向上させる。

---

## 設計方針

### 方針概要

1. **テキスト取得関数を新規作成**: `src/features/docs/functions/mcp-text.ts` に各セクションのテキストを返す関数を作成
2. **コンポーネント構造**: docs-how-to-use-page.tsx の Section コンポーネントパターンを踏襲
3. **コードブロック表示**: HeroUI の Snippet コンポーネントを使用 (クライアントコンポーネントとして分離)
4. **スタイリング**: docs-how-to-use-page.tsx と同じ Tailwind CSS スタイルを使用
5. **画像表示**: Next.js Image コンポーネントを使用
6. **サーバーコンポーネント維持**: ページ全体のクライアント化を避け、必要最小限の部分のみクライアントコンポーネント化

### クライアントコンポーネントの分離方針

PR #436 の `docs-how-to-use-page.tsx` はサーバーコンポーネントとして実装されています。本実装でも同様に、ページ全体をサーバーコンポーネントとして維持し、SSR のメリットを最大化します。

**クライアント化が必要な箇所**:
- HeroUI の `Snippet` コンポーネントはクライアントコンポーネントのため、これを使用する部分のみを `CodeSnippet` として切り出し

**分離のメリット**:
- 初期ロード時のJavaScriptバンドルサイズ削減
- SSRによるSEO最適化
- ページ全体のパフォーマンス向上

### アクセシビリティ考慮事項

- **セマンティックHTML**: セクション見出しには `<h2>` を使用、サブセクションには `<h3>` を使用
- **画像のalt属性**: スクリーンショット画像には言語に応じた適切なalt属性を設定
- **リンクのセキュリティ**: 外部リンクには `rel="noopener noreferrer"` を設定
- **フォーカス可能な要素**: 全てのリンクはキーボードでアクセス可能

### コンポーネント構成

```
DocsMcpPage (サーバーコンポーネント)
├── PageLayout
│   ├── Header
│   └── Footer
└── コンテンツエリア
    ├── Section: LGTMeow MCPサーバー (概要)
    ├── Section: 利用可能ツール
    │   ├── ToolSection: get_random_lgtm_images
    │   │   └── CodeSnippet (クライアントコンポーネント)
    │   ├── ToolSection: get_recently_created_lgtm_images
    │   │   └── CodeSnippet (クライアントコンポーネント)
    │   └── ToolSection: get_random_lgtm_markdown
    │       └── CodeSnippet (クライアントコンポーネント)
    ├── Section: MCPクライアントの設定方法
    │   ├── CodeSnippet (サーバーURL表示用・クライアントコンポーネント)
    │   ├── ConfigSection: SSE直接サポート
    │   │   └── CodeSnippet (クライアントコンポーネント)
    │   ├── ConfigSection: Node環境 / mcp-remote
    │   │   └── CodeSnippet (クライアントコンポーネント)
    │   └── ConfigSection: Python / uvx + mcp-proxy
    │       └── CodeSnippet (クライアントコンポーネント)
    └── Section: GitHub Actionsで LGTM画像を自動コメントする
        ├── ExampleSection: Claude Code Action を使った例
        │   └── CodeSnippet (複数箇所・クライアントコンポーネント)
        └── ExampleSection: Codex Action を使った例
            └── CodeSnippet (複数箇所・クライアントコンポーネント)
```

**注意**: `CodeSnippet` は `"use client"` ディレクティブを持つクライアントコンポーネントとして分離。ページ本体 (`DocsMcpPage`) はサーバーコンポーネントのまま維持。

### レイアウト設計

docs-how-to-use-page.tsx と同じレイアウトを採用:

```
コンテナ: max-w-[1020px] px-4 py-8 sm:px-10 sm:py-[60px]
セクション間隔: gap-5 sm:gap-7
見出し + 下線: flex gap-2 items-center
本文間隔: gap-2
```

**レスポンシブ対応**:
- モバイル (< 640px): `px-4 py-8 gap-5`
- デスクトップ (>= 640px): `px-10 py-[60px] gap-7`

**モバイル表示での文言調整**: Issueの仕様に従い、モバイル表示では文言の調整を許容する。コードブロックは横スクロール可能にする。

---

## 変更内容

### 1. src/features/docs/functions/mcp-text.ts の新規作成

**ファイルパス**: `src/features/docs/functions/mcp-text.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";

export interface McpToolInfo {
  readonly name: string;
  readonly description: string;
  readonly responseFormat: string;
  readonly responseExample: string;
}

export interface McpConfigPattern {
  readonly title: string;
  readonly description?: string;
  readonly code: string;
  readonly note?: string;
}

export interface McpGitHubActionsExample {
  readonly title: string;
  readonly description: string;
  readonly folderStructure: string;
  readonly folderNote?: string;
  readonly mcpConfigCode?: string;
  readonly mcpConfigDescription?: string;
  readonly workflowCode: string;
  readonly outputDescription: string;
  readonly screenshotPath: string;
  readonly screenshotAlt: string;
  readonly screenshotWidth: number;
  readonly screenshotHeight: number;
}

export interface McpTexts {
  readonly overview: {
    readonly title: string;
    readonly intro: string;
    readonly useCases: readonly string[];
  };
  readonly availableTools: {
    readonly title: string;
    readonly tools: readonly McpToolInfo[];
  };
  readonly clientConfig: {
    readonly title: string;
    readonly intro: {
      readonly main: string;
      readonly authTitle: string;
      readonly authDescription: string;
      readonly serverUrlTitle: string;
      readonly serverUrl: string;
    };
    readonly patternsIntro: string;
    readonly patterns: readonly McpConfigPattern[];
  };
  readonly githubActions: {
    readonly title: string;
    readonly examples: readonly McpGitHubActionsExample[];
  };
}

const mcpServerUrl = "https://api.lgtmeow.com/sse";

const sseDirectConfigCode = `{
  "mcpServers": {
    "lgtmeow": {
      "type": "sse",
      "url": "${mcpServerUrl}"
    }
  }
}`;

const nodeConfigCode = `{
  "mcpServers": {
    "lgtmeow": {
      "command": "npx",
      "args": ["mcp-remote", "${mcpServerUrl}"]
    }
  }
}`;

const pythonConfigCode = `{
  "mcpServers": {
    "lgtmeow": {
      "command": "uvx",
      "args": [
        "mcp-proxy",
        "${mcpServerUrl}"
      ]
    }
  }
}`;

const lgtmImagesResponseExample = `{
  "lgtmImages": [
    {
      "id": "1",
      "url": "https://lgtm-images.lgtmeow.com/2021/03/16/23/5947f291-a46e-453c-a230-0d756d7174cb.webp"
    },
    {
      "id": "2",
      "url": "https://lgtm-images.lgtmeow.com/2021/03/16/23/6947f291-a46e-453c-a230-0d756d7174cb.webp"
    }
  ]
}`;

const markdownResponseExample = `{
  "markdown": "[![LGTMeow](https://lgtm-images.lgtmeow.com/2022/03/23/10/9738095a-f426-48e4-be8d-93f933c42917.webp)](https://lgtmeow.com)"
}`;

const claudeWorkflowCode = `name: Claude Code Auto Review on PR Open

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-auto-review:
    runs-on: ubuntu-latest
    concurrency:
      group: \${{ github.workflow }}-\${{ github.event.pull_request.number }}
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
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            リポジトリ: \${{ github.repository }}
            PR番号: \${{ github.event.pull_request.number }}

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
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

const codexWorkflowCode = `name: Codex Auto Review on PR Open

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  codex:
    runs-on: ubuntu-latest
    concurrency:
      group: \${{ github.workflow }}-\${{ github.event.pull_request.number }}
      cancel-in-progress: false
    permissions:
      contents: read
    outputs:
      final_message: \${{ steps.run_codex.outputs.final-message }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6
        with:
          ref: refs/pull/\${{ github.event.pull_request.number }}/merge

      - name: Pre-fetch base and head refs for the PR
        run: |
          git fetch --no-tags origin \\
            \${{ github.event.pull_request.base.ref }} \\
            +refs/pull/\${{ github.event.pull_request.number }}/head

      - name: Install mcp-proxy for SSE bridge
        run: pip install mcp-proxy

      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: \${{ secrets.OPENAI_API_KEY }}
          codex-args: |
            --config mcp_servers={"lgtmeow"={"command"="mcp-proxy","args"=["${mcpServerUrl}"]}}
          prompt: |
            リポジトリ: \${{ github.repository }}
            PR番号: \${{ github.event.pull_request.number }}

            このPRの変更内容をレビューしてください。

            マージ可能な品質と判断した場合は、lgtmeow MCPサーバーの get_random_lgtm_markdown でLGTM画像を取得し、レビュー結果に含めてください。
            問題がある場合は、改善点を具体的に指摘してください。

            PRタイトルと本文:
            ----
            \${{ github.event.pull_request.title }}
            \${{ github.event.pull_request.body }}

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
          CODEX_FINAL_MESSAGE: \${{ needs.codex.outputs.final_message }}
        with:
          github-token: \${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            });`;

export function getMcpTexts(language: Language): McpTexts {
  switch (language) {
    case "ja":
      return {
        overview: {
          title: "LGTMeow MCPサーバー",
          intro:
            "LGTMeow は、MCP(Model Context Protocol)に対応したリモートMCPサーバーを提供しています。MCPを利用すると、AIエージェントから猫のLGTM画像を簡単に呼び出すことができるようになります。",
          useCases: [
            "レビュー結果に応じてAIが自動でLGTM画像を挿入する",
            "「LGTM画像ください」と依頼して、Markdownを受け取る",
          ],
        },
        availableTools: {
          title: "利用可能ツール",
          tools: [
            {
              name: "get_random_lgtm_images",
              description: "ランダムに選択されたLGTM画像のリストを返します。",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_recently_created_lgtm_images",
              description: "最近作成されたLGTM画像のリストを返します。",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_random_lgtm_markdown",
              description:
                "Markdown 形式の LGTM 画像を 1 件返します。PRコメントなどにそのまま貼り付け可能です。",
              responseFormat: "application/json",
              responseExample: markdownResponseExample,
            },
          ],
        },
        clientConfig: {
          title: "MCPクライアントの設定方法",
          intro: {
            main: "LGTMeow MCP Server は、リモート(SSE)方式のみ提供しています。",
            authTitle: "認証について",
            authDescription:
              "認証不要で利用できます。API キーやトークンの設定は不要です。",
            serverUrlTitle: "サーバー URL",
            serverUrl: mcpServerUrl,
          },
          patternsIntro:
            "お使いの MCP クライアントが SSE を「直接サポートしているか」に応じて、以下の 3 パターンのいずれかを利用してください。",
          patterns: [
            {
              title: "SSE を直接サポートするクライアントの場合",
              code: sseDirectConfigCode,
            },
            {
              title: "Node 環境 / mcp-remote を使う場合",
              description:
                "クライアントが SSE を直接サポートしない場合、mcp-remote を利用して SSE → stdio をブリッジできます。",
              code: nodeConfigCode,
              note: "npx が見つからない場合は、Node.js がインストールされているか、PATH が通っているかをご確認ください。必要に応じて npx のフルパスを指定してください。",
            },
            {
              title: "Python / uvx + mcp-proxy を使う場合",
              description: "Python ユーザー向けの SSE → stdio ブリッジです。",
              code: pythonConfigCode,
              note: "uvx が見つからない場合は、インストール状況と PATH をご確認ください。必要に応じて uvx のフルパスを指定してください。",
            },
          ],
        },
        githubActions: {
          title: "GitHub Actionsで LGTM画像を自動コメントする",
          examples: [
            {
              title: "Claude Code Action を使った例",
              description:
                "PR が作成 or 更新された際に Claude Code がレビューを実行し、マージ可能と判断した場合に LGTMeow MCP Server から LGTM 画像を取得して自動でコメントするワークフロー例です。",
              folderStructure: `.github
├── mcp-servers.json              # LGTMeow MCP Server の設定
└── workflows
    └── claude-auto-review.yml    # PR を自動レビューする GitHub Actions`,
              mcpConfigDescription: "MCP サーバー設定 (.github/mcp-servers.json)",
              mcpConfigCode: sseDirectConfigCode,
              workflowCode: claudeWorkflowCode,
              outputDescription:
                "マージ可能と判断された場合、Claude Code は LGTMeow MCP Server から取得した Markdown 形式の LGTM 画像を含むコメントを自動で PR に投稿します。",
              screenshotPath: "/screenshots/claude-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt: "Claude Code による自動レビューとLGTM画像投稿の例",
              screenshotWidth: 700,
              screenshotHeight: 496,
            },
            {
              title: "Codex Action を使った例",
              description:
                "PR が作成 or 更新された際に Codex Action がレビューを実行し、マージ可能と判断した場合に LGTMeow MCP Server から LGTM 画像を取得して自動でコメントするワークフロー例です。",
              folderStructure: `.github
└── workflows
    └── codex-auto-review.yml    # PR を自動レビューする GitHub Actions`,
              folderNote:
                "Codex Action は MCP サーバー設定を codex-args で直接指定できるため、.github/mcp-servers.json は不要です。",
              workflowCode: codexWorkflowCode,
              outputDescription:
                "マージ可能と判断された場合、Codex Action は LGTMeow MCP Server から取得した Markdown 形式の LGTM 画像を含むコメントを自動で PR に投稿します。",
              screenshotPath: "/screenshots/codex-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt: "Codex による自動レビューとLGTM画像投稿の例",
              screenshotWidth: 700,
              screenshotHeight: 406,
            },
          ],
        },
      };
    case "en":
      return {
        overview: {
          title: "LGTMeow MCP Server",
          intro:
            "LGTMeow provides a remote MCP (Model Context Protocol) server. With MCP, you can easily call cat LGTM images from AI agents.",
          useCases: [
            "AI automatically inserts LGTM images based on review results",
            'Request "Please give me an LGTM image" and receive Markdown',
          ],
        },
        availableTools: {
          title: "Available Tools",
          tools: [
            {
              name: "get_random_lgtm_images",
              description: "Returns a list of randomly selected LGTM images.",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_recently_created_lgtm_images",
              description: "Returns a list of recently created LGTM images.",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_random_lgtm_markdown",
              description:
                "Returns one LGTM image in Markdown format. You can paste it directly into PR comments.",
              responseFormat: "application/json",
              responseExample: markdownResponseExample,
            },
          ],
        },
        clientConfig: {
          title: "MCP Client Configuration",
          intro: {
            main: "LGTMeow MCP Server only supports remote (SSE) mode.",
            authTitle: "Authentication",
            authDescription:
              "No authentication required. No API key or token configuration is needed.",
            serverUrlTitle: "Server URL",
            serverUrl: mcpServerUrl,
          },
          patternsIntro:
            "Depending on whether your MCP client directly supports SSE, use one of the following 3 patterns.",
          patterns: [
            {
              title: "For clients that directly support SSE",
              code: sseDirectConfigCode,
            },
            {
              title: "For Node environment / using mcp-remote",
              description:
                "If your client doesn't directly support SSE, you can use mcp-remote to bridge SSE → stdio.",
              code: nodeConfigCode,
              note: "If npx is not found, please verify that Node.js is installed and PATH is configured. Specify the full path to npx if needed.",
            },
            {
              title: "For Python / uvx + mcp-proxy",
              description: "This is an SSE → stdio bridge for Python users.",
              code: pythonConfigCode,
              note: "If uvx is not found, please verify installation and PATH. Specify the full path to uvx if needed.",
            },
          ],
        },
        githubActions: {
          title: "Auto-comment LGTM Images with GitHub Actions",
          examples: [
            {
              title: "Using Claude Code Action",
              description:
                "This is a workflow example where Claude Code performs a review when a PR is created or updated, and if it determines the PR is mergeable, it automatically fetches an LGTM image from LGTMeow MCP Server and posts a comment.",
              folderStructure: `.github
├── mcp-servers.json              # LGTMeow MCP Server configuration
└── workflows
    └── claude-auto-review.yml    # GitHub Actions for auto PR review`,
              mcpConfigDescription: "MCP Server Configuration (.github/mcp-servers.json)",
              mcpConfigCode: sseDirectConfigCode,
              workflowCode: claudeWorkflowCode,
              outputDescription:
                "When determined as mergeable, Claude Code automatically posts a comment to the PR containing a Markdown-formatted LGTM image retrieved from LGTMeow MCP Server.",
              screenshotPath: "/screenshots/claude-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt:
                "Example of auto review and LGTM image posting by Claude Code",
              screenshotWidth: 700,
              screenshotHeight: 496,
            },
            {
              title: "Using Codex Action",
              description:
                "This is a workflow example where Codex Action performs a review when a PR is created or updated, and if it determines the PR is mergeable, it automatically fetches an LGTM image from LGTMeow MCP Server and posts a comment.",
              folderStructure: `.github
└── workflows
    └── codex-auto-review.yml    # GitHub Actions for auto PR review`,
              folderNote:
                "Codex Action can specify MCP server configuration directly via codex-args, so .github/mcp-servers.json is not needed.",
              workflowCode: codexWorkflowCode,
              outputDescription:
                "When determined as mergeable, Codex Action automatically posts a comment to the PR containing a Markdown-formatted LGTM image retrieved from LGTMeow MCP Server.",
              screenshotPath: "/screenshots/codex-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt: "Example of auto review and LGTM image posting by Codex",
              screenshotWidth: 700,
              screenshotHeight: 406,
            },
          ],
        },
      };
    default:
      return assertNever(language);
  }
}
```

---

### 2. src/features/docs/components/code-snippet.tsx の新規作成

**ファイルパス**: `src/features/docs/components/code-snippet.tsx`

HeroUI の Snippet コンポーネントをラップするクライアントコンポーネントです。ページ全体のクライアント化を避けるため、コードブロック表示部分のみを分離します。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Snippet } from "@heroui/react";

interface CodeSnippetProps {
  readonly code: string;
  readonly variant?: "block" | "inline";
}

/**
 * コードブロックを表示するクライアントコンポーネント
 * HeroUI の Snippet コンポーネントをラップ
 */
export function CodeSnippet({ code, variant = "block" }: CodeSnippetProps) {
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
}
```

**Props説明**:
- `code`: 表示するコード文字列
- `variant`: `"block"` (デフォルト) でコードブロック表示、`"inline"` でインライン表示 (サーバーURLなど短いコード用)

**実装時の注意事項**:
HeroUI公式ドキュメントでは、複数行コードを表示する場合に `<span>` 要素でラップする例が示されています。本設計では `children` に文字列を直接渡していますが、実装時に複数行コードが正しく表示されるか動作確認を行ってください。問題がある場合は以下のパターンを検討してください:

```tsx
// 代替パターン (必要に応じて)
<Snippet>
  <span>{code}</span>
</Snippet>
```

---

### 3. src/features/docs/components/docs-mcp-page.tsx の修正

**ファイルパス**: `src/features/docs/components/docs-mcp-page.tsx`

**現在のコード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

export function DocsMcpPage({ language, currentUrlPath }: Props) {
  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    >
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="font-bold text-3xl text-orange-900">Coming Soon</h1>
        <p className="mt-4 text-orange-800">
          {language === "ja"
            ? "MCPの使い方ページは準備中です"
            : "How to Use MCP page is under construction"}
        </p>
      </div>
    </PageLayout>
  );
}
```

**変更後のコード**:

注意: 以下のコードは完全な実装例です。docs-how-to-use-page.tsx の Section コンポーネントパターンを踏襲し、CodeSnippet クライアントコンポーネントを使用してコードブロックを表示します。ページ本体はサーバーコンポーネントのまま維持します。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import Image from "next/image";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import { CodeSnippet } from "@/features/docs/components/code-snippet";
import {
  getMcpTexts,
  type McpConfigPattern,
  type McpGitHubActionsExample,
  type McpToolInfo,
} from "@/features/docs/functions/mcp-text";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

interface SectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * MCPページの各セクションを表示するコンポーネント
 */
function Section({ title, children }: SectionProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="shrink-0 font-bold text-orange-500 text-xl leading-7">
          {title}
        </h2>
        <div className="h-px flex-1 bg-orange-300" />
      </div>
      <div className="flex flex-col gap-2 text-base text-orange-900 leading-6">
        {children}
      </div>
    </div>
  );
}

interface SubSectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * MCPページのサブセクションを表示するコンポーネント
 */
function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-orange-800 text-lg">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

interface ToolSectionProps {
  readonly tool: McpToolInfo;
  readonly language: Language;
}

/**
 * ツール情報を表示するコンポーネント
 */
function ToolSection({ tool, language }: ToolSectionProps) {
  const responseFormatLabel =
    language === "ja" ? "レスポンス形式:" : "Response Format:";
  const responseExampleLabel =
    language === "ja" ? "レスポンス例:" : "Response Example:";

  return (
    <SubSection title={tool.name}>
      <p>{tool.description}</p>
      <p className="text-orange-700 text-sm">
        <span className="font-medium">{responseFormatLabel}</span>{" "}
        {tool.responseFormat}
      </p>
      <p className="font-medium text-orange-700 text-sm">{responseExampleLabel}</p>
      <CodeSnippet code={tool.responseExample} />
    </SubSection>
  );
}

interface ConfigPatternSectionProps {
  readonly pattern: McpConfigPattern;
  readonly index: number;
}

/**
 * 設定パターンを表示するコンポーネント
 */
function ConfigPatternSection({ pattern, index }: ConfigPatternSectionProps) {
  return (
    <SubSection title={`${index + 1}. ${pattern.title}`}>
      {pattern.description && <p>{pattern.description}</p>}
      <CodeSnippet code={pattern.code} />
      {pattern.note && (
        <p className="text-orange-700 text-sm">{pattern.note}</p>
      )}
    </SubSection>
  );
}

interface GitHubActionsExampleSectionProps {
  readonly example: McpGitHubActionsExample;
  readonly language: Language;
}

/**
 * GitHub Actions の例を表示するコンポーネント
 */
function GitHubActionsExampleSection({
  example,
  language,
}: GitHubActionsExampleSectionProps) {
  const folderStructureLabel =
    language === "ja" ? "フォルダ構成" : "Folder Structure";
  const workflowLabel =
    language === "ja" ? "GitHub Actions ワークフロー" : "GitHub Actions Workflow";
  const outputImageLabel = language === "ja" ? "出力イメージ" : "Output Example";

  return (
    <SubSection title={example.title}>
      <p>{example.description}</p>

      {/* フォルダ構成 */}
      <p className="mt-2 font-medium text-orange-800">{folderStructureLabel}</p>
      {example.folderNote && (
        <p className="text-orange-700 text-sm">{example.folderNote}</p>
      )}
      <CodeSnippet code={example.folderStructure} />

      {/* MCP設定ファイル (Claude Code の場合のみ) */}
      {example.mcpConfigCode && example.mcpConfigDescription && (
        <>
          <p className="mt-2 font-medium text-orange-800">
            {example.mcpConfigDescription}
          </p>
          <CodeSnippet code={example.mcpConfigCode} />
        </>
      )}

      {/* ワークフローファイル */}
      <p className="mt-2 font-medium text-orange-800">{workflowLabel}</p>
      <CodeSnippet code={example.workflowCode} />

      {/* 出力イメージ */}
      <p className="mt-4 font-medium text-orange-800">{outputImageLabel}</p>
      <p>{example.outputDescription}</p>
      <div className="mt-2 flex justify-center">
        <Image
          alt={example.screenshotAlt}
          className="rounded-lg border border-orange-200"
          height={example.screenshotHeight}
          loading="lazy"
          src={example.screenshotPath}
          width={example.screenshotWidth}
        />
      </div>
    </SubSection>
  );
}

export function DocsMcpPage({ language, currentUrlPath }: Props) {
  const texts = getMcpTexts(language);
  const useCasesLabel = language === "ja" ? "使用例:" : "Use cases:";

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-4 py-8 sm:gap-7 sm:px-10 sm:py-[60px]">
        {/* セクション1: LGTMeow MCPサーバー (概要) */}
        <Section title={texts.overview.title}>
          <p>{texts.overview.intro}</p>
          <p className="font-medium">{useCasesLabel}</p>
          <ul className="list-disc pl-6">
            {texts.overview.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </Section>

        {/* セクション2: 利用可能ツール */}
        <Section title={texts.availableTools.title}>
          {texts.availableTools.tools.map((tool) => (
            <ToolSection key={tool.name} language={language} tool={tool} />
          ))}
        </Section>

        {/* セクション3: MCPクライアントの設定方法 */}
        <Section title={texts.clientConfig.title}>
          <p>{texts.clientConfig.intro.main}</p>
          <div className="flex flex-col gap-1 rounded-lg bg-orange-50 p-4">
            <p className="font-medium text-orange-800">
              【{texts.clientConfig.intro.authTitle}】
            </p>
            <p className="text-orange-700 text-sm">
              {texts.clientConfig.intro.authDescription}
            </p>
            <p className="mt-2 font-medium text-orange-800">
              【{texts.clientConfig.intro.serverUrlTitle}】
            </p>
            <CodeSnippet
              code={texts.clientConfig.intro.serverUrl}
              variant="inline"
            />
          </div>
          <p className="mt-2">{texts.clientConfig.patternsIntro}</p>
          {texts.clientConfig.patterns.map((pattern, index) => (
            <ConfigPatternSection
              index={index}
              key={pattern.title}
              pattern={pattern}
            />
          ))}
        </Section>

        {/* セクション4: GitHub Actionsで LGTM画像を自動コメントする */}
        <Section title={texts.githubActions.title}>
          {texts.githubActions.examples.map((example) => (
            <GitHubActionsExampleSection
              example={example}
              key={example.title}
              language={language}
            />
          ))}
        </Section>
      </div>
    </PageLayout>
  );
}
```

**重要な変更点**:

1. **サーバーコンポーネントのまま維持**: `"use client"` ディレクティブを追加しない
2. **CodeSnippet クライアントコンポーネントを使用**: コードブロック表示には `CodeSnippet` を使用
3. `getMcpTexts` 関数からテキストを取得
4. Section、SubSection、ToolSection、ConfigPatternSection、GitHubActionsExampleSection の各コンポーネントを作成
5. 画像は Next.js の `Image` コンポーネントを使用

---

### 4. src/features/docs/__tests__/functions/mcp-text.test.ts の新規作成

**ファイルパス**: `src/features/docs/__tests__/functions/mcp-text.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import { getMcpTexts } from "@/features/docs/functions/mcp-text";
import type { Language } from "@/features/language";

describe("src/features/docs/functions/mcp-text.ts getMcpTexts TestCases", () => {
  interface TestTable {
    readonly language: Language;
    readonly expectedOverviewTitle: string;
    readonly expectedAvailableToolsTitle: string;
    readonly expectedClientConfigTitle: string;
    readonly expectedGithubActionsTitle: string;
  }

  it.each`
    language | expectedOverviewTitle       | expectedAvailableToolsTitle | expectedClientConfigTitle       | expectedGithubActionsTitle
    ${"ja"}  | ${"LGTMeow MCPサーバー"}    | ${"利用可能ツール"}         | ${"MCPクライアントの設定方法"}  | ${"GitHub Actionsで LGTM画像を自動コメントする"}
    ${"en"}  | ${"LGTMeow MCP Server"}     | ${"Available Tools"}        | ${"MCP Client Configuration"}   | ${"Auto-comment LGTM Images with GitHub Actions"}
  `(
    "should return correct section titles when language is $language",
    ({
      language,
      expectedOverviewTitle,
      expectedAvailableToolsTitle,
      expectedClientConfigTitle,
      expectedGithubActionsTitle,
    }: TestTable) => {
      const result = getMcpTexts(language);

      expect(result.overview.title).toBe(expectedOverviewTitle);
      expect(result.availableTools.title).toBe(expectedAvailableToolsTitle);
      expect(result.clientConfig.title).toBe(expectedClientConfigTitle);
      expect(result.githubActions.title).toBe(expectedGithubActionsTitle);
    }
  );

  it("should return 3 available tools", () => {
    const result = getMcpTexts("ja");

    expect(result.availableTools.tools).toHaveLength(3);
    expect(result.availableTools.tools[0].name).toBe("get_random_lgtm_images");
    expect(result.availableTools.tools[1].name).toBe(
      "get_recently_created_lgtm_images"
    );
    expect(result.availableTools.tools[2].name).toBe("get_random_lgtm_markdown");
  });

  it("should return 3 client config patterns", () => {
    const result = getMcpTexts("ja");

    expect(result.clientConfig.patterns).toHaveLength(3);
  });

  it("should return 2 GitHub Actions examples", () => {
    const result = getMcpTexts("ja");

    expect(result.githubActions.examples).toHaveLength(2);
    expect(result.githubActions.examples[0].title).toContain("Claude Code");
    expect(result.githubActions.examples[1].title).toContain("Codex");
  });

  it("should include correct server URL in client config", () => {
    const result = getMcpTexts("ja");

    expect(result.clientConfig.intro.serverUrl).toBe(
      "https://api.lgtmeow.com/sse"
    );
  });

  it("should include correct screenshot paths and dimensions", () => {
    const result = getMcpTexts("ja");

    // Claude Code Action screenshot
    expect(result.githubActions.examples[0].screenshotPath).toBe(
      "/screenshots/claude-auto-review-with-lgtmeow-mcp.webp"
    );
    expect(result.githubActions.examples[0].screenshotWidth).toBe(700);
    expect(result.githubActions.examples[0].screenshotHeight).toBe(496);

    // Codex Action screenshot
    expect(result.githubActions.examples[1].screenshotPath).toBe(
      "/screenshots/codex-auto-review-with-lgtmeow-mcp.webp"
    );
    expect(result.githubActions.examples[1].screenshotWidth).toBe(700);
    expect(result.githubActions.examples[1].screenshotHeight).toBe(406);
  });

  it("should return Japanese texts with correct structure", () => {
    const result = getMcpTexts("ja");

    // Overview
    expect(result.overview.intro).toContain("MCP");
    expect(result.overview.useCases).toHaveLength(2);

    // Client config
    expect(result.clientConfig.intro.authTitle).toBe("認証について");
    expect(result.clientConfig.intro.authDescription).toContain("認証不要");

    // GitHub Actions
    expect(result.githubActions.examples[0].description).toContain(
      "Claude Code"
    );
    expect(result.githubActions.examples[1].folderNote).toContain("Codex");
  });

  it("should return English texts with correct structure", () => {
    const result = getMcpTexts("en");

    // Overview
    expect(result.overview.intro).toContain("MCP");
    expect(result.overview.useCases).toHaveLength(2);

    // Client config
    expect(result.clientConfig.intro.authTitle).toBe("Authentication");
    expect(result.clientConfig.intro.authDescription).toContain(
      "No authentication"
    );

    // GitHub Actions
    expect(result.githubActions.examples[0].description).toContain(
      "Claude Code"
    );
    expect(result.githubActions.examples[1].folderNote).toContain("Codex");
  });
});
```

---

### 5. src/features/docs/components/docs-mcp-page.stories.tsx の新規作成

**ファイルパス**: `src/features/docs/components/docs-mcp-page.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { DocsMcpPage } from "./docs-mcp-page";

const meta = {
  component: DocsMcpPage,
  title: "features/docs/DocsMcpPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocsMcpPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版MCPドキュメントページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/docs/mcp",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/docs/mcp",
      },
    },
  },
};

/**
 * 英語版MCPドキュメントページ
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en/docs/mcp",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/mcp",
      },
    },
  },
};
```

---

### 6. src/app/sitemap.xml の修正

**ファイルパス**: `src/app/sitemap.xml`

**追加するエントリ**:
- 追加位置: 英語版 `/en/docs/how-to-use/` エントリの `</url>` 終了タグの直後
- 以下のエントリを追加:

```xml
  <url>
    <loc>https://lgtmeow.com/docs/mcp/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/mcp/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/mcp/"/>
  </url>
  <url>
    <loc>https://lgtmeow.com/en/docs/mcp/</loc>
    <changefreq>monthly</changefreq>
    <xhtml:link
      rel="alternate"
      hreflang="ja"
      href="https://lgtmeow.com/docs/mcp/"/>
    <xhtml:link
      rel="alternate"
      hreflang="en"
      href="https://lgtmeow.com/en/docs/mcp/"/>
  </url>
```

---

## 修正対象ファイル一覧

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/docs/functions/mcp-text.ts` | **新規作成** - テキスト取得関数 |
| `src/features/docs/__tests__/functions/mcp-text.test.ts` | **新規作成** - テキスト取得関数のテスト |
| `src/features/docs/components/code-snippet.tsx` | **新規作成** - コードブロック表示用クライアントコンポーネント |
| `src/features/docs/components/docs-mcp-page.tsx` | コンテンツ実装 (サーバーコンポーネント) |
| `src/features/docs/components/docs-mcp-page.stories.tsx` | **新規作成** - Storybook |
| `src/app/sitemap.xml` | `/docs/mcp` エントリ追加 |

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: テキスト取得関数の作成

1. `src/features/docs/functions/mcp-text.ts` を新規作成

### Phase 2: テキスト取得関数のテスト作成

2. `src/features/docs/__tests__/functions/mcp-text.test.ts` を新規作成

### Phase 3: クライアントコンポーネントの作成

3. `src/features/docs/components/code-snippet.tsx` を新規作成 (HeroUI Snippet をラップ)

### Phase 4: ページコンポーネントの修正

4. `src/features/docs/components/docs-mcp-page.tsx` を修正 (サーバーコンポーネントのまま)

### Phase 5: Storybookの作成

5. `src/features/docs/components/docs-mcp-page.stories.tsx` を新規作成

### Phase 6: sitemap.xmlの更新

6. `src/app/sitemap.xml` に `/docs/mcp` エントリを追加

### Phase 7: 品質管理

7. `npm run format` を実行してコードをフォーマット
8. `npm run lint` を実行してLintエラーがないことを確認
9. `npm run test` を実行して全てパスすることを確認
10. Chrome DevTools MCP で `http://localhost:2222/docs/mcp` にアクセスして表示確認
11. Chrome DevTools MCP で `http://localhost:2222/en/docs/mcp` にアクセスして英語版の表示確認
12. Chrome DevTools MCP で `http://localhost:6006/` にアクセスしてStorybookの表示確認

**重要**: 各Phase完了後は次のPhaseに進む前に、変更が正しく動作することを確認すること

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

- [ ] ページ全体が正常に表示される
- [ ] 4つのセクションが順番通りに表示される
- [ ] 各セクションの見出しにオレンジ色の下線が表示される
- [ ] コードブロックが HeroUI Snippet で正常に表示される
- [ ] コードブロックのコピーボタンが正常に動作する
- [ ] 3つのツール情報が正常に表示される
- [ ] 3つの設定パターンが正常に表示される
- [ ] 2つのGitHub Actions例が正常に表示される
- [ ] スクリーンショット画像が正常に表示される

#### 英語版 (`http://localhost:2222/en/docs/mcp`)

- [ ] ページ全体が正常に表示される
- [ ] 4つのセクションが英語で表示される
- [ ] 全てのテキストが英語で表示される

#### レスポンシブ確認

Chrome DevTools のデバイスツールバーを使用:

- [ ] デスクトップ (1280px以上): 適切なレイアウトで表示
- [ ] タブレット (768px): 適切に縮小表示
- [ ] モバイル (375px): 適切にスタック表示、コードブロックは横スクロール可能

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし確認:

- [ ] `features/docs/DocsMcpPage` がサイドバーに表示される
- [ ] Japanese ストーリーが正常に表示される
- [ ] English ストーリーが正常に表示される
- [ ] コードブロックが正常に表示される
- [ ] 画像が正常に読み込まれる

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のルーティングファイル (`src/app/` 配下) の変更禁止** - コンポーネントのみ修正
3. **既存の関数 (`appBaseUrl` 等) の変更禁止**
4. **Issueで指定されていないセクションの追加禁止**
5. **画像アセットの追加・変更禁止** - 既存の画像をそのまま使用

---

## 成功基準

以下を全て満たすこと:

### ファイルの作成・修正

- [ ] `src/features/docs/functions/mcp-text.ts` が新規作成されている
- [ ] `src/features/docs/__tests__/functions/mcp-text.test.ts` が新規作成されている
- [ ] `src/features/docs/components/code-snippet.tsx` が新規作成されている (クライアントコンポーネント)
- [ ] `src/features/docs/components/docs-mcp-page.tsx` がコンテンツ実装されている (サーバーコンポーネント)
- [ ] `src/features/docs/components/docs-mcp-page.stories.tsx` が新規作成されている
- [ ] `src/app/sitemap.xml` に `/docs/mcp` エントリが追加されている

### コンテンツ確認

- [ ] 4つのセクションが全て表示される
- [ ] 日本語版と英語版で適切なテキストが表示される
- [ ] 3つのツール情報が正しく表示される
- [ ] 3つの設定パターンが正しく表示される
- [ ] 2つのGitHub Actions例が正しく表示される
- [ ] スクリーンショット画像が表示される

### スタイリング確認

- [ ] docs-how-to-use-page.tsx に準拠したスタイリング
- [ ] 見出しにオレンジ色の下線
- [ ] コードブロックが HeroUI Snippet で表示
- [ ] コードブロックのコピーボタンが正常に動作
- [ ] レスポンシブ対応

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 機能確認

- [ ] `/docs/mcp` が正常に表示される
- [ ] `/en/docs/mcp` が正常に表示される

---

## トラブルシューティング

### HeroUI Snippet がエラーになる場合

**原因**: `code-snippet.tsx` がクライアントコンポーネントとして宣言されていない可能性

**対処法**:
1. `src/features/docs/components/code-snippet.tsx` の先頭に `"use client";` ディレクティブが追加されているか確認
2. `@heroui/react` からの import が正しいか確認
3. `docs-mcp-page.tsx` から `CodeSnippet` を正しくインポートしているか確認

### 画像が表示されない場合

**原因**: 画像パスが間違っている可能性

**対処法**:
1. `public/screenshots/claude-auto-review-with-lgtmeow-mcp.webp` が存在するか確認
2. `public/screenshots/codex-auto-review-with-lgtmeow-mcp.webp` が存在するか確認
3. パスが `/screenshots/xxx.webp` (先頭にスラッシュ) になっているか確認

### コードブロックが正しく表示されない場合

**対処法**:
1. `Snippet` コンポーネントの props を確認
2. `hideSymbol` prop が設定されているか確認
3. `className` でオーバーフロー設定が正しいか確認

### Lintエラーが発生する場合

**対処法**:
1. `npm run format` を実行してコードをフォーマット
2. 再度 `npm run lint` を実行して確認
3. エラーメッセージに従って手動で修正

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### Phase 1: テキスト取得関数の作成
- [ ] `src/features/docs/functions/mcp-text.ts` を新規作成

### Phase 2: テキスト取得関数のテスト作成
- [ ] `src/features/docs/__tests__/functions/mcp-text.test.ts` を新規作成

### Phase 3: クライアントコンポーネントの作成
- [ ] `src/features/docs/components/code-snippet.tsx` を新規作成

### Phase 4: ページコンポーネントの修正
- [ ] `src/features/docs/components/docs-mcp-page.tsx` を修正 (サーバーコンポーネントのまま)

### Phase 5: Storybookの作成
- [ ] `src/features/docs/components/docs-mcp-page.stories.tsx` を新規作成

### Phase 6: sitemap.xmlの更新
- [ ] `src/app/sitemap.xml` に `/docs/mcp` エントリを追加

### Phase 7: 品質管理
- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] Chrome DevTools MCP で `/docs/mcp` の表示確認完了
- [ ] Chrome DevTools MCP で `/en/docs/mcp` の表示確認完了
- [ ] Chrome DevTools MCP で `http://localhost:6006/` の表示確認完了

### 最終確認
- [ ] 4つのセクションが全て正しく表示される
- [ ] 日英両方の言語で正常に動作する
- [ ] テストコードが全てパスする
- [ ] sitemap.xml に正しいエントリが追加されている
- [ ] ページ全体がサーバーコンポーネントのまま維持されている
- [ ] CodeSnippet のみがクライアントコンポーネントになっている
- [ ] 不要な変更が含まれていない
