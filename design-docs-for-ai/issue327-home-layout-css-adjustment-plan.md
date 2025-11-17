# Issue #327: ホームページレイアウト CSS 調整 - 詳細実装計画書

## 📋 概要

### 目的
ホームページ（`HomePageContainer`）のレイアウトと `RandomLgtmImages` の表示位置をFigmaのデザインに合わせるためのCSS調整を行う。

### 実装対象
1. `src/features/main/components/home-page-container.tsx` - メインコンテナのレイアウト追加
2. `src/features/main/components/lgtm-images.tsx` - グリッドレイアウトから flex-wrap レイアウトへの変更

### 実装対象外
- サービス説明テキスト（「猫のLGTM画像を共有出来るサービスです。...」）
- 3つのボタン（「ランダムコピー」「ねこリフレッシュ」「ねこ新着順」）

### 技術スタック
- **言語**: TypeScript
- **フレームワーク**: Next.js 16 App Router
- **スタイリング**: Tailwind CSS 4
- **UIライブラリ**: HeroUI

### 関連デザイン

#### Figma デザイン
- メイン画面全体: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=862-10457&m=dev
- コンテンツエリア: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=947-2910&m=dev

#### Figmaデザインから抽出した主要スタイル

**全体レイアウト（コンテンツエリア）:**
- レイアウト: `flex flex-col`
- Gap: `gap-[80px]`（垂直方向の要素間隔）
- Padding: `px-[40px] py-[60px]`（水平40px、垂直60px）
- 配置: `items-center`（中央揃え）
- 最大幅: `w-[1020px]`

**LGTM画像グリッド:**
- レイアウト: `flex flex-wrap`（グリッドではなくflexboxのwrap）
- Gap: `gap-[24px]`
- 配置: `content-center items-center`
- 幅: `w-full`
- 各画像の高さ: 固定 `220px`
- 各画像の幅: 可変（画像のアスペクト比に依存）

---

## 🎯 現在の実装状況の確認

### HomePageContainer の現在の実装
**ファイルパス**: `src/features/main/components/home-page-container.tsx`

**現在のコード**:
```typescript
export const HomePageContainer = ({ language, currentUrlPath }: Props) => (
  <>
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <RandomLgtmImages />
    <Footer language={language} />
  </>
);
```

**問題点**:
- レイアウト用のコンテナ要素が存在しない
- Header、RandomLgtmImages、Footer が単に並んでいるだけ
- Figmaデザインで指定されている padding、gap、max-width が適用されていない

### LgtmImages の現在の実装
**ファイルパス**: `src/features/main/components/lgtm-images.tsx`

**現在のコード**:
```typescript
export function LgtmImages({ images }: Props): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((image) => (
        <LgtmImage key={image.id} {...image} />
      ))}
    </div>
  );
}
```

**問題点**:
- グリッドレイアウト（`grid`）を使用しているが、Figmaでは `flex-wrap` を使用
- Gap が `gap-6`（24px）だが、これは正しい（`gap-[24px]` と同じ）
- レスポンシブブレークポイント（`md:`, `lg:`, `xl:`）が設定されているが、Figmaデザインでは単純な flex-wrap

### LgtmImage の現在の実装
**ファイルパス**: `src/features/main/components/lgtm-image.tsx`

**関連部分のコード**:
```typescript
<button
  aria-label="Copy LGTM markdown"
  className="relative block aspect-[4/3] min-h-[220px] w-full cursor-pointer border-0 bg-neutral-50 p-0 dark:bg-neutral-900"
  onClick={handleCopy}
  type="button"
>
  <Image
    alt="LGTM image"
    className="object-contain"
    fill
    objectPosition="center top"
    priority={false}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    src={imageUrl}
  />
</button>
```

**確認事項**:
- `aspect-[4/3]` が設定されている（4:3のアスペクト比を強制）
- `min-h-[220px]` が設定されている（最小高さ220px）
- Figmaデザインでは画像の幅が可変（実際の画像のアスペクト比を維持）

---

## 🔧 実装する変更の詳細仕様

### 1. HomePageContainer の変更

#### ファイルパス
```
src/features/main/components/home-page-container.tsx
```

#### 変更内容

**変更前**:
```typescript
export const HomePageContainer = ({ language, currentUrlPath }: Props) => (
  <>
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <RandomLgtmImages />
    <Footer language={language} />
  </>
);
```

**変更後**:
```typescript
export const HomePageContainer = ({ language, currentUrlPath }: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <main className="flex w-full flex-1 flex-col items-center">
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
        <RandomLgtmImages />
      </div>
    </main>
    <Footer language={language} />
  </div>
);
```

#### 追加するスタイルの説明

**最外側のコンテナ** (`div`):
- `flex` - flexboxコンテナ
- `min-h-screen` - 最小高さを画面全体に
- `w-full` - 幅100%
- `flex-col` - 縦方向に配置
- `bg-background` - 背景色（Tailwind CSSのカスタムカラー）

**メインコンテンツエリア** (`main`):
- `flex` - flexboxコンテナ
- `w-full` - 幅100%
- `flex-1` - 残りの空間を占有（Footerを下部に固定するため）
- `flex-col` - 縦方向に配置
- `items-center` - 中央揃え

**コンテンツラッパー** (内側の `div`):
- `flex` - flexboxコンテナ
- `w-full` - 幅100%
- `max-w-[1020px]` - 最大幅1020px（Figmaデザインより）
- `flex-col` - 縦方向に配置
- `items-center` - 中央揃え
- `gap-[80px]` - 子要素間の垂直間隔80px（Figmaデザインより）
- `px-[40px]` - 水平パディング40px（Figmaデザインより）
- `py-[60px]` - 垂直パディング60px（Figmaデザインより）

**重要な注意点**:
- `gap-[80px]` は現時点では `RandomLgtmImages` のみが子要素なので効果はないが、将来的にサービス説明テキストや3つのボタンを追加する際に必要
- Figmaデザインでは `box-border` が指定されているが、Tailwind CSSではデフォルトで適用されるため不要

### 2. LgtmImages の変更

#### ファイルパス
```
src/features/main/components/lgtm-images.tsx
```

#### 変更内容

**変更前**:
```typescript
export function LgtmImages({ images }: Props): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((image) => (
        <LgtmImage key={image.id} {...image} />
      ))}
    </div>
  );
}
```

**変更後**:
```typescript
export function LgtmImages({ images }: Props): JSX.Element {
  return (
    <div className="flex w-full flex-wrap content-center items-center justify-center gap-[24px]">
      {images.map((image) => (
        <LgtmImage key={image.id} {...image} />
      ))}
    </div>
  );
}
```

#### 変更するスタイルの説明

**レイアウトの変更**:
- `grid grid-cols-1 ... xl:grid-cols-4` → `flex flex-wrap` に変更
  - グリッドレイアウトから flexbox の wrap レイアウトへ
  - 画像の幅が可変になり、実際の画像のアスペクト比を維持できる

**追加するスタイル**:
- `w-full` - 幅100%
- `flex-wrap` - 折り返しを有効化
- `content-center` - 複数行の場合、行全体を中央に配置
- `items-center` - 各行内で子要素を中央に配置
- `justify-center` - 各行内で子要素を中央に配置（水平方向）
- `gap-[24px]` - 子要素間の間隔24px（既存の `gap-6` と同じ）

**削除するスタイル**:
- `grid` - グリッドレイアウト
- `grid-cols-1` - 1カラム
- `md:grid-cols-2` - 中画面で2カラム
- `lg:grid-cols-3` - 大画面で3カラム
- `xl:grid-cols-4` - 特大画面で4カラム

### 3. LgtmImage の変更（必須）

#### ファイルパス
```
src/features/main/components/lgtm-image.tsx
```

#### 問題点

**現在の実装**:
```typescript
<button
  className="relative block aspect-[4/3] min-h-[220px] w-full ..."
  ...
>
```

**親要素を flex-wrap に変更した場合の問題**:
- `w-full`（幅100%）のままだと、1行に1枚しか並ばず複数列レイアウトにならない
- `aspect-[4/3]` を維持すると、親幅（最大1020px）に引っ張られて高さが ~765px になる
- Figmaデザイン指定の高さ220pxとかけ離れてしまう

**Figmaデザインとの比較**:
- Figmaデザインでは各画像の高さが固定 `220px`
- 各画像の幅は可変（147px, 315px, 210px, 164px, 330px など）
- これは画像の実際のアスペクト比を維持していることを示す

#### 変更内容

**変更前**:
```typescript
<button
  aria-label="Copy LGTM markdown"
  className="relative block aspect-[4/3] min-h-[220px] w-full cursor-pointer border-0 bg-neutral-50 p-0 dark:bg-neutral-900"
  onClick={handleCopy}
  type="button"
>
```

**変更後**:
```typescript
<button
  aria-label="Copy LGTM markdown"
  className="relative block h-[220px] max-w-[390px] flex-none cursor-pointer border-0 bg-neutral-50 p-0 dark:bg-neutral-900"
  onClick={handleCopy}
  type="button"
>
```

#### 変更するスタイルの説明

**削除するスタイル**:
- `aspect-[4/3]` - 4:3のアスペクト比強制を削除
- `min-h-[220px]` - 最小高さ指定を削除
- `w-full` - 幅100%を削除

**追加するスタイル**:
- `h-[220px]` - 高さを220pxに固定（Figmaデザインに準拠）
- `max-w-[390px]` - 最大幅を390pxに制限（Figmaデザインの最大画像幅に準拠）
- `flex-none` - flex-grow と flex-shrink を無効化（画像サイズを固定）

**理由**:
- 高さを固定することで、Figmaデザイン通りの220pxを維持
- 幅は `max-w-[390px]` で制限しつつ、実際の画像のアスペクト比に応じて可変
- `flex-none` により、親要素のflexboxレイアウトで意図しないサイズ変更を防ぐ
- `object-contain` により、画像が歪まずに表示される

#### Next.js Image コンポーネントの調整

**変更前**:
```typescript
<Image
  alt="LGTM image"
  className="object-contain"
  fill
  objectPosition="center top"
  priority={false}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  src={imageUrl}
/>
```

**変更後**:
```typescript
<Image
  alt="LGTM image"
  className="object-contain"
  fill
  objectPosition="center top"
  priority={false}
  sizes="(max-width: 768px) 100vw, 390px"
  src={imageUrl}
/>
```

**変更点**:
- `sizes` 属性を `(max-width: 768px) 100vw, 390px` に変更
  - モバイル（768px以下）: ビューポート幅100%
  - デスクトップ: 最大390px
- これにより、Next.js が適切なサイズの画像を配信できる

---

## 🧪 実装後の品質管理手順

### 1. コードフォーマット
```bash
npm run format
```

### 2. Lintチェック
```bash
npm run lint
```

### 3. テスト実行
```bash
npm run test
```

### 4. 開発サーバーでの表示確認
```bash
npm run dev
```
- `http://localhost:2222` にアクセス
- Playwright MCP を使って以下を確認:
  - Header が正しく表示されている
  - **LGTM画像が複数列で表示されている（重要）**
  - 各画像の高さが 220px になっている
  - 画像間の gap が 24px になっている
  - コンテンツエリアの最大幅が 1020px になっている
  - padding が正しく適用されている
  - Footer が正しく表示されている

### 5. Chrome DevTools MCP でのデバッグ
```bash
# 開発サーバーが起動している状態で
```
- Chrome DevTools MCP を使って以下をデバッグ:
  - `http://localhost:2222` にアクセス
  - スナップショットを取得して要素を確認
  - LgtmImages コンテナの flex-wrap が適用されているか確認
  - 各 LgtmImage の幅と高さを確認
  - 複数列が正しく表示されているか確認
  - レスポンシブ時の挙動を確認（画面幅を変更して確認）
  - コンソールエラーがないか確認

### 6. Storybook での確認
```bash
npm run storybook
```
- `http://localhost:6006/` にアクセス
- Playwright MCP を使って `LgtmImages` コンポーネントのストーリーを確認
- **複数列の flex-wrap レイアウトが正しく表示されているか確認（重要）**
- 各画像の高さが 220px になっているか確認

### 7. ビルド確認
```bash
npm run build
```
- エラーなくビルドが完了することを確認

---

## 📝 実装時の注意事項

### 重要な禁止事項
1. **依頼内容に関係のない無駄な修正を行わない**
   - 今回の対象は `HomePageContainer`、`LgtmImages`、`LgtmImage` のレイアウト調整のみ
   - 他のコンポーネント（Header、Footer）の変更は不要

2. **存在しないファイルをimportしない**
   - 全ての import パスを確認済み
   - 新規ファイル作成は不要

3. **存在しないプロパティやカラムを捏造しない**
   - 使用する Props は全て既存のもの
   - 新規の Props 追加は不要

### 実装の必須要件
1. **複数列表示の確認**
   - `LgtmImages` が flex-wrap で複数列表示されることを必ず確認
   - 1列表示になっている場合は実装失敗（`LgtmImage` の幅が100%のままの可能性）

2. **高さの固定**
   - 各 `LgtmImage` の高さが 220px に固定されていることを確認
   - `aspect-[4/3]` により極端に縦長になっていないか確認

### Tailwind CSS 4 のルール
- `@import "tailwindcss"` を使用（既に設定済み）
- CSS変数の形式: `var(--color-*, --spacing-*, など)`（必要に応じて）
- 任意の値は `[]` で囲む（例: `gap-[24px]`, `max-w-[1020px]`）

### コーディング規約
- ファイル先頭に必ず `// 絶対厳守:編集前に必ずAI実装ルールを読む` を記載
- `type` を使用（`interface` は使用しない）
- `readonly` を使用してイミュータブルなデータフローを維持
- キャメルケースを使用（変数、プロパティ）
- ケバブケースを使用（ファイル名）

### Next.js App Router の注意点
- Server Component と Client Component の使い分け
  - `HomePageContainer` は Server Component（`"use client"` 不要）
  - `LgtmImages` は Server Component（`"use client"` 不要）
  - `LgtmImage` は Client Component（既に `"use client"` あり）

---

## 🎨 レイアウトの視覚的な構造

```
┌─────────────────────────────────────────────────────────┐
│ Header (bg-primary)                                     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ <main> (flex-1, items-center)                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Content Wrapper (max-w-[1020px])                  │ │
│  │ px-[40px] py-[60px] gap-[80px]                    │ │
│  │                                                     │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ RandomLgtmImages                            │  │ │
│  │  │ (LgtmImages Component)                      │  │ │
│  │  │                                              │  │ │
│  │  │ flex flex-wrap gap-[24px]                   │  │ │
│  │  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │  │ │
│  │  │ │img │ │img │ │img │ │img │                │  │ │
│  │  │ └────┘ └────┘ └────┘ └────┘                │  │ │
│  │  │ ┌────┐ ┌────┐ ┌────┐                        │  │ │
│  │  │ │img │ │img │ │img │                        │  │ │
│  │  │ └────┘ └────┘ └────┘                        │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │                                                     │ │
│  │  [将来: サービス説明とボタンがここに追加される]   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Footer (border-t)                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 実装チェックリスト

### コード変更
- [ ] `src/features/main/components/home-page-container.tsx` にレイアウトコンテナを追加
- [ ] `src/features/main/components/lgtm-images.tsx` のレイアウトを grid から flex-wrap に変更
- [ ] `src/features/main/components/lgtm-image.tsx` の幅・高さスタイルを変更（`h-[220px]`, `max-w-[390px]`, `flex-none`）
- [ ] `src/features/main/components/lgtm-image.tsx` の Image sizes 属性を更新

### 品質管理
- [ ] `npm run format` でコードをフォーマット
- [ ] `npm run lint` でエラーがないことを確認
- [ ] `npm run test` で全テストがパス
- [ ] `npm run build` でビルドが成功
- [ ] Playwright MCP で `http://localhost:2222` の表示確認
- [ ] Chrome DevTools MCP で詳細なデバッグ確認
- [ ] Playwright MCP で `http://localhost:6006/` の Storybook 確認

### 最終確認（重要）
- [ ] **LGTM画像が複数列で表示されている（1列表示になっていない）**
- [ ] **各画像の高さが 220px になっている（極端に縦長になっていない）**
- [ ] 画像間の gap が 24px になっている
- [ ] コンテンツエリアの最大幅が 1020px になっている
- [ ] Figmaデザインとの視覚的な比較
- [ ] レスポンシブデザインの確認（Chrome DevTools MCP使用）
- [ ] 各種ブラウザでの表示確認（Playwright MCP使用）

---

## 🚀 実装の流れ

1. **準備**: 関連ファイルの読み込みと現状確認
2. **実装**: HomePageContainer、LgtmImages、LgtmImage の変更
3. **フォーマット**: `npm run format` 実行
4. **Lint**: `npm run lint` 実行
5. **テスト**: `npm run test` 実行
6. **ビルド**: `npm run build` 実行
7. **表示確認**: Playwright MCP で `http://localhost:2222` 確認
8. **デバッグ**: Chrome DevTools MCP で詳細確認（**複数列表示の確認必須**）
9. **Storybook確認**: Playwright MCP で `http://localhost:6006/` 確認
10. **最終チェック**: Figmaデザインとの視覚的比較

---

## 📚 参考資料

### プロジェクトドキュメント
- `@docs/basic-coding-guidelines.md` - 基本的なコーディングガイドライン
- `@docs/project-coding-guidelines.md` - プロジェクト固有のコーディング規約
- `@docs/tailwind-css-v4-coding-guidelines.md` - Tailwind CSS 4 のコーディングルール

### 関連Issue
- Issue #327: ホームページの基本コンポーネント実装

### Figmaデザイン
- https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=862-10457&m=dev
- https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=947-2910&m=dev
