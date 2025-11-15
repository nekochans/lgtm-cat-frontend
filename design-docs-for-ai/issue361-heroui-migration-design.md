# Issue #361: Hero UI移行 - 詳細実装計画書

## 📋 概要

### 目的
react-aria-componentsを使用している既存のUIコンポーネントをHero UIベースのコンポーネントに変更し、Figmaデザインと一致させる。

### 対象コンポーネント
1. `src/components/login-button.tsx`
2. `src/components/link-button.tsx`
3. `src/components/lgtm-cat-icon.tsx`
4. `src/components/icon-button.tsx`
5. `src/components/header.tsx`

### 技術スタック
- **UIライブラリ**: `@heroui/react` (v2.8.5) - 既にインストール済み
- **スタイリング**: Tailwind CSS 4
- **フレームワーク**: Next.js 16 App Router
- **React**: v19.2.0

---

## 🎨 Figmaデザイン仕様

### ボタン系コンポーネント (Node: 140:1019)
```
背景色: amber-300 (#fcd34d)
テキスト色: orange-900 (#7c2d12)
パディング: px-7 py-2 (px-[28px] py-[8px])
角丸: rounded-lg (8px)
フォント: Inter Bold, 20px, line-height 28px
アイコン: GitHubアイコン (20x19.491px)
```

### ヘッダー (Node: 132:284)
```
背景色: orange-500 (#f97316)
ボーダー: border-b border-orange-300 (#fdba74)
高さ: h-16 (64px)
パディング: px-5 (20px)

ナビゲーションボタン:
- 背景: orange-500 (透明化)
- テキスト: orange-50 (#fff7ed)
- ホバー: text-orange-100
- パディング: px-6 py-0
- フォント: Inter Regular 16px

ポリシー/languageボタン:
- 背景: orange-500
- ボーダー: border-2 border-orange-50
- テキスト: orange-50
- パディング: px-5 py-3 (20px 12px)
- 角丸: rounded-3 (12px)
- フォント: Inter Bold 16px
```

### ドロップダウンメニュー (Node: 862:10359)
```
背景色: orange-500
シャドウ: shadow-lg
ボーダー: ring-1 ring-black/5
アイテム:
- パディング: px-5 py-2 (20px 8px)
- テキスト: orange-50
- ホバー: bg-orange-600
- フォント: Inter Bold 16px
選択中アイテム:
- 背景: orange-400
```

---

## 🎨 デザイントークン (Tailwind CSS v4)

プロジェクトでは、Figmaのデザイントークンを`src/app/globals.css`の`@theme`ディレクティブで定義しています。

### 定義済みカラートークン

```css
@theme {
  /* Colors - Text */
  --color-text-br: #7c2d12;
  --color-text-wh: #ffffff;

  /* Colors - Background & Border */
  --color-background: #fff7ed;
  --color-primary: #f97316;
  --color-border: #fed7aa;

  /* Colors - Button Primary */
  --color-button-primary-base: #f97316;
  --color-button-primary-hover: #fed7aa;
  --color-button-primary-active: #c2410c;

  /* Colors - Button Secondary */
  --color-button-secondary-base: #fcd34d;
  --color-button-secondary-hover: #fde68a;
  --color-button-secondary-active: #eab308;

  /* Colors - Button Tertiary */
  --color-button-tertiary-base: #fff7ed;
  --color-button-tertiary-border: #fed7aa;
  --color-button-tertiary-tx: #ea580c;
  --color-button-tertiary-hover: #ffedd5;
}
```

### 使用方法

Tailwind CSS v4では、これらのトークンを以下の2つの方法で使用できます:

#### 1. Tailwindのクラス名として使用 (推奨)
```tsx
// 背景色
<div className="bg-button-secondary-base">  // #fcd34d
<div className="bg-primary">                // #f97316

// テキスト色
<div className="text-text-br">              // #7c2d12
<div className="text-text-wh">              // #ffffff

// ボーダー色
<div className="border-border">             // #fed7aa
```

#### 2. CSS変数として直接使用
```tsx
// 任意の値として使用
<div className="bg-(--color-button-secondary-base)">
<div className="text-(--color-text-br)">
```

### デザイントークンとTailwindのマッピング

| Figmaトークン | Tailwind CSS v4 変数 | Tailwindクラス | カラーコード |
|--------------|---------------------|---------------|------------|
| text_br | `--color-text-br` | `text-text-br`, `bg-text-br` | #7c2d12 |
| text_wh | `--color-text-wh` | `text-text-wh`, `bg-text-wh` | #ffffff |
| background | `--color-background` | `bg-background` | #fff7ed |
| primary | `--color-primary` | `bg-primary`, `text-primary` | #f97316 |
| border | `--color-border` | `border-border` | #fed7aa |
| button_primary_base | `--color-button-primary-base` | `bg-button-primary-base` | #f97316 |
| button_primary_hover | `--color-button-primary-hover` | `bg-button-primary-hover` | #fed7aa |
| button_primary_active | `--color-button-primary-active` | `bg-button-primary-active` | #c2410c |
| button_secondary_base | `--color-button-secondary-base` | `bg-button-secondary-base` | #fcd34d |
| button_secondary_hover | `--color-button-secondary-hover` | `bg-button-secondary-hover` | #fde68a |
| button_secondary_active | `--color-button-secondary-active` | `bg-button-secondary-active` | #eab308 |
| button_tertiary_base | `--color-button-tertiary-base` | `bg-button-tertiary-base` | #fff7ed |
| button_tertiary_border | `--color-button-tertiary-border` | `border-button-tertiary-border` | #fed7aa |
| button_tertiary_tx | `--color-button-tertiary-tx` | `text-button-tertiary-tx` | #ea580c |
| button_tertiary_hover | `--color-button-tertiary-hover` | `bg-button-tertiary-hover` | #ffedd5 |

### 重要な注意事項

1. **既存のTailwindカラーとの共存**:
   - デザイントークンは既存のTailwind標準カラー（`orange-500`, `amber-300`など）と共存します
   - 実装時は、可能な限りデザイントークンを優先的に使用してください

2. **標準カラーとの対応**:
   - `--color-text-br` = `orange-900` (#7c2d12) - **デザイントークン使用推奨**
   - `--color-background` = `orange-50` (#fff7ed) - **デザイントークン使用推奨**
   - `--color-primary` = `orange-500` (#f97316) - **デザイントークン使用推奨**
   - `--color-button-secondary-base` = `amber-300` (#fcd34d) - **デザイントークン使用推奨**

3. **今回の実装で使用する置き換えマッピング**:

   すべてのコンポーネントでデザイントークンを使用します。以下の置き換えを適用してください。

   | 既存のTailwindクラス | デザイントークンクラス | 用途 |
   |-------------------|---------------------|------|
   | `bg-amber-300` | `bg-button-secondary-base` | セカンダリボタン背景 |
   | `bg-amber-100` | `bg-button-secondary-hover` | セカンダリボタンホバー |
   | `hover:bg-amber-100` | `hover:bg-button-secondary-hover` | セカンダリボタンホバー |
   | `bg-amber-500` | `bg-button-secondary-active` | セカンダリボタンアクティブ |
   | `text-orange-900` | `text-text-br` | テキスト色（茶色） |
   | `bg-orange-900` | `bg-text-br` | 背景色（茶色） |
   | `bg-orange-50` | `bg-background` | 背景色（ベージュ） |
   | `text-orange-50` | `text-background` | テキスト色（ベージュ） |
   | `bg-orange-500` | `bg-primary` | プライマリ背景 |
   | `text-orange-500` | `text-primary` | プライマリテキスト |
   | `border-orange-200` | `border-border` | ボーダー色 |
   | `border-orange-50` | `border-background` | ボーダー色（明るい） |
   | `bg-orange-600` | `bg-button-tertiary-tx` | ターシャリボタン |
   | `hover:bg-orange-600` | `hover:bg-button-tertiary-tx` | ターシャリボタンホバー |
   | `bg-orange-700` | `bg-button-primary-active` | プライマリボタンアクティブ |
   | `hover:bg-orange-700` | `hover:bg-button-primary-active` | プライマリボタンホバー（アクティブ） |
   | `bg-orange-100` | `bg-button-tertiary-hover` | ターシャリボタンホバー |
   | `hover:text-orange-100` | `hover:text-button-tertiary-hover` | テキストホバー |
   | `text-white` | `text-text-wh` | テキスト色（白） |

   **注意**: 以下の色はデザイントークンにないため、標準のTailwindクラスを使用します:
   - `orange-300` (#fdba74) - ヘッダーのボーダーなど
   - `orange-400` (#fb923c) - 選択中のメニュー項目など

---

## 🔧 コンポーネント別実装計画

### 1. login-button.tsx

#### 現在の実装
```typescript
// react-aria-components の IconButton を使用
import { IconButton } from "@/components/icon-button";

export function LoginButton({ language }: Props): JSX.Element {
  return (
    <IconButton
      displayText={language === "en" ? "Login" : "ログイン"}
      link={createIncludeLanguageAppPath("login", language)}
      showGithubIcon={true}
    />
  );
}
```

#### Hero UI移行後の実装

**重要**: `IconButton`コンポーネントが他の場所でも使われているため、`login-button.tsx`は`IconButton`の実装変更に依存します。`IconButton`がHero UIベースに変更されれば、このコンポーネントは**そのまま動作します**。

**アクション**: このコンポーネント自体の変更は不要。`icon-button.tsx`の変更を待つ。

---

### 2. link-button.tsx

#### 現在の実装
```typescript
import Link from "next/link";
import { Text } from "react-aria-components"; // <- 削除対象

export function LinkButton({ linkText, linkUrl, className, style }: Props): JSX.Element {
  return (
    <Link className="..." href={linkUrl}>
      <Text className="...">{linkText}</Text>
    </Link>
  );
}
```

#### Hero UI移行後の実装

**方針**: `react-aria-components`の`Text`を削除し、Hero UIの`Button`コンポーネントを`as={Link}`で使用する。

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { Button } from "@heroui/react";
import Link from "next/link";
import type { CSSProperties, JSX } from "react";
import type { IncludeLanguageAppPath, Url } from "@/features/url";

type Props = {
  linkText: string;
  linkUrl: Url | IncludeLanguageAppPath;
  className?: string;
  style?: CSSProperties;
};

export function LinkButton({
  linkText,
  linkUrl,
  className,
  style,
}: Props): JSX.Element {
  return (
    <Button
      as={Link}
      href={linkUrl}
      className={`flex w-full max-w-screen-md items-center justify-center gap-2.5 rounded-lg bg-button-tertiary-tx px-6 py-3.5 font-bold font-inter text-lg text-text-wh transition-colors duration-200 hover:bg-button-primary-active ${className ?? ""}`}
      style={style}
    >
      {linkText}
    </Button>
  );
}
```

**重要な変更点**:
- `Text`コンポーネントを削除
- Hero UIの`Button`を`as={Link}`プロパティで使用
- `href`を直接`Button`に渡す
- テキストは`children`として直接渡す
- `prefetch={false}`は削除（Next.js Linkのデフォルト動作に依存）

**デザイントークンの使用**:
- `bg-orange-600` → `bg-button-tertiary-tx`
- `hover:bg-orange-700` → `hover:bg-button-primary-active`
- `text-white` → `text-text-wh`

**importパス**:
```typescript
import { Button } from "@heroui/react";
```

---

### 3. lgtm-cat-icon.tsx

#### 現在の実装
```typescript
export function LgtmCatIcon({ className, "aria-hidden": ariaHidden }: Props): JSX.Element {
  return <svg ...>{/* SVGパス */}</svg>;
}
```

#### Hero UI移行後の実装

**方針**: このコンポーネントは純粋なSVGアイコンのため、**変更不要**。

**理由**:
- Hero UIはアイコンコンポーネントに特別な要件を持たない
- 既存の実装はFigmaデザインと一致している
- 他のコンポーネントから正常に参照されている

**アクション**: 変更なし

---

### 4. icon-button.tsx

#### 現在の実装
```typescript
import { Button, Text } from "react-aria-components"; // <- 変更対象

export function IconButton({ displayText, showGithubIcon, link, ... }: Props): JSX.Element {
  if (link != null) {
    return <Link className="...">...</Link>;
  }
  return <Button className="...">...</Button>;
}
```

#### Hero UI移行後の実装

**方針**: Hero UIの`Button`コンポーネントを使用し、Figmaデザインに一致させる。

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む
import { Button } from "@heroui/react";
import Link from "next/link";
import type { ComponentProps, JSX } from "react";
import type { IncludeLanguageAppPath } from "@/features/url";
import { GithubIcon } from "./icons/github-icon";

function RepeatIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Repeat icon</title>
      <path
        d="M15.7704 0.361021C16.239 0.143546 16.7741 0.265332 17.1334 0.661135L19.6329 3.44481C19.8672 3.70578 20 4.05809 20 4.4278C20 4.7975 19.8672 5.14981 19.6329 5.41078L17.1334 8.19445C16.7741 8.59461 16.239 8.71204 15.7704 8.49457C15.3017 8.27709 14.9971 7.77255 14.9971 7.20712V5.82398H13.7473C13.3529 5.82398 12.9818 6.02841 12.7475 6.38072L11.0916 8.83818L9.52939 6.5199L10.7479 4.71051C11.4548 3.65793 12.5679 3.04031 13.7473 3.04031H14.9971V1.64847C14.9971 1.08739 15.3017 0.578495 15.7704 0.361021ZM6.405 11.1608L7.96719 13.4791L6.74868 15.2885C6.04179 16.3411 4.92873 16.9587 3.74927 16.9587H1.24976C0.558485 16.9587 0 16.3367 0 15.5668C0 14.797 0.558485 14.175 1.24976 14.175H3.74927C4.14372 14.175 4.51474 13.9706 4.74907 13.6183L6.405 11.1608ZM17.1295 19.3379C16.7702 19.738 16.2351 19.8554 15.7665 19.638C15.2978 19.4205 14.9932 18.916 14.9932 18.3505V16.9587H13.7473C12.5679 16.9587 11.4548 16.3411 10.7479 15.2885L4.74907 6.38072C4.51474 6.02841 4.14372 5.82398 3.74927 5.82398H1.24976C0.558485 5.82398 0 5.202 0 4.43214C0 3.66228 0.558485 3.04031 1.24976 3.04031H3.74927C4.92873 3.04031 6.04179 3.65793 6.74868 4.71051L12.7475 13.6183C12.9818 13.9706 13.3529 14.175 13.7473 14.175H14.9971V12.7832C14.9971 12.2221 15.3017 11.7132 15.7704 11.4957C16.239 11.2782 16.7741 11.4 17.1334 11.7958L19.6329 14.5795C19.8672 14.8405 20 15.1928 20 15.5625C20 15.9322 19.8672 16.2845 19.6329 16.5455L17.1334 19.3292L17.1295 19.3379Z"
        fill="#FFF7ED"
      />
    </svg>
  );
}

function RandomIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Random icon</title>
      <path
        d="M5.2875 5.08008C7.87917 2.37435 12.0667 2.3613 14.675 5.03658L12.9583 6.82444C12.6708 7.1246 12.5875 7.57265 12.7417 7.96416C12.8958 8.35566 13.2625 8.60796 13.6667 8.60796H18.6458H19C19.5542 8.60796 20 8.14251 20 7.56395V1.9959C20 1.57394 19.7583 1.19114 19.3833 1.03019C19.0083 0.869238 18.5792 0.956239 18.2917 1.25639L16.5583 3.06601C12.9083 -0.696777 7.02917 -0.683726 3.4 3.10951C2.38333 4.17092 1.65 5.41938 1.2 6.75484C0.954167 7.4813 1.32083 8.27301 2.0125 8.52966C2.70417 8.78631 3.46667 8.40351 3.7125 7.6814C4.03333 6.73309 4.55417 5.84134 5.2875 5.08008ZM0 12.436V12.7666V12.7971V18.0041C0 18.426 0.241667 18.8088 0.616667 18.9698C0.991667 19.1307 1.42083 19.0437 1.70833 18.7436L3.44167 16.9339C7.09167 20.6967 12.9708 20.6837 16.6 16.8904C17.6167 15.829 18.3542 14.5806 18.8042 13.2495C19.05 12.523 18.6833 11.7313 17.9917 11.4746C17.3 11.218 16.5375 11.6008 16.2917 12.3229C15.9708 13.2712 15.45 14.163 14.7167 14.9242C12.125 17.6299 7.9375 17.643 5.32917 14.9677L7.04167 13.1755C7.32917 12.8754 7.4125 12.4273 7.25833 12.0358C7.10417 11.6443 6.7375 11.392 6.33333 11.392H1.35H1.32083H1C0.445833 11.392 0 11.8574 0 12.436Z"
        fill="#FFF7ED"
      />
    </svg>
  );
}

function CatIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cat icon</title>
      <path
        d="M11.2492 7.56353H11.9172C12.7806 9.02159 14.3979 9.99997 16.2496 9.99997C16.6794 9.99997 17.1013 9.94668 17.4998 9.8477V9.99997V11.2182V18.5275C17.4998 19.2013 16.9411 19.7457 16.2496 19.7457C15.5582 19.7457 14.9995 19.2013 14.9995 18.5275V13.1673L9.68652 17.3093H11.8742C12.5657 17.3093 13.1243 17.8537 13.1243 18.5275C13.1243 19.2013 12.5657 19.7457 11.8742 19.7457H6.24869C4.17818 19.7457 2.49833 18.1088 2.49833 16.0911V7.58257C2.49833 6.96965 2.02954 6.4481 1.40448 6.37196L1.09585 6.33389C0.412194 6.25014 -0.0761338 5.64103 0.00981194 4.97482C0.0957576 4.3086 0.720817 3.83273 1.40448 3.91649L1.7131 3.95456C3.58828 4.18297 4.99857 5.7362 4.99857 7.58257V10.8299C6.34245 8.8617 8.63954 7.56353 11.2492 7.56353ZM17.4998 8.57237C17.1091 8.70562 16.6872 8.78175 16.2496 8.78175C15.1402 8.78175 14.1401 8.30969 13.4525 7.56353C13.308 7.40745 13.179 7.23994 13.0657 7.06102C12.7063 6.49759 12.4993 5.83518 12.4993 5.12709V1.47243V0.711044V0.661554C12.4993 0.436944 12.6829 0.258018 12.9134 0.254211H12.9212C13.0501 0.254211 13.1712 0.315122 13.2494 0.414103V0.41791L13.7494 1.06509L14.812 2.44701L14.9995 2.69065H17.4998L17.6873 2.44701L18.7499 1.06509L19.2499 0.41791V0.414103C19.3281 0.315122 19.4492 0.254211 19.5781 0.254211H19.5859C19.8164 0.258018 20 0.436944 20 0.661554V0.711044V1.47243V5.12709C20 5.78569 19.8203 6.40622 19.5078 6.9392C19.0663 7.69297 18.3514 8.27924 17.4998 8.57237ZM15.6246 5.12709C15.6246 4.96555 15.5587 4.81062 15.4415 4.69639C15.3243 4.58216 15.1653 4.51798 14.9995 4.51798C14.8337 4.51798 14.6748 4.58216 14.5575 4.69639C14.4403 4.81062 14.3745 4.96555 14.3745 5.12709C14.3745 5.28864 14.4403 5.44357 14.5575 5.5578C14.6748 5.67203 14.8337 5.7362 14.9995 5.7362C15.1653 5.7362 15.3243 5.67203 15.4415 5.5578C15.5587 5.44357 15.6246 5.28864 15.6246 5.12709ZM17.4998 5.7362C17.6655 5.7362 17.8245 5.67203 17.9417 5.5578C18.059 5.44357 18.1248 5.28864 18.1248 5.12709C18.1248 4.96555 18.059 4.81062 17.9417 4.69639C17.8245 4.58216 17.6655 4.51798 17.4998 4.51798C17.334 4.51798 17.175 4.58216 17.0578 4.69639C16.9406 4.81062 16.8747 4.96555 16.8747 5.12709C16.8747 5.28864 16.9406 5.44357 17.0578 5.5578C17.175 5.67203 17.334 5.7362 17.4998 5.7362Z"
        fill="#FFF7ED"
      />
    </svg>
  );
}

type Props = ComponentProps<"button"> & {
  displayText: string;
  showGithubIcon?: boolean;
  showRepeatIcon?: boolean;
  showRandomIcon?: boolean;
  showCatIcon?: boolean;
  isPressed?: boolean;
  className?: string;
  link?: IncludeLanguageAppPath;
};

export function IconButton({
  type,
  displayText,
  showGithubIcon,
  showRepeatIcon,
  showRandomIcon,
  showCatIcon,
  isPressed,
  className,
  link,
}: Props): JSX.Element {
  // Figmaデザインに基づくスタイル（デザイントークン使用）
  const buttonClasses = `inline-flex items-center justify-center gap-2 rounded-lg px-7 py-2 font-bold font-inter text-xl text-text-br transition-colors duration-200 ${
    isPressed === true ? "bg-button-secondary-active" : "bg-button-secondary-base hover:bg-button-secondary-hover"
  } ${className ?? ""}`;

  const startContent = (
    <>
      {showGithubIcon != null && (
        <GithubIcon color="default" height={20} width={20} />
      )}
      {showRepeatIcon != null && <RepeatIcon />}
      {showRandomIcon != null && <RandomIcon />}
      {showCatIcon != null && <CatIcon />}
    </>
  );

  if (link != null) {
    return (
      <Button
        as={Link}
        href={link}
        className={buttonClasses}
        startContent={startContent}
      >
        {displayText}
      </Button>
    );
  }

  return (
    <Button
      type={type}
      isDisabled={isPressed}
      className={buttonClasses}
      startContent={startContent}
    >
      {displayText}
    </Button>
  );
}
```

**重要な変更点**:
1. `react-aria-components`の`Button`と`Text`を削除
2. Hero UIの`Button`コンポーネントを使用
3. `as={Link}`プロパティでLinkとして動作
4. `startContent`プロパティでアイコンを配置
5. テキストは`children`として直接配置
6. Figmaデザインに一致するようにクラス名を調整（`text-xl`、`font-bold`）
7. `aria-pressed`プロパティを削除（Hero UIでは不要）

**デザイントークンの使用**:
- `text-orange-900` → `text-text-br`
- `bg-amber-500` → `bg-button-secondary-active`
- `bg-amber-300` → `bg-button-secondary-base`
- `hover:bg-amber-100` → `hover:bg-button-secondary-hover`

**importパス**:
```typescript
import { Button } from "@heroui/react";
```

---

### 5. header.tsx

#### 現在の実装
```typescript
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Header as ReactAriaHeader,
  Text,
} from "react-aria-components"; // <- 変更対象
```

#### Hero UI移行後の実装

**方針**: Hero UIの`Dropdown`、`DropdownTrigger`、`DropdownMenu`、`DropdownItem`、`Button`を使用する。

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import Link from "next/link";
import type { JSX } from "react";
import { HeaderLogo } from "@/components/header-logo";
import { DownIcon } from "@/components/icons/down-icon";
import { GithubIcon } from "@/components/icons/github-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { RightIcon } from "@/components/icons/right-icon";
import { LoginButton } from "@/components/login-button";
import { createExternalTransmissionPolicyLinksFromLanguages } from "@/features/external-transmission-policy";
import { type Language, removeLanguageFromAppPath } from "@/features/language";
import { createPrivacyPolicyLinksFromLanguages } from "@/features/privacy-policy";
import { createTermsOfUseLinksFromLanguages } from "@/features/terms-of-use";
import { appPathList, type IncludeLanguageAppPath } from "@/features/url";
import {
  favoriteListText,
  howToUseText,
  logoutText,
  meowlistText,
  policyText,
  uploadText,
} from "./header-i18n";

type Props = {
  language: Language;
  currentUrlPath: IncludeLanguageAppPath;
  isLoggedIn: boolean;
};

export function Header({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
  const terms = createTermsOfUseLinksFromLanguages(language);
  const privacy = createPrivacyPolicyLinksFromLanguages(language);
  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);
  const removedLanguagePath = removeLanguageFromAppPath(currentUrlPath);

  return (
    <header className="w-full border-orange-300 border-b bg-primary">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <HeaderLogo language={language} />
            <nav className="flex items-center gap-1">
              <Link
                className="flex items-center justify-center bg-primary p-5 font-bold font-medium text-base text-background hover:text-button-tertiary-hover"
                href={appPathList.upload}
              >
                {uploadText(language)}
              </Link>
              <Link
                className="flex items-center justify-center bg-primary p-5 font-bold font-medium text-base text-background hover:text-button-tertiary-hover"
                href="/how-to-use"
              >
                {howToUseText(language)}
              </Link>
              <Link
                className="flex items-center justify-center bg-primary p-5 font-bold font-medium text-base text-background hover:text-button-tertiary-hover"
                href={terms.link}
              >
                {terms.text}
              </Link>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="light"
                    className="flex items-center justify-center gap-2 bg-transparent px-5 py-2 font-bold font-medium text-base text-background hover:text-button-tertiary-hover data-[hover=true]:bg-transparent"
                  >
                    {policyText(language)}
                    <DownIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Policy menu"
                  className="min-w-[200px] max-w-[400px] bg-primary"
                >
                  <DropdownItem
                    key="privacy"
                    className="px-6 py-2 font-bold font-medium text-base text-background data-[hover=true]:bg-button-tertiary-tx"
                    as={Link}
                    href={privacy.link}
                  >
                    {privacy.text}
                  </DropdownItem>
                  <DropdownItem
                    key="external-transmission"
                    className="px-6 py-2 font-bold font-medium text-base text-background data-[hover=true]:bg-button-tertiary-tx"
                    as={Link}
                    href={externalTransmissionPolicy.link}
                  >
                    {externalTransmissionPolicy.text}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="border-2 border-background bg-primary px-5 py-3 font-bold text-base text-background hover:bg-primary"
                >
                  <GlobeIcon />
                  language
                  <DownIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Language selection"
                className="min-w-[180px] bg-primary"
                selectionMode="single"
                selectedKeys={language === "ja" ? ["ja"] : ["en"]}
              >
                <DropdownItem
                  key="ja"
                  className={`px-5 py-2 font-bold font-medium text-base ${
                    language === "ja"
                      ? "bg-orange-400 text-background"
                      : "text-background data-[hover=true]:bg-button-tertiary-tx"
                  }`}
                  as={Link}
                  href={removedLanguagePath}
                  startContent={language === "ja" ? <RightIcon /> : null}
                >
                  日本語
                </DropdownItem>
                <DropdownItem
                  key="en"
                  className={`px-5 py-2 font-bold font-medium text-base ${
                    language === "en"
                      ? "bg-orange-400 text-background"
                      : "text-background data-[hover=true]:bg-button-tertiary-tx"
                  }`}
                  as={Link}
                  href={`/en${removedLanguagePath}`}
                  startContent={language === "en" ? <RightIcon /> : null}
                >
                  English
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {isLoggedIn ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="light"
                    isIconOnly
                    className="bg-transparent px-5 py-2 data-[hover=true]:bg-transparent"
                  >
                    <GithubIcon color="white" height={24} width={24} />
                    <DownIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="User menu"
                  className="min-w-[180px] bg-primary"
                >
                  <DropdownItem
                    key="favorites"
                    className="px-5 py-2 font-bold font-medium text-base text-background data-[hover=true]:bg-button-tertiary-tx"
                    as={Link}
                    href="/favorites"
                  >
                    {favoriteListText(language)}
                  </DropdownItem>
                  <DropdownItem
                    key="cat-list"
                    className="px-5 py-2 font-bold font-medium text-base text-background data-[hover=true]:bg-button-tertiary-tx"
                    as={Link}
                    href="/cat-list"
                  >
                    {meowlistText(language)}
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    className="px-5 py-2 font-bold font-medium text-base text-background data-[hover=true]:bg-button-tertiary-tx"
                    as={Link}
                    href="/logout"
                  >
                    {logoutText(language)}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <LoginButton language={language} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

**重要な変更点**:
1. `react-aria-components`の全てのコンポーネントを削除
2. Hero UIの`Dropdown`、`DropdownTrigger`、`DropdownMenu`、`DropdownItem`、`Button`を使用
3. `ReactAriaHeader`を`<header>`タグに変更
4. `Text`コンポーネントを削除し、テキストを直接配置
5. `Popover`の代わりに`Dropdown`を使用（Hero UIではDropdownが自動的にPopoverを管理）
6. `variant="light"`でボタンの透明化
7. `variant="bordered"`でボーダー付きボタン
8. `as={Link}`でリンクとして動作
9. `data-[hover=true]:bg-button-tertiary-tx`でホバー時のスタイル（デザイントークン使用）
10. `startContent`プロパティでアイコン配置

**デザイントークンの使用**:
- `bg-orange-500` → `bg-primary`
- `text-orange-50` → `text-background`
- `hover:text-orange-100` → `hover:text-button-tertiary-hover`
- `border-orange-50` → `border-background`
- `bg-orange-600` → `bg-button-tertiary-tx`
- `data-[hover=true]:bg-orange-600` → `data-[hover=true]:bg-button-tertiary-tx`

**注意**: `orange-300`（ボーダー）と`orange-400`（選択中アイテム）はデザイントークンにないため、標準のTailwindクラスを使用

**importパス**:
```typescript
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
```

**Hero UI特有のdata属性**:
- `data-[hover=true]`: ホバー状態
- `data-[focus=true]`: フォーカス状態
- `data-[pressed=true]`: プレス状態

---

## 🚨 実装時の注意事項

### 1. 既存機能の保持
- **Props interfaceの変更禁止**: 既存のコンポーネントを使用している箇所が多数あるため、propsの型定義は変更しないこと
- **動作の維持**: 既存の動作（リンク、ボタンクリック、ドロップダウン開閉）は全て維持すること

### 2. アクセシビリティ
- `aria-label`を全てのドロップダウンメニューに追加
- アイコンのみのボタンには`aria-hidden="true"`を設定
- `<title>`タグをSVGアイコンに含める

### 3. スタイリング
- **Tailwind CSS 4のルールに従う**: `@docs/tailwind-css-v4-coding-guidelines.md`参照
- **Figmaデザインとの厳密な一致**: 色、サイズ、パディング、フォントを正確に再現
- **data属性の活用**: Hero UIの`data-[hover=true]`などを使用してホバー状態をスタイリング
- **デザイントークンの必須使用**:
  - すべての色指定で、可能な限りデザイントークンを使用すること
  - 例: `bg-orange-500` の代わりに `bg-primary` を使用
  - 例: `text-orange-900` の代わりに `text-text-br` を使用
  - 例: `bg-amber-300` の代わりに `bg-button-secondary-base` を使用
  - デザイントークンにない色（`orange-300`, `orange-400`）のみ標準のTailwindクラスを使用
  - 詳細な置き換えマッピングは上記の「デザイントークン」セクションを参照

### 4. 既存のアイコンコンポーネントの再利用
以下の既存アイコンコンポーネントは**そのまま使用**:
- `src/components/icons/github-icon.tsx`
- `src/components/icons/down-icon.tsx`
- `src/components/icons/globe-icon.tsx`
- `src/components/icons/right-icon.tsx`
- `src/components/lgtm-cat-icon.tsx`

**絶対に新しいアイコンライブラリをインストールしないこと**

### 5. Hero UIのバージョン
- 既にインストールされている`@heroui/react` v2.8.5を使用
- **追加のインストールは不要**

### 6. Storybookファイルの更新
各コンポーネントの変更後、対応するStorybookファイル（`*.stories.tsx`）も更新すること:
- `src/components/login-button.stories.tsx`
- `src/components/link-button.stories.tsx`
- `src/components/icon-button.stories.tsx`
- `src/components/header.stories.tsx`

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
```bash
npm run dev
```
Playwright MCPを使って `http://localhost:2222` にアクセスし、以下を確認:
- ヘッダーの表示
- ボタンのホバー状態
- ドロップダウンメニューの開閉
- 言語切替の動作
- ログインボタンの表示

### 5. Storybookでの表示確認
```bash
npm run storybook
```
Playwright MCPを使って `http://localhost:6006/` にアクセスし、修正した各コンポーネントが正常に表示されることを確認

---

## 📝 実装順序の推奨

以下の順序で実装することを推奨:

1. **icon-button.tsx** (他のコンポーネントに依存されているため最優先)
2. **link-button.tsx** (単独で完結)
3. **login-button.tsx** (icon-button.tsxの変更後は変更不要)
4. **lgtm-cat-icon.tsx** (変更不要)
5. **header.tsx** (最も複雑なため最後)

---

## 📋 ステップバイステップ実装手順

### Step 1: icon-button.tsx の実装

#### 1-1. ファイルを開く
```bash
# エディタで開く
src/components/icon-button.tsx
```

#### 1-2. import文を変更
**変更前**:
```typescript
import { Button, Text } from "react-aria-components";
```

**変更後**:
```typescript
import { Button } from "@heroui/react";
```

#### 1-3. IconButton関数内のbuttonClassesを更新
**変更前**:
```typescript
const buttonClasses = `inline-flex items-center justify-center gap-2 rounded-lg px-7 py-2 font-bold font-inter text-xl text-orange-900 transition-colors duration-200 ${
  isPressed === true ? "bg-amber-500" : "bg-amber-300 hover:bg-amber-100"
} ${className ?? ""}`;
```

**変更後**:
```typescript
const buttonClasses = `inline-flex items-center justify-center gap-2 rounded-lg px-7 py-2 font-bold font-inter text-xl text-text-br transition-colors duration-200 ${
  isPressed === true ? "bg-button-secondary-active" : "bg-button-secondary-base hover:bg-button-secondary-hover"
} ${className ?? ""}`;
```

#### 1-4. Link使用時の実装を変更
**変更前**:
```typescript
if (link != null) {
  return (
    <Link className={buttonClasses} href={link}>
      {showGithubIcon != null && <GithubIcon ... />}
      {/* ... */}
      <Text className="...">{displayText}</Text>
    </Link>
  );
}
```

**変更後**:
```typescript
if (link != null) {
  return (
    <Button
      as={Link}
      href={link}
      className={buttonClasses}
      startContent={startContent}
    >
      {displayText}
    </Button>
  );
}
```

#### 1-5. Button使用時の実装を変更
**変更前**:
```typescript
return (
  <Button className={buttonClasses} ...>
    {showGithubIcon != null && <GithubIcon ... />}
    {/* ... */}
    <Text className="...">{displayText}</Text>
  </Button>
);
```

**変更後**:
```typescript
return (
  <Button
    type={type}
    isDisabled={isPressed}
    className={buttonClasses}
    startContent={startContent}
  >
    {displayText}
  </Button>
);
```

#### 1-6. 確認
```bash
npm run lint
npm run format
```

---

### Step 2: link-button.tsx の実装

#### 2-1. ファイルを開く
```bash
src/components/link-button.tsx
```

#### 2-2. import文を変更
**変更前**:
```typescript
import Link from "next/link";
import { Text } from "react-aria-components";
```

**変更後**:
```typescript
import { Button } from "@heroui/react";
import Link from "next/link";
```

#### 2-3. コンポーネント全体を書き換え
**変更前**:
```typescript
return (
  <Link className="... bg-orange-600 ... text-white ... hover:bg-orange-700 ..." href={linkUrl}>
    <Text className="...">{linkText}</Text>
  </Link>
);
```

**変更後**:
```typescript
return (
  <Button
    as={Link}
    href={linkUrl}
    className={`flex w-full max-w-screen-md items-center justify-center gap-2.5 rounded-lg bg-button-tertiary-tx px-6 py-3.5 font-bold font-inter text-lg text-text-wh transition-colors duration-200 hover:bg-button-primary-active ${className ?? ""}`}
    style={style}
  >
    {linkText}
  </Button>
);
```

#### 2-4. 確認
```bash
npm run lint
npm run format
```

---

### Step 3: header.tsx の実装

#### 3-1. ファイルを開く
```bash
src/components/header.tsx
```

#### 3-2. import文を変更
**変更前**:
```typescript
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Header as ReactAriaHeader,
  Text,
} from "react-aria-components";
```

**変更後**:
```typescript
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
```

#### 3-3. ReactAriaHeaderを<header>タグに変更
**変更前**:
```typescript
return (
  <ReactAriaHeader className="...">
```

**変更後**:
```typescript
return (
  <header className="...">
```

#### 3-4. すべての色クラスをデザイントークンに置換
以下の置換を**すべて**実行:
- `bg-orange-500` → `bg-primary`
- `text-orange-50` → `text-background`
- `hover:text-orange-100` → `hover:text-button-tertiary-hover`
- `border-orange-50` → `border-background`
- `bg-orange-600` → `bg-button-tertiary-tx`
- `data-[hover=true]:bg-orange-600` → `data-[hover=true]:bg-button-tertiary-tx`

**注意**: `orange-300`（ボーダー）と`orange-400`（選択中）は**そのまま**

#### 3-5. MenuTrigger/Menu/MenuItemをDropdownに変更
**変更前**:
```typescript
<MenuTrigger>
  <Button>ポリシー</Button>
  <Popover>
    <Menu>
      <MenuItem>...</MenuItem>
    </Menu>
  </Popover>
</MenuTrigger>
```

**変更後**:
```typescript
<Dropdown>
  <DropdownTrigger>
    <Button variant="light">ポリシー</Button>
  </DropdownTrigger>
  <DropdownMenu aria-label="Policy menu">
    <DropdownItem as={Link} href="...">...</DropdownItem>
  </DropdownMenu>
</Dropdown>
```

#### 3-6. Textコンポーネントを削除
Link内の`<Text>`タグを削除し、テキストを直接配置

**変更前**:
```typescript
<Link href="...">
  <Text>{uploadText(language)}</Text>
</Link>
```

**変更後**:
```typescript
<Link href="...">
  {uploadText(language)}
</Link>
```

#### 3-7. 確認
```bash
npm run lint
npm run format
```

---

### Step 4: 全体の動作確認

#### 4-1. テスト実行
```bash
npm run test
```

#### 4-2. 開発サーバー起動
```bash
npm run dev
```

#### 4-3. ブラウザで確認
`http://localhost:2222` にアクセスし、以下を確認:
- [ ] ヘッダーが正しく表示される
- [ ] ログインボタンが正しい色で表示される（セカンダリボタン）
- [ ] ボタンにホバーすると色が変わる
- [ ] ドロップダウンメニューが開閉する
- [ ] 言語切替が動作する

#### 4-4. Storybook確認
```bash
npm run storybook
```

`http://localhost:6006/` にアクセスし、各コンポーネントのストーリーが正しく表示されることを確認

---

## 🔍 トラブルシューティング（詳細版）

### 1. TypeScriptエラー: "Property 'as' does not exist on type..."

**エラー例**:
```
Property 'as' does not exist on type 'IntrinsicAttributes & ButtonProps'
```

**原因**: Hero UIの`Button`に`as={Link}`を渡しているが、型定義が認識されていない

**解決方法**:
```typescript
// 正しいimport順序
import { Button } from "@heroui/react";
import Link from "next/link";

// as={Link}を使用する場合、hrefは必須
<Button as={Link} href="/path">テキスト</Button>
```

---

### 2. デザイントークンが適用されない

**症状**: `bg-primary`などのクラスが効かず、背景色が表示されない

**原因1**: `globals.css`の`@theme`が正しく読み込まれていない

**解決方法**:
```bash
# 開発サーバーを再起動
npm run dev
```

**原因2**: クラス名のタイポ

**解決方法**:
```typescript
// ❌ 誤り
className="bg-primary-button-base"

// ✅ 正しい
className="bg-button-primary-base"
```

---

### 3. Dropdownメニューが表示されない

**症状**: ボタンをクリックしてもメニューが開かない

**原因**: `DropdownTrigger`に複数の子要素がある

**解決方法**:
```typescript
// ❌ 誤り
<DropdownTrigger>
  <Button>メニュー</Button>
  <div>その他</div>
</DropdownTrigger>

// ✅ 正しい（子要素は1つのみ）
<DropdownTrigger>
  <Button>メニュー</Button>
</DropdownTrigger>
```

---

### 4. Lintエラー: "React Hook useRef is called conditionally"

**原因**: Hero UIの`Button`内部で条件付きでhookを使用している（通常は起きない）

**解決方法**: コンポーネント内の条件分岐を確認
```typescript
// ❌ 条件付きreturn後にhookを使用
if (condition) return null;
const ref = useRef(); // エラー

// ✅ 条件は最後に
const ref = useRef();
if (condition) return null;
```

---

### 5. テストエラー: "Cannot find module '@heroui/react'"

**原因**: テスト環境で`@heroui/react`が解決できない

**解決方法**:
```bash
# node_modulesを再インストール
rm -rf node_modules
npm install
```

---

### 6. Buttonのホバー状態が機能しない

**症状**: `data-[hover=true]:bg-...`が効かない

**原因**: Hero UIの`data-[hover=true]`はHero UI内部で管理される特別な属性

**解決方法**:
```typescript
// ✅ 正しい使い方
<Button className="data-[hover=true]:bg-button-tertiary-tx">

// ❌ 通常のhoverは使えない
<Button className="hover:bg-button-tertiary-tx">
```

**代替案**: `variant`プロパティを使用
```typescript
<Button variant="light" className="...">
```

---

### 7. startContentにアイコンが表示されない

**症状**: アイコンが表示されない、またはレイアウトが崩れる

**解決方法**:
```typescript
// ✅ 正しい: startContentにJSX要素を渡す
const startContent = (
  <>
    {showGithubIcon && <GithubIcon />}
    {showRepeatIcon && <RepeatIcon />}
  </>
);

<Button startContent={startContent}>テキスト</Button>

// ❌ 誤り: 条件付きで直接渡す
<Button startContent={showGithubIcon && <GithubIcon />}>
```

---

### 8. Hero UIのButtonが期待通りに動作しない場合

**解決方法**:
- `HeroUIProvider`が正しく設定されているか確認: `src/components/heroui/providers.tsx`
- `src/app/layout.tsx`で`Providers`コンポーネントがラップされているか確認

### Tailwind CSSのクラスが適用されない場合
- `tailwind.config.js`でHero UIのパスが含まれているか確認
- ブラウザのDevToolsでクラスが正しく適用されているか確認

### TypeScriptエラーが発生する場合
- `@heroui/react`の型定義が正しくインポートされているか確認
- `as={Link}`を使用する場合、`href`プロパティが必須

---

## 📚 参考リソース

- Hero UI公式ドキュメント: https://heroui.com/docs
- Hero UI Button: https://heroui.com/docs/components/button
- Hero UI Dropdown: https://heroui.com/docs/components/dropdown
- Tailwind CSS 4ガイドライン: `@docs/tailwind-css-v4-coding-guidelines.md`
- プロジェクトコーディング規約: `@docs/project-coding-guidelines.md`

---

## ⚠️ 禁止事項（再確認）

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいアイコンパッケージのインストール禁止** - 全てのアイコンは既存のコンポーネントまたはFigmaから取得
3. **ビジネスロジックの変更禁止** - UI変更のみに集中
4. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 🎯 成功基準

以下を全て満たすこと:

✅ 全てのコンポーネントがHero UIベースに変更されている
✅ Figmaデザインと視覚的に一致している
✅ **デザイントークンが正しく使用されている**（`bg-primary`, `text-text-br`など）
✅ 既存の機能が全て正常に動作する
✅ `npm run lint`がエラー0で完了する
✅ `npm run test`が全てパスする
✅ `http://localhost:2222`で正常に表示される
✅ `http://localhost:6006/`のStorybookで各コンポーネントが正常に表示される
✅ アクセシビリティが維持されている

---

**作成日**: 2025-11-09
**対象Issue**: #361
**担当**: AI実装者
