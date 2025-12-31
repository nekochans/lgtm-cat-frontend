# Issue #365: Metaタグの文言調整 - 詳細実装計画書

## 目次

1. [クイックリファレンス](#クイックリファレンス)
2. [概要](#概要)
3. [ファイル構成](#ファイル構成)
4. [変更内容詳細](#変更内容詳細) - **実装はここから**
5. [実装順序](#実装順序)
6. [品質管理手順](#品質管理手順)
7. [動作確認手順](#動作確認手順)
8. [トラブルシューティング](#トラブルシューティング)
9. [禁止事項](#禁止事項)
10. [成功基準](#成功基準)
11. [最終チェックリスト](#最終チェックリスト)

---

## クイックリファレンス

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| Title (日本語) | LGTMeow 猫好きのためのLGTM画像共有サービス | LGTMeow \| 猫好きのためのLGTM画像作成・共有サービス |
| Title (英語) | LGTMeow \| LGTM image share service for cat lovers | LGTMeow \| Generate & Share LGTM Images for Cat Lovers |
| Description (日本語) | LGTMeowは可愛い猫のLGTM画像を共有出来るサービスです。 | LGTMeowは可愛い猫のLGTM画像を作成して共有できるサービスです。 |
| Description (英語) | LGTMeow is a service that allows you to share LGTM images of cats. | LGTMeow is a service for generating and sharing cute cat LGTM images. |
| 修正ファイル数 | 1ファイル | `src/features/meta-tag.ts` のみ |
| 修正関数数 | 2関数 | `homePageTitle`, `description` |

**変更の本質**: SEO最適化とサービス内容の正確な表現のため、Metaタグの文言を「共有」から「作成・共有」に更新する

**重要**: この変更はホームページのMetaタグ (title, description) のみに影響します。他のページ (upload, terms, privacy等) には影響しません。

---

## 概要

### 目的

`src/features/meta-tag.ts` の `homePageTitle` 関数と `description` 関数の文言を調整し、サービスの機能を正確に表現するとともに、英語圏での検索性を向上させる。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/365

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **言語**: TypeScript
- **対象ファイル**: `src/features/meta-tag.ts`

### 変更理由

1. **機能の正確な表現**: LGTMeowは画像を「共有」するだけでなく「作成」もできるサービスであるため
2. **SEO最適化**: 英語圏で検索されやすいワード (Generate, Share) を使用

---

## ファイル構成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/meta-tag.ts` | `homePageTitle` 関数と `description` 関数の文言を更新 |

### 変更不要のファイル

以下のファイルは関連していますが、今回の変更対象外です:

| ファイルパス | 理由 |
|-------------|------|
| `src/features/main/service-description-text.ts` | UI表示用テキスト。既に新しい文言が適用済み |
| `src/app/(default)/page.tsx` | ページコンポーネント。meta-tag.ts を参照しているだけ |
| `src/app/(default)/en/page.tsx` | 英語版ページコンポーネント。meta-tag.ts を参照しているだけ |

---

## 変更内容詳細

> **実装者への注意**
>
> 以下の2つの関数を修正してください。
> ファイル先頭のコメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` は変更しないこと。

> **Issue と実際のコードの差異について**
>
> Issue #365 の「現在」の description では「共有できるサービス」と記載されていますが、
> 実際のコードでは「共有出来るサービス」(漢字表記) となっています。
> 変更後は「共有できるサービス」(ひらがな表記) に統一されます。

### Step 1: homePageTitle 関数の修正

**ファイルパス**: `src/features/meta-tag.ts`
**行番号**: 34-43行目

#### 現在のコード

```typescript
function homePageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} 猫好きのためのLGTM画像共有サービス`;
    case "en":
      return `${defaultTitle} | LGTM image share service for cat lovers`;
    default:
      return assertNever(language);
  }
}
```

#### 変更後のコード

```typescript
function homePageTitle(language: Language): string {
  switch (language) {
    case "ja":
      return `${defaultTitle} | 猫好きのためのLGTM画像作成・共有サービス`;
    case "en":
      return `${defaultTitle} | Generate & Share LGTM Images for Cat Lovers`;
    default:
      return assertNever(language);
  }
}
```

#### diff形式

```diff
 function homePageTitle(language: Language): string {
   switch (language) {
     case "ja":
-      return `${defaultTitle} 猫好きのためのLGTM画像共有サービス`;
+      return `${defaultTitle} | 猫好きのためのLGTM画像作成・共有サービス`;
     case "en":
-      return `${defaultTitle} | LGTM image share service for cat lovers`;
+      return `${defaultTitle} | Generate & Share LGTM Images for Cat Lovers`;
     default:
       return assertNever(language);
   }
 }
```

#### 変更ポイントの詳細

| 言語 | 変更箇所 | 変更内容 |
|------|----------|----------|
| 日本語 | 区切り文字 | 半角スペースから半角パイプ + スペース「\| 」に変更 |
| 日本語 | 文言 | 「画像共有サービス」→「画像作成・共有サービス」 |
| 英語 | 区切り文字 | 変更なし (半角パイプ + スペース) |
| 英語 | 文言 | 完全に書き換え (SEO最適化) |

### Step 2: description 関数の修正

**ファイルパス**: `src/features/meta-tag.ts`
**行番号**: 133-142行目

#### 現在のコード

```typescript
function description(language: Language): string {
  switch (language) {
    case "ja":
      return `${appName}は可愛い猫のLGTM画像を共有出来るサービスです。`;
    case "en":
      return `${appName} is a service that allows you to share LGTM images of cats.`;
    default:
      return assertNever(language);
  }
}
```

#### 変更後のコード

```typescript
function description(language: Language): string {
  switch (language) {
    case "ja":
      return `${appName}は可愛い猫のLGTM画像を作成して共有できるサービスです。`;
    case "en":
      return `${appName} is a service for generating and sharing cute cat LGTM images.`;
    default:
      return assertNever(language);
  }
}
```

#### diff形式

```diff
 function description(language: Language): string {
   switch (language) {
     case "ja":
-      return `${appName}は可愛い猫のLGTM画像を共有出来るサービスです。`;
+      return `${appName}は可愛い猫のLGTM画像を作成して共有できるサービスです。`;
     case "en":
-      return `${appName} is a service that allows you to share LGTM images of cats.`;
+      return `${appName} is a service for generating and sharing cute cat LGTM images.`;
     default:
       return assertNever(language);
   }
 }
```

#### 変更ポイントの詳細

| 言語 | 変更内容 |
|------|----------|
| 日本語 | 「共有出来る」→「作成して共有できる」(「作成」を追加、「出来る」→「できる」ひらがな統一) |
| 英語 | 文全体を書き換え (より自然な英語表現とSEO最適化) |

---

## 実装順序

### Step 1: ファイルを開く

`src/features/meta-tag.ts` を開く

### Step 2: homePageTitle 関数を修正

1. 37行目の日本語タイトルを修正
2. 39行目の英語タイトルを修正

### Step 3: description 関数を修正

1. 136行目の日本語説明を修正
2. 138行目の英語説明を修正

### Step 4: 品質管理の実行

```bash
npm run format
npm run lint
npm run test
```

### Step 5: 動作確認

Chrome DevTools MCP で確認

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

### 1. 日本語版ホームページでの確認

Chrome DevTools MCPを使って `http://localhost:2222` にアクセスし、Metaタグを確認:

#### Step 1-1: ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222"
```

#### Step 1-2: ページタイトルの確認

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      return document.title;
    }
```

**期待される結果:**
```
LGTMeow | 猫好きのためのLGTM画像作成・共有サービス
```

#### Step 1-3: meta descriptionの確認

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const metaDesc = document.querySelector('meta[name="description"]');
      return metaDesc ? metaDesc.getAttribute('content') : 'not found';
    }
```

**期待される結果:**
```
LGTMeowは可愛い猫のLGTM画像を作成して共有できるサービスです。
```

#### Step 1-4: OGP titleの確認

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      return ogTitle ? ogTitle.getAttribute('content') : 'not found';
    }
```

**期待される結果:**
```
LGTMeow | 猫好きのためのLGTM画像作成・共有サービス
```

#### Step 1-5: OGP descriptionの確認

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      return ogDesc ? ogDesc.getAttribute('content') : 'not found';
    }
```

**期待される結果:**
```
LGTMeowは可愛い猫のLGTM画像を作成して共有できるサービスです。
```

### 2. 英語版ホームページでの確認

#### Step 2-1: ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222/en/"
```

#### Step 2-2: ページタイトルの確認

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      return document.title;
    }
```

**期待される結果:**
```
LGTMeow | Generate & Share LGTM Images for Cat Lovers
```

#### Step 2-3: meta descriptionの確認

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const metaDesc = document.querySelector('meta[name="description"]');
      return metaDesc ? metaDesc.getAttribute('content') : 'not found';
    }
```

**期待される結果:**
```
LGTMeow is a service for generating and sharing cute cat LGTM images.
```

#### Step 2-4: OGP titleの確認 (英語版)

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      return ogTitle ? ogTitle.getAttribute('content') : 'not found';
    }
```

**期待される結果:**
```
LGTMeow | Generate & Share LGTM Images for Cat Lovers
```

#### Step 2-5: OGP descriptionの確認 (英語版)

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      return ogDesc ? ogDesc.getAttribute('content') : 'not found';
    }
```

**期待される結果:**
```
LGTMeow is a service for generating and sharing cute cat LGTM images.
```

### 3-1. Twitter Card メタタグの確認 (日本語版)

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      return {
        title: twitterTitle ? twitterTitle.getAttribute('content') : 'not found',
        description: twitterDesc ? twitterDesc.getAttribute('content') : 'not found'
      };
    }
```

**期待される結果:**
```json
{
  "title": "LGTMeow | 猫好きのためのLGTM画像作成・共有サービス",
  "description": "LGTMeowは可愛い猫のLGTM画像を作成して共有できるサービスです。"
}
```

### 3-2. Twitter Card メタタグの確認 (英語版)

まず英語版ページに移動してから確認:

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222/en/"
```

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      return {
        title: twitterTitle ? twitterTitle.getAttribute('content') : 'not found',
        description: twitterDesc ? twitterDesc.getAttribute('content') : 'not found'
      };
    }
```

**期待される結果:**
```json
{
  "title": "LGTMeow | Generate & Share LGTM Images for Cat Lovers",
  "description": "LGTMeow is a service for generating and sharing cute cat LGTM images."
}
```

### 4. 表示確認 (デザイン崩れがないこと)

#### Step 4-1: 日本語版のスクリーンショット

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222"
```

```
mcp__chrome-devtools__take_screenshot
```

#### Step 4-2: 英語版のスクリーンショット

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222/en/"
```

```
mcp__chrome-devtools__take_screenshot
```

**確認項目:**
- ページが正常に表示されること
- デザイン崩れがないこと

### 5. Storybookでの確認

今回の変更は Metaタグのみであり、UIコンポーネントへの変更はないため、Storybookでの確認は**不要**です。

---

## トラブルシューティング

### Q1: タイトルが変更されていない場合

**確認事項:**
1. `src/features/meta-tag.ts` が正しく保存されているか確認
2. 開発サーバーを再起動: `npm run dev`
3. ブラウザのキャッシュをクリア (Ctrl+Shift+R または Cmd+Shift+R)

### Q2: Lintエラーが発生する場合

**対処:**
- `npm run format` を実行してフォーマットを修正

---

## 禁止事項

> **絶対厳守**
>
> 以下の行為は絶対に禁止です。違反した場合は実装をやり直してください。

| No. | 禁止事項 | 理由 |
|-----|----------|------|
| 1 | **依頼内容に関係のない無駄な修正** | スコープ外の変更はバグの原因 |
| 2 | **他の関数の修正** | `homePageTitle` と `description` 以外は変更不要 |
| 3 | **他のページタイトル (upload, terms等) の修正** | Issue #365 の対象外 |
| 4 | **service-description-text.ts の修正** | 既に新しい文言が適用済み |
| 5 | **テストコードの追加・修正** | 既存テストに影響なし |

---

## 成功基準

以下を全て満たすこと:

### Metaタグ (title, description)

- [ ] 日本語版 title が「LGTMeow | 猫好きのためのLGTM画像作成・共有サービス」になっている
- [ ] 英語版 title が「LGTMeow | Generate & Share LGTM Images for Cat Lovers」になっている
- [ ] 日本語版 description が「LGTMeowは可愛い猫のLGTM画像を作成して共有できるサービスです。」になっている
- [ ] 英語版 description が「LGTMeow is a service for generating and sharing cute cat LGTM images.」になっている

### OGP / Twitter Card

- [ ] 日本語版 og:title / twitter:title が新しい文言になっている
- [ ] 英語版 og:title / twitter:title が新しい文言になっている
- [ ] 日本語版 og:description / twitter:description が新しい文言になっている
- [ ] 英語版 og:description / twitter:description が新しい文言になっている

### コード品質

- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認

- [ ] `http://localhost:2222` で日本語版Metaタグが正しく表示される
- [ ] `http://localhost:2222/en/` で英語版Metaタグが正しく表示される
- [ ] デザイン崩れがない

---

## 最終チェックリスト

> **実装完了前に必ず確認**
>
> 全ての項目にチェックが入るまで実装完了とはなりません。

### Phase 1: ファイル修正

| チェック | ファイル | 確認項目 |
|:--------:|----------|----------|
| [ ] | `src/features/meta-tag.ts` | 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を変更していない |
| [ ] | `src/features/meta-tag.ts` | `homePageTitle` 関数の日本語タイトルを修正した |
| [ ] | `src/features/meta-tag.ts` | `homePageTitle` 関数の英語タイトルを修正した |
| [ ] | `src/features/meta-tag.ts` | `description` 関数の日本語説明を修正した |
| [ ] | `src/features/meta-tag.ts` | `description` 関数の英語説明を修正した |
| [ ] | `src/features/meta-tag.ts` | 他の関数を変更していない |

### Phase 2: 品質管理

| チェック | コマンド | 期待結果 |
|:--------:|----------|----------|
| [ ] | `npm run format` | 正常完了 |
| [ ] | `npm run lint` | エラー0で完了 |
| [ ] | `npm run test` | 全テストパス |

### Phase 3: 動作確認

| チェック | 確認場所 | 確認項目 |
|:--------:|----------|----------|
| [ ] | `http://localhost:2222` | ページタイトルが新しい日本語文言になっている |
| [ ] | `http://localhost:2222` | meta descriptionが新しい日本語文言になっている |
| [ ] | `http://localhost:2222/en/` | ページタイトルが新しい英語文言になっている |
| [ ] | `http://localhost:2222/en/` | meta descriptionが新しい英語文言になっている |
| [ ] | `http://localhost:2222` | OGP (og:title, og:description) が新しい日本語文言になっている |
| [ ] | `http://localhost:2222/en/` | OGP (og:title, og:description) が新しい英語文言になっている |
| [ ] | `http://localhost:2222` | Twitter Card (twitter:title, twitter:description) が新しい日本語文言になっている |
| [ ] | `http://localhost:2222/en/` | Twitter Card (twitter:title, twitter:description) が新しい英語文言になっている |
| [ ] | 全ページ | デザイン崩れがない |

---

## 参考情報

### 関連プロジェクトドキュメント

- [プロジェクトコーディングガイドライン](https://github.com/nekochans/lgtm-cat-frontend/blob/staging/docs/project-coding-guidelines.md)

### 既存の類似実装

- `src/features/main/service-description-text.ts`: UI表示用のサービス説明テキスト (既に新しい文言が適用済み)

---

**作成日**: 2025-12-31
**最終更新**: 2025-12-31 (レビュー3回目反映 - 最終版)
**対象Issue**: #365
**担当**: AI実装者
