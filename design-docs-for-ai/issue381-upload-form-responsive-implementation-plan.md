# Issue #381: UploadForm レスポンシブ対応 - 詳細実装計画書

## 🚀 クイックリファレンス

| 変更内容 | モバイル | デスクトップ |
|---------|---------|-------------|
| 画像サイズ | 280×280px | 371×371px |
| ボタン配置 | 縦並び（flex-col） | 横並び（flex-row） |
| ボタン幅 | 100%（w-full） | 220px固定 |
| 成功テキスト | text-xl | text-3xl |
| 説明テキスト | text-sm | text-xl |
| 注意事項 | text-xs | text-base |
| プログレスバー | max-w-280px, h-6 | max-w-400px, h-7 |
| コンテナ高さ | min-h-360px, p-4 | min-h-600px, p-7 |
| ボタン縦並び間隔 | gap-3 (12px) | gap-5 (20px) |

**ブレークポイント**: `md:` (768px) を境界に切り替え

### 余白統一方針

モバイル共通の左右パディングは**親コンテナレベル**で `p-4 md:p-7` として定義し、子コンポーネントでは必要最小限の補足（`px-2` 等）のみを追加する方針とする。これにより、Storybook間での余白の揺れを防止する。

---

## 📋 概要

### 目的

`src/features/upload/components/upload-form.tsx` およびその子コンポーネントをレスポンシブ対応し、モバイル端末での表示崩れを修正する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/381

### 技術スタック

- **UIライブラリ**: `@heroui/react` (既にインストール済み)
- **スタイリング**: Tailwind CSS 4
- **フレームワーク**: Next.js 16 App Router
- **React**: v19

### 変更の背景

現在のスマートフォン表示では以下の問題が発生している：

1. 成功画面のテキスト「アップロード成功しました！」や説明テキストが横にはみ出している
2. 「Markdownソースをコピー」ボタンのテキストが見切れている
3. プレビュー確認画面の確認テキストが見切れている
4. ボタンが横並びのため、モバイル画面幅では収まらない
5. プログレスバーの幅が固定で、画面幅を超える

---

## 📁 ファイル構成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/upload/components/upload-form.tsx` | コンテナのレスポンシブ対応 |
| `src/features/upload/components/upload-preview.tsx` | 画像サイズ・ボタン配置のレスポンシブ対応 |
| `src/features/upload/components/upload-progress.tsx` | 画像サイズ・プログレスバーのレスポンシブ対応 |
| `src/features/upload/components/upload-success.tsx` | 画像サイズ・テキスト・ボタン配置のレスポンシブ対応 |
| `src/features/upload/components/upload-notes.tsx` | テキストサイズのレスポンシブ対応 |
| `src/features/upload/components/upload-error-message.tsx` | テキストサイズのレスポンシブ対応 |

### 変更不要のファイル

| ファイルパス | 理由 |
|-------------|------|
| `src/features/upload/components/upload-drop-area.tsx` | 現状でレスポンシブ対応済み（ボタン幅220pxは許容範囲） |

---

## 🎨 Figmaデザイン仕様

### ブレークポイント方針

- **モバイル**: `md` (768px) 未満
- **デスクトップ**: `md` (768px) 以上

Figmaのモバイルデザインは幅323pxを基準としている。

### Figmaデザインノード一覧

| ノードID | 状態 | 幅 | 高さ |
|---------|------|-----|------|
| 293:2064 | 初期状態 (idle) | 323px | - |
| 293:2098 | プレビュー確認 (preview) | 323px | 559px |
| 293:2172 | アップロード中 (uploading) | 323px | 447px |
| 293:2227 | 成功 (success) | 390px | 792px |
| 293:2293 | エラー (error) | 323px | 361px |

### 各状態のデザイン仕様

#### 初期状態 (idle) - node: 293:2064

```
構成要素:
- アップロードアイコン
- テキスト「ここに画像をドロップ」(text-xl/20px)
- ボタン「またはファイルの選択」(220px幅)
- 注意事項セクション

モバイル版の特徴:
- パディング: px-24 (96px) → モバイルでは縮小必要
- 注意事項テキスト: text-xs (12px)
- プライバシーポリシーテキスト: text-xs (12px)
```

#### プレビュー確認 (preview) - node: 293:2098

```
構成要素:
- プレビュー画像
- テキスト「この画像をアップロードします。よろしいですか？」
- キャンセルボタン
- アップロードボタン

モバイル版の特徴:
- ボタンは縦並び（flex-col）
- ボタン幅: 220px → 画面幅に応じて調整
```

#### アップロード中 (uploading) - node: 293:2172

```
構成要素:
- プレビュー画像
- テキスト「ただいまアップロード中...」
- プログレスバー

モバイル版の特徴:
- プログレスバー幅: 画面幅に応じて調整
```

#### 成功 (success) - node: 293:2227

```
構成要素:
- プレビュー画像（クリックでコピー）
- テキスト「アップロード成功しました！」(text-3xl)
- 説明テキスト (text-xl)
- リンクテキスト (text-xl)
- 閉じるボタン
- Markdownソースをコピーボタン

モバイル版の特徴:
- 成功メッセージ: text-xl (20px) に縮小
- 説明テキスト: text-sm (14px) に縮小
- リンクテキスト: text-sm (14px) に縮小
- ボタンは縦並び（flex-col）
- ボタン幅: 100%（親要素に合わせる）
```

#### エラー (error) - node: 293:2293

```
構成要素:
- エラーメッセージ (Toast風)
- アップロードアイコン
- テキスト「ここに画像をドロップ」
- ボタン「またはファイルの選択」

モバイル版の特徴:
- エラーメッセージテキスト: text-xs (12px)
```

### ✅ Figmaスクリーンショット確認結果

全5状態のFigmaモバイルデザインを確認し、以下の仕様を特定した：

| 状態 | 確認結果 |
|------|----------|
| idle (293:2064) | 注意事項12px、ボタン220px縦配置、テキスト折り返し適切 |
| preview (293:2098) | 確認テキスト2行折り返し、ボタン縦並び、間隔約12px |
| uploading (293:2172) | プログレスバー画面幅内に収まる、テキスト1行 |
| success (293:2227) | 説明テキスト複数行折り返し、ボタンテキスト完全表示、縦並び |
| error (293:2293) | エラーToast幅250px、テキスト12px |

**重要な発見:**
- ボタン間のgapはFigmaで約12px（gap-3相当）が視覚的に適切
- プログレスバーはユーザー操作対象ではないため、h-6でアクセシビリティ上の問題なし
- 画像サイズは371×371pxで統一（元の373pxは微修正）

---

## 🔧 コンポーネント修正詳細

### 1. upload-form.tsx

**ファイルパス**: `src/features/upload/components/upload-form.tsx`

#### 修正箇所: メインコンテナ (行: 306)

**現在のコード:**
```typescript
<div
  className={`flex min-h-[600px] flex-col items-center justify-center gap-[10px] rounded-2xl border-[5px] border-dashed p-7 ${
    formState === "error" ? "border-rose-400" : "border-primary"
  }`}
>
```

**修正後のコード:**
```typescript
<div
  className={`flex min-h-[360px] flex-col items-center justify-center gap-2.5 rounded-2xl border-[5px] border-dashed p-4 md:min-h-[600px] md:gap-[10px] md:p-7 ${
    formState === "error" ? "border-rose-400" : "border-primary"
  }`}
>
```

**変更理由:**
- `min-h-[600px]` → `min-h-[360px] md:min-h-[600px]`: モバイルでは最小高さを縮小（Figmaエラー状態の実高さ361pxに基づく）
- `p-7` → `p-4 md:p-7`: モバイルではパディングを縮小（**余白統一方針の基準**）
- `gap-[10px]` → `gap-2.5 md:gap-[10px]`: gapはそのまま（2.5 = 10px）

**📝 余白統一方針:** この親コンテナで `p-4 md:p-7` を定義することで、子コンポーネントでの追加パディングは最小限に抑える。

#### 修正箇所: エラー表示エリア (行: 312)

**現在のコード:**
```typescript
<div className="mb-4 w-full max-w-[500px]">
```

**修正後のコード:**
```typescript
<div className="mb-4 w-full max-w-full px-2 md:max-w-[500px] md:px-0">
```

**変更理由:**
- モバイルでは最大幅制限を解除し、パディングで調整

---

### 2. upload-preview.tsx

**ファイルパス**: `src/features/upload/components/upload-preview.tsx`

#### 修正箇所: プレビュー画像コンテナ (行: 39)

**現在のコード:**
```typescript
<div className="relative h-[371px] w-[371px]">
```

**修正後のコード:**
```typescript
<div className="relative h-[280px] w-[280px] md:h-[371px] md:w-[371px]">
```

**変更理由:**
- Next.js Image の `fill` プロパティは親要素に明示的なサイズが必要
- モバイルでは `h-[280px] w-[280px]` で正方形に近いサイズに固定
- デスクトップでは従来の `h-[371px] w-[371px]` を維持

**⚠️ 重要:** Next.js Image で `fill` を使用する場合、親要素には必ず明示的な `width` と `height` が必要。`aspect-square` だけでは高さが0になり画像が表示されない。

#### 修正箇所: Image コンポーネントの sizes 属性 (行: 44)

**現在のコード:**
```typescript
sizes="371px"
```

**修正後のコード:**
```typescript
sizes="(max-width: 768px) 280px, 371px"
```

**変更理由:**
- レスポンシブ画像のための適切な sizes 設定

#### 修正箇所: 確認テキスト (行: 50)

**現在のコード:**
```typescript
<p className="font-bold text-text-br text-xl leading-7">
```

**修正後のコード:**
```typescript
<p className="px-2 text-center font-bold text-text-br text-base leading-6 md:px-0 md:text-xl md:leading-7">
```

**変更理由:**
- モバイルでは `text-base` (16px) に縮小し、`text-center` と `px-2` で折り返しを適切に処理

#### 修正箇所: ボタンコンテナ (行: 55)

**現在のコード:**
```typescript
<div className="flex items-center justify-center gap-5">
```

**修正後のコード:**
```typescript
<div className="flex w-full flex-col items-center justify-center gap-3 px-4 md:w-auto md:flex-row md:gap-5 md:px-0">
```

**変更理由:**
- モバイルでは `flex-col` で縦並び、デスクトップでは `flex-row` で横並び
- モバイルでは `w-full` と `px-4` で親要素の幅に合わせる

**📝 gap調整について:** Figma確認の結果、`gap-3` (12px) が視覚的に適切。実機確認で余白が窮屈に感じる場合は `gap-4` (16px) への調整を検討。

#### 修正箇所: キャンセルボタン (行: 56-63)

**現在のコード:**
```typescript
<Button
  className="h-12 w-[220px] rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover"
  ...
>
```

**修正後のコード:**
```typescript
<Button
  className="h-12 w-full rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover md:w-[220px]"
  ...
>
```

**変更理由:**
- モバイルでは `w-full` で親要素の幅に合わせる

#### 修正箇所: アップロードボタン (行: 64-71)

**現在のコード:**
```typescript
<Button
  className="h-12 w-[220px] rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover"
  ...
>
```

**修正後のコード:**
```typescript
<Button
  className="h-12 w-full rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover md:w-[220px]"
  ...
>
```

**変更理由:**
- モバイルでは `w-full` で親要素の幅に合わせる

---

### 3. upload-progress.tsx

**ファイルパス**: `src/features/upload/components/upload-progress.tsx`

#### 修正箇所: プレビュー画像コンテナ (行: 31)

**現在のコード:**
```typescript
<div className="relative h-[371px] w-[371px]">
```

**修正後のコード:**
```typescript
<div className="relative h-[280px] w-[280px] md:h-[371px] md:w-[371px]">
```

**変更理由:**
- upload-preview.tsx と同様、Next.js Image の `fill` には明示的なサイズが必要

#### 修正箇所: Image コンポーネントの sizes 属性 (行: 36)

**現在のコード:**
```typescript
sizes="371px"
```

**修正後のコード:**
```typescript
sizes="(max-width: 768px) 280px, 371px"
```

#### 修正箇所: アップロード中テキスト (行: 42)

**現在のコード:**
```typescript
<p className="font-bold text-text-br text-xl leading-7">
```

**修正後のコード:**
```typescript
<p className="font-bold text-text-br text-base leading-6 md:text-xl md:leading-7">
```

**変更理由:**
- モバイルでは `text-base` (16px) に縮小

#### 修正箇所: プログレスバー (行: 47-56)

**現在のコード:**
```typescript
<Progress
  aria-label={uploadingText(language)}
  classNames={{
    base: "w-[400px]",
    track: "h-7 bg-zinc-200",
    indicator: "bg-orange-400",
  }}
  showValueLabel={false}
  value={progress}
/>
```

**修正後のコード:**
```typescript
<Progress
  aria-label={uploadingText(language)}
  classNames={{
    base: "w-full max-w-[280px] md:max-w-[400px]",
    track: "h-6 md:h-7 bg-zinc-200",
    indicator: "bg-orange-400",
  }}
  showValueLabel={false}
  value={progress}
/>
```

**変更理由:**
- モバイルでは `max-w-[280px]`、デスクトップでは `max-w-[400px]`
- `w-full` を追加して柔軟な幅に対応
- トラックの高さも調整

---

### 4. upload-success.tsx

**ファイルパス**: `src/features/upload/components/upload-success.tsx`

#### 修正箇所: プレビュー画像ボタン (行: 94)

**現在のコード:**
```typescript
<button
  className="relative h-[371px] w-[371px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  ...
>
```

**修正後のコード:**
```typescript
<button
  className="relative h-[280px] w-[280px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:h-[371px] md:w-[371px]"
  ...
>
```

**変更理由:**
- upload-preview.tsx と同様、Next.js Image の `fill` には明示的なサイズが必要

#### 修正箇所: Image コンポーネントの sizes 属性 (行: 102)

**現在のコード:**
```typescript
sizes="371px"
```

**修正後のコード:**
```typescript
sizes="(max-width: 768px) 280px, 371px"
```

#### 修正箇所: 成功メッセージ (行: 108)

**現在のコード:**
```typescript
<p className="font-bold text-3xl text-primary leading-9">
```

**修正後のコード:**
```typescript
<p className="px-2 text-center font-bold text-xl text-primary leading-7 md:px-0 md:text-3xl md:leading-9">
```

**変更理由:**
- モバイルでは `text-xl` (20px) に縮小

#### 修正箇所: 説明テキストコンテナ (行: 113)

**現在のコード:**
```typescript
<div className="text-center font-normal text-text-br text-xl leading-7">
```

**修正後のコード:**
```typescript
<div className="px-2 text-center font-normal text-text-br text-sm leading-5 md:px-0 md:text-xl md:leading-7">
```

**変更理由:**
- モバイルでは `text-sm` (14px) に縮小し、`px-2` でパディングを追加

#### 修正箇所: リンクテキスト (行: 126)

**現在のコード:**
```typescript
<p className="text-center font-normal text-text-br text-xl leading-7">
```

**修正後のコード:**
```typescript
<p className="px-2 text-center font-normal text-text-br text-sm leading-5 md:px-0 md:text-xl md:leading-7">
```

**変更理由:**
- モバイルでは `text-sm` (14px) に縮小

#### 修正箇所: ボタンコンテナ (行: 138)

**現在のコード:**
```typescript
<div className="flex items-center justify-center gap-5">
```

**修正後のコード:**
```typescript
<div className="flex w-full flex-col items-center justify-center gap-3 px-4 md:w-auto md:flex-row md:gap-5 md:px-0">
```

#### 修正箇所: 閉じるボタン (行: 140-145)

**現在のコード:**
```typescript
<Button
  className="h-12 w-[220px] rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover"
  ...
>
```

**修正後のコード:**
```typescript
<Button
  className="h-12 w-full rounded-lg border-2 border-button-tertiary-border bg-button-tertiary-base px-6 font-bold text-base text-button-tertiary-tx hover:bg-button-tertiary-hover md:w-[220px]"
  ...
>
```

#### 修正箇所: Markdownコピーボタン (行: 146-151)

**現在のコード:**
```typescript
<Button
  className="h-12 w-[220px] rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover"
  ...
>
```

**修正後のコード:**
```typescript
<Button
  className="h-12 w-full rounded-lg bg-button-primary-base px-6 font-bold text-base text-text-wh hover:bg-button-primary-hover md:w-[220px]"
  ...
>
```

---

### 5. upload-notes.tsx

**ファイルパス**: `src/features/upload/components/upload-notes.tsx`

#### 修正箇所: 注意事項タイトル (行: 28)

**現在のコード:**
```typescript
<p className="font-bold text-xl leading-7">{cautionText(language)}</p>
```

**修正後のコード:**
```typescript
<p className="font-bold text-base leading-6 md:text-xl md:leading-7">{cautionText(language)}</p>
```

#### 修正箇所: 注意事項リスト (行: 29)

**現在のコード:**
```typescript
<ul className="list-disc pl-6 font-normal text-base leading-6">
```

**修正後のコード:**
```typescript
<ul className="list-disc pl-5 font-normal text-xs leading-4 md:pl-6 md:text-base md:leading-6">
```

**変更理由:**
- Figma仕様に基づき、モバイルでは `text-xs` (12px) に縮小

#### 修正箇所: プライバシーポリシーテキスト (行: 34)

**現在のコード:**
```typescript
<p className="max-w-[476px] text-center font-normal text-base leading-6">
```

**修正後のコード:**
```typescript
<p className="max-w-full px-2 text-center font-normal text-xs leading-4 md:max-w-[476px] md:px-0 md:text-base md:leading-6">
```

**変更理由:**
- モバイルでは `text-xs` (12px) に縮小し、`max-w-full` で幅制限を解除

---

### 6. upload-error-message.tsx

**ファイルパス**: `src/features/upload/components/upload-error-message.tsx`

#### 修正箇所: メッセージテキストコンテナ (行: 37)

**現在のコード:**
```typescript
<div className="flex flex-col font-normal text-rose-600 text-xl leading-7">
```

**修正後のコード:**
```typescript
<div className="flex flex-col font-normal text-rose-600 text-xs leading-4 md:text-xl md:leading-7">
```

**変更理由:**
- Figma仕様に基づき、モバイルでは `text-xs` (12px) に縮小

---

## 🎨 デザイントークン（Tailwind CSS v4）

### 使用するデザイントークン

| 用途 | Tailwindクラス | カラーコード |
|------|---------------|-------------|
| テキスト（茶色） | `text-text-br` | #7c2d12 |
| テキスト（白） | `text-text-wh` | #ffffff |
| 背景 | `bg-background` | #fff7ed |
| プライマリ | `bg-primary` / `text-primary` | #f97316 |
| ボーダー | `border-border` | #fed7aa |
| プライマリボタン背景 | `bg-button-primary-base` | #f97316 |
| プライマリボタンホバー | `bg-button-primary-hover` | #fed7aa |
| ターシャリボタン背景 | `bg-button-tertiary-base` | #fff7ed |
| ターシャリボタンボーダー | `border-button-tertiary-border` | #fed7aa |
| ターシャリボタンテキスト | `text-button-tertiary-tx` | #ea580c |
| ターシャリボタンホバー | `bg-button-tertiary-hover` | #ffedd5 |

### レスポンシブブレークポイント

| プレフィックス | 最小幅 | 用途 |
|--------------|-------|------|
| (なし) | 0px | モバイル（デフォルト） |
| `md:` | 768px | タブレット・デスクトップ |

---

## 📝 実装順序

1. **upload-error-message.tsx の修正** - 最も単純な変更
2. **upload-notes.tsx の修正** - テキストサイズのみ
3. **upload-progress.tsx の修正** - 画像・プログレスバー・テキスト
4. **upload-preview.tsx の修正** - 画像・ボタン・テキスト
5. **upload-success.tsx の修正** - 最も複雑（画像・テキスト・ボタン）
6. **upload-form.tsx の修正** - コンテナのパディング・高さ
7. **品質管理の実行** - format, lint, test, build
8. **動作確認** - ブラウザ・Storybook

---

## ✅ 品質管理手順

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

### 4. TypeScript ビルドチェック

```bash
npm run build
```

**ビルドエラーがないことを確認。型エラーがあれば修正すること。**

### 5. 開発サーバーでの表示確認

Chrome DevTools MCPを使って `http://localhost:2222` にアクセスし、以下を確認:

**⚠️ 最小サポート画面幅**: 本実装はモバイル幅 **320px以上** をサポート対象としています。320px未満の画面では一部要素がはみ出す可能性があります。

#### モバイル表示 (幅: 375px〜430px程度)

- [ ] 初期状態 (idle): アップロードアイコン、テキスト、ボタン、注意事項が画面内に収まる
- [ ] プレビュー確認 (preview): 画像が適切なサイズで表示され、確認テキストが折り返される、ボタンが縦並びで表示される
- [ ] アップロード中 (uploading): 画像とプログレスバーが画面内に収まる
- [ ] 成功 (success): 画像、成功メッセージ、説明テキスト、リンク、ボタンが全て画面内に収まる、ボタンが縦並び
- [ ] エラー (error): エラーメッセージが画面内に収まる

#### デスクトップ表示 (幅: 768px以上)

- [ ] 全ての状態で従来通りの表示が維持される
- [ ] ボタンは横並びで表示される
- [ ] テキストサイズが従来通り（text-xl等）

### 6. Storybookでの表示確認

Chrome DevTools MCPを使って `http://localhost:6006/` にアクセスし、以下を確認:

**⚠️ 重要**: Storybookのデコレーターは `w-[700px]` でラップされているため、デフォルトビューでは**モバイル表示**（768px未満）になります。デスクトップ表示を確認するには、Storybookのビューポートツールバーを使用してください。

#### Storybookビューポート切替手順

1. Storybookの右上のツールバーにあるビューポートアイコン（📱のようなアイコン）をクリック
2. 「Large mobile」または「Tablet」「Desktop」を選択
3. または「Reset viewport」でデフォルト（700px = モバイル表示）に戻す

#### 確認項目

**モバイル表示（デフォルト・700px幅）:**

**⚠️ 700px環境の特性:** Storybookのデコレーターは `w-[700px]` でラップしているため、`md:` (768px) 未満となり常にモバイルスタイルが適用される。これは意図通りの動作。

- [ ] `UploadForm` の各ストーリーでモバイルスタイルが適用されている
- [ ] ボタンが縦並びになっている
- [ ] テキストが画面内に収まっている
- [ ] 画像サイズが280x280pxになっている
- [ ] 700px幅でもレイアウトが崩れていない（横並び→縦並び切替の境界付近で問題がないか）

**デスクトップ表示（ビューポート切替後）:**
- [ ] ボタンが横並びになっている
- [ ] テキストが従来のサイズ（text-xl等）で表示
- [ ] 画像サイズが371x371pxになっている

**全ビューポート共通:**
- [ ] 日本語/英語の表示切替が正しい
- [ ] 各状態（idle, preview, uploading, success, error）の表示が正しい

### 7. デザイン崩れの調査

Chrome DevTools MCP を使ってデザイン崩れがないか確認すること。特に以下の点に注意:

- テキストの折り返しが適切か
- ボタンのクリック領域が十分か
- 画像のアスペクト比が崩れていないか
- 要素間の余白が適切か
- **エラーメッセージの長文テスト:** 英語の長いエラーメッセージ（例: "The image could not be processed because it does not appear to contain a cat."）で縦方向のオーバーフローが発生しないか確認

---

## 📘 実装上の注意点

### Next.js Image + fill の制約

Next.js の `<Image>` コンポーネントで `fill` プロパティを使用する場合、**親要素には必ず明示的な `width` と `height` が必要**です。

**❌ 動作しないパターン:**
```typescript
// aspect-square だけでは height が 0 になり、画像が表示されない
<div className="relative aspect-square w-full max-w-[280px]">
  <Image fill ... />
</div>
```

**✅ 正しいパターン:**
```typescript
// 明示的に width と height を指定する
<div className="relative h-[280px] w-[280px] md:h-[371px] md:w-[371px]">
  <Image fill ... />
</div>
```

**理由:**
- `fill` を使う場合、Image コンポーネントは `position: absolute` で親要素全体を埋めようとする
- 親要素に明示的な高さがないと、コンテンツがないため高さ 0 となる
- `aspect-square` は幅に対する比率で高さを決めるが、`position: absolute` の子要素は「コンテンツ」として扱われないため高さ計算に寄与しない

### HeroUI Progress の classNames

HeroUI の `Progress` コンポーネントは `classNames` プロパティでスタイルをカスタマイズできます:

```typescript
<Progress
  classNames={{
    base: "w-full max-w-[280px]",  // 外側コンテナ
    track: "h-6 bg-zinc-200",       // 進捗トラック（背景）
    indicator: "bg-orange-400",     // 進捗インジケーター（塗りつぶし部分）
  }}
  value={45}
/>
```

レスポンシブクラスもそのまま使用可能です：
```typescript
base: "w-full max-w-[280px] md:max-w-[400px]"
track: "h-6 md:h-7 bg-zinc-200"
```

---

## ⚠️ 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいパッケージのインストール禁止** - 既存のライブラリのみを使用
3. **ビジネスロジックの変更禁止** - UI変更のみに集中
4. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 🎯 成功基準

以下を全て満たすこと:

### レスポンシブ対応

- [ ] モバイル幅（375px〜430px）で全ての状態が正常に表示される
- [ ] テキストが画面外にはみ出さない
- [ ] ボタンが画面内に収まり、操作可能

### デスクトップ互換性

- [ ] デスクトップ幅（768px以上）で従来通りの表示が維持される
- [ ] 既存のUIが崩れていない

### コード品質

- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする
- [ ] `npm run build` がエラー0で完了する
- [ ] Tailwind CSS v4 の記法に準拠している

### 動作確認

- [ ] `http://localhost:2222` でモバイル・デスクトップ両方で正常に表示される
- [ ] `http://localhost:6006/` のStorybookで各コンポーネントが正常に表示される

---

## 📚 参考情報

### Tailwind CSS 4 レスポンシブ記法

```css
/* モバイルファースト */
class="text-sm md:text-xl"  /* モバイル: 14px, デスクトップ: 20px */
class="flex-col md:flex-row"  /* モバイル: 縦並び, デスクトップ: 横並び */
class="w-full md:w-[220px]"  /* モバイル: 100%, デスクトップ: 220px */
```

### 既存のファイル先頭コメント

全てのファイルには以下のコメントを維持すること:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
```

---

**作成日**: 2025-12-20
**対象Issue**: #381
**担当**: AI実装者
