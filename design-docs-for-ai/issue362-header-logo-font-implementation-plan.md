# Issue #362: ヘッダーロゴのフォント変更 - 詳細実装計画書

## 目次

1. [クイックリファレンス](#クイックリファレンス)
2. [概要](#概要)
3. [Next.js 外部フォント利用のベストプラクティス](#nextjs-外部フォント利用のベストプラクティス)
4. [ファイル構成](#ファイル構成)
5. [M PLUS Rounded 1c フォント情報](#m-plus-rounded-1c-フォント情報)
6. [パフォーマンス考慮事項](#パフォーマンス考慮事項)
7. [既存テストへの影響](#既存テストへの影響)
8. [コンポーネント修正詳細](#コンポーネント修正詳細) - **実装はここから**
9. [実装順序](#実装順序)
10. [品質管理手順](#品質管理手順)
11. [トラブルシューティング](#トラブルシューティング)
12. [アクセシビリティ考慮事項](#アクセシビリティ考慮事項)
13. [禁止事項](#禁止事項)
14. [成功基準](#成功基準)
15. [最終チェックリスト](#最終チェックリスト)

---

## クイックリファレンス

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| フォント | システムデフォルト | M PLUS Rounded 1c (700) |
| 新規ファイル数 | 0ファイル | 1ファイル (`src/app/fonts.ts`) |
| 修正ファイル数 | 0ファイル | 2ファイル (`layout.tsx`, `header-logo.tsx`) |
| 影響範囲 | HeaderLogo コンポーネントのみ | 同左 |

**変更の本質**: 「LGTMeow」テキストのフォントを M PLUS Rounded 1c に変更し、LGTM画像のフォントとデザインを統一する

**重要**: このフォント変更は Next.js の `next/font/google` を使用し、ビルド時にセルフホスティングされます。外部リクエストは発生しません。

---

## 概要

### 目的

`src/components/header-logo.tsx` の「LGTMeow」というテキストのフォントを Google Fonts の「M PLUS Rounded 1c」に変更する。これにより、LGTM画像のフォントとサービスタイトルのデザインを統一する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/362

### 技術スタック

- **フォント**: M PLUS Rounded 1c (Google Fonts)
- **フォント読み込み**: `next/font/google`
- **UIライブラリ**: `react-aria-components` (既にインストール済み)
- **スタイリング**: Tailwind CSS 4
- **フレームワーク**: Next.js 16 App Router
- **React**: v19

### 参考情報として確認したファイル

以下のファイルは今回の実装計画作成にあたり参考として確認しましたが、**変更は不要**です:

| ファイルパス | 確認理由 | 変更要否 |
|-------------|----------|----------|
| `src/proxy.ts` | ユーザーから提示されたファイル | 変更不要 (ミドルウェア関連で今回のフォント変更とは無関係) |
| `.storybook/preview.tsx` | Storybookでのフォント表示確認 | 変更不要 (globals.css を読み込んでいるため追加設定不要) |
| `.storybook/main.ts` | Storybook設定確認 | 変更不要 |
| `src/components/header-logo.stories.tsx` | Storybook確認 | 変更不要 |

---

## Next.js 外部フォント利用のベストプラクティス

### 公式ドキュメントに基づく推奨アプローチ

Next.js 16 で Google Fonts を使用する際のベストプラクティスは以下の通り:

1. **`next/font/google` を使用**: ビルド時にフォントをダウンロードし、セルフホスティングする
2. **CSS変数方式**: 特定のコンポーネントにのみフォントを適用する場合に最適
3. **フォント定義ファイルの分離**: 複数箇所で使用する場合はフォント定義を別ファイルに分離

### 選択したアプローチ

- **フォント定義ファイル方式**: `src/app/fonts.ts` にフォント定義を配置
- **CSS変数方式**: `layout.tsx` でCSS変数を設定し、`header-logo.tsx` で適用
- **理由**: 将来的に他の箇所でも同じフォントを使う可能性があり、再利用性を高めるため

---

## ファイル構成

### 新規作成ファイル

| ファイルパス | 内容 |
|-------------|------|
| `src/app/fonts.ts` | フォント定義ファイル (M PLUS Rounded 1c の設定) |

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/layout.tsx` | フォントのCSS変数をHTML要素に適用 |
| `src/components/header-logo.tsx` | テキストにフォントクラスを適用 |

### 変更不要のファイル

| ファイルパス | 理由 |
|-------------|------|
| `src/proxy.ts` | ミドルウェア関連で今回のフォント変更とは無関係 |
| `src/app/globals.css` | Tailwind CSS 4ではCSS変数を直接使用するため、`@theme`への追加は不要 |
| `.storybook/preview.tsx` | globals.css を読み込んでいるため追加設定不要 |
| `src/components/header-logo.stories.tsx` | ストーリー自体に変更不要 |

---

## M PLUS Rounded 1c フォント情報

### 利用可能なフォントウェイト

| Weight | 名称 |
|--------|------|
| 100 | Thin |
| 300 | Light |
| 400 | Regular |
| 500 | Medium |
| 700 | Bold |
| 800 | Extra-bold |
| 900 | Black |

### 今回使用するウェイト

- **700 (Bold)**: 現在 `header-logo.tsx` で `font-bold` を使用しているため

### サブセット

- **latin**: 「LGTMeow」は英字のみのため、`latin` サブセットで十分

---

## パフォーマンス考慮事項

### next/font/google のメリット

| 項目 | 説明 |
|------|------|
| **セルフホスティング** | ビルド時にフォントファイルをダウンロードし、アプリケーションと一緒にホスティング。外部リクエストなし |
| **最適化** | 使用するウェイト (700) とサブセット (latin) のみを含む最小限のフォントファイルを生成 |
| **プリロード** | layout.tsx で使用することで、フォントがプリロードされ、初回表示が高速化 |
| **レイアウトシフト防止** | `display: "swap"` により、フォント読み込み前はシステムフォントを表示。CLS (Cumulative Layout Shift) を最小化 |

### 推定ファイルサイズ

- **M PLUS Rounded 1c (weight: 700, subset: latin)**: 約20-30KB (gzip圧縮後)
- 英字のみの使用なので、日本語グリフは含まれず軽量

### フォントフォールバック動作

```
読み込み順序:
1. M PLUS Rounded 1c (weight: 700) を読み込み試行
2. 読み込み中: システムフォントで表示 (display: swap)
3. 読み込み完了: M PLUS Rounded 1c に切り替え
4. 読み込み失敗時: システムフォントのまま (graceful degradation)
```

---

## 既存テストへの影響

### 影響なし

今回の変更は以下の理由から既存テストに影響しません:

| テスト種別 | 影響 | 理由 |
|-----------|------|------|
| **ユニットテスト** | なし | フォント変更は視覚的変更のみ。ビジネスロジックに変更なし |
| **Storybookテスト** | なし | レンダリングエラーは発生しない (CSS変数未定義時はフォールバック) |
| **E2Eテスト** | なし | 機能テストに影響なし |

### 確認すべきテスト

```bash
npm run test
```

全てのテストがパスすることを確認。新規テストの追加は不要。

---

## コンポーネント修正詳細

> **実装者への注意**
>
> 以下の3つのファイルを順番に作成・修正してください。
> 各ファイルには必ず先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を含めること。

### Step 1: フォント定義ファイルの作成

**ファイルパス**: `src/app/fonts.ts` (新規作成)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { M_PLUS_Rounded_1c } from "next/font/google";

export const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-m-plus-rounded-1c",
});
```

**設定の説明**:

| オプション | 値 | 説明 |
|-----------|-----|------|
| `weight` | `"700"` | Bold ウェイトのみを読み込み (ファイルサイズ最小化) |
| `subsets` | `["latin"]` | 英字のみなので latin サブセットで十分 |
| `display` | `"swap"` | フォント読み込み中はシステムフォントを表示 (推奨) |
| `variable` | `"--font-m-plus-rounded-1c"` | CSS変数名 |

### Step 2: layout.tsx の修正

**ファイルパス**: `src/app/layout.tsx`

#### 変更1: import文の追加 (行5)

**diff形式:**
```diff
  // 絶対厳守：編集前に必ずAI実装ルールを読む
  import type { Metadata } from "next";
  import type { JSX, ReactNode } from "react";
  import "./globals.css";
+ import { mPlusRounded1c } from "./fonts";
  import { Providers } from "@/components/heroui/providers";
```

#### 変更2: html要素にclassNameを追加 (行47)

**diff形式:**
```diff
  export default function RootLayout({ children }: Props): JSX.Element {
    return (
-     <html lang={language} suppressHydrationWarning>
+     <html lang={language} suppressHydrationWarning className={mPlusRounded1c.variable}>
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }
```

**変更内容サマリ**:

| 変更箇所 | 行番号 | 変更内容 |
|----------|--------|----------|
| import追加 | 行5 (globals.cssの後) | `import { mPlusRounded1c } from "./fonts";` を追加 |
| html要素 | 行47 | `className={mPlusRounded1c.variable}` を追加 |

### Step 3: header-logo.tsx の修正

**ファイルパス**: `src/components/header-logo.tsx`

#### 変更: h1要素にstyle属性を追加 (行37-39)

**diff形式:**
```diff
-       <h1 className={`font-bold text-orange-50 no-underline ${textClasses}`}>
+       <h1
+         className={`font-bold text-orange-50 no-underline ${textClasses}`}
+         style={{ fontFamily: "var(--font-m-plus-rounded-1c)" }}
+       >
          <Text>LGTMeow</Text>
        </h1>
```

**変更内容サマリ**:

| 変更箇所 | 行番号 | 変更内容 |
|----------|--------|----------|
| h1要素 | 行37 | `style={{ fontFamily: "var(--font-m-plus-rounded-1c)" }}` を追加 |

**style属性を使用する理由**:

1. **CSS変数の仕組み**: `--font-m-plus-rounded-1c` は `next/font` が自動生成するフォントファミリー名 (例: `'__M_PLUS_Rounded_1c_abc123', '__M_PLUS_Rounded_1c_Fallback_abc123'`) を含む
2. **Tailwindクラスより可読性が高い**: `font-[family-name:var(--font-m-plus-rounded-1c)]` は長く複雑
3. **単一要素への適用**: 特定の1要素にのみ適用するため、globals.css への追加は過剰
4. **プロジェクトの慣習との整合**: 既存コードでも style 属性を適宜使用している

---

## レイアウト階層

```
RootLayout (layout.tsx)
├── html (className={mPlusRounded1c.variable}) ← CSS変数を定義
│   └── body
│       └── Providers
│           └── ...
│               └── HeaderLogo (header-logo.tsx)
│                   └── Link
│                       ├── LgtmCatIcon
│                       └── h1 (style={{ fontFamily: "var(--font-m-plus-rounded-1c)" }})
│                           └── Text "LGTMeow" ← フォント適用対象
```

---

## 実装順序

### Step 1: フォント定義ファイルの作成

1. `src/app/fonts.ts` を新規作成
2. 上記のコードを記述

### Step 2: layout.tsx の修正

1. `src/app/layout.tsx` を開く
2. `import { mPlusRounded1c } from "./fonts";` を追加 (行4の後)
3. `<html>` 要素に `className={mPlusRounded1c.variable}` を追加

### Step 3: header-logo.tsx の修正

1. `src/components/header-logo.tsx` を開く
2. h1要素にstyle属性を追加

### Step 4: 品質管理の実行

```bash
npm run format
npm run lint
npm run test
```

### Step 5: 動作確認

- Chrome DevTools MCPで `http://localhost:2222` にアクセス
- Chrome DevTools MCPで `http://localhost:6006/` にアクセス

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

Chrome DevTools MCPを使って `http://localhost:2222` にアクセスし、以下を確認:

#### Step 4-1: ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222"
```

#### Step 4-2: スクリーンショット撮影

```
mcp__chrome-devtools__take_screenshot
```

#### Step 4-3: フォント適用確認 (重要)

Chrome DevTools MCPのスナップショットでは視覚的なフォントの確認が難しいため、以下のスクリプトで確認:

```
mcp__chrome-devtools__evaluate_script
  function: |
    () => {
      const h1 = document.querySelector('h1');
      if (!h1) return 'h1 element not found';
      const fontFamily = window.getComputedStyle(h1).fontFamily;
      return { fontFamily, hasM_PLUS_Rounded_1c: fontFamily.includes('M_PLUS_Rounded_1c') };
    }
```

**期待される結果:**
- `hasM_PLUS_Rounded_1c: true`
- `fontFamily` に `__M_PLUS_Rounded_1c` が含まれている

#### Step 4-4: モバイルサイズでの確認

```
mcp__chrome-devtools__resize_page
  width: 375
  height: 667
```

その後、再度スクリーンショットを撮影して確認。

#### Step 4-5: デスクトップサイズに戻す

```
mcp__chrome-devtools__resize_page
  width: 1280
  height: 720
```

#### 確認項目チェックリスト

- [ ] 「LGTMeow」テキストが M PLUS Rounded 1c フォントで表示されている (evaluate_scriptで確認)
- [ ] フォントが丸みを帯びたデザインになっている (スクリーンショットで視覚確認)
- [ ] テキストが太字 (Bold) で表示されている
- [ ] デスクトップサイズ (1280x720) での表示が崩れていない
- [ ] モバイルサイズ (375x667) での表示が崩れていない

### 5. Storybookでの表示確認

Chrome DevTools MCPを使って `http://localhost:6006/` にアクセスし、以下を確認:

#### 重要: Storybookでのフォント動作について

Storybookは Next.js の `layout.tsx` を経由せずにコンポーネントをレンダリングするため、CSS変数 `--font-m-plus-rounded-1c` が定義されません。

**期待される動作:**
- Storybookでは `header-logo.tsx` の `style={{ fontFamily: "var(--font-m-plus-rounded-1c)" }}` は **システムフォントにフォールバック** される
- これは**問題ではありません** - 本番環境では `layout.tsx` でCSS変数が正しく定義されるためです

**確認すべき点:**
- Storybookでコンポーネントがエラーなく表示されること
- レイアウトが崩れていないこと
- **フォントの見た目は開発サーバー (`http://localhost:2222`) で確認すること**

#### 確認対象ストーリー

- `HeaderLogo` > `HomeLinkIsJapanese`
- `HeaderLogo` > `HomeLinkIsEnglish`

#### Storybook確認手順

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:6006/?path=/story/headerlogo--home-link-is-japanese"
```

スクリーンショットを撮影:
```
mcp__chrome-devtools__take_screenshot
```

#### 確認項目

- [ ] 日本語版ストーリーでコンポーネントがエラーなく表示される
- [ ] 英語版ストーリーでコンポーネントがエラーなく表示される
- [ ] ヘッダーロゴのレイアウトが崩れていない
- [ ] アイコンとテキストの配置が正常
- [ ] コンソールにエラーが出力されていない

### 6. デザイン崩れの調査

Chrome DevTools MCP を使ってデザイン崩れがないか確認すること。特に以下の点に注意:

#### 必須チェック項目

- [ ] ヘッダーロゴのレイアウトが崩れていない
- [ ] テキストとアイコンの間隔が適切 (`gap-0.5`)
- [ ] デスクトップサイズ (`h-10 w-[218px]`) で表示が正常
- [ ] モバイルサイズ (`h-8 w-[146px]`) で表示が正常
- [ ] リンクのクリック領域が正常に機能している

---

## トラブルシューティング

### Q1: フォントが適用されない場合

**確認事項:**
1. `src/app/fonts.ts` が正しく作成されているか確認
2. `layout.tsx` で `mPlusRounded1c.variable` が `<html>` に適用されているか確認
3. `header-logo.tsx` で `style={{ fontFamily: "var(--font-m-plus-rounded-1c)" }}` が設定されているか確認
4. 開発サーバーを再起動: `npm run dev`

### Q2: ビルドエラーが発生する場合

**よくある原因:**
- インポートパスが間違っている
- フォント名のスペルミス (`M_PLUS_Rounded_1c` が正しい)

**対処:**
1. `next/font/google` からのインポートを確認
2. フォント名はアンダースコアで区切る: `M_PLUS_Rounded_1c`

### Q3: Storybookでフォントが表示されない場合

**確認事項:**
1. `.storybook/preview.tsx` で `../src/app/globals.css` がインポートされているか確認
2. Storybookサーバーを再起動: `npm run storybook`

### Q4: Lintエラーが発生する場合

**よくある原因:**
- インポート順序が不正
- 未使用のインポート

**対処:**
- `npm run format` を実行

---

## アクセシビリティ考慮事項

### 維持される機能

| 属性 | 値 | 説明 |
|------|-----|------|
| `<h1>` | 維持 | 見出しレベル1を維持 |
| `<Link>` | 維持 | ホームへのナビゲーション |
| `aria-hidden={true}` on Icon | 維持 | アイコンはスクリーンリーダーから隠す |

### フォント変更による影響

- **影響なし**: フォント変更は視覚的な変更のみ
- **影響なし**: テキストコンテンツ「LGTMeow」は変更なし
- **影響なし**: スクリーンリーダーの読み上げに影響なし

---

## 禁止事項

> **絶対厳守**
>
> 以下の行為は絶対に禁止です。違反した場合は実装をやり直してください。

| No. | 禁止事項 | 理由 |
|-----|----------|------|
| 1 | **依頼内容に関係のない無駄な修正** | スコープ外の変更はバグの原因 |
| 2 | **新しいパッケージのインストール** | `next/font/google` は Next.js に組み込み済み |
| 3 | **globals.css への追加** | CSS変数は `next/font` が自動管理 |
| 4 | **他のコンポーネントへのフォント適用** | 今回は `header-logo.tsx` のみ |
| 5 | **フォントウェイトの追加** | 700 (Bold) のみで十分、ファイルサイズ増加を防ぐ |
| 6 | **テストコードの上書き** | テストが失敗する場合は実装を修正 |

---

## 成功基準

以下を全て満たすこと:

### フォント適用

- [ ] 「LGTMeow」テキストが M PLUS Rounded 1c フォントで表示される
- [ ] フォントウェイトが 700 (Bold) で表示される
- [ ] LGTM画像のフォントとデザインの統一感がある

### コード品質

- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認

- [ ] `http://localhost:2222` でデスクトップ・モバイル両方で正常に表示される
- [ ] `http://localhost:6006/` のStorybookで HeaderLogo コンポーネントが正常に表示される

---

## 最終チェックリスト

> **実装完了前に必ず確認**
>
> 全ての項目にチェックが入るまで実装完了とはなりません。

### Phase 1: ファイル作成・修正

| チェック | ファイル | 確認項目 |
|:--------:|----------|----------|
| [ ] | `src/app/fonts.ts` | 新規作成した |
| [ ] | `src/app/fonts.ts` | 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を追加した |
| [ ] | `src/app/fonts.ts` | `M_PLUS_Rounded_1c` を `next/font/google` からインポートした |
| [ ] | `src/app/fonts.ts` | `weight: "700"`, `subsets: ["latin"]`, `display: "swap"` を設定した |
| [ ] | `src/app/layout.tsx` | `import { mPlusRounded1c } from "./fonts";` を追加した |
| [ ] | `src/app/layout.tsx` | `<html>` 要素に `className={mPlusRounded1c.variable}` を追加した |
| [ ] | `src/components/header-logo.tsx` | h1要素に `style={{ fontFamily: "var(--font-m-plus-rounded-1c)" }}` を追加した |
| [ ] | `src/components/header-logo.tsx` | 既存のクラス名は変更していない |

### Phase 2: 品質管理

| チェック | コマンド | 期待結果 |
|:--------:|----------|----------|
| [ ] | `npm run format` | 正常完了 |
| [ ] | `npm run lint` | エラー0で完了 |
| [ ] | `npm run test` | 全テストパス |

### Phase 3: 動作確認

| チェック | 確認場所 | 確認項目 |
|:--------:|----------|----------|
| [ ] | `http://localhost:2222` | ホームページが表示される |
| [ ] | `http://localhost:2222` | 「LGTMeow」が M PLUS Rounded 1c フォントで表示される (evaluate_scriptで確認) |
| [ ] | `http://localhost:2222` | デスクトップ・モバイルでレイアウト崩れなし |
| [ ] | `http://localhost:6006/` | HeaderLogo ストーリーが正常に表示される |
| [ ] | `http://localhost:6006/` | コンソールにエラーなし |

---

## 参考情報

### Next.js Font Module ドキュメント

- [Font Module API Reference](https://nextjs.org/docs/app/api-reference/components/font)
- [Google Fonts の使用方法](https://nextjs.org/docs/app/api-reference/components/font#google-fonts)
- [Tailwind CSS との統合](https://nextjs.org/docs/app/api-reference/components/font#with-tailwind-css)

### M PLUS Rounded 1c

- [Google Fonts ページ](https://fonts.google.com/specimen/M+PLUS+Rounded+1c)
- インポート名: `M_PLUS_Rounded_1c` (スペースと+をアンダースコアに置換)

### 関連プロジェクトドキュメント

- [プロジェクトコーディングガイドライン](../docs/project-coding-guidelines.md)
- [Tailwind CSS v4 コーディングガイドライン](../docs/tailwind-css-v4-coding-guidelines.md)

---

**作成日**: 2025-12-26
**最終更新**: 2025-12-26 (レビュー3回目反映 - 最終版)
**対象Issue**: #362
**担当**: AI実装者
