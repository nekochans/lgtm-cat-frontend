# Issue #421: staging→mainへのリリースPR自動作成ワークフロー追加 - 詳細実装計画書

## 目次

1. [クイックリファレンス](#クイックリファレンス)
2. [概要](#概要)
3. [調査結果](#調査結果)
4. [ファイル構成](#ファイル構成)
5. [変更内容詳細](#変更内容詳細) - **実装はここから**
6. [実装順序](#実装順序)
7. [品質管理手順](#品質管理手順)
8. [動作確認手順](#動作確認手順)
9. [トラブルシューティング](#トラブルシューティング)
10. [禁止事項](#禁止事項)
11. [成功基準](#成功基準)
12. [最終チェックリスト](#最終チェックリスト)

---

## クイックリファレンス

### ワークフローファイル

| 項目 | 内容 |
|------|------|
| ファイルパス | `.github/workflows/create-release-pull-request.yml` |
| ステータス | **作成済み** (ユーザーが作成) |
| 確認事項 | 内容が正しいか確認のみ |

### CodeRabbit設定

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| ファイルパス | `.coderabbit.yaml` | `.coderabbit.yaml` |
| auto_review.labels | (未設定) | `- "!release-pull-request"` (リスト形式) |

**変更の本質**: `staging`ブランチへのマージ時に自動で`main`へのPRを作成し、そのPRはCodeRabbitレビューの対象外にする

### 重要な注意事項

> **本タスクの特性**
>
> - ワークフローファイル (.yml) と設定ファイル (.yaml) のみの変更です
> - ソースコード (.ts, .tsx) の変更はありません
> - Chrome DevTools MCP での動作確認は**不要**です
> - ワークフローの動作確認は `staging` ブランチへマージ後に GitHub 上で行います

---

## 概要

### 目的

1. `staging`ブランチにマージされた際に、自動で`main`ブランチへのPRを作成する
2. 自動作成・更新される`staging`から`main`へのPRは`CodeRabbit`のレビュー対象外にする

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/421

### Done の定義 (Issueより抜粋)

> - [ ] `staging` にマージされた際に自動で `main` へのPRを作成するように変更されている事
> - [ ] 自動作成・更新される `staging` から `main` へのPRは `CodeRabbit` のレビューの対象外になっている事

### 技術スタック

- **GitHub Actions**: ワークフロー自動実行
- **git-pr-release**: PRの自動作成ツール (Ruby gem)
- **CodeRabbit**: AIコードレビューツール

### 背景情報

このワークフローは、`staging`ブランチから`main`ブランチへのリリースPRを自動作成するためのものです。`git-pr-release`というRuby gemを使用して、`staging`と`main`の差分をまとめたPRを作成します。

自動作成されるPRには`release-pull-request`というラベルが付与されます。このラベルを持つPRは、CodeRabbitによる自動レビューを除外する必要があります。

---

## 調査結果

### git-pr-release について

`git-pr-release`は、2つのブランチ間のマージコミットを収集し、リリースPRを作成するRuby gemです。

**主要な環境変数:**

| 環境変数 | 説明 |
|----------|------|
| `GIT_PR_RELEASE_TOKEN` | GitHub APIアクセストークン |
| `GIT_PR_RELEASE_BRANCH_PRODUCTION` | 本番ブランチ名 (main) |
| `GIT_PR_RELEASE_BRANCH_STAGING` | ステージングブランチ名 (staging) |
| `GIT_PR_RELEASE_LABELS` | PRに付与するラベル |

**`--squashed`オプションについて:**

本プロジェクトでは `staging` ブランチへのマージ時にスカッシュマージを使用しているため、`--squashed` オプションが必須です。このオプションがないと、スカッシュマージされたコミットが正しく認識されません。

```bash
# スカッシュマージされたコミットも含めてPRを作成
git-pr-release --squashed
```

### CodeRabbit ラベル除外設定

CodeRabbitでは、`.coderabbit.yaml`の`reviews.auto_review.labels`設定で特定のラベルを持つPRを除外できます。

**設定形式 (リスト形式):**
```yaml
reviews:
  auto_review:
    labels:
      - "!label-to-ignore"
```

**設定形式 (配列形式):**
```yaml
reviews:
  auto_review:
    labels: ["!label-to-ignore"]
```

> **本プロジェクトでの形式**
>
> 既存の `.coderabbit.yaml` では `path_filters` がリスト形式 (ハイフン区切り) を使用しているため、統一性を保つために **リスト形式** を採用します。

ラベル名の先頭に`!`を付けることで、そのラベルを持つPRを自動レビューの対象外にします。

---

## ファイル構成

### 確認対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `.github/workflows/create-release-pull-request.yml` | **作成済み** - 内容が正しいか確認のみ |

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `.coderabbit.yaml` | `release-pull-request`ラベルを除外設定に追加 |

### 変更不要のファイル

| ファイルパス | 理由 |
|-------------|------|
| `.github/workflows/ci.yml` | CIワークフローは関係なし |
| `.github/workflows/chromatic.yml` | Chromaticワークフローは関係なし |
| ソースコードファイル | ワークフローと設定ファイルのみの変更 |

---

## 変更内容詳細

> **実装者への注意**
>
> 1. ワークフローファイルは既に作成されています。内容が正しいか確認してください。
> 2. CodeRabbit設定ファイルに`release-pull-request`ラベル除外設定を追加してください。

### Step 1: ワークフローファイルの確認

**ファイルパス**: `.github/workflows/create-release-pull-request.yml`

**確認項目:**
このファイルは既にユーザーによって作成されています。以下の内容と一致しているか確認してください。

#### 期待されるファイル内容

```yaml
name: create-release-pull-request

on:
  push:
    branches:
      - staging

jobs:
  git-pr-release:
    runs-on: ubuntu-24.04
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: setup ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 4.0.0
      - name: setup git-pr-release
        run: gem install --no-document git-pr-release
      - name: create a release pull request
        run: git-pr-release --squashed
        env:
          GIT_PR_RELEASE_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GIT_PR_RELEASE_BRANCH_PRODUCTION: main
          GIT_PR_RELEASE_BRANCH_STAGING: staging
          GIT_PR_RELEASE_LABELS: release-pull-request
          TZ: Asia/Tokyo
```

#### ワークフローの各ステップの説明

| ステップ | 説明 |
|----------|------|
| `checkout` | `fetch-depth: 0`で全履歴を取得 (git-pr-releaseがコミット履歴を解析するため必要) |
| `setup ruby` | Ruby 4.0.0をセットアップ |
| `setup git-pr-release` | git-pr-release gemをインストール |
| `create a release pull request` | PRを作成または更新 |

#### 環境変数の説明

| 環境変数 | 値 | 説明 |
|----------|-----|------|
| `GIT_PR_RELEASE_TOKEN` | `${{ secrets.GITHUB_TOKEN }}` | GitHub Actions が自動で提供するトークン |
| `GIT_PR_RELEASE_BRANCH_PRODUCTION` | `main` | マージ先のブランチ |
| `GIT_PR_RELEASE_BRANCH_STAGING` | `staging` | マージ元のブランチ |
| `GIT_PR_RELEASE_LABELS` | `release-pull-request` | PRに付与するラベル |
| `TZ` | `Asia/Tokyo` | タイムゾーン設定 |

### Step 2: CodeRabbit設定ファイルの修正

**ファイルパス**: `.coderabbit.yaml`

#### 現在のコード

```yaml
language: ja-JP
reviews:
  path_filters:
    - "!design-docs-for-ai/**"
```

#### 変更後のコード

```yaml
language: ja-JP
reviews:
  auto_review:
    labels:
      - "!release-pull-request"
  path_filters:
    - "!design-docs-for-ai/**"
```

#### diff形式

```diff
 language: ja-JP
 reviews:
+  auto_review:
+    labels:
+      - "!release-pull-request"
   path_filters:
     - "!design-docs-for-ai/**"
```

#### 変更ポイントの詳細

| 設定 | 説明 |
|------|------|
| `auto_review.labels` | 自動レビュー対象のラベル条件 |
| `!release-pull-request` | `!`プレフィックスにより、このラベルを持つPRを除外 |

---

## 実装順序

### Step 1: ワークフローファイルの確認

1. `.github/workflows/create-release-pull-request.yml` を開く
2. 内容がIssueに記載されたコードと一致しているか確認
3. **一致している場合**: 修正は不要、Step 2へ進む
4. **一致していない場合**: Issueに記載されたコードに修正する

> **ワークフローファイルが既に正しい場合**
>
> ユーザーが既にワークフローファイルを正しく作成している場合、Step 1は確認のみで修正は不要です。

### Step 2: CodeRabbit設定ファイルの修正

5. `.coderabbit.yaml` を開く
6. `reviews`セクションに`auto_review.labels`設定を追加:
   ```yaml
   auto_review:
     labels:
       - "!release-pull-request"
   ```
7. ファイルを保存

### Step 3: 品質管理

8. `npm run format` を実行
9. `npm run lint` を実行
10. `npm run test` を実行

> **品質管理の補足**
>
> 今回の変更は `.yml` と `.yaml` ファイルのみです。ソースコードの変更はないため、テストへの影響はありませんが、プロジェクトの品質管理ルールに従い実行してください。

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

---

## 動作確認手順

### 重要: 動作確認のタイミングについて

本タスクの動作確認は **2段階** に分かれます:

| フェーズ | タイミング | 確認内容 |
|----------|------------|----------|
| **Phase A** | PR作成前 (ローカル) | ファイル内容・YAML構文の確認 |
| **Phase B** | PRマージ後 (GitHub) | ワークフロー実行・PR自動作成・CodeRabbit除外の確認 |

> **注意**
>
> ワークフローの実際の動作確認 (Phase B) は、`staging` ブランチにマージした後に行います。ローカル環境でワークフローを実行することはできません。

---

### Phase A: PR作成前の確認 (ローカル)

#### 1. ファイル内容の確認

#### Step 1-1: ワークフローファイルの確認

以下のコマンドでワークフローファイルの内容を確認:

```bash
cat .github/workflows/create-release-pull-request.yml
```

**確認項目:**
- [ ] `on.push.branches`が`staging`になっている
- [ ] `runs-on`が`ubuntu-24.04`になっている
- [ ] `fetch-depth: 0`が設定されている
- [ ] `ruby-version: 4.0.0`が設定されている
- [ ] `GIT_PR_RELEASE_LABELS: release-pull-request`が設定されている

#### Step 1-2: CodeRabbit設定ファイルの確認

以下のコマンドでCodeRabbit設定ファイルの内容を確認:

```bash
cat .coderabbit.yaml
```

**確認項目:**
- [ ] `reviews.auto_review.labels`に`!release-pull-request`が含まれている
- [ ] 既存の`path_filters`設定が維持されている

#### 2. YAML構文の検証

ワークフローファイルとCodeRabbit設定ファイルのYAML構文が正しいか確認:

```bash
# YAMLの構文チェック (npx yaml-lintがある場合)
npx yaml-lint .github/workflows/create-release-pull-request.yml
npx yaml-lint .coderabbit.yaml
```

または、オンラインのYAMLバリデーターで検証してください。

> **Phase A 完了条件**
>
> - [ ] ワークフローファイルの内容がIssueのコードと一致
> - [ ] CodeRabbit設定に `!release-pull-request` が追加されている
> - [ ] 両ファイルのYAML構文エラーがない
> - [ ] `npm run format && npm run lint && npm run test` が全て成功

---

### Phase B: PRマージ後の確認 (GitHub)

> **このフェーズはPRを `staging` ブランチにマージした後に実行します**

#### 1. GitHub Actions ワークフローの確認

1. GitHubリポジトリの「Actions」タブを開く
2. 「create-release-pull-request」ワークフローを探す
3. 最新の実行結果が緑色 (成功) であることを確認
4. 失敗している場合はログを確認し、トラブルシューティングを参照

#### 2. 自動作成されたPRの確認

1. GitHubリポジトリの「Pull requests」タブを開く
2. `staging`→`main`のPRが自動作成されていることを確認
3. PRに`release-pull-request`ラベルが付いていることを確認

#### 3. CodeRabbit除外の確認

1. 自動作成されたPRのページを開く
2. CodeRabbitによる自動レビューコメントが**付いていない**ことを確認
3. 「Reviews」セクションにCodeRabbitが表示されていないことを確認

> **Phase B 完了条件**
>
> - [ ] ワークフローが正常に実行された
> - [ ] `staging`→`main`のPRが自動作成された
> - [ ] PRに`release-pull-request`ラベルが付いている
> - [ ] CodeRabbitの自動レビューが付いていない

---

## トラブルシューティング

### Q1: ワークフローが実行されない場合

**確認事項:**
1. ワークフローファイルが`.github/workflows/`ディレクトリにあるか確認
2. ファイル名が正しいか確認 (`create-release-pull-request.yml`)
3. YAMLの構文エラーがないか確認
4. `staging`ブランチにマージされたか確認 (ワークフローは`push`イベントで発火)

**対処:**
```bash
# ワークフローファイルの存在確認
ls -la .github/workflows/create-release-pull-request.yml

# YAML構文チェック
cat .github/workflows/create-release-pull-request.yml
```

### Q2: PRが作成されない場合

**確認事項:**
1. `staging`と`main`ブランチ間に差分があるか確認
2. GitHub Actionsのログでエラーを確認
3. `GITHUB_TOKEN`の権限が正しいか確認 (`contents: write`, `pull-requests: write`)
4. 既に同じPRが存在する場合は更新される (新規作成ではない)

**対処:**
```bash
# staging と main の差分確認
git log main..staging --oneline
```

### Q3: CodeRabbitがレビューしてしまう場合

**確認事項:**
1. `.coderabbit.yaml`の構文が正しいか確認
2. `auto_review.labels`に`!release-pull-request`が正しく設定されているか確認
3. PRに`release-pull-request`ラベルが付いているか確認
4. CodeRabbitがラベルを認識するまで時間がかかる場合がある

**対処:**
```bash
# CodeRabbit設定の確認
cat .coderabbit.yaml
```

### Q4: Ruby 4.0.0のセットアップに失敗する場合

**確認事項:**
- `ruby/setup-ruby@v1`アクションが最新か確認
- Ruby 4.0.0の利用可能性を確認

**対処:**
- Ruby 4.0.0がまだリリースされていない場合は、安定版のRuby (例: 3.3.6) に変更することを検討

```yaml
# 代替案: 安定版Rubyを使用
- name: setup ruby
  uses: ruby/setup-ruby@v1
  with:
    ruby-version: '3.3'  # または '3.3.6'
```

> **Ruby 4.0.0 について**
>
> Ruby 4.0.0はIssueに記載されたバージョンです。2026年1月時点でRuby 4.0.0が利用可能であれば問題ありませんが、利用できない場合は最新の安定版Ruby 3.x系を使用してください。
> ユーザーに確認の上、適切なバージョンに変更することを推奨します。

### Q5: ラベルが作成されていない場合

**確認事項:**
- リポジトリに`release-pull-request`ラベルが存在するか確認

**対処:**
- `git-pr-release`は自動でラベルを作成します
- もしラベルが作成されない場合は、GitHubのUI上で手動で作成してください:
  1. リポジトリの「Issues」→「Labels」を開く
  2. 「New label」をクリック
  3. ラベル名: `release-pull-request`
  4. 色: 任意
  5. 「Create label」をクリック

---

## 禁止事項

> **絶対厳守**
>
> 以下の行為は絶対に禁止です。違反した場合は実装をやり直してください。

| No. | 禁止事項 | 理由 |
|-----|----------|------|
| 1 | **依頼内容に関係のない無駄な修正** | スコープ外の変更はバグの原因 |
| 2 | **他のワークフローファイルの修正** | ci.yml, chromatic.yml は変更不要 |
| 3 | **ソースコードの修正** | 今回はワークフローと設定ファイルのみ |
| 4 | **既存のpath_filters設定の削除** | design-docs-for-ai の除外設定は維持 |
| 5 | **language設定の変更** | 日本語レビュー設定は維持 |
| 6 | **ワークフローファイルの不要な変更** | ユーザーが作成したファイルが正しい場合は修正不要 |
| 7 | **Ruby バージョンの勝手な変更** | Ruby 4.0.0 が動作しない場合はユーザーに確認を取る |

---

## 成功基準

以下を全て満たすこと:

### ワークフローファイル

- [ ] `.github/workflows/create-release-pull-request.yml` が存在する
- [ ] `on.push.branches` が `staging` に設定されている
- [ ] `runs-on: ubuntu-24.04` が設定されている
- [ ] `fetch-depth: 0` が設定されている
- [ ] `ruby-version: 4.0.0` が設定されている
- [ ] `GIT_PR_RELEASE_LABELS: release-pull-request` が設定されている
- [ ] `--squashed` オプションが指定されている
- [ ] YAMLの構文エラーがない

### CodeRabbit設定

- [ ] `.coderabbit.yaml` に `auto_review.labels` 設定が追加されている
- [ ] `!release-pull-request` がラベル除外リストに含まれている
- [ ] 既存の `language: ja-JP` 設定が維持されている
- [ ] 既存の `path_filters` 設定が維持されている
- [ ] YAMLの構文エラーがない

### コード品質

- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認 (マージ後)

- [ ] `staging` へのマージ時にワークフローが実行される
- [ ] `staging`→`main` のPRが自動作成される
- [ ] 作成されたPRに `release-pull-request` ラベルが付いている
- [ ] CodeRabbitの自動レビューが付かない

---

## 最終チェックリスト

> **実装完了前に必ず確認**
>
> Phase A (PR作成前) の全項目にチェックが入るまでPRを作成しないでください。
> Phase B (マージ後) はPRを`staging`にマージした後に確認してください。

---

### Phase A: PR作成前チェック (必須)

#### A-1. ワークフローファイルの確認

| チェック | 確認項目 |
|:--------:|----------|
| [ ] | `.github/workflows/create-release-pull-request.yml` が存在する |
| [ ] | `on.push.branches` が `staging` になっている |
| [ ] | `runs-on: ubuntu-24.04` が設定されている |
| [ ] | `fetch-depth: 0` が設定されている |
| [ ] | `ruby-version: 4.0.0` が設定されている |
| [ ] | `GIT_PR_RELEASE_LABELS: release-pull-request` が設定されている |
| [ ] | `--squashed` オプションが指定されている |

#### A-2. CodeRabbit設定ファイルの確認

| チェック | 確認項目 |
|:--------:|----------|
| [ ] | `auto_review.labels` に `!release-pull-request` を追加した |
| [ ] | 既存の `language: ja-JP` を変更していない |
| [ ] | 既存の `path_filters` 設定を変更していない |

#### A-3. 品質管理

| チェック | コマンド | 期待結果 |
|:--------:|----------|----------|
| [ ] | `npm run format` | 正常完了 |
| [ ] | `npm run lint` | エラー0で完了 |
| [ ] | `npm run test` | 全テストパス |

#### A-4. YAML構文確認

| チェック | ファイル | 確認項目 |
|:--------:|----------|----------|
| [ ] | `.github/workflows/create-release-pull-request.yml` | YAMLの構文エラーがない |
| [ ] | `.coderabbit.yaml` | YAMLの構文エラーがない |

---

### Phase B: マージ後チェック (stagingマージ後に実施)

| チェック | 確認場所 | 確認項目 |
|:--------:|----------|----------|
| [ ] | GitHub Actions | ワークフローが正常に実行される |
| [ ] | GitHub Pull requests | `staging`→`main` のPRが自動作成される |
| [ ] | 自動作成されたPR | `release-pull-request` ラベルが付いている |
| [ ] | 自動作成されたPR | CodeRabbitの自動レビューが付いていない |

---

## 参考情報

### 公式ドキュメント

- [GitHub Actions ワークフロー構文](https://docs.github.com/ja/actions/using-workflows/workflow-syntax-for-github-actions)
- [git-pr-release GitHub](https://github.com/x-motemen/git-pr-release)
- [CodeRabbit 設定ドキュメント](https://docs.coderabbit.ai/configuration/)

### 関連プロジェクトファイル

- `.github/workflows/ci.yml`: CIワークフロー (参考)
- `.github/workflows/chromatic.yml`: Chromaticワークフロー (参考)

---

**作成日**: 2026-01-01
**最終更新**: 2026-01-01 (レビュー3回目反映 - 最終版)
**対象Issue**: #421
**担当**: AI実装者

### レビュー履歴

| 回 | 改善内容 |
|----|----------|
| 初版 | 実装計画書作成 |
| 1回目 | 重要な注意事項セクション追加、実装順序の詳細化、トラブルシューティング強化 (Q5追加、具体的なコマンド例追加)、Ruby 4.0.0の注意事項詳細化、CodeRabbit設定形式の明確化 |
| 2回目 | 動作確認手順をPhase A (PR作成前)/Phase B (マージ後)に明確分離、git-pr-releaseの--squashedオプション説明強化、禁止事項追加 (6,7)、最終チェックリストの構成改善 |
| 3回目 | 成功基準の項目を最終チェックリストと整合、CodeRabbit設定形式の説明強化 (リスト形式と配列形式の両方を記載し、本プロジェクトでの採用形式を明記)、全体の一貫性確認と用語統一 |
