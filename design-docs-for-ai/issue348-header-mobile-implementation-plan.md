# Issue #348: HeaderMobile レスポンシブ対応 - 詳細実装計画書（Drawer版）

## 📋 概要

### 目的

`src/components/header-mobile.tsx` を HeroUI の `Drawer` コンポーネントを使用した実装に変更する。メニューは**右側からスライドイン**し、**要素外クリックやESCキーで閉じる**形式に対応する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/348

### 技術スタック

- **UIライブラリ**: `@heroui/react` (既にインストール済み)
  - **Drawer コンポーネント**: メニューパネルに使用
  - **useDisclosure フック**: 開閉状態の管理
- **スタイリング**: Tailwind CSS 4
- **フレームワーク**: Next.js 16 App Router
- **React**: v19

### 変更の背景

Figmaデザイン（node: `484-5241`）に基づき、メニューパネルを右側から開くDrawer形式に変更する。これにより以下のUX改善が実現される：

1. **直感的な操作**: 右からスライドインするアニメーション
2. **標準的な閉じ方**: 要素外クリック、ESCキー、×ボタンで閉じる
3. **オーバーレイ**: 背景が薄暗くなり、メニューにフォーカスが当たる

---

## 📁 ファイル構成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/components/header-mobile.tsx` | Drawer コンポーネントを使用した実装に変更 |

### 既存ファイル（変更なし）

以下のファイルは前回の実装で作成済みであり、今回の変更では修正不要：

- `src/components/icons/menu-icon.tsx` - ハンバーガーメニューアイコン
- `src/components/icons/close-icon.tsx` - クローズアイコン
- `src/components/icons/cat-nyan-icon.tsx` - にゃんリスト用猫アイコン
- `src/components/header-logo.tsx` - size プロパティ対応済み
- `src/components/icons/heart-icon.tsx` - color: "white" 対応済み
- `src/components/header-i18n.ts` - i18n関数追加済み
- `src/components/header.tsx` - ブレークポイント切り替え対応済み
- `src/components/header-desktop.stories.tsx` - Storybook作成済み
- `src/components/header-mobile.stories.tsx` - Storybook作成済み

---

## 🎨 Figmaデザイン仕様

### ブレークポイント

- **デスクトップ**: `md` (768px) 以上 → `HeaderDesktop` を表示
- **モバイル**: `md` (768px) 未満 → `HeaderMobile` を表示

### HeaderMobile - ヘッダーバー（閉じた状態）

**Figma Node**: `222-1483`

```
構成要素:
- LGTMeow ロゴ（HeaderLogoコンポーネントを使用）
- 地球儀アイコン（言語切替トリガー）
- ハンバーガーメニューアイコン

レイアウト:
- 高さ: 48px
- 背景色: primary (orange-500, #f97316)
- パディング: px-4
- justify-between で左右配置
```

### HeaderMobile - Drawer（開いた状態）

**Figma Node**: `484-5241`

```
Drawer の特徴:
- 右側からスライドインするアニメーション
- 背景に薄暗いオーバーレイ（backdrop）
- 要素外クリックまたはESCキーで閉じる
- ヘッダーバーの×アイコンでも閉じる

構成要素:
- ヘッダーバー（LGTMeow ロゴ + 地球儀アイコン + ×アイコン）
- メニューコンテンツ（ログイン状態に応じて変化）
- 言語選択メニュー（オプション）
```

### メニューパネル（未ログイン状態 - 日本語）

**Figma Node**: `226-2186`

```
構成要素:
1. ログインボタン
   - 背景色: amber-300 (#fcd34d)
   - テキスト色: orange-900 (#7c2d12)
   - GitHubアイコン付き
   - 角丸: rounded-lg (8px)
   - パディング: px-7 py-2
   - 幅: 100% (親要素に合わせる)

2. ナビゲーションリンク
   - HOME
   - アップロード
   - 使い方

   各リンク:
   - 高さ: 70px
   - 下ボーダー: border-b border-orange-200
   - テキスト色: white
   - パディング: px-5 py-3
   - フォント: 16px
```

### メニューパネル（未ログイン状態 - 英語）

**Figma Node**: `425-7142`

```
構成要素:
1. Loginボタン（日本語版と同じスタイル）
2. ナビゲーションリンク
   - HOME
   - Upload new Cats
   - How to Use
```

### メニューパネル（ログイン状態 - 日本語/英語共通）

**Figma Node**: `230-3133` (日本語), `425-7156` (英語)

**注意**: Figmaでは日本語版がHOMEボタン、英語版がLogoutボタンになっていますが、**両言語ともLogoutボタンに統一**します。

```
構成要素:
1. Logoutボタン（日本語: ログアウト / 英語: Logout）
   - 背景色: amber-300 (#fcd34d)
   - テキスト色: orange-900 (#7c2d12)
   - 角丸: rounded-lg (8px)
   - 幅: 100%
   - パディング: px-6 py-2
   - フォント: font-bold text-xl

2. ナビゲーションリンク（アイコン付き）
   - お気に入り / Favorite（ハートアイコン - 白色）
   - にゃんリスト / Meowlist（猫アイコン - 白色）

   各リンク:
   - 高さ: 70px
   - 下ボーダー: border-b border-orange-200
   - テキスト色: white
   - パディング: px-5 py-4
   - フォント: 14px (text-sm)
   - アイコンとテキスト間: gap-3
```

### 言語メニュー

**Figma Node**: `484-5221`, `484-5224`, `484-5226`

```
構成要素:
- 日本語
- English

選択状態:
- 背景色: orange-400 (#fb923c)
- 右矢印アイコン（RightIcon）表示
- パディング左: px-5

非選択状態:
- 背景色: transparent
- パディング左: pl-10 (インデント)
```

---

## 🔧 コンポーネント実装詳細

### 1. MenuIcon（新規作成）

**ファイルパス**: `src/components/icons/menu-icon.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

export function MenuIcon(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 12"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Menu icon</title>
      <path
        d="M0 0H20V2H0V0ZM0 5H20V7H0V5ZM0 10H20V12H0V10Z"
        fill="#FFF7ED"
      />
    </svg>
  );
}
```

**SVGデータの取得元**: Figma Node `222-1479` (Icon/Solid/menu)

---

### 2. CloseIcon（新規作成）

**ファイルパス**: `src/components/icons/close-icon.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

export function CloseIcon(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Close icon</title>
      <path
        d="M4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L10 8.58579L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L11.4142 10L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L10 11.4142L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L8.58579 10L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289Z"
        fill="#FFF7ED"
      />
    </svg>
  );
}
```

**SVGデータの取得元**: Figma Node `226-2338` (Icon/Solid/x)

---

### 3. CatNyanIcon（新規作成）

**ファイルパス**: `src/components/icons/cat-nyan-icon.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

type Props = {
  readonly width?: number;
  readonly height?: number;
  readonly color?: "default" | "white";
};

export function CatNyanIcon({
  width = 24,
  height = 24,
  color = "white",
}: Props): JSX.Element {
  const fillColor = color === "white" ? "#FFF7ED" : "#7C2D12";

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cat icon</title>
      <path
        d="M13.4991 9.07623H14.3007C15.3367 10.826 17.2775 12 19.4995 12C20.0153 12 20.5216 11.9361 20.9998 11.8173V12V13.4618V22.2331C20.9998 23.0416 20.3294 23.6949 19.4995 23.6949C18.6698 23.6949 17.9994 23.0416 17.9994 22.2331V15.8007L11.624 20.771H14.2491C15.0789 20.771 15.7492 21.4244 15.7492 22.2331C15.7492 23.0416 15.0789 23.6949 14.2491 23.6949H7.49844C4.9139 23.6949 2.89795 21.7306 2.89795 19.3093V9.09909C2.89795 8.36358 2.33555 7.73772 1.58548 7.64635L1.21503 7.60066C0.394734 7.50016 -0.19145 6.77124 0.00987483 5.96978C0.211199 5.16832 0.96127 4.59928 1.78156 4.69978L2.15201 4.74547C4.40603 5.01957 6.10019 6.88344 6.10019 9.09909V13.0759C7.71103 10.6341 10.4675 8.87623 13.4991 8.87623V9.07623ZM20.9998 10.2869C20.531 10.4468 20.0247 10.5381 19.4995 10.5381C18.1683 10.5381 16.9682 9.97163 16.1431 9.07623C15.9697 8.88894 15.8149 8.68793 15.6789 8.47322C15.2476 7.79711 14.9992 7.00222 14.9992 6.15251V1.76691V0.853253V0.793864C14.9992 0.524332 15.2195 0.309621 15.4961 0.305053H15.5055C15.6602 0.305053 15.8055 0.378147 15.8993 0.496924V0.501492L16.4993 1.27811L17.7744 2.93641L17.9994 3.22878H20.9998L21.2248 2.93641L22.4999 1.27811L23.0999 0.501492V0.496924C23.1937 0.378147 23.339 0.305053 23.4937 0.305053H23.5031C23.7797 0.309621 24 0.524332 24 0.793864V0.853253V1.76691V6.15251C24 6.94283 23.7844 7.68747 23.4094 8.32704C22.8796 9.23157 22.0217 9.93509 20.9998 10.2869ZM18.7495 6.15251C18.7495 5.95866 18.6705 5.77275 18.5299 5.63567C18.3892 5.49859 18.1984 5.42157 17.9994 5.42157C17.8005 5.42157 17.6097 5.49859 17.469 5.63567C17.3284 5.77275 17.2494 5.95866 17.2494 6.15251C17.2494 6.34637 17.3284 6.53228 17.469 6.66936C17.6097 6.80644 17.8005 6.88344 17.9994 6.88344C18.1984 6.88344 18.3892 6.80644 18.5299 6.66936C18.6705 6.53228 18.7495 6.34637 18.7495 6.15251ZM20.9998 6.88344C21.1987 6.88344 21.3894 6.80644 21.5301 6.66936C21.6707 6.53228 21.7498 6.34637 21.7498 6.15251C21.7498 5.95866 21.6707 5.77275 21.5301 5.63567C21.3894 5.49859 21.1987 5.42157 20.9998 5.42157C20.8008 5.42157 20.6101 5.49859 20.4694 5.63567C20.3288 5.77275 20.2497 5.95866 20.2497 6.15251C20.2497 6.34637 20.3288 6.53228 20.4694 6.66936C20.6101 6.80644 20.8008 6.88344 20.9998 6.88344Z"
        fill={fillColor}
      />
    </svg>
  );
}
```

**SVGデータの取得元**: Figma Node `425-7163` (icon/nyan)

---

### 4. HeaderLogo の修正

**ファイルパス**: `src/components/header-logo.tsx`

デスクトップ（218px x 40px）とモバイル（146px x 32px）でサイズが異なるため、`size` プロパティを追加します。

**注意**: `Text` は `react-aria-components` からインポートされています。

#### 修正後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import Link from "next/link";
import type { JSX } from "react";
import { Text } from "react-aria-components";
import { LgtmCatIcon } from "@/components/lgtm-cat-icon";
import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";

export type Props = {
  readonly language: Language;
  readonly size?: "desktop" | "mobile";
};

export function HeaderLogo({ language, size = "desktop" }: Props): JSX.Element {
  const homeToLink = createIncludeLanguageAppPath("home", language);

  const sizeClasses = size === "mobile"
    ? "h-8 w-[146px]"
    : "h-10 w-[218px]";

  const textClasses = size === "mobile"
    ? "text-2xl"
    : "text-4xl";

  const iconSize = size === "mobile"
    ? { width: 28, height: 21 }  // LgtmCatIcon default ratio: 36:27 = 4:3
    : { width: 36, height: 27 };  // default

  return (
    <Link
      className={`flex items-center justify-center gap-0.5 bg-orange-500 ${sizeClasses}`}
      href={homeToLink}
      prefetch={false}
    >
      {/* eslint-disable-next-line react/prefer-shorthand-boolean */}
      <LgtmCatIcon
        aria-hidden={true}
        className="shrink-0"
        height={iconSize.height}
        width={iconSize.width}
      />
      <h1 className={`font-bold text-orange-50 no-underline ${textClasses}`}>
        <Text>LGTMeow</Text>
      </h1>
    </Link>
  );
}
```

#### サイズ比較

| サイズ | 幅 | 高さ | アイコンサイズ (w x h) | テキストサイズ |
|--------|-----|------|----------------------|--------------|
| desktop | 218px | 40px | 36 x 27 | text-4xl |
| mobile | 146px | 32px | 28 x 21 | text-2xl |

**注意**: `LgtmCatIcon` のデフォルトアスペクト比は 36:27 (4:3) です。モバイル用は同じ比率を維持しています。

---

### 5. HeartIcon の修正

**ファイルパス**: `src/components/icons/heart-icon.tsx`

モバイルメニューではアイコンが白色で表示されるため、`color` プロパティに "white" を追加します。

**注意**: 既存のHeartIconはfillとstrokeの両方を使用しています。白色版ではstrokeも白色にして視認性を確保します。

#### 修正後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";

type Props = {
  readonly width?: number;
  readonly height?: number;
  readonly color?: "default" | "favorite" | "white";
};

export function HeartIcon({
  width = 20,
  height = 20,
  color = "default",
}: Props): JSX.Element {
  const palette = (() => {
    switch (color) {
      case "favorite":
        return { fill: "#EF4444", stroke: "#3C4F64" };
      case "white":
        return { fill: "#FFF7ED", stroke: "#FFF7ED" };
      default:
        return { fill: "#FFFFFF", stroke: "#CBD5E1" };
    }
  })();

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
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="1.3"
      />
    </svg>
  );
}
```

#### color オプション一覧

| color | fill | stroke | 用途 |
|-------|------|--------|------|
| default | #FFFFFF | #CBD5E1 | 通常表示 |
| favorite | #EF4444 | #3C4F64 | お気に入り（赤色） |
| white | #FFF7ED | #FFF7ED | モバイルメニュー用（白色） |

---

### 6. header-i18n.ts への追加

**ファイルパス**: `src/components/header-i18n.ts`

以下の関数を追加:

```typescript
export function homeText(language: Language): string {
  switch (language) {
    case "ja":
      return "HOME";
    case "en":
      return "HOME";
    default:
      return assertNever(language);
  }
}
```

---

### 7. HeaderMobile（Drawer版に修正）

**ファイルパス**: `src/components/header-mobile.tsx`

#### Props定義（変更なし）

```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};
```

#### インポート（Drawer関連を追加）

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import type { JSX } from "react";
import {
  closeMenuAriaLabel,
  favoriteListText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  meowlistText,
  openMenuAriaLabel,
  switchLanguageAriaLabel,
  uploadText,
} from "@/components/header-i18n";
import { HeaderLogo } from "@/components/header-logo";
import { CatNyanIcon } from "@/components/icons/cat-nyan-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { GithubIcon } from "@/components/icons/github-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { RightIcon } from "@/components/icons/right-icon";
import { type Language, removeLanguageFromAppPath } from "@/features/language";
import {
  createIncludeLanguageAppPath,
  type IncludeLanguageAppPath,
} from "@/features/url";
```

#### 状態管理（useDisclosureフックを使用）

```typescript
// メニューDrawerの開閉状態
const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
// 言語メニューの開閉状態（Drawer内のアコーディオン的な動作）
const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
```

#### コンポーネント構造

1. **ヘッダーバー**: ロゴ + 地球儀アイコン + メニューアイコン（常に表示）
2. **Drawer**: 右側から開くメニューパネル
   - **DrawerHeader**: Drawer内のヘッダー（×ボタン付き）
   - **DrawerBody**: メニューコンテンツ（言語選択 + ナビリンク）

#### Drawer の設定

```typescript
<Drawer
  hideCloseButton  // デフォルトのクローズボタンを非表示
  isOpen={isMenuOpen}
  placement="right"  // 右側から開く
  onClose={onMenuClose}
  classNames={{
    base: "bg-primary",  // Drawer全体の背景色
    header: "bg-primary border-b border-orange-300",  // ヘッダー部分
    body: "bg-primary px-5 pb-5",  // ボディ部分
  }}
>
```

#### スタイリング指針（変更なし）

- ヘッダーバー背景: `bg-primary`
- Drawer背景: `bg-primary`
- ボタン背景（未ログイン時ログインボタン / ログイン時Logoutボタン）: `bg-button-secondary-base`
- ボタンテキスト: `text-text-br`
- ナビリンクテキスト: `text-background` (white系)
- ボーダー: `border-orange-200`
- 選択状態背景: `bg-orange-400`

---

### 8. header.tsx の修正

**ファイルパス**: `src/components/header.tsx`

#### 修正後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX } from "react";
import { HeaderDesktop } from "@/components/header-desktop";
import { HeaderMobile } from "@/components/header-mobile";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};

export function Header({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
  return (
    <>
      {/* モバイル: md未満で表示 */}
      <div className="md:hidden">
        <HeaderMobile
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
      {/* デスクトップ: md以上で表示 */}
      <div className="hidden md:block">
        <HeaderDesktop
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
      </div>
    </>
  );
}
```

---

### 9. HeaderDesktop Storybook（新規作成）

**ファイルパス**: `src/components/header-desktop.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { HeaderDesktop } from "@/components/header-desktop";

const meta = {
  component: HeaderDesktop,
} satisfies Meta<typeof HeaderDesktop>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderDesktopInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: false,
  },
};

export const HeaderDesktopInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: false,
  },
};

export const LoggedInHeaderDesktopInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: true,
  },
};

export const LoggedInHeaderDesktopInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: true,
  },
};
```

---

### 10. HeaderMobile Storybook（新規作成）

**ファイルパス**: `src/components/header-mobile.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { HeaderMobile } from "@/components/header-mobile";

const meta = {
  component: HeaderMobile,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
} satisfies Meta<typeof HeaderMobile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderMobileInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: false,
  },
};

export const HeaderMobileInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: false,
  },
};

export const LoggedInHeaderMobileInJapanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    isLoggedIn: true,
  },
};

export const LoggedInHeaderMobileInEnglish: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    isLoggedIn: true,
  },
};
```

---

## 🎨 デザイントークン（Tailwind CSS v4）

### 使用するデザイントークン

| 用途 | Tailwindクラス | カラーコード |
|------|---------------|-------------|
| ヘッダー背景 | `bg-primary` | #f97316 |
| メニュー背景 | `bg-primary` | #f97316 |
| ボタン背景 | `bg-button-secondary-base` | #fcd34d |
| ボタンテキスト | `text-text-br` | #7c2d12 |
| ナビテキスト | `text-background` | #fff7ed |
| ボーダー | `border-orange-200` | #fed7aa |
| 選択状態背景 | `bg-orange-400` | #fb923c |

### 注意事項

- `orange-200`, `orange-400` はデザイントークンに定義されていないため、標準のTailwindクラスを使用
- その他の色は可能な限りデザイントークンを使用

---

## 📝 実装順序

**今回の変更は HeaderMobile のみ**です。以下のファイルは前回の実装で作成済み：

- ✅ MenuIcon, CloseIcon, CatNyanIcon - 作成済み
- ✅ HeaderLogo - size プロパティ追加済み
- ✅ HeartIcon - color: "white" 追加済み
- ✅ header-i18n.ts - homeText, loginText, aria-label関数 追加済み
- ✅ header.tsx - ブレークポイント切り替え対応済み
- ✅ Storybook - 作成済み

### 今回の実装手順

1. **HeaderMobile を Drawer版に修正** - `src/components/header-mobile.tsx`
2. **品質管理の実行** - format, lint, test
3. **動作確認** - ブラウザで確認

---

## 📋 HeaderMobile 詳細実装（Drawer版）

### 重要な仕様変更（2025-12-15更新）

**言語メニューの表示仕様**:
- ヘッダーバーの地球儀アイコンは**メニューを開く**動作のみ（Drawerを開く）
- 言語メニューは**Drawer内の地球儀アイコンをクリックした時のみ**表示される
- 通常時のDrawer内: ログインボタン + ナビリンク（言語メニューなし）
- 地球儀クリック後: ログインボタン + 言語メニュー + ナビリンク

### コンポーネント全体構造

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import { type JSX, useState } from "react";
import {
  closeMenuAriaLabel,
  favoriteListText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  meowlistText,
  openMenuAriaLabel,
  switchLanguageAriaLabel,
  uploadText,
} from "@/components/header-i18n";
import { HeaderLogo } from "@/components/header-logo";
import { CatNyanIcon } from "@/components/icons/cat-nyan-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { GithubIcon } from "@/components/icons/github-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { HeartIcon } from "@/components/icons/heart-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { RightIcon } from "@/components/icons/right-icon";
import { type Language, removeLanguageFromAppPath } from "@/features/language";
import {
  createIncludeLanguageAppPath,
  type IncludeLanguageAppPath,
} from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};

export function HeaderMobile({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
  // HeroUI の useDisclosure フックでDrawerの開閉状態を管理
  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure();
  // 言語メニューの開閉状態（Drawer内の地球儀クリックで切り替え）
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const removedLanguagePath = removeLanguageFromAppPath(currentUrlPath);

  const handleLanguageToggle = () => {
    setIsLanguageMenuOpen((prev) => !prev);
  };

  const handleCloseMenus = () => {
    onMenuClose();
    setIsLanguageMenuOpen(false);
  };

  return (
    <>
      {/* ヘッダーバー（常に表示） */}
      <header className="w-full border-orange-300 border-b bg-primary">
        <div className="flex h-12 items-center justify-between px-4">
          <HeaderLogo language={language} size="mobile" />
          <div className="flex items-center gap-3">
            {/* 地球儀アイコン: メニューを開く（言語メニューも開いた状態で） */}
            <button
              aria-label={switchLanguageAriaLabel(language)}
              className="p-1"
              onClick={() => {
                setIsLanguageMenuOpen(true);
                onMenuOpen();
              }}
              type="button"
            >
              <GlobeIcon />
            </button>
            {/* メニューアイコン: メニューを開く（言語メニューは閉じた状態で） */}
            <button
              aria-label={openMenuAriaLabel(language)}
              className="p-1"
              onClick={onMenuOpen}
              type="button"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* メニューDrawer（右からスライドイン） */}
      <Drawer
        classNames={{
          base: "bg-primary",
        }}
        hideCloseButton
        isOpen={isMenuOpen}
        onClose={handleCloseMenus}
        placement="right"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              {/* Drawer内のヘッダー */}
              <DrawerHeader className="flex items-center justify-between border-orange-300 border-b bg-primary px-4 py-2">
                <HeaderLogo language={language} size="mobile" />
                <div className="flex items-center gap-3">
                  {/* Drawer内の地球儀アイコン: 言語メニューの開閉を切り替え */}
                  <button
                    aria-label={switchLanguageAriaLabel(language)}
                    className="p-1"
                    onClick={handleLanguageToggle}
                    type="button"
                  >
                    <GlobeIcon />
                  </button>
                  <button
                    aria-label={closeMenuAriaLabel(language)}
                    className="p-1"
                    onClick={onClose}
                    type="button"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </DrawerHeader>

              {/* Drawer内のボディ（メニューコンテンツ） */}
              <DrawerBody className="bg-primary px-5 pb-5">
                {/* 未ログイン時: ログインボタン + 言語メニュー（条件付き） + ナビリンク */}
                {!isLoggedIn && (
                  <>
                    <Button
                      as={Link}
                      className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-7 py-2 font-bold text-text-br text-xl"
                      href={createIncludeLanguageAppPath("login", language)}
                      onClick={handleCloseMenus}
                    >
                      <GithubIcon color="default" height={20} width={20} />
                      {loginText(language)}
                    </Button>

                    {/* 言語メニュー（地球儀クリック時のみ表示） */}
                    {isLanguageMenuOpen && (
                      <nav className="mb-4">
                        <Link
                          className={`flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-3 text-background text-base ${
                            language === "ja" ? "bg-orange-400" : ""
                          }`}
                          href={removedLanguagePath}
                          onClick={handleCloseMenus}
                        >
                          {language === "ja" && <RightIcon />}
                          <span className={language === "ja" ? "" : "pl-5"}>日本語</span>
                        </Link>
                        <Link
                          className={`flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-3 text-background text-base ${
                            language === "en" ? "bg-orange-400" : ""
                          }`}
                          href={`/en${removedLanguagePath}`}
                          onClick={handleCloseMenus}
                        >
                          {language === "en" && <RightIcon />}
                          <span className={language === "en" ? "" : "pl-5"}>English</span>
                        </Link>
                      </nav>
                    )}

                    <Link
                      className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
                      href={createIncludeLanguageAppPath("home", language)}
                      onClick={handleCloseMenus}
                    >
                      {homeText(language)}
                    </Link>
                    <Link
                      className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
                      href={createIncludeLanguageAppPath("upload", language)}
                      onClick={handleCloseMenus}
                    >
                      {uploadText(language)}
                    </Link>
                    <Link
                      className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
                      // TODO: /how-to-use ページ実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
                      href="/how-to-use"
                      onClick={handleCloseMenus}
                    >
                      {howToUseText(language)}
                    </Link>
                  </>
                )}

                {/* ログイン時: Logoutボタン + 言語メニュー（条件付き） + ナビリンク */}
                {isLoggedIn && (
                  <>
                    <Button
                      as={Link}
                      className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-6 py-2 font-bold text-text-br text-xl"
                      // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
                      href="/logout"
                      onClick={handleCloseMenus}
                    >
                      {logoutText(language)}
                    </Button>

                    {/* 言語メニュー（地球儀クリック時のみ表示） */}
                    {isLanguageMenuOpen && (
                      <nav className="mb-4">
                        <Link
                          className={`flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-3 text-background text-base ${
                            language === "ja" ? "bg-orange-400" : ""
                          }`}
                          href={removedLanguagePath}
                          onClick={handleCloseMenus}
                        >
                          {language === "ja" && <RightIcon />}
                          <span className={language === "ja" ? "" : "pl-5"}>日本語</span>
                        </Link>
                        <Link
                          className={`flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-3 text-background text-base ${
                            language === "en" ? "bg-orange-400" : ""
                          }`}
                          href={`/en${removedLanguagePath}`}
                          onClick={handleCloseMenus}
                        >
                          {language === "en" && <RightIcon />}
                          <span className={language === "en" ? "" : "pl-5"}>English</span>
                        </Link>
                      </nav>
                    )}

                    <Link
                      className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
                      // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
                      href="/favorites"
                      onClick={handleCloseMenus}
                    >
                      <HeartIcon color="white" height={24} width={24} />
                      {favoriteListText(language)}
                    </Link>
                    <Link
                      className="flex h-[70px] items-center gap-3 border-orange-200 border-b px-5 py-4 text-background text-sm"
                      // TODO: https://github.com/nekochans/lgtm-cat/issues/14 でログイン機能が出来た際にこのページを実装するので実装後は `createIncludeLanguageAppPath` を使ってパスを生成するように修正する
                      href="/cat-list"
                      onClick={handleCloseMenus}
                    >
                      <CatNyanIcon color="white" height={24} width={24} />
                      {meowlistText(language)}
                    </Link>
                  </>
                )}
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
```

### Drawer の主要設定

| プロパティ | 値 | 説明 |
|-----------|-----|------|
| `placement` | `"right"` | 右側から開く |
| `hideCloseButton` | `true` | デフォルトのクローズボタンを非表示（カスタムボタン使用） |
| `isOpen` | `isMenuOpen` | 開閉状態（useDisclosure で管理） |
| `onClose` | `handleCloseMenus` | 閉じる時のハンドラー |
| `classNames.base` | `"bg-primary"` | Drawer全体の背景色 |

### 言語メニューの動作仕様

| 操作 | 動作 |
|------|------|
| ヘッダーバーの地球儀クリック | Drawerを開く + 言語メニューを表示した状態で開く |
| ヘッダーバーのメニューアイコンクリック | Drawerを開く（言語メニューは非表示） |
| Drawer内の地球儀クリック | 言語メニューの表示/非表示を切り替え |
| 言語リンククリック | 言語を切り替え + Drawerを閉じる |

### 閉じる方法

Drawerは以下の方法で閉じることができます：

1. **×ボタンクリック**: DrawerHeader内のCloseIconボタン
2. **オーバーレイクリック**: Drawer外の薄暗い部分をクリック
3. **ESCキー**: キーボードのESCキーを押す
4. **リンククリック**: メニュー内のリンクをクリック（handleCloseMenusで閉じる）

---

## 🚨 実装時の注意事項

### 1. 既存コンポーネント（全て対応済み）

以下のコンポーネントは前回の実装で作成・修正済みです：

- `src/components/icons/menu-icon.tsx` - ハンバーガーメニューアイコン（作成済み）
- `src/components/icons/close-icon.tsx` - クローズアイコン（作成済み）
- `src/components/icons/cat-nyan-icon.tsx` - にゃんリスト用猫アイコン（作成済み）
- `src/components/header-logo.tsx` - size プロパティ追加済み
- `src/components/icons/heart-icon.tsx` - color: "white" 追加済み
- `src/components/header-i18n.ts` - homeText, loginText, aria-label関数 追加済み

### 2. インポートパスの確認

すべてのインポートは `@/` エイリアスを使用:

```typescript
import { HeaderLogo } from "@/components/header-logo";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { type Language } from "@/features/language";
```

### 3. "use client" ディレクティブ

`HeaderMobile` は `useState` を使用するため、ファイル先頭に `"use client"` が必須。

### 4. 型定義

Props は `readonly` 修飾子を使用:

```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};
```

### 5. アクセシビリティ

- すべてのボタンに `aria-label` を設定
- SVGアイコンに `<title>` タグを含める
- `aria-hidden="true"` をアイコンに設定

### 6. 新規アイコンライブラリのインストール禁止

すべてのアイコンは既存のコンポーネントまたはFigmaから取得したSVGを使用。

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

### 4. 開発サーバーでの表示確認

Playwright MCPを使って `http://localhost:2222` にアクセスし、以下を確認:

- [ ] デスクトップサイズ（768px以上）で `HeaderDesktop` が表示される
- [ ] モバイルサイズ（768px未満）で `HeaderMobile` が表示される
- [ ] ハンバーガーメニューをクリックで**Drawerが右から開く**（言語メニューは非表示）
- [ ] ヘッダーバーの地球儀アイコンをクリックで**Drawerが開く + 言語メニューが表示される**
- [ ] Drawer内の×ボタンをクリックで**Drawerが閉じる**
- [ ] **オーバーレイ（背景の薄暗い部分）をクリックでDrawerが閉じる**
- [ ] **ESCキーを押してDrawerが閉じる**
- [ ] Drawer内の地球儀アイコンをクリックで**言語メニューが開閉する**
- [ ] 言語切替が動作する
- [ ] 各ナビリンクが正常に遷移し、Drawerが閉じる
- [ ] ログイン/未ログイン状態でメニュー内容が切り替わる

### 5. Storybookでの表示確認

Playwright MCPを使って `http://localhost:6006/` にアクセスし、以下を確認:

- [ ] `HeaderDesktop` の各ストーリーが正常に表示される
- [ ] `HeaderMobile` の各ストーリーが正常に表示される
- [ ] 日本語/英語の表示切替が正しい
- [ ] ログイン/未ログイン状態の表示が正しい

### 6. デザイン崩れの調査

Chrome DevTools MCP を使ってデザイン崩れがないか確認すること。

---

## ⚠️ 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいアイコンパッケージのインストール禁止** - 全てのアイコンは既存のコンポーネントまたはFigmaから取得
3. **ビジネスロジックの変更禁止** - UI変更のみに集中
4. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 🎯 成功基準

以下を全て満たすこと:

### 今回の修正対象
- [ ] `HeaderMobile` コンポーネントがDrawer版に修正されている (`src/components/header-mobile.tsx`)

### 前回の実装（確認済み - 変更不要）
- [x] `MenuIcon` が作成されている (`src/components/icons/menu-icon.tsx`)
- [x] `CloseIcon` が作成されている (`src/components/icons/close-icon.tsx`)
- [x] `CatNyanIcon` が作成されている (`src/components/icons/cat-nyan-icon.tsx`)
- [x] `HeaderDesktop` の Storybook が作成されている (`src/components/header-desktop.stories.tsx`)
- [x] `HeaderMobile` の Storybook が作成されている (`src/components/header-mobile.stories.tsx`)
- [x] `header-i18n.ts` に `homeText`, `loginText`, aria-label関数が追加されている
- [x] `header.tsx` がブレークポイントで HeaderDesktop と HeaderMobile を切り替える実装になっている
- [x] `header-logo.tsx` に `size` プロパティが追加されている
- [x] `heart-icon.tsx` に `color: "white"` オプションが追加されている

### Drawer 動作確認
- [ ] メニューアイコンをクリックで**Drawerが右側からスライドイン**する（言語メニューは非表示）
- [ ] ヘッダーバーの地球儀アイコンをクリックで**Drawerが開く + 言語メニューが表示される**
- [ ] Drawer内の×ボタンをクリックで**Drawerがスライドアウト**する
- [ ] **オーバーレイ（背景の薄暗い部分）をクリックでDrawerが閉じる**
- [ ] **ESCキーを押してDrawerが閉じる**
- [ ] Drawer内の地球儀アイコンをクリックで**言語メニューの表示/非表示が切り替わる**
- [ ] Drawer内のリンクをクリックするとDrawerが閉じる

### デザイン・品質
- [ ] Figmaデザイン（node: `484-5241`）と視覚的に一致している
- [ ] デザイントークン（`bg-primary`, `text-background`, `bg-button-secondary-base` など）が正しく使用されている
- [ ] 既存の機能（デスクトップ表示）が全て正常に動作する

### CI/テスト
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 動作確認
- [ ] `http://localhost:2222` でモバイル・デスクトップ両方で正常に表示される
- [ ] `http://localhost:6006/` のStorybookで各コンポーネントが正常に表示される
- [ ] アクセシビリティ（aria-label, title タグ）が維持されている

---

**作成日**: 2025-12-15
**更新日**: 2025-12-15（言語メニュー仕様変更 - 地球儀クリック時のみ表示）
**対象Issue**: #348
**担当**: AI実装者
