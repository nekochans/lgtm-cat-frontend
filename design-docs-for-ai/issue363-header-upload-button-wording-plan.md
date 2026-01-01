# Issue #363: Headerのアップロードボタン英語文言修正 - 詳細実装計画書

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
| Header アップロードリンク (英語) | Upload new Cats | Upload Cat |
| 修正ファイル数 | 1ファイル | `src/components/header-i18n.ts` のみ |
| 修正関数数 | 1関数 | `uploadText` |

**変更の本質**: Figmaデザインに合わせて、Headerのアップロードリンクの英語文言を「Upload new Cats」から「Upload Cat」に変更する

**重要**: この変更はHeaderのアップロードリンクテキストのみに影響します。日本語版 (「アップロード」) は変更しません。

---

## 概要

### 目的

`src/components/header-i18n.ts` の `uploadText` 関数で、英語の場合の返り値を「Upload new Cats」から「Upload Cat」に変更し、Figmaデザインと一致させる。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/363

### Done の定義 (Issueより抜粋)

> - [ ] Headerのアップロードの英語文言が `Upload Cat` に変更されていること

**注意**: Issue #363 には他にも3つの変更項目がありますが、それらは既に完了済みです。本計画書は上記1項目のみを対象としています。

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **言語**: TypeScript
- **対象ファイル**: `src/components/header-i18n.ts`

### 変更理由

1. **Figmaデザインとの整合性**: Figma上で「Upload Cat」に変更済みのデザインと一致させる
2. **他のボタン変更との整合性**: 同じIssue内の他の3つの文言変更 (Copy Random Cat, Show Latest Cats, Refresh Cats) は既に完了しており、本変更が最後の残作業

### 背景情報

Issue #363では以下の4つの英語文言変更が対象でしたが、3つは既に完了しています:

| 対象 | 変更後の文言 | ステータス |
|------|-------------|----------|
| Header アップロードリンク | Upload Cat | **未完了 (本対応)** |
| ランダムコピーボタン | Copy Random Cat | 完了済み |
| ねこ新着順ボタン | Show Latest Cats | 完了済み |
| リフレッシュボタン | Refresh Cats | 完了済み |

---

## ファイル構成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/components/header-i18n.ts` | `uploadText` 関数の英語文言を更新 |

### 関連ファイル (変更不要)

以下のファイルは `uploadText` 関数を使用していますが、直接の修正は不要です:

| ファイルパス | 役割 | 備考 |
|-------------|------|------|
| `src/components/header-desktop.tsx` | デスクトップ版Header | 61行目で `uploadText(language)` を呼び出し |
| `src/components/header-mobile.tsx` | モバイル版Header | 147行目で `uploadText(language)` を呼び出し |
| `src/components/header.tsx` | Header親コンポーネント | HeaderDesktopとHeaderMobileを切り替え |

### Storybookファイル (確認用)

| ファイルパス | 用途 |
|-------------|------|
| `src/components/header.stories.tsx` | Header全体のStory |
| `src/components/header-desktop.stories.tsx` | デスクトップ版HeaderのStory |
| `src/components/header-mobile.stories.tsx` | モバイル版HeaderのStory |

---

## 変更内容詳細

> **実装者への注意**
>
> 以下の1つの関数を修正してください。
> ファイル先頭のコメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` は変更しないこと。

### Step 1: uploadText 関数の修正

**ファイルパス**: `src/components/header-i18n.ts`
**行番号**: 5-14行目 (英語文言は10行目)

#### 現在のコード

```typescript
export function uploadText(language: Language): string {
  switch (language) {
    case "ja":
      return "アップロード";
    case "en":
      return "Upload new Cats";
    default:
      return assertNever(language);
  }
}
```

#### 変更後のコード

```typescript
export function uploadText(language: Language): string {
  switch (language) {
    case "ja":
      return "アップロード";
    case "en":
      return "Upload Cat";
    default:
      return assertNever(language);
  }
}
```

#### diff形式

```diff
 export function uploadText(language: Language): string {
   switch (language) {
     case "ja":
       return "アップロード";
     case "en":
-      return "Upload new Cats";
+      return "Upload Cat";
     default:
       return assertNever(language);
   }
 }
```

#### 変更ポイントの詳細

| 言語 | 変更前 | 変更後 | 変更内容 |
|------|--------|--------|----------|
| 日本語 | アップロード | アップロード | **変更なし** |
| 英語 | Upload new Cats | Upload Cat | 「new Cats」を「Cat」に変更 |

---

## 実装順序

### Step 1: ファイルを開く

`src/components/header-i18n.ts` を開く

### Step 2: uploadText 関数を修正

10行目の英語文言 `"Upload new Cats"` を `"Upload Cat"` に修正

```typescript
// 変更前 (10行目)
      return "Upload new Cats";

// 変更後 (10行目)
      return "Upload Cat";
```

### Step 3: 品質管理の実行

```bash
npm run format
npm run lint
npm run test
```

### Step 4: 動作確認

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

### 前提条件

- 開発サーバーが `http://localhost:2222` で起動していること
- Storybookが `http://localhost:6006` で起動していること

### 1. 英語版ホームページでの確認 (デスクトップ表示)

Chrome DevTools MCPを使って `http://localhost:2222/en/` にアクセスし、Headerのアップロードリンクを確認:

#### Step 1-1: ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222/en/"
```

#### Step 1-2: ウィンドウサイズをデスクトップサイズに設定

```
mcp__chrome-devtools__resize_page
  width: 1280
  height: 800
```

#### Step 1-3: スナップショットを取得してアップロードリンクを確認

```
mcp__chrome-devtools__take_snapshot
```

**期待される結果:**
- Headerにアップロードリンクがあり、テキストが `Upload Cat` になっていること

#### Step 1-4: スクリーンショットで目視確認

```
mcp__chrome-devtools__take_screenshot
```

**確認項目:**
- Headerのアップロードリンクが「Upload Cat」と表示されていること
- デザイン崩れがないこと

### 2. 英語版ホームページでの確認 (モバイル表示)

> **モバイル版Headerの構造**
>
> モバイル版 (md未満: 768px未満) では、アップロードリンクはハンバーガーメニュー内に配置されています。
>
> メニュー構造:
> - HOME
> - **Upload Cat** ← 確認対象
> - How to Use
> - How to Use MCP

#### Step 2-1: ウィンドウサイズをモバイルサイズに設定

```
mcp__chrome-devtools__resize_page
  width: 375
  height: 667
```

#### Step 2-2: ページをリロード (レスポンシブ対応のため)

```
mcp__chrome-devtools__navigate_page
  type: "reload"
```

#### Step 2-3: スナップショットを取得してハンバーガーメニューアイコンを特定

```
mcp__chrome-devtools__take_snapshot
```

ハンバーガーメニューアイコン (MenuIcon) は aria-label が「メニューを開く」または「Open menu」のボタンです。

#### Step 2-4: ハンバーガーメニューをクリック

```
mcp__chrome-devtools__click
  uid: (ハンバーガーメニューアイコンのuid)
```

#### Step 2-5: メニューが開いた状態でスナップショットを取得

```
mcp__chrome-devtools__take_snapshot
```

**期待される結果:**
- Drawer (右からスライドインするメニュー) が表示されている
- メニュー内に以下のリンクが順番に表示されている:
  - HOME
  - **Upload Cat** ← テキストが「Upload Cat」であることを確認
  - How to Use
  - How to Use MCP

#### Step 2-6: スクリーンショットで目視確認

```
mcp__chrome-devtools__take_screenshot
```

**確認項目:**
- モバイルメニュー内のアップロードリンクが「Upload Cat」と表示されていること
- デザイン崩れがないこと

#### Step 2-7: メニューを閉じる (次の確認のため)

```
mcp__chrome-devtools__click
  uid: (閉じるアイコンのuid)
```

閉じるアイコン (CloseIcon) は aria-label が「メニューを閉じる」または「Close menu」のボタンです。

### 3. 日本語版での確認 (変更がないこと)

#### Step 3-1: ウィンドウサイズをデスクトップサイズに戻す

```
mcp__chrome-devtools__resize_page
  width: 1280
  height: 800
```

#### Step 3-2: 日本語版ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222"
```

#### Step 3-3: スナップショットを取得

```
mcp__chrome-devtools__take_snapshot
```

**期待される結果:**
- Headerにアップロードリンクがあり、テキストが「アップロード」のままであること (変更されていないこと)

### 4. Storybookでの確認

> **Storybook Story名について**
>
> 以下のStoryが存在します (英語版のみ確認対象):
> - `HeaderInEnglish`: Header全体 (デスクトップ/モバイル自動切替)
> - `HeaderDesktopInEnglish`: デスクトップ版Header
> - `HeaderMobileInEnglish`: モバイル版Header

#### Step 4-1: デスクトップ版Header Storyを確認

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:6006/?path=/story/components-headerdesktop--header-desktop-in-english"
```

#### Step 4-2: スクリーンショットで確認

```
mcp__chrome-devtools__take_screenshot
```

**確認項目:**
- 英語版デスクトップHeaderのアップロードリンクが「Upload Cat」と表示されていること

#### Step 4-3: モバイル版Header Storyを確認

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:6006/?path=/story/components-headermobile--header-mobile-in-english"
```

#### Step 4-4: モバイル版はメニューを開いて確認

モバイル版Headerではアップロードリンクはハンバーガーメニュー内にあります。
Storybookのデフォルト表示ではメニューが閉じているため、手動で確認するか、Storyのinteractionsを確認してください。

```
mcp__chrome-devtools__take_screenshot
```

**確認項目:**
- モバイル版Headerが正常に表示されていること
- ハンバーガーメニューをクリックしてメニューを開くと、アップロードリンク「Upload Cat」が表示されること

---

## トラブルシューティング

### Q1: 文言が変更されていない場合

**確認事項:**
1. `src/components/header-i18n.ts` が正しく保存されているか確認
2. 開発サーバーを再起動: `npm run dev`
3. ブラウザのキャッシュをクリア (Ctrl+Shift+R または Cmd+Shift+R)

### Q2: Lintエラーが発生する場合

**対処:**
- `npm run format` を実行してフォーマットを修正

### Q3: Storybookで確認できない場合

**確認事項:**
1. Storybookが起動しているか確認: `npm run storybook`
2. ブラウザで `http://localhost:6006` にアクセスできるか確認

---

## 禁止事項

> **絶対厳守**
>
> 以下の行為は絶対に禁止です。違反した場合は実装をやり直してください。

| No. | 禁止事項 | 理由 |
|-----|----------|------|
| 1 | **依頼内容に関係のない無駄な修正** | スコープ外の変更はバグの原因 |
| 2 | **日本語文言の修正** | 「アップロード」は変更不要 |
| 3 | **他の関数の修正** | `uploadText` 以外は変更不要 |
| 4 | **header-desktop.tsx や header-mobile.tsx の修正** | 文言は header-i18n.ts で一元管理 |
| 5 | **テストコードの追加・修正** | 既存テストに影響なし |
| 6 | **Storybookファイルの修正** | 文言変更によりStoryの修正は不要 |

---

## 成功基準

以下を全て満たすこと:

### 文言変更

- [ ] 英語版Headerのアップロードリンクが「Upload Cat」になっている
- [ ] 日本語版Headerのアップロードリンクが「アップロード」のままである (変更されていない)

### デスクトップ・モバイル両対応

- [ ] デスクトップ版Header (md以上) でアップロードリンクが正しく表示される
- [ ] モバイル版Header (md未満) のメニュー内でアップロードリンクが正しく表示される

### コード品質

- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認

- [ ] `http://localhost:2222/en/` でデスクトップ版 (幅768px以上) Headerのアップロードリンクが「Upload Cat」
- [ ] `http://localhost:2222/en/` でモバイル版 (幅768px未満) Headerのメニュー内アップロードリンクが「Upload Cat」
- [ ] `http://localhost:2222` で日本語版が「アップロード」のまま
- [ ] Storybook `HeaderDesktopInEnglish` で英語版デスクトップHeaderが「Upload Cat」と表示される
- [ ] Storybook `HeaderMobileInEnglish` で英語版モバイルHeaderのメニュー内が「Upload Cat」と表示される
- [ ] デザイン崩れがない

---

## 最終チェックリスト

> **実装完了前に必ず確認**
>
> 全ての項目にチェックが入るまで実装完了とはなりません。

### Phase 1: ファイル修正

| チェック | ファイル | 確認項目 |
|:--------:|----------|----------|
| [ ] | `src/components/header-i18n.ts` | 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を変更していない |
| [ ] | `src/components/header-i18n.ts` | `uploadText` 関数の英語文言を `"Upload Cat"` に修正した |
| [ ] | `src/components/header-i18n.ts` | 日本語文言 `"アップロード"` を変更していない |
| [ ] | `src/components/header-i18n.ts` | 他の関数を変更していない |
| [ ] | 他のファイル | 修正していない |

### Phase 2: 品質管理

| チェック | コマンド | 期待結果 |
|:--------:|----------|----------|
| [ ] | `npm run format` | 正常完了 |
| [ ] | `npm run lint` | エラー0で完了 |
| [ ] | `npm run test` | 全テストパス |

### Phase 3: 動作確認 (Chrome DevTools MCP使用)

| チェック | 確認場所 | 確認項目 |
|:--------:|----------|----------|
| [ ] | `http://localhost:2222/en/` (幅1280px) | デスクトップHeaderのアップロードリンクが「Upload Cat」 |
| [ ] | `http://localhost:2222/en/` (幅375px) | モバイルメニュー内のアップロードリンクが「Upload Cat」 |
| [ ] | `http://localhost:2222` | 日本語版が「アップロード」のまま (変更されていない) |
| [ ] | Storybook `HeaderDesktopInEnglish` | デスクトップHeaderが「Upload Cat」と表示 |
| [ ] | Storybook `HeaderMobileInEnglish` | モバイルHeaderメニュー内が「Upload Cat」と表示 |
| [ ] | 全ページ | デザイン崩れがない |

---

## 参考情報

### 関連プロジェクトドキュメント

- [プロジェクトコーディングガイドライン](https://github.com/nekochans/lgtm-cat-frontend/blob/staging/docs/project-coding-guidelines.md)

### 既存の類似実装

- `src/features/main/service-description-text.ts`: ホームページのボタン文言 (Copy Random Cat, Show Latest Cats, Refresh Cats は既に変更済み)

### 関連コンポーネントの構造

```
src/components/header.tsx
├── HeaderMobile (md未満で表示)
│   └── uploadText(language) を使用 (147行目)
└── HeaderDesktop (md以上で表示)
    └── uploadText(language) を使用 (61行目)
```

---

**作成日**: 2026-01-01
**最終更新**: 2026-01-01 (レビュー3回目反映 - 最終版)
**対象Issue**: #363
**担当**: AI実装者
