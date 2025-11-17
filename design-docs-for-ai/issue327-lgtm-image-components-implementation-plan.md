# Issue #327: LgtmImage・LgtmImages コンポーネント実装 - 詳細実装計画書

## 📋 概要

### 目的
LGTM画像を表示するUIコンポーネント（`LgtmImage` と `LgtmImages`）を実装し、クリップボードコピー機能とお気に入り機能（UI状態のみ）を含めた品質保証を完了させる。

### 実装対象
1. `src/components/icons/copy-icon.tsx` - コピーアイコンコンポーネント
2. `src/components/icons/heart-icon.tsx` - お気に入りアイコンコンポーネント
3. `src/features/main/components/lgtm-image.tsx` - 単一LGTM画像表示コンポーネント
4. `src/features/main/components/lgtm-images.tsx` - 複数LGTM画像表示コンポーネント
5. `src/features/main/components/lgtm-image.stories.tsx` - LgtmImage Storybook
6. `src/features/main/components/lgtm-images.stories.tsx` - LgtmImages Storybook

### 技術スタック
- **言語**: TypeScript
- **フレームワーク**: Next.js 16 App Router
- **UI ライブラリ**: HeroUI（既存のプロジェクトで使用中）
- **スタイリング**: Tailwind CSS 4
- **Storybookフレームワーク**: Storybook

### 関連デザイン

#### Figma デザイン
- メイン画像一覧: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=862-10457&m=dev
- 個別画像（コピー状態）: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=162-829&m=dev
- 個別画像（お気に入り状態）: https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=162-838&m=dev

#### デザイン仕様
- 画像の右上にコピーアイコンとお気に入りアイコンを配置
- アイコンは画像の上にホバーした際に表示（常に表示でも可）
- コピーアイコンとお気に入りアイコン以外をクリック：クリップボードにGitHubマークダウンをコピー
- コピーアイコンをクリック：クリップボードにGitHubマークダウンをコピー（画像クリックと同じ動作）
- お気に入りアイコンをクリック：色を変更（灰色 → 赤）※バックエンド処理は不要
- グリッドレイアウト：複数の画像を配置（Figmaのレイアウト参照）

---

## 🎯 型定義の確認

### 既存の型定義（変更不可）

#### src/features/main/types/lgtmImage.ts
```typescript
export type LgtmImageUrl = `https://${string}` & {
  readonly __brand: "lgtmImageUrl";
};

export function createLgtmImageUrl(url: string): LgtmImageUrl {
  return url as LgtmImageUrl;
}

export type LgtmImageId = number & { readonly __brand: "lgtmImageId" };

export function createLgtmImageId(id: number): LgtmImageId {
  return id as LgtmImageId;
}

export type LgtmImage = { id: LgtmImageId; imageUrl: LgtmImageUrl };
```

**重要**:
- `LgtmImage` 型は既に定義済み（変更不可）
- `id` は `LgtmImageId` 型（Branded Type）
- `imageUrl` は `LgtmImageUrl` 型（Branded Type）

### 既存の関数（使用のみ）

#### src/features/url.ts
```typescript
export function appBaseUrl(): Url {
  if (isUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return "https://lgtmeow.com";
}
```

**重要**:
- `appBaseUrl()` 関数を使用してアプリケーションのベースURLを取得
- マークダウン生成時に使用

---

## 🔧 実装するコンポーネントの仕様

### 1. CopyIcon コンポーネント

#### ファイルパス
```
src/components/icons/copy-icon.tsx
```

#### Props
```typescript
type Props = {
  width?: number;
  height?: number;
  color?: "default" | "white";
};
```

#### 実装のポイント
- Figma MCPから取得したアイコンSVGを使用
- 既存の `GithubIcon` コンポーネント（`src/components/icons/github-icon.tsx`）と同様のパターンで実装
- `color="default"` の場合は `#CBD5E1`（slate-300）、`color="white"` の場合は `#FFFFFF` を使用
- `width` と `height` のデフォルト値は `20`

---

### 2. HeartIcon コンポーネント

#### ファイルパス
```
src/components/icons/heart-icon.tsx
```

#### Props
```typescript
type Props = {
  width?: number;
  height?: number;
  color?: "default" | "favorite";
};
```

#### 実装のポイント
- Figma MCPから取得したアイコンSVGを使用
- `color="default"` の場合は `#CBD5E1`（slate-300）、`color="favorite"` の場合は `#EF4444`（red-500） を使用
- `width` と `height` のデフォルト値は `20`

---

### 3. LgtmImage コンポーネント

#### ファイルパス
```
src/features/main/components/lgtm-image.tsx
```

#### Props
```typescript
type Props = {
  readonly id: LgtmImageId;
  readonly imageUrl: LgtmImageUrl;
};
```

#### 機能仕様

##### クリップボードコピー機能
- コピーアイコンまたは画像本体（アイコン以外）をクリック時に以下のマークダウンをクリップボードにコピー:
  ```markdown
  [![LGTMeow](画像URL)](アプリベースURL)
  ```
- 例: 画像URLが `https://lgtm-images.lgtmeow.com/2023/08/14/14/5974a575-faf0-45d3-977d-c5b84de005e3.webp` の場合
  ```markdown
  [![LGTMeow](https://lgtm-images.lgtmeow.com/2023/08/14/14/5974a575-faf0-45d3-977d-c5b84de005e3.webp)](https://lgtmeow.com)
  ```
- アプリベースURLは `appBaseUrl()` 関数を呼び出して取得

##### お気に入り機能（UI状態のみ）
- お気に入りアイコンをクリック時に色を変更（灰色 → 赤）
- `useState` を使用してローカル状態で管理
- バックエンドへの通信は不要

##### UI構造
```
<div> (画像コンテナ)
  <img> (LGTM画像)
  <div> (アイコンコンテナ - 右上に配置)
    <button> (コピーアイコン)
    <button> (お気に入りアイコン)
  </div>
</div>
```

#### 実装のポイント
- **"use client" ディレクティブを必ず追加**（`useState` を使用するため）
- `useState` でお気に入り状態を管理
  ```typescript
  const [isFavorite, setIsFavorite] = useState(false);
  ```
- `useCallback` でイベントハンドラーを最適化
  ```typescript
  const handleCopy = useCallback(() => {
    const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
    navigator.clipboard.writeText(markdown);
  }, [imageUrl]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((previous) => !previous);
  }, []);
  ```
- アイコンのクリックイベントで `event.stopPropagation()` を呼び出し、親要素のクリックイベントを阻止
- HeroUIの `Button` コンポーネントを使用してアイコンボタンを実装（既存の `icon-button.tsx` パターン参考）
- Tailwind CSS 4 でスタイリング（既存のコーディングガイドライン参照）
- 画像は `next/image` の `Image` コンポーネントを使用
  - `width` と `height` は必須（または `fill` プロパティを使用）
  - `alt` 属性には "LGTM image" を設定
  - `sizes` プロパティを適切に設定（レスポンシブ対応）
  - 例: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`

---

### 4. LgtmImages コンポーネント

#### ファイルパス
```
src/features/main/components/lgtm-images.tsx
```

#### Props
```typescript
type Props = {
  readonly images: ReadonlyArray<LgtmImage>;
};
```

#### 機能仕様
- `images` 配列を受け取り、各画像を `LgtmImage` コンポーネントで表示
- グリッドレイアウトで配置（Figmaデザイン参照）
- レスポンシブ対応：
  - モバイル: 1列
  - タブレット: 2-3列
  - デスクトップ: 3-4列

#### 実装のポイント
- **"use client" ディレクティブは不要**（子コンポーネントがクライアントコンポーネントなので親はサーバーコンポーネントでも可）
- Tailwind CSS 4 の Grid レイアウトを使用
  ```tsx
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {images.map((image) => (
      <LgtmImage key={image.id} {...image} />
    ))}
  </div>
  ```
- `key` には `image.id` を使用（ユニークなIDのため）

---

## 📁 ファイル1: copy-icon.tsx

### ファイルパス
```
src/components/icons/copy-icon.tsx
```

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

type Props = {
  width?: number;
  height?: number;
  color?: "default" | "white";
};

export function CopyIcon({
  width = 20,
  height = 20,
  color = "default",
}: Props): JSX.Element {
  const fillColor = color === "default" ? "#CBD5E1" : "#FFFFFF";

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={height}
      viewBox="0 0 20 20"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Copy icon</title>
      <path
        d="M10 1.66666H3.33333C2.41667 1.66666 1.66667 2.41666 1.66667 3.33332V13.3333H3.33333V3.33332H10V1.66666ZM12.5 4.99999H6.66667C5.75 4.99999 5 5.74999 5 6.66666V16.6667C5 17.5833 5.75 18.3333 6.66667 18.3333H12.5C13.4167 18.3333 14.1667 17.5833 14.1667 16.6667V6.66666C14.1667 5.74999 13.4167 4.99999 12.5 4.99999ZM12.5 16.6667H6.66667V6.66666H12.5V16.6667Z"
        fill={fillColor}
      />
    </svg>
  );
}
```

### 実装のポイント
- SVGパスは Figma MCP から取得したデータに基づく（上記は一例）
- `GithubIcon` コンポーネントと同じパターンで実装
- `width` と `height` のデフォルト値は `20`
- **`viewBox` は常に `"0 0 20 20"` で固定**（SVGパス座標が20x20前提のため、可変にすると縮小時に欠ける）

---

## 📁 ファイル2: heart-icon.tsx

### ファイルパス
```
src/components/icons/heart-icon.tsx
```

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

type Props = {
  width?: number;
  height?: number;
  color?: "default" | "favorite";
};

export function HeartIcon({
  width = 20,
  height = 20,
  color = "default",
}: Props): JSX.Element {
  const fillColor = color === "default" ? "#CBD5E1" : "#EF4444";

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={height}
      viewBox="0 0 20 20"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Heart icon</title>
      <path
        d="M10 17.5L8.825 16.4583C4.5 12.5833 1.66667 10.0417 1.66667 7C1.66667 4.45834 3.625 2.5 6.16667 2.5C7.58333 2.5 8.94167 3.13334 10 4.09167C11.0583 3.13334 12.4167 2.5 13.8333 2.5C16.375 2.5 18.3333 4.45834 18.3333 7C18.3333 10.0417 15.5 12.5833 11.175 16.4583L10 17.5Z"
        fill={fillColor}
      />
    </svg>
  );
}
```

### 実装のポイント
- SVGパスは Figma MCP から取得したデータに基づく（上記は一例）
- `color="default"` の場合は `#CBD5E1`（slate-300）
- `color="favorite"` の場合は `#EF4444`（red-500）
- **`viewBox` は常に `"0 0 20 20"` で固定**（SVGパス座標が20x20前提のため、可変にすると縮小時に欠ける）

---

## 📁 ファイル3: lgtm-image.tsx

### ファイルパス
```
src/features/main/components/lgtm-image.tsx
```

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { MouseEvent, JSX } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtmImage";
import { appBaseUrl } from "@/features/url";

type Props = {
  readonly id: LgtmImageType["id"];
  readonly imageUrl: LgtmImageType["imageUrl"];
};

export function LgtmImage({ id, imageUrl }: Props): JSX.Element {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCopy = useCallback(() => {
    const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
    navigator.clipboard.writeText(markdown);
  }, [imageUrl]);

  const handleToggleFavorite = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setIsFavorite((previous) => !previous);
    },
    []
  );

  const handleCopyIconClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handleCopy();
    },
    [handleCopy]
  );

  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-lg"
      data-lgtm-image-id={id}
    >
      <div className="relative h-[220px] w-full" onClick={handleCopy}>
        <Image
          alt="LGTM image"
          className="object-cover"
          fill
          priority={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={imageUrl}
        />
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          aria-label="Copy to clipboard"
          className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
          isIconOnly
          onClick={handleCopyIconClick}
          radius="sm"
          size="sm"
        >
          <CopyIcon color="default" height={20} width={20} />
        </Button>
        <Button
          aria-label="Add to favorites"
          className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
          isIconOnly
          onClick={handleToggleFavorite}
          radius="sm"
          size="sm"
        >
          <HeartIcon
            color={isFavorite ? "favorite" : "default"}
            height={20}
            width={20}
          />
        </Button>
      </div>
    </div>
  );
}
```

### 実装のポイント

1. **"use client" ディレクティブ**
   - `useState` を使用するため必須
   - ファイルの先頭（コメントの次）に配置

2. **型定義とimport**
   - `LgtmImage as LgtmImageType` でインポート（コンポーネント名と型名が衝突するため）
   - Props は `readonly` で定義
   - **`MouseEvent` を `react` からimport**（`React.MouseEvent` ではなく `MouseEvent` を使用）
   - `import type { MouseEvent, JSX } from "react";`

3. **`id` の使用**
   - **`data-lgtm-image-id={id}` でデータ属性として使用**（未使用のままだとLintエラー）
   - テスト時の要素特定や将来的な機能拡張で利用可能

4. **状態管理**
   - `useState` でお気に入り状態を管理
   - 初期値は `false`（お気に入りではない）

5. **イベントハンドラー**
   - `useCallback` で最適化
   - `event.stopPropagation()` でイベント伝播を阻止
   - 変数名は `previous` を使用（`prev` は省略形なので避ける）
   - 型は `MouseEvent<HTMLButtonElement>`（`React.` プレフィックスなし）

6. **クリップボードコピー**
   - `navigator.clipboard.writeText()` を使用
   - マークダウン形式: `[![LGTMeow](画像URL)](アプリベースURL)`
   - `appBaseUrl()` 関数でベースURLを取得

7. **画像表示**
   - Next.js の `Image` コンポーネントを使用
   - `fill` プロパティで親要素いっぱいに表示
   - `sizes` プロパティでレスポンシブ対応
   - `priority={false}` で遅延ロード（最適化）
   - 親要素の `div` に `relative` と固定高さ（`h-[220px]`）を設定

8. **アイコンボタン**
   - HeroUI の `Button` コンポーネントを使用
   - `isIconOnly` プロパティでアイコンのみのボタンに
   - `aria-label` でアクセシビリティ対応
   - 背景は半透明白（`bg-white/80`）+ `backdrop-blur-sm` でぼかし効果

9. **スタイリング**
   - Tailwind CSS 4 を使用
   - `absolute top-2 right-2` でアイコンを右上に配置
   - `flex gap-2` でアイコン間にスペース
   - `data-lgtm-image-id={id}` でデータ属性を追加（テスト用）

---

## 📁 ファイル4: lgtm-images.tsx

### ファイルパス
```
src/features/main/components/lgtm-images.tsx
```

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtmImage";
import { LgtmImage } from "./lgtm-image";

type Props = {
  readonly images: ReadonlyArray<LgtmImageType>;
};

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

### 実装のポイント

1. **"use client" ディレクティブ不要**
   - サーバーコンポーネントでOK
   - 子コンポーネント（`LgtmImage`）がクライアントコンポーネント

2. **型定義**
   - `images` は `ReadonlyArray<LgtmImage>` 型
   - Props は `readonly` で定義

3. **グリッドレイアウト**
   - `grid` でグリッドレイアウト
   - `grid-cols-1`: モバイル（1列）
   - `md:grid-cols-2`: タブレット（2列）
   - `lg:grid-cols-3`: 小型デスクトップ（3列）
   - `xl:grid-cols-4`: 大型デスクトップ（4列）
   - `gap-6`: グリッドアイテム間のスペース

4. **マッピング**
   - `map()` で各画像をレンダリング
   - `key={image.id}` でユニークキーを設定
   - `{...image}` でpropsを展開

---

## 📁 ファイル5: lgtm-image.stories.tsx

### ファイルパス
```
src/features/main/components/lgtm-image.stories.tsx
```

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LgtmImage } from "@/features/main/components/lgtm-image";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtmImage";

const meta = {
  component: LgtmImage,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LgtmImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: createLgtmImageId(1),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp"
    ),
  },
};

export const AnotherImage: Story = {
  args: {
    id: createLgtmImageId(2),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp"
    ),
  },
};
```

### 実装のポイント

1. **型定義のインポート**
   - `createLgtmImageId` と `createLgtmImageUrl` をインポート
   - Branded Type を作成するために必要

2. **decorators**
   - `w-[400px]` で幅を固定してストーリー表示を整える
   - `layout: "centered"` で中央寄せ

3. **Storyの定義**
   - `Default`: デフォルトの画像
   - `AnotherImage`: 別の画像（複数のバリエーションを表示）

4. **args**
   - `createLgtmImageId()` で `LgtmImageId` 型を作成
   - `createLgtmImageUrl()` で `LgtmImageUrl` 型を作成
   - 実際のLGTM画像URLを使用（モックデータから取得）

---

## 📁 ファイル6: lgtm-images.stories.tsx

### ファイルパス
```
src/features/main/components/lgtm-images.stories.tsx
```

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtmImage";

const meta = {
  component: LgtmImages,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof LgtmImages>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockImages = [
  {
    id: createLgtmImageId(1),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp"
    ),
  },
  {
    id: createLgtmImageId(2),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/01/2cb9b761-d8f5-4f5f-863c-fe292a29d0ae.webp"
    ),
  },
  {
    id: createLgtmImageId(3),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/01/c0fa3d4b-6346-4b71-9b9f-07c18c3e78c3.webp"
    ),
  },
  {
    id: createLgtmImageId(4),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/02/64f5f0a9-7aa0-4e70-b00a-b4a1a847657e.webp"
    ),
  },
  {
    id: createLgtmImageId(5),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/03/46cc8ae9-bbd2-4aa1-9b01-f6ef4c74dd40.webp"
    ),
  },
  {
    id: createLgtmImageId(6),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/04/f6bdb4f0-4b5e-4e11-9cf7-4f50f0cb9e77.webp"
    ),
  },
  {
    id: createLgtmImageId(7),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/05/ac5e7f6b-2f4e-4a6e-b0f8-0f0f9d0e6c5a.webp"
    ),
  },
  {
    id: createLgtmImageId(8),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/06/b9f0e5c8-3d7a-4b1e-9c8f-1e2d3c4b5a6f.webp"
    ),
  },
  {
    id: createLgtmImageId(9),
    imageUrl: createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp"
    ),
  },
];

export const Default: Story = {
  args: {
    images: mockImages,
  },
};

export const FewImages: Story = {
  args: {
    images: mockImages.slice(0, 3),
  },
};

export const Empty: Story = {
  args: {
    images: [],
  },
};
```

### 実装のポイント

1. **モックデータ**
   - `mockImages` 配列を定義（9件の画像）
   - 実際のLGTM画像URLを使用
   - `createLgtmImageId()` と `createLgtmImageUrl()` で型を作成

2. **Storyのバリエーション**
   - `Default`: 9件の画像を表示
   - `FewImages`: 3件の画像を表示（少ない画像の場合）
   - `Empty`: 空の配列（エッジケース）

3. **レイアウト**
   - `layout: "padded"` で余白を追加（グリッド表示に適している）

---

## 📋 実装手順（ステップバイステップ）

### Step 1: アイコンコンポーネントの実装

1. ファイルを作成: `src/components/icons/copy-icon.tsx`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

4. ファイルを作成: `src/components/icons/heart-icon.tsx`
5. 上記の完全な実装コードをコピー＆ペースト
6. ファイルを保存

**重要**: SVGパスはFigma MCPから取得したデータを使用すること

### Step 2: LgtmImage コンポーネントの実装

1. ファイルを作成: `src/features/main/components/lgtm-image.tsx`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

**重要**:
- "use client" ディレクティブを忘れずに追加
- `useState` と `useCallback` を正しくimport

### Step 3: LgtmImages コンポーネントの実装

1. ファイルを作成: `src/features/main/components/lgtm-images.tsx`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

### Step 4: Storybook の実装

1. ファイルを作成: `src/features/main/components/lgtm-image.stories.tsx`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

4. ファイルを作成: `src/features/main/components/lgtm-images.stories.tsx`
5. 上記の完全な実装コードをコピー＆ペースト
6. ファイルを保存

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

### 4. ビルド確認
```bash
npm run build
```
**ビルドエラーがないことを確認**

### 5. Playwright での動作確認

#### localhost:2222 での表示確認
```bash
npm run dev
```
- Playwright MCPを使用して `http://localhost:2222` にアクセス
- LGTMImages コンポーネントが正常に表示されることを確認
- クリップボードコピー機能が動作することを確認
- お気に入りアイコンの色変更が動作することを確認

#### Storybook での表示確認
```bash
npm run storybook
```
- Playwright MCPを使用して `http://localhost:6006/` にアクセス
- `LgtmImage` と `LgtmImages` のストーリーが正常に表示されることを確認

### 6. 開発環境の前提

**重要な前提条件**:
- `npm run dev` や `npm run storybook` などで開発サーバーは既に起動済みと考えてOK
- サーバーの起動確認や待機処理は不要

**CSSデバッグ時の注意**:
- CSSのデバッグを行う際は **Chrome DevTools MCP を使用**してデバッグすること
- ブラウザの開発者ツールで要素のスタイルを確認・調整できる

---

## 🚨 重要な注意事項

### 1. "use client" ディレクティブ

**必須**:
- `lgtm-image.tsx` には "use client" ディレクティブが必須（`useState` を使用）
- `lgtm-images.tsx` には "use client" ディレクティブは不要（サーバーコンポーネント）

### 2. MouseEvent の import

**重要**:
- `React.MouseEvent` は使用しない（`React` 名前空間をimportしていないため）
- `import type { MouseEvent, JSX } from "react";` でimport
- イベントハンドラーの型は `MouseEvent<HTMLButtonElement>`

### 3. `id` プロパティの使用

**必須**:
- `id` を Props で受け取るが使用しないと Lint エラー（`@typescript-eslint/no-unused-vars`）
- `data-lgtm-image-id={id}` でデータ属性として使用
- テスト時の要素特定や将来的な機能拡張で利用可能

### 4. 型定義の使用

**既存の型を使用**:
- `LgtmImage` 型（変更不可）
- `LgtmImageId`, `LgtmImageUrl` 型（Branded Types）
- `createLgtmImageId()`, `createLgtmImageUrl()` 関数

**新しい型定義は作成しない**:
- 既存の型定義を使用すること

### 5. appBaseUrl 関数の使用

**必須**:
- `appBaseUrl()` 関数を使用してアプリケーションのベースURLを取得
- マークダウン生成時に使用
- `src/features/url.ts` からインポート

### 6. クリップボード API の使用

**使用方法**:
```typescript
navigator.clipboard.writeText(markdown);
```

**重要**:
- `navigator.clipboard` はHTTPSまたはlocalhostでのみ動作
- エラーハンドリングは不要（ユーザーフィードバックなし）

### 7. 画像の表示

**Next.js Image コンポーネントを使用**:
- `next/image` の `Image` コンポーネントを使用
- `fill` プロパティで親要素いっぱいに表示
- `sizes` プロパティでレスポンシブ対応
- `priority={false}` で遅延ロード
- 親要素に `relative` と固定高さを設定

**禁止**:
- `<img>` タグを使用しない

### 8. イベントハンドラーの最適化

**useCallback を使用**:
```typescript
const handleCopy = useCallback(() => {
  // ...
}, [imageUrl]);
```

**event.stopPropagation() を使用**:
```typescript
const handleToggleFavorite = useCallback(
  (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsFavorite((previous) => !previous);
  },
  []
);
```

**重要**:
- `React.MouseEvent` ではなく `MouseEvent` を使用（importが必要）

### 9. 変数命名規約

**キャメルケースを使用**:
- `handleCopy`, `handleToggleFavorite`, `isFavorite`

**省略形を避ける**:
- ✅ `previous` ではなく ❌ `prev`
- ✅ `imageUrl` ではなく ❌ `imgUrl`

**汎用的な名前を避ける**:
- ❌ `data` は絶対に使用禁止

### 10. Tailwind CSS 4 の使用

**既存のコーディングガイドラインに従う**:
- `@CLAUDE.md` および `@docs/tailwind-css-v4-coding-guidelines.md` を参照
- カスタムCSSクラスは作成しない
- Tailwind CSS 4 のユーティリティクラスのみを使用

### 11. HeroUI の使用

**Button コンポーネントを使用**:
```typescript
import { Button } from "@heroui/react";
```

**プロパティ**:
- `isIconOnly`: アイコンのみのボタン
- `aria-label`: アクセシビリティ対応
- `onClick`: クリックイベントハンドラー
- `className`: カスタムスタイル

### 12. SVG アイコンの viewBox 固定

**重要**:
- **`viewBox` は常に `"0 0 20 20"` で固定**
- SVGパス座標が 20x20 前提のため、`viewBox` を可変にすると縮小時にパスが欠ける
- `width` と `height` プロパティで表示サイズのみを調整

**正しい実装**:
```typescript
<svg
  viewBox="0 0 20 20"  // 固定
  width={width}         // 可変
  height={height}       // 可変
>
```

**間違った実装**:
```typescript
<svg
  viewBox={`0 0 ${width} ${height}`}  // ❌ 可変にしない
>
```

### 13. 既存ファイルの確認

**変更不可のファイル**:
- `src/features/main/types/lgtmImage.ts` - 型定義（変更不可）
- `src/features/url.ts` - URL関数（変更不可）

**新規作成するファイル**:
- `src/components/icons/copy-icon.tsx`
- `src/components/icons/heart-icon.tsx`
- `src/features/main/components/lgtm-image.tsx`
- `src/features/main/components/lgtm-images.tsx`
- `src/features/main/components/lgtm-image.stories.tsx`
- `src/features/main/components/lgtm-images.stories.tsx`

### 11. 存在しないimportの禁止

**絶対に存在しないファイルやモジュールをimportしないこと**:
- 全てのimportパスは既存のファイルまたは新規作成したファイルを参照する
- 新しいライブラリのインストールは不要

---

## 📝 実装チェックリスト

実装完了前に、以下の全ての項目をチェックすること:

### アイコンコンポーネント
- [ ] `src/components/icons/copy-icon.tsx` が実装されている
- [ ] `src/components/icons/heart-icon.tsx` が実装されている
- [ ] SVGパスはFigma MCPから取得したデータを使用している
- [ ] `width`, `height`, `color` プロパティが実装されている
- [ ] デフォルト値が設定されている
- [ ] **`viewBox="0 0 20 20"` で固定されている**（可変ではない）
- [ ] ファイル先頭に「絶対厳守：編集前に必ずAI実装ルールを読む」コメントがある

### LgtmImage コンポーネント
- [ ] `src/features/main/components/lgtm-image.tsx` が実装されている
- [ ] **"use client" ディレクティブが追加されている**
- [ ] **`MouseEvent` を `react` からimportしている**（`React.MouseEvent` ではない）
- [ ] **`id` を `data-lgtm-image-id={id}` で使用している**（未使用でLintエラーを防ぐ）
- [ ] `useState` でお気に入り状態を管理している
- [ ] `useCallback` でイベントハンドラーを最適化している
- [ ] クリップボードコピー機能が実装されている
- [ ] `appBaseUrl()` 関数を使用している
- [ ] マークダウン形式が正しい（`[![LGTMeow](画像URL)](ベースURL)`）
- [ ] お気に入りアイコンクリックで色が変更される
- [ ] `event.stopPropagation()` が実装されている
- [ ] イベントハンドラーの型は `MouseEvent<HTMLButtonElement>`（`React.` なし）
- [ ] Next.js の `Image` コンポーネントを使用している
- [ ] `fill`, `sizes`, `alt` プロパティが設定されている
- [ ] HeroUI の `Button` コンポーネントを使用している
- [ ] `aria-label` が設定されている
- [ ] Tailwind CSS 4 でスタイリングされている
- [ ] ファイル先頭に「絶対厳守：編集前に必ずAI実装ルールを読む」コメントがある

### LgtmImages コンポーネント
- [ ] `src/features/main/components/lgtm-images.tsx` が実装されている
- [ ] グリッドレイアウトが実装されている
- [ ] レスポンシブ対応されている（1列 → 2列 → 3列 → 4列）
- [ ] `map()` で各画像をレンダリングしている
- [ ] `key={image.id}` が設定されている
- [ ] ファイル先頭に「絶対厳守：編集前に必ずAI実装ルールを読む」コメントがある

### Storybook
- [ ] `src/features/main/components/lgtm-image.stories.tsx` が実装されている
- [ ] `src/features/main/components/lgtm-images.stories.tsx` が実装されている
- [ ] `createLgtmImageId()` と `createLgtmImageUrl()` を使用している
- [ ] 複数のストーリーが定義されている
- [ ] モックデータが正しく設定されている
- [ ] ファイル先頭に「絶対厳守：編集前に必ずAI実装ルールを読む」コメントがある

### 型定義と型安全性
- [ ] `LgtmImage` 型を使用している
- [ ] `LgtmImageId`, `LgtmImageUrl` 型（Branded Types）を使用している
- [ ] `createLgtmImageId()`, `createLgtmImageUrl()` 関数を使用している
- [ ] Props は `readonly` で定義されている
- [ ] `ReadonlyArray` を使用している

### コーディング規約
- [ ] キャメルケースの変数名を使用している
- [ ] 汎用的な変数名（`data`, `prev` など）を避けている
- [ ] `previous` を使用している（`prev` ではない）
- [ ] 既存ファイルを変更していない
- [ ] 存在しないファイルをimportしていない
- [ ] Tailwind CSS 4 のコーディングガイドラインに準拠している

### 品質管理
- [ ] `npm run format` が成功している
- [ ] `npm run lint` がエラー0で完了している
- [ ] `npm run test` が全てパスしている
- [ ] `npm run build` が成功している
- [ ] Playwright MCP で `http://localhost:2222` にアクセスして表示確認済み
- [ ] Playwright MCP で `http://localhost:6006/` にアクセスしてStorybook確認済み

---

## 🎯 成功基準

以下を全て満たすこと:

✅ 2つのアイコンコンポーネントが正しく実装されている（`CopyIcon`, `HeartIcon`）
✅ **アイコンの `viewBox="0 0 20 20"` が固定されている**（可変ではない）
✅ `LgtmImage` コンポーネントが正しく実装されている
✅ **`MouseEvent` を `react` からimportしている**（`React.MouseEvent` ではない）
✅ **`id` を `data-lgtm-image-id={id}` で使用している**（未使用のLintエラーを防ぐ）
✅ `LgtmImages` コンポーネントが正しく実装されている
✅ クリップボードコピー機能が動作する
✅ お気に入りアイコンの色変更が動作する
✅ `appBaseUrl()` 関数を使用してマークダウンを生成している
✅ Next.js の `Image` コンポーネントを使用している
✅ HeroUI の `Button` コンポーネントを使用している
✅ Tailwind CSS 4 でスタイリングされている
✅ レスポンシブ対応されている
✅ Storybookが正しく実装されている
✅ `npm run format` が成功する
✅ **`npm run lint` がエラー0で完了する**（特に `@typescript-eslint/no-unused-vars` エラーがない）
✅ `npm run test` が全てパスする
✅ `npm run build` が成功する
✅ Playwright MCP で動作確認が完了している

---

## 📚 参考情報

### 使用する既存ファイル

1. **型定義**
   - `src/features/main/types/lgtmImage.ts` - LgtmImage型、Branded Types

2. **関数**
   - `src/features/url.ts` - appBaseUrl関数

3. **コンポーネント参考**
   - `src/components/icons/github-icon.tsx` - アイコンコンポーネントのパターン
   - `src/components/icon-button.tsx` - ボタンコンポーネントのパターン
   - `src/components/header.tsx` - HeroUI使用例

4. **Storybook参考**
   - `src/components/footer.stories.tsx` - Storybookのパターン
   - `src/components/icon-button.stories.tsx` - 複数ストーリーの例

### コーディング規約ドキュメント

- `docs/basic-coding-guidelines.md` - 基本的なコーディングガイドライン
- `docs/project-coding-guidelines.md` - プロジェクト固有のコーディング規約
- `docs/tailwind-css-v4-coding-guidelines.md` - Tailwind CSS 4 コーディングガイドライン

### Figma デザイン

- メイン画像一覧: `node-id=862-10457`
- 個別画像（コピー状態）: `node-id=162-829`
- 個別画像（お気に入り状態）: `node-id=162-838`

---

**作成日**: 2025-11-15
**対象Issue**: #327
**担当**: AI実装者
