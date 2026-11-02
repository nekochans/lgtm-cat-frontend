# lgtm-cat-frontend

LGTMeow（https://lgtmeow.com）のフロントエンド用 Next.js プロジェクト。

## ビルド・テスト・開発コマンド

| コマンド                     | 内容                                                 |
| ---------------------------- | ---------------------------------------------------- |
| `npm run dev`                | ポート 2222 でホットリロード付きの開発サーバーを起動 |
| `npm run build`              | 本番向けビルド。マージ前セルフチェックで実行する     |
| `npm run lint`               | Ultracite + Prettier のスタイル検証                  |
| `npm run format`             | コードのフォーマット（修正含む）                     |
| `npm run test`               | Vitest のユニット + Storybook 連携テスト             |
| `npm run test:coverage`      | CI 同等のカバレッジレポート出力                      |
| `npm run storybook`          | ポート 6006 で Storybook を起動                      |
| `npm run chromatic`          | Chromatic にビジュアル差分を送信                     |
| `npm run sync:agents-skills` | `.agents/skills/` を `.claude/skills/` に同期        |

## 品質管理の実行手順

特別な指示がない場合は、以下の順番で品質管理を実行する。

1. `npm run format` でコードをフォーマット
2. `npm run lint` でコードをチェック
3. `npm run test` で全てパスすることを確認
4. UI 変更時は、ブラウザで以下を表示確認
   - `http://localhost:2222`
   - `http://localhost:6006/`（Storybook）

## 利用可能な Skill

用途固有のワークフローは `.agents/skills/` 配下の Skill に分離している。以下の状況に該当する場合は、対応する Skill を読み込んでから作業すること。

| 状況                               | Skill 名           | 内容                                                |
| ---------------------------------- | ------------------ | --------------------------------------------------- |
| GitHub の Pull Request を作成する  | `create-pr`        | PR タイトル規約、本文テンプレート、ベースブランチ等 |
| Git コミットメッセージを作成する   | `git-commit`       | コミットメッセージ規約、issue 番号付与ルール        |
| Tailwind CSS v4 でスタイリングする | `tailwind-styling` | v4 構文ルール、Breaking Changes、新機能等           |
| Figma デザインを取り込む           | `figma-import`     | Figma Dev Mode MCP の利用ルール、注意事項           |

各 Skill の実体は `.agents/skills/<skill名>/SKILL.md` に格納されている。Claude Code・Codex CLI ともに自動的に Skill を発見するが、確実に呼び出したい場合は明示的に Skill 名を指定すること。

## ファイル編集時の注意

### AGENTS.md / CLAUDE.md の関係

- `AGENTS.md` が実体、`CLAUDE.md` は同ディレクトリの `AGENTS.md` への **相対パス symlink**
- 編集する際は **必ず `AGENTS.md` を編集** すること（CLAUDE.md は同一ファイルへの参照）
- 対象ディレクトリ: `./`, `src/`, `src/components/`, `src/features/`
- symlink を再作成する必要が生じた場合は、必ず相対パスで作成すること（絶対パスは他環境で動作しない）

```bash
# 各ディレクトリで実行
ln -s AGENTS.md CLAUDE.md
```

### Skill ファイル（`.agents/skills/` ↔ `.claude/skills/`）

- **`.agents/skills/<name>/` が実体**（Codex CLI 等が公式に読み込むパス）
- `.claude/skills/<name>/` は同期スクリプトでコピーされた複製（Claude Code 用）
- `.agents/skills/` 配下を編集したら **必ず `npm run sync:agents-skills` を実行** して `.claude/skills/` に反映する
- `.claude/skills/` 側を直接編集してはならない（次の同期実行時に上書きされる）
- CI が同期ズレを検出する

## GitHub Actions のワークフロー

- ジョブの `runs-on` は `ubuntu-latest` にする。OS の版を固定すると、版の乗り換え（24.04 → 26.04 のような更新）を人が追いかける必要があり、古い版に取り残されやすいため
- `ubuntu-latest` の切り替わりで CI が止まったときに限り、一時的に版を固定してよい。固定した行には、固定の理由と `ubuntu-latest` に戻す作業の Issue の URL をコメントで書く

## 関連ドキュメント

| 参照先                             | 内容                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| @src/AGENTS.md                     | `src/` 配下のレイヤー構造と依存関係ルール                    |
| @docs/project-coding-guidelines.md | プロジェクト固有のコーディング規約（型定義、命名、テスト等） |

## GitHub の利用ルール

`gh` コマンドで GitHub と連携できる。許可されている操作と、許可が必要な操作の区別は以下のとおり。

**許可なく実行可能：**

- Git へのコミット
- GitHub へのプッシュ
- GitHub への PR の作成
- GitHub への PR へのコメント追加
- GitHub Issue の新規作成
- GitHub Issue へのコメントの追加

**ユーザーの明示的な許可が必要：**

- PR のマージ（`staging` / `main` に反映され、取り消しが難しいため）

`main` と `staging` には直接コミット・プッシュしない。これらのブランチにいるときは、`feature/issue<番号>/<内容>` 形式の作業ブランチを作ってからコミットする。

PR 作成時は `create-pr` Skill、コミット時は `git-commit` Skill を参照すること。
