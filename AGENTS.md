# 🚨🚨🚨 【重要】ソースファイル必須事項（絶対厳守）

絶対厳守：編集前に必ずルールを読む

本ドキュメントはコーディング用AIエージェント向けの資料です。

## 📝 ソースファイル先頭コメント必須

全てのソースファイル（.ts .tsx）の先頭に必ず以下のコメントを記載：

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
```

既存ファイルにコメントがない場合は必ず追加すること。

## 他のファイルへの参照

**以下のように @<path> の形式で書かれている場合は別のファイルへの参照になりますので、対象ファイルを探して内容を確認してください。**

**以下に記載例を示します。**

@src/app/page.tsx（src/app/page.tsx を参照）
@docs/basic-coding-guidelines.md （docs/basic-coding-guidelines.md を参照）

## プロジェクト構成とモジュール

- Next.js 16 App Router を採用し、`src/app` にページ、`src/components` に共通 UI、`src/features` にドメインごとのロジックと `__tests__` を配置します。
- `src/utils` はヘルパー、`src/docs` は静的コンテンツ、`src/mocks` は MSW ハンドラー、`stories` と `.storybook` は Storybook 設定です。
- 公開アセットは `public/`、解析や仕様の補足は `docs/`、Sentry 関連は `sentry.*.config.ts` にまとまっています。

## ビルド・テスト・開発コマンド

- `npm run dev` : ポート 2222 でホットリロード付きの開発サーバーを起動します。
- `npm run build` : 本番向けビルドを生成します。マージ前セルフチェックで実行してください。
- `npm run lint` : Ultracite + Prettier のスタイル検証を行います。修正は `npm run format`。
- `npm run test` : Vitest のユニットテストと Storybook 連携テストを一括実行します。
- `npm run test:coverage` : CI 同等のカバレッジレポートを出力します。
- `npm run storybook` / `npm run chromatic` : UI をローカル確認し、Chromatic にビジュアル差分を送信します。

## 関連ドキュメント

### **重要: 基本的なコーディングガイドライン**

必ず以下のドキュメントを参照してから開発を開始してください:

@docs/basic-coding-guidelines.md

### **プロジェクト固有のコーディングガイドライン**

プロジェクト固有のコーディング規約とベストプラクティスについては以下に記載してありますので必ず見てください:

@docs/project-coding-guidelines.md

### **Tailwind CSS 4 コーディングガイドライン**

CSSはTailwind CSS 4を利用しています。以下のコーディングルールをご確認ください。

@docs/tailwind-css-v4-coding-guidelines.md

## GitとGitHubワークフロールール

### GitHubの利用ルール

GitHubのMCPサーバーを利用してGitHubへのPRを作成する事が可能です。

許可されている操作は以下の通りです。

- GitHubへのPRの作成
- GitHubへのPRへのコメントの追加
- GitHub Issueへのコメントの追加

### PR作成ルール

- ブランチはユーザーが作成しますので現在のブランチをそのまま利用します
- PRのタイトルは日本語で入力します
- PRの作成先は特別な指示がない場合は `staging` ブランチになります
- PRの説明欄は @.github/PULL_REQUEST_TEMPLATE.md を参考に入力します
- 対応issueがある場合は、PRの説明欄に `#<issue番号>` を記載します
- Issue番号は現在のブランチ名から取得出来ます、例えば `feature/issue7/add-docs` の場合は `7` がIssue番号になります
- PRの説明欄には主に以下の情報を含めてください

#### PRの説明欄に含めるべき情報

- 変更内容の詳細説明よりも、なぜその変更が必要なのかを重視
- 他に影響を受ける機能やAPIエンドポイントがあれば明記

#### 以下の情報はPRの説明欄に記載する事を禁止する

- 1つのissueで1つのPRとは限らないので `fix #issue番号` や `close #issue番号` のようなコメントは禁止します
- 全てのテストをパス、Linter、型チェックを通過などのコメント（テストやCIが通過しているのは当たり前でわざわざ書くべき事ではない）

## コーディング時に利用可能なツールについて

コーディングを効率的に行う為のツールです。必ず以下に目を通してください。

### Serena MCP ― コード検索・編集ツールセット（必ず優先）

| 分類                        | 主要ツール (mcp**serena**)                                                                        | 典型的な用途                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **ファイル / ディレクトリ** | `list_dir` / `find_file`                                                                          | ツリー俯瞰・ファイル名で高速検索                 |
| **全文検索**                | `search_for_pattern` / `replace_regex`                                                            | 正規表現を含む横断検索・一括置換                 |
| **シンボル検索**            | `get_symbols_overview` / `find_symbol` / `find_referencing_symbols`                               | 定義探索・参照逆引き                             |
| **シンボル編集**            | `insert_after_symbol` / `insert_before_symbol` / `replace_symbol_body`                            | 挿入・追記・リファクタ                           |
| **メモリ管理**              | `write_memory` / `read_memory` / `list_memories` / `delete_memory`                                | `.serena/memories/` への長期知識 CRUD            |
| **メンテナンス**            | `restart_language_server` / `switch_modes` / `summarize_changes` / `prepare_for_new_conversation` | LSP 再起動・モード切替・変更要約・新チャット準備 |

> **禁止**: 組み込み `Search / Read / Edit / Write` ツールは使用しない。
> **ロード手順**: チャット開始直後に `/mcp__serena__initial_instructions` を必ず実行してから作業を行う。

Serena MCPが使えない環境では仕方ないので通常の `Search / Read / Edit / Write` を使用しても良いが、Serena MCPの機能を優先的に利用すること。

### Gemini CLI ― Web 検索専用

外部情報を取得する必要がある場合は、次の Bash ツール呼び出しを **唯一の手段として使用** する。

```bash
gemini --prompt "WebSearch: <query>"
```

`gemini` が使えない環境の場合は通常のWeb検索ツールを使っても良い。

## **絶対禁止事項**

1. **依頼内容に関係のない無駄な修正を行う行為は絶体に禁止。**
2. **ビジネスロジックが誤っている状態で、テストコードを“上書きしてまで”合格させる行為は絶対に禁止。**
