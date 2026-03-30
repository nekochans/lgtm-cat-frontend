# Issue #457: @heroui/react を v3 系に更新する 実装計画

## 概要

HeroUI v2 (`@heroui/react@2.8.10`) を v3 系にマイグレーションする。
v3 は完全な書き直しであり、v2 と v3 は同一プロジェクトに共存できないため、全ファイルを一括で移行する。

## 前提条件

- React 19 は既に使用中 (`react@19.2.4`) → 対応不要
- Tailwind CSS v4 は既に使用中 (`tailwindcss@4.2.2`) → 対応不要
- `framer-motion` は `src/` 内で直接 import されていない → 依存パッケージとしてのみ存在するため削除が容易

## Done の定義（Issue #457 より）

- [ ] `@heroui/react` が v3 系に更新されている事
- [ ] v3 での破壊的変更に対応し、全コンポーネントが正常に動作する事
- [ ] `framer-motion` が依存から削除されている事
- [ ] `HeroUIProvider` の削除など、v3 で不要になった設定が整理されている事
- [ ] `npm run build` が正常に完了する事
- [ ] `npm run lint` が正常に完了する事
- [ ] `npm run test` が全てパスする事

---

## ステップ 0: 移行前のベースラインスクリーンショット取得（最初に必ず実施）

**目的:** 移行前の Storybook の見た目をスクリーンショットとして保存し、移行後に AI エージェントが目視比較するためのベースラインを作成する。

**前提:** 開発サーバー (`npm run dev`) と Storybook (`npm run storybook`) が起動済みであること。

### 0-1. スクリーンショット保存先ディレクトリの作成

```bash
mkdir -p screenshots/before screenshots/after
```

### 0-2. Chrome DevTools MCP を使ったベースラインスクリーンショット取得

以下の各 Storybook ストーリー URL に `mcp__chrome-devtools__navigate_page` でアクセスし、`mcp__chrome-devtools__take_screenshot` でスクリーンショットを保存する。

**Storybook の iframe URL パターン:** `http://localhost:6006/iframe.html?id=<story-id>&viewMode=story`

> **重要:** `/iframe.html` を使うことで Storybook の UI フレームを除いたコンポーネント単体のスクリーンショットを取得できる。

| # | ストーリーID（目安） | 保存先ファイル名 | 確認対象 |
|---|---|---|---|
| 1 | `features-upload-uploadprogress--japanese` | `screenshots/before/upload-progress.png` | ProgressBar |
| 2 | `features-upload-uploadform--japanese` | `screenshots/before/upload-form.png` | UploadDropArea, UploadPreview |
| 3 | `features-upload-uploadsuccess--japanese` | `screenshots/before/upload-success.png` | UploadSuccess のボタン |
| 4 | `components-headerdesktop--default` | `screenshots/before/header-desktop.png` | Dropdown メニュー |
| 5 | `components-headermobile--default` | `screenshots/before/header-mobile.png` | Drawer |
| 6 | `components-iconbutton--default` | `screenshots/before/icon-button.png` | IconButton |
| 7 | `components-linkbutton--default` | `screenshots/before/link-button.png` | LinkButton |
| 8 | `features-main-lgtmimage--default` | `screenshots/before/lgtm-image.png` | 画像カードのボタン |
| 9 | `features-docs-docsmcppage--default` | `screenshots/before/docs-mcp-page.png` | CodeSnippet（最高リスク） |
| 10 | `features-docs-docshowtousepage--default` | `screenshots/before/docs-how-to-use.png` | CodeSnippet (inline) |
| 11 | `features-docs-docsgithubapppage--default` | `screenshots/before/docs-github-app.png` | CodeSnippet |
| 12 | `features-main-homepage--default` | `screenshots/before/home-page.png` | ホームページ全体 |
| 13 | `features-upload-uploadpage--default` | `screenshots/before/upload-page.png` | アップロードページ全体 |

> **注意:** ストーリーIDは Storybook の URL バーから確認できる。上記は命名規則に基づく推測値なので、実際の ID が異なる場合は `http://localhost:6006/` にアクセスしてサイドバーから正しい ID を確認すること。

### 0-2a. Dropdown / Drawer の「開いた状態」のスクリーンショット取得

Dropdown と Drawer は Compound Component パターンへの移行で最も壊れやすいコンポーネントであるため、**閉じた状態だけでなく開いた状態のスクリーンショットも取得する**。

現行の Storybook ストーリーにはメニューを開いた状態の story や play function が存在しないため、Chrome DevTools MCP の操作ツールを使ってメニューを開いてからスクリーンショットを取得する。

**手順:**

1. HeaderDesktop のストーリーにアクセス（`http://localhost:6006/iframe.html?id=components-headerdesktop--default&viewMode=story`）
2. `mcp__chrome-devtools__click` で Documents メニューのトリガーボタンをクリック
3. Dropdown が開いた状態で `mcp__chrome-devtools__take_screenshot` → `screenshots/before/header-desktop-dropdown-open.png`
4. 同様に Language セレクターの Dropdown も開いた状態で撮影 → `screenshots/before/header-desktop-language-open.png`
5. HeaderMobile のストーリーにアクセス（`http://localhost:6006/iframe.html?id=components-headermobile--default&viewMode=story`）
6. `mcp__chrome-devtools__click` でハンバーガーメニューボタンをクリック
7. Drawer が開いた状態で `mcp__chrome-devtools__take_screenshot` → `screenshots/before/header-mobile-drawer-open.png`

| # | 操作 | 保存先ファイル名 | 確認対象 |
|---|---|---|---|
| 1 | HeaderDesktop → Documents メニューを開く | `screenshots/before/header-desktop-dropdown-open.png` | Dropdown メニュー本体の表示 |
| 2 | HeaderDesktop → Language セレクターを開く | `screenshots/before/header-desktop-language-open.png` | 言語切り替え Dropdown の表示 |
| 3 | HeaderMobile → ハンバーガーメニューを開く | `screenshots/before/header-mobile-drawer-open.png` | Drawer メニュー本体の表示 |

### 0-3. 実アプリのベースラインスクリーンショット取得

Storybook だけでなく、実アプリ (`http://localhost:2222`) のスクリーンショットも取得する。

| # | URL | 保存先ファイル名 |
|---|---|---|
| 1 | `http://localhost:2222` | `screenshots/before/app-home.png` |
| 2 | `http://localhost:2222/en` | `screenshots/before/app-home-en.png` |
| 3 | `http://localhost:2222/upload` | `screenshots/before/app-upload.png` |
| 4 | `http://localhost:2222/docs/how-to-use` | `screenshots/before/app-docs-how-to-use.png` |
| 5 | `http://localhost:2222/docs/mcp` | `screenshots/before/app-docs-mcp.png` |
| 6 | `http://localhost:2222/docs/github-app` | `screenshots/before/app-docs-github-app.png` |

---

## ステップ 1: 依存パッケージの更新

### 1-1. パッケージのアンインストール

```bash
npm uninstall @heroui/react framer-motion
```

**削除対象:**

| パッケージ | 現在のバージョン | 削除理由 |
|---|---|---|
| `@heroui/react` | `2.8.10` | v3 を新規インストールするため |
| `framer-motion` | `12.38.0` | v3 では CSS アニメーションに置き換わり不要 |

### 1-2. パッケージのインストール

**重要:** インストール前に `npm view @heroui/react dist-tags` と `npm view @heroui/styles dist-tags` で最新の安定版バージョンを確認し、明示的にバージョンを指定してインストールする。このプロジェクトの `package.json` は依存を厳密なバージョン文字列で管理しているため、再現性を確保する。

```bash
# 実行直前に dist-tag を確認
npm view @heroui/react dist-tags
npm view @heroui/styles dist-tags

# 確認したバージョンを明示的に指定してインストール（例: 3.x.x）
npm install @heroui/react@<確認したバージョン> @heroui/styles@<確認したバージョン>
```

**追加対象:**

| パッケージ | 説明 |
|---|---|
| `@heroui/react` (v3) | HeroUI v3 コンポーネントライブラリ |
| `@heroui/styles` | HeroUI v3 のスタンドアロン CSS パッケージ（旧 `@heroui/theme` の後継） |

### 1-3. `@heroui/toast` パッケージについて

`@heroui/toast` は `package.json` の `dependencies` に直接記載されておらず、`@heroui/react` v2 の内部依存として提供されている。そのため、ステップ 1-1 で `@heroui/react` v2 をアンインストールすれば `@heroui/toast` も自動的に削除される。**`npm uninstall @heroui/toast` の実行は不要。**

v3 では Toast 機能は `@heroui/react` に統合されているため、`import { toast } from "@heroui/react"` で利用可能になる。

### 1-4. `package-lock.json` について

`@heroui/react` のメジャーバージョンアップと `framer-motion` の削除により、`package-lock.json` の差分は非常に大きくなるが、これは正常な挙動である。PR レビュー時にこの点を補足情報として記載すること。

---

## ステップ 2: CSS 設定の変更

### 対象ファイル: `src/app/globals.css`

**現在の内容:**

```css
@import "tailwindcss";
@import "tw-animate-css";
@plugin "./hero.ts";

@source "../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}";
@custom-variant dark (&:is(.dark *));

/* LGTMeow Design Tokens from Figma */
@theme {
  /* （省略） */
}
```

**変更後の内容:**

```css
@import "tailwindcss";
@import "@heroui/styles";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* LGTMeow Design Tokens from Figma */
@theme {
  /* （省略 - デザイントークン部分は変更なし） */
}
```

**変更点の詳細:**

| 行 | 変更 | 理由 |
|---|---|---|
| `@plugin "./hero.ts";` | **削除** | v3 では `heroui()` Tailwind プラグインが廃止 |
| `@source "../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}";` | **削除** | `@heroui/theme` は v3 で `@heroui/styles` に置き換わり、`@source` スキャンは不要 |
| `@import "@heroui/styles";` | **追加** | v3 のスタイルパッケージ。`@import "tailwindcss"` の直後に配置する（順序重要: `@heroui/styles` は Tailwind のユーティリティを前提とした上書き・拡張を行うため、必ず `tailwindcss` の後に読み込む） |

### 対象ファイル: `src/app/hero.ts` → 削除

このファイルは `heroui()` Tailwind プラグインをエクスポートしていたが、v3 では不要。

```ts
// 削除対象: src/app/hero.ts
import { heroui } from "@heroui/react";
export default heroui();
```

**操作:** ファイルを完全に削除する。

---

## ステップ 3: Provider の変更

### 対象ファイル: `src/components/heroui/providers.tsx`

**現在の実装:**

```tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <ToastProvider />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
```

**変更後の実装:**

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import { Toast } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <Toast.Provider />
      {children}
    </NextThemesProvider>
  );
}
```

**変更点の詳細:**

| 変更 | 理由 |
|---|---|
| `HeroUIProvider` の import と使用を削除 | v3 では Provider 不要 |
| `import { ToastProvider } from "@heroui/toast"` → `import { Toast } from "@heroui/react"` | v3 では Toast は `@heroui/react` から import |
| `<ToastProvider />` → `<Toast.Provider />` | v3 の Compound Component パターン |

### 影響を受けるファイル

以下のファイルは `Providers` コンポーネントを使用しているが、`Providers` の export インターフェースは変更されないため修正不要。

- `src/app/layout.tsx` - 変更不要
- `.storybook/preview.tsx` - 変更不要

---

## ステップ 4: useDisclosure → useOverlayState の移行

### 対象ファイル: `src/components/header-mobile.tsx`

**現在の実装（該当部分）:**

```tsx
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
} from "@heroui/react";

// コンポーネント内:
const {
  isOpen: isMenuOpen,
  onOpen: onMenuOpen,
  onClose: onMenuClose,
} = useDisclosure();

const handleCloseMenus = () => { onMenuClose(); setMenuType("navigation"); };
const handleOpenNavigationMenu = () => { setMenuType("navigation"); onMenuOpen(); };
const handleOpenLanguageMenu = () => { setMenuType("language"); onMenuOpen(); };
```

**変更後の実装（該当部分）:**

```tsx
import {
  Button,
  Drawer,
  useOverlayState,
} from "@heroui/react";

// コンポーネント内:
const menuState = useOverlayState({ defaultOpen: false });

const handleCloseMenus = () => { menuState.close(); setMenuType("navigation"); };
const handleOpenNavigationMenu = () => { setMenuType("navigation"); menuState.open(); };
const handleOpenLanguageMenu = () => { setMenuType("language"); menuState.open(); };
```

**API 対応表:**

本計画では変数名を `menuState` としているため、実際のコードでは `menuState.isOpen` 等で参照する。

| v2 (`useDisclosure`) | v3 (`useOverlayState`) | 本計画での使用例 |
|---|---|---|
| `isOpen` | `state.isOpen` | `menuState.isOpen` |
| `onOpen()` | `state.open()` | `menuState.open()` |
| `onClose()` | `state.close()` | `menuState.close()` |
| - | `state.toggle()` | `menuState.toggle()` |
| - | `state.setOpen(boolean)` | `menuState.setOpen(true)` |

> **注意:** `useOverlayState` の戻り値には `onOpenChange` プロパティは存在しない。`Drawer.Backdrop` の `onOpenChange` prop に渡す場合は `menuState.setOpen` を使用する。

---

## ステップ 5: Drawer コンポーネントの Compound Component パターンへの移行

### 対象ファイル: `src/components/header-mobile.tsx`

**現在の Drawer 実装:**

```tsx
<Drawer
  classNames={{ base: "w-[285px] bg-primary" }}
  hideCloseButton
  isOpen={isMenuOpen}
  onClose={handleCloseMenus}
  placement="right"
>
  <DrawerContent>
    {(onClose) => (
      <>
        <DrawerHeader className="flex items-center justify-end border-orange-300 border-b bg-primary px-4 py-2">
          <button aria-label={closeMenuAriaLabel(language)} className="p-1" onClick={onClose} type="button">
            <CloseIcon />
          </button>
        </DrawerHeader>
        <DrawerBody className="bg-primary px-5 py-10">
          {/* メニュー内容 */}
        </DrawerBody>
      </>
    )}
  </DrawerContent>
</Drawer>
```

**変更後の Drawer 実装:**

```tsx
<Drawer state={menuState}>
  <Drawer.Backdrop
    isOpen={menuState.isOpen}
    onOpenChange={(open) => {
      menuState.setOpen(open);
      if (!open) {
        setMenuType("navigation"); // バックドロップクリック/ESCで閉じた際もmenuTypeをリセット
      }
    }}
  >
    <Drawer.Content placement="right">
      <Drawer.Dialog className="w-[285px] bg-primary">
        <Drawer.Header className="flex items-center justify-end border-orange-300 border-b bg-primary px-4 py-2">
          <button
            aria-label={closeMenuAriaLabel(language)}
            className="p-1"
            onClick={handleCloseMenus}
            type="button"
          >
            <CloseIcon />
          </button>
        </Drawer.Header>
        <Drawer.Body className="bg-primary px-5 py-10">
          {!isLoggedIn && (
            <UnloggedInMenu
              hideLoginButton={hideLoginButton}
              language={language}
              menuType={menuType}
              onCloseMenus={handleCloseMenus}
              removedLanguagePath={removedLanguagePath}
            />
          )}
          {isLoggedIn && (
            <LoggedInMenu
              language={language}
              menuType={menuType}
              onCloseMenus={handleCloseMenus}
              removedLanguagePath={removedLanguagePath}
            />
          )}
        </Drawer.Body>
      </Drawer.Dialog>
    </Drawer.Content>
  </Drawer.Backdrop>
</Drawer>
```

**注意: `state` prop と `isOpen` の二重渡しについて**

上記コード例では `<Drawer state={menuState}>` と `<Drawer.Backdrop isOpen={menuState.isOpen}>` の両方で状態を渡している。v3 の Compound Component パターンでは、親の `state` prop が Context 経由で子に共有される設計のため、`Drawer.Backdrop` への `isOpen` 明示渡しが冗長な可能性がある。ステップ 1 で v3 インストール後、`Drawer.Backdrop` に `isOpen` を渡さずに動作するか確認し、不要であれば `isOpen` を削除する。

**重要: バックドロップ/ESC による閉じ操作への対応**

v2 では `onClose={handleCloseMenus}` をルートの `<Drawer>` に渡していたため、バックドロップクリック・ESC キー・明示的な閉じるボタンのいずれでも `handleCloseMenus` が呼ばれていた。v3 では `Drawer.Backdrop` の `onOpenChange` がこれらのイベントを受け取るため、`onOpenChange` ハンドラ内で `setMenuType("navigation")` のリセットも行う必要がある。

**変更点の詳細（HeroUI v3 公式ドキュメント https://heroui.com/docs/react/components/drawer に基づく）:**

| v2 | v3 | 備考 |
|---|---|---|
| `<Drawer isOpen={...} onClose={...} placement="right">` | `<Drawer>` + `<Drawer.Backdrop isOpen={...} onOpenChange={...}>` + `<Drawer.Content placement="right">` | props が分散 |
| `<DrawerContent>{(onClose) => ...}</DrawerContent>` | `<Drawer.Dialog>` | render prop パターンは不要に |
| `<DrawerHeader>` | `<Drawer.Header>` | Compound Component |
| `<DrawerBody>` | `<Drawer.Body>` | Compound Component |
| `hideCloseButton` prop | 削除（カスタム閉じるボタンを自前で実装済み） | - |
| `classNames={{ base: "w-[285px] bg-primary" }}` | `<Drawer.Dialog className="w-[285px] bg-primary">` | `classNames` → 各サブコンポーネントの `className` |

---

## ステップ 6: Dropdown コンポーネントの Compound Component パターンへの移行

### 対象ファイル: `src/components/header-desktop.tsx`

このファイルには 3 つの Dropdown が存在する。全て同じパターンで移行する。

**v2 → v3 対応表:**

| v2 | v3 |
|---|---|
| `<Dropdown classNames={{content: "p-0"}}>` | `<Dropdown>` |
| `<DropdownTrigger>` | `<Dropdown.Trigger>` |
| `<DropdownMenu aria-label="..." className="..." classNames={{...}}>` | `<Dropdown.Popover>` + `<Dropdown.Menu>` |
| `<DropdownItem key="xxx" as={Link} href="..." className="...">` | `<Dropdown.Item id="xxx" className="...">` + `onAction` で `router.push()` ナビゲーション |

**移行パターン例（Documents メニュー）:**

現在:
```tsx
<Dropdown classNames={{ content: "p-0" }}>
  <DropdownTrigger>
    <Button className="..." variant="light">
      {documentsText(language)}
      <DownIcon />
    </Button>
  </DropdownTrigger>
  <DropdownMenu
    aria-label="Documents menu"
    className="min-w-[200px] max-w-[400px] rounded-lg bg-primary p-2"
    classNames={{ base: "!gap-0", list: "gap-0" }}
  >
    <DropdownItem
      as={Link}
      className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
      href={howToUse.link}
      key="how-to-use"
    >
      {howToUse.text}
    </DropdownItem>
    {/* ... 他のアイテム */}
  </DropdownMenu>
</Dropdown>
```

変更後:
```tsx
const router = useRouter();

<Dropdown
  onAction={(key) => {
    const linkMap: Record<string, string> = {
      "how-to-use": howToUse.link,
      "mcp": mcp.link,
      "github-app": githubApp.link,
    };
    const href = linkMap[key as string];
    if (href) {
      router.push(href);
    }
  }}
>
  <Dropdown.Trigger>
    <Button className="..." variant="ghost">
      {documentsText(language)}
      <DownIcon />
    </Button>
  </Dropdown.Trigger>
  <Dropdown.Popover className="p-0">
    <Dropdown.Menu
      aria-label="Documents menu"
      className="min-w-[200px] max-w-[400px] rounded-lg bg-primary p-2"
    >
      <Dropdown.Item
        className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
        id="how-to-use"
        textValue={howToUse.text}
      >
        {howToUse.text}
      </Dropdown.Item>
      {/* ... 他のアイテム */}
    </Dropdown.Menu>
  </Dropdown.Popover>
</Dropdown>
```

**重要な変更点:**

1. **`as={Link}` + `href` パターンの廃止 → `onAction` + `router.push()` パターンへ**: v3 の `Dropdown.Item` は ARIA menu item として振る舞うため、children 内に `<Link>` をネストするとフォーカス対象と押下対象が二重化し、キーボード操作・typeahead・全行クリック・閉じ動作が不安定になる。代わりに `Dropdown` の `onAction` コールバックで `router.push()` によるナビゲーションを行う。`useRouter` は `next/navigation` から import する。
2. **`key` → `id`**: コレクション系コンポーネントのアイテム識別子が変更。
3. **`textValue` の追加**: アクセシビリティとタイプアヘッド検索のため必須。
4. **`classNames` → `className`**: 各サブコンポーネントに直接 `className` を渡す。
5. **`variant="light"` → `variant="ghost"`**: Button の variant 名が変更。
6. **`classNames={{ base: "!gap-0", list: "gap-0" }}` の移行**: `DropdownMenu` の `classNames` は v3 では `Dropdown.Menu` の `className` に統合する。`className="!gap-0"` を `Dropdown.Menu` に追加する（3つの Dropdown 全てに適用）。v3 で要素構造が変わりスタイルが効かない場合は、ブラウザの DevTools でクラス名を確認して調整する。
7. **`onAction` の注意点**: `onAction` のコールバック引数は `Dropdown.Item` の `id` 値。3つの Dropdown それぞれに適切な `onAction` ハンドラを実装すること。

### 全 3 つの Dropdown の移行対象

| Dropdown | 場所 | 特記事項 |
|---|---|---|
| Documents メニュー | ナビゲーション内 | 3 つの `DropdownItem` を移行 |
| Language セレクター | 右側ボタン群 | `startContent` → children 内でアイコン配置（下記参照）、アクティブ言語のハイライト |
| User メニュー（ログイン時） | 右側ボタン群 | 3 つの `DropdownItem` を移行 |

### Language セレクターの `startContent` 移行例

v2 では `startContent` prop でアクティブ言語にアイコンを表示していた。v3 では children 内で直接配置する。

**現在:**
```tsx
<DropdownItem
  as={Link}
  className={`... ${language === "ja" ? "!bg-orange-400" : ""}`}
  href={removedLanguagePath}
  key="ja"
  startContent={language === "ja" ? <RightIcon /> : null}
>
  日本語
</DropdownItem>
```

**変更後:**
```tsx
<Dropdown.Item
  className={`... ${language === "ja" ? "!bg-orange-400" : ""}`}
  id="ja"
  textValue="日本語"
>
  <div className="flex items-center gap-3">
    {language === "ja" ? <RightIcon /> : <span className="w-4" />}
    日本語
  </div>
</Dropdown.Item>
```

**ポイント:**
- アクティブでない言語には `<span className="w-4" />` でスペーサーを配置し、テキスト位置を揃える。
- `<Link>` ではなく `<div>` で children を構成する。ナビゲーションは Language セレクターの `Dropdown` に設定する `onAction` コールバック内で `router.push()` を使って行う。各 `Dropdown.Item` の `id` に言語コード（`"ja"`, `"en"`）を設定し、`onAction` で対応する URL へ遷移する。

---

## ステップ 7: Button コンポーネントの props 変更

### 7-0. v3 の Button API 確認手順（ステップ 1 完了後に実施）

依存パッケージのインストール後、以下のコマンドで v3 Button の実際の型定義を確認し、`as`、`startContent`、`ButtonProps`、`onPressStart`/`onPressEnd` のサポート状況を把握する。

```bash
# Button の型定義を確認
grep -n "startContent\|as\?\s*:\|onPressStart\|onPressEnd\|ButtonProps\|render" node_modules/@heroui/react/dist/index.d.ts | head -50
```

この結果に基づいて、以下の表の「確認後の対応」列を参考にコードを修正する。

### 7-1. 全ファイル共通の変更点

**v2 → v3 prop 変更:**

| v2 prop | v3 prop | 確認後の対応 |
|---|---|---|
| `isLoading` | `isPending` | 確定: React 標準パターンに合わせた命名変更 |
| `variant="bordered"` | `variant="outline"` | 確定: variant 名の変更 |
| `variant="light"` | `variant="ghost"` | 確定: variant 名の変更 |
| `variant="flat"` | 削除 | 確定: 現在 `code-snippet.tsx` でのみ使用（Snippet ごと廃止されるため影響なし）。他ファイルでは使用されていない |
| `variant="solid"` | `variant="primary"` | 確定: variant 名の変更 |
| `radius="sm"` | `className="rounded-sm"` | v3 で `radius` prop が存在しない場合は Tailwind クラスで代替 |
| `startContent={...}` | children 内で配置（フォールバック） | v3 で `startContent` がサポートされていればそのまま。**サポートされない場合**: children 内にアイコンとテキストを並べて配置する |
| `as={Link}` | `render` prop（フォールバック） | v3 で `as` prop がサポートされていればそのまま。**サポートされない場合**: `render={(props) => <Link {...props} href={url} />}` パターンを使用 |
| `onPressStart`/`onPressEnd` | `onPressStart`/`onPressEnd`（フォールバック: `onMouseDown`/`onMouseUp`） | v3 でサポートされていればそのまま。**サポートされない場合**: 標準の DOM イベントハンドラで代替 |
| `ButtonProps` 型 | `ComponentProps<typeof Button>` | v3 で `ButtonProps` がエクスポートされていなければ `ComponentProps` で代替 |

### 7-2. ファイルごとの具体的な変更

#### `src/components/icon-button.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| `import { Button, type ButtonProps } from "@heroui/react"` | `ButtonProps` の型名が変更されている可能性がある。v3 で確認し、適切な型を使用。`onPress` の型が必要な場合は `ComponentProps<typeof Button>["onPress"]` で取得可能 |
| `isLoading={isLoading}` | `isPending={isLoading}` に変更 |
| `isDisabled={isPressed === true \|\| isLoading === true}` | `isDisabled` はそのまま |
| `startContent={startContent}` | v3 でのサポート状況を確認。サポートされない場合は children 内で配置 |
| `onPress={onPress}` | そのまま（v3 でも `onPress` は存在） |
| `as={Link}` + `href={link}` パターン（110〜120行目） | v3 で `as` prop がサポートされるか確認。サポートされない場合は `render` prop を使用するか、`Link` でラップする代替案に変更（下記参照） |

**`as={Link}` の代替案（v3 で `as` がサポートされない場合）:**

```tsx
// 方法 1: render prop を使用
<Button
  className={buttonClasses}
  render={(props) => <Link {...props} href={link} />}
>
  {startContent}
  {displayText}
</Button>

// 方法 2: Link でラップ（Button のスタイルを維持）
<Link href={link}>
  <Button className={buttonClasses}>
    {startContent}
    {displayText}
  </Button>
</Link>
```

> **注意:** 方法 2 はアクセシビリティ上の問題（`<a>` の中に `<button>`）が発生する場合があるため、方法 1 を優先する。

#### `src/components/link-button.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| `as={Link}` + `href={linkUrl}` | v3 で `as` prop がサポートされるか確認。サポートされない場合は `render` prop を使用（`icon-button.tsx` の代替案と同じ方法） |

#### `src/components/header-mobile.tsx` の `Button as={Link}` パターン

`UnloggedInMenu`（113〜121行目）と `LoggedInMenu`（192〜199行目）でも `Button as={Link}` パターンが使用されている。

```tsx
// 現在: UnloggedInMenu 内
<Button
  as={Link}
  className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-7 py-2 font-bold text-text-br text-xl"
  href={createIncludeLanguageAppPath("login", language)}
  onClick={onCloseMenus}
>
```

この `as={Link}` も `icon-button.tsx` と同じ方針で移行する（`render` prop 優先）。

**`onClick` → `onPress` の変更:**

`UnloggedInMenu`（行 117）と `LoggedInMenu`（行 197）の `Button` で使用されている `onClick={onCloseMenus}` は、v3 では `onPress={onCloseMenus}` に変更する。HeroUI v3 の Button は React Aria ベースであり、`onPress` がプライマリのクリックハンドラとして推奨される。`onClick` は標準 DOM イベントとして動作する可能性があるが、一貫性のために `onPress` を使用する。

#### `src/features/upload/components/upload-preview.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| `isLoading={isUploading}` | `isPending={isUploading}` |
| `variant="bordered"` | `variant="outline"` |

#### `src/features/upload/components/upload-drop-area.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| `variant="bordered"` | `variant="outline"` |

#### `src/features/upload/components/upload-success.tsx`

Button の `onPress` はそのまま。variant は指定されていないため変更なし。

#### `src/features/main/components/lgtm-image.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| `isIconOnly` | v3 でも `isIconOnly` はサポート |
| `radius="sm"` | v3 では `radius` prop が無い可能性。`className="rounded-sm"` で対応 |
| `size="sm"` | そのまま |
| `onPress`, `onPressStart`, `onPressEnd` | `onPress` はサポート。`onPressStart`/`onPressEnd` の v3 サポート状況を確認 |

---

## ステップ 8: Progress → ProgressBar の移行

### 対象ファイル: `src/features/upload/components/upload-progress.tsx`

**現在の実装:**

```tsx
import { Progress } from "@heroui/react";

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

**変更後の実装:**

```tsx
import { ProgressBar } from "@heroui/react";

<ProgressBar
  aria-label={uploadingText(language)}
  className="w-full max-w-[280px] md:max-w-[400px]"
  value={progress}
>
  <ProgressBar.Track className="h-6 md:h-7 bg-zinc-200">
    <ProgressBar.Fill className="bg-orange-400" />
  </ProgressBar.Track>
</ProgressBar>
```

**変更点の詳細:**

| v2 | v3 | 備考 |
|---|---|---|
| `Progress` | `ProgressBar` | コンポーネント名の変更 |
| `classNames={{ base, track, indicator }}` | 各サブコンポーネントに `className` | Compound Component パターン |
| `classNames.base` | `ProgressBar` の `className` | ルートに適用 |
| `classNames.track` | `ProgressBar.Track` の `className` | トラック背景に適用 |
| `classNames.indicator` | `ProgressBar.Fill` の `className` | 進捗表示バーに適用 |
| `showValueLabel={false}` | 削除（`ProgressBar.Output` を含めなければ値は表示されない） | デフォルトで非表示 |

### Storybook への影響

`src/features/upload/components/upload-progress.stories.tsx` は `UploadProgress` コンポーネントを import しているだけなので、コンポーネント内部の変更に追従して自動的に反映される。**Storybook ファイル自体の修正は不要。**

---

## ステップ 9: addToast → toast の移行

### 対象ファイル 1: `src/features/upload/components/upload-success.tsx`

**import の変更:**

```tsx
// 変更前（2行に分かれている）
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";

// 変更後（1行にまとめる）
import { Button, toast } from "@heroui/react";
```

**`addToast` 呼び出しの変更（1箇所）:**

```tsx
// 変更前
addToast({
  title: copyFailedTitle(language),
  description: copyFailedDescription(language),
  color: "danger",
});

// 変更後
toast.danger(copyFailedTitle(language), {
  description: copyFailedDescription(language),
});
```

### 対象ファイル 2: `src/features/main/components/home-action-buttons.tsx`

`addToast` の呼び出しが **5 箇所**（タイトル 3 種類）あるため、それぞれ個別に変更する。

**import の変更:**

```tsx
// 変更前
import { addToast } from "@heroui/toast";

// 変更後
import { toast } from "@heroui/react";
```

**5 箇所の個別変更:**

| # | 行（目安） | 変更前 title | 変更前 description | 変更後 |
|---|---|---|---|---|
| 1 | 58 | `"Error"` | `"Failed to refresh images. Please try again later."` | `toast.danger("Error", { description: "Failed to refresh images. Please try again later." })` |
| 2 | 83 | `"Error"` | `"Failed to load latest images. Please try again later."` | `toast.danger("Error", { description: "Failed to load latest images. Please try again later." })` |
| 3 | 123 | `"Copy Failed"` | `"Failed to copy to clipboard. Please check browser permissions."` | `toast.danger("Copy Failed", { description: "Failed to copy to clipboard. Please check browser permissions." })` |
| 4 | 131 | `"Error"` | `sanitizeErrorMessage(result.error)` ※動的 | `toast.danger("Error", { description: sanitizeErrorMessage(result.error) })` |
| 5 | 138 | `"Error"` | `"An unexpected error occurred. Please try again later."` | `toast.danger("Error", { description: "An unexpected error occurred. Please try again later." })` |

> **注意:** 箇所3は title が `"Copy Failed"` であり他の箇所と異なる。全て同一パターンで変換してはいけない。

**Toast API 対応表:**

| v2 (`addToast`) | v3 (`toast`) |
|---|---|
| `addToast({ title, description, color: "danger" })` | `toast.danger(title, { description })` |
| `addToast({ title, description, color: "success" })` | `toast.success(title, { description })` |
| `addToast({ title, description, color: "warning" })` | `toast.warning(title, { description })` |
| `color` prop | `variant` prop（オブジェクト形式の場合）またはメソッド名 |

---

## ステップ 10: Snippet コンポーネントの代替実装

### 対象ファイル: `src/features/docs/components/code-snippet.tsx`

HeroUI v3 では `Snippet` コンポーネントが完全に削除されたため、カスタム実装が必要。

**現在の実装が `Snippet` に依存している機能:**

1. コピーボタン（クリップボードにコードをコピー）
2. `classNames` によるスロットベースのスタイリング
3. `hideSymbol` による `$` 記号の非表示
4. `variant="flat"` によるスタイル
5. `codeString` prop による明示的なコピー対象文字列の指定

**代替実装方針:**

`Snippet` の機能を HTML + Tailwind CSS + カスタムコピーボタンで再現する。

**変更後の実装:**

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { Highlight, Prism, themes } from "prism-react-renderer";
import { useCallback, useEffect, useState } from "react";
import { CopyIcon } from "@/components/icons/copy-icon";

// YAML言語の初期化状態を管理（モジュールスコープで共有）
let isPrismYamlInitialized = false;

async function initPrismYaml(): Promise<void> {
  if (isPrismYamlInitialized) {
    return;
  }
  const globalObj = typeof globalThis === "undefined" ? window : globalThis;
  globalObj.Prism = Prism;
  await import("prismjs/components/prism-yaml");
  isPrismYamlInitialized = true;
}

type SupportedLanguage = "json" | "yaml" | "typescript" | "plaintext";

interface CodeSnippetProps {
  readonly code: string;
  readonly language?: SupportedLanguage;
  readonly variant?: "block" | "inline";
}

function getPrismLanguage(
  language: SupportedLanguage,
): "json" | "yaml" | "typescript" | "markup" {
  switch (language) {
    case "json":
      return "json";
    case "yaml":
      return "yaml";
    case "typescript":
      return "typescript";
    default:
      return "markup";
  }
}

function HighlightedCode({
  code,
  language,
}: {
  readonly code: string;
  readonly language: "json" | "yaml" | "typescript" | "markup";
}) {
  return (
    <Highlight code={code} language={language} theme={themes.github}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, lineIndex) => {
            const lineProps = getLineProps({ line });
            const lineKey = `line-${lineIndex}`;
            return (
              <div key={lineKey} {...lineProps}>
                {line.map((token, tokenIndex) => {
                  const tokenProps = getTokenProps({ token });
                  const tokenKey = `${lineIndex}-${tokenIndex}`;
                  return <span key={tokenKey} {...tokenProps} />;
                })}
              </div>
            );
          })}
        </>
      )}
    </Highlight>
  );
}

/**
 * コピーボタンコンポーネント
 * 旧 Snippet コンポーネントのコピー機能を再現
 * 既存の CopyIcon コンポーネントを流用する
 */
function CopyButton({ text }: { readonly text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch {
      // クリップボード書き込み失敗時は何もしない
    }
  }, [text]);

  return (
    <button
      aria-label={isCopied ? "Copied" : "Copy to clipboard"}
      className="text-orange-600 hover:text-orange-800"
      onClick={handleCopy}
      type="button"
    >
      {isCopied ? (
        <svg
          aria-hidden="true"
          fill="none"
          height="16"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="16"
        >
          <title>Copied</title>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <CopyIcon color="default" height={16} width={16} />
      )}
    </button>
  );
}

export function CodeSnippet({
  code,
  variant = "block",
  language = "plaintext",
}: CodeSnippetProps) {
  const [isPrismReady, setIsPrismReady] = useState(
    language !== "yaml" || isPrismYamlInitialized,
  );

  useEffect(() => {
    setIsPrismReady(language !== "yaml" || isPrismYamlInitialized);
  }, [language]);

  useEffect(() => {
    if (language === "yaml" && !isPrismYamlInitialized) {
      initPrismYaml()
        .then(() => {
          setIsPrismReady(true);
        })
        .catch(() => {
          setIsPrismReady(false);
        });
    }
  }, [language]);

  if (variant === "inline") {
    return (
      <div className="inline-flex w-fit items-center gap-2 border border-orange-200 bg-white px-3 py-1.5 rounded-lg">
        <pre className="font-mono text-orange-900">{code}</pre>
        <CopyButton text={code} />
      </div>
    );
  }

  if (language === "plaintext") {
    return (
      <div className="relative w-full max-w-full overflow-hidden border border-orange-200 bg-orange-50 rounded-lg">
        <pre className="min-w-0 overflow-x-auto whitespace-pre p-4 pr-12 font-mono text-sm text-orange-900">
          {code}
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
      </div>
    );
  }

  const prismLanguage = getPrismLanguage(language);

  return (
    <div className="relative w-full max-w-full overflow-hidden border border-orange-200 bg-orange-50 rounded-lg">
      <pre className="min-w-0 overflow-x-auto whitespace-pre p-4 pr-12 font-mono text-sm">
        {isPrismReady ? (
          <HighlightedCode code={code} language={prismLanguage} />
        ) : (
          code
        )}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
    </div>
  );
}
```

**主な変更点:**

1. `Snippet` コンポーネントの import を完全に削除
2. `CopyButton` コンポーネントを新規作成（コピー機能を自前実装）
3. `Snippet` の `classNames` スロットスタイリングを HTML 要素の `className` に移行
4. `codeString` prop → `CopyButton` の `text` prop に置き換え
5. `hideSymbol` → 不要（カスタム実装では `$` 記号を表示しない）
6. `variant="flat"` → Tailwind CSS クラスで同等のスタイルを再現

**補足:**

- `CopyButton` 内のアイコンは既存の `CopyIcon` コンポーネント（`src/components/icons/copy-icon.tsx`）を流用する。`CopyIcon` は `color` prop（`"default"` | `"active"`）と `width`/`height` prop を受け取る。
- `prism-react-renderer`（`2.4.1`）と `prismjs`（`1.30.0`）は既に `package.json` に存在するため、新規インストールは不要。

---

## ステップ 11: import 文の整理

### 全対象ファイルの import 変更一覧

| ファイル | v2 import | v3 import |
|---|---|---|
| `header-desktop.tsx` | `{ Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react"` | `{ Button, Dropdown } from "@heroui/react"` |
| `header-mobile.tsx` | `{ Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, useDisclosure } from "@heroui/react"` | `{ Button, Drawer, useOverlayState } from "@heroui/react"` |
| `icon-button.tsx` | `{ Button, type ButtonProps } from "@heroui/react"` | `{ Button } from "@heroui/react"` ※ButtonProps の代替型を確認 |
| `link-button.tsx` | `{ Button } from "@heroui/react"` | `{ Button } from "@heroui/react"` ※変更なし |
| `lgtm-image.tsx` | `{ Button } from "@heroui/react"` | `{ Button } from "@heroui/react"` ※変更なし |
| `upload-success.tsx` | `{ Button } from "@heroui/react"` + `{ addToast } from "@heroui/toast"` | `{ Button, toast } from "@heroui/react"` |
| `upload-preview.tsx` | `{ Button } from "@heroui/react"` | `{ Button } from "@heroui/react"` ※変更なし |
| `upload-progress.tsx` | `{ Progress } from "@heroui/react"` | `{ ProgressBar } from "@heroui/react"` |
| `upload-drop-area.tsx` | `{ Button } from "@heroui/react"` | `{ Button } from "@heroui/react"` ※変更なし |
| `home-action-buttons.tsx` | `{ addToast } from "@heroui/toast"` | `{ toast } from "@heroui/react"` |
| `code-snippet.tsx` | `{ Snippet } from "@heroui/react"` | 削除（HeroUI import なし） |
| `providers.tsx` | `{ HeroUIProvider } from "@heroui/react"` + `{ ToastProvider } from "@heroui/toast"` | `{ Toast } from "@heroui/react"` |
| `hero.ts` | **ファイル削除** | - |

---

## ステップ 12: Button variant の実装確認と調整

v3 では Button の variant 体系が大きく変わっているため、全ファイルで既存のスタイリングが維持されるか確認が必要。

**v3 で利用可能な variant:**

- `primary` (デフォルト)
- `secondary`
- `tertiary`
- `outline`
- `ghost`
- `danger`

**現在のプロジェクトでの Button 使用パターン:**

| ファイル | 現在の variant | カスタム className | 判断 |
|---|---|---|---|
| `icon-button.tsx` | なし（デフォルト） | 全スタイルを `className` で制御 | HeroUI のデフォルトスタイルとの衝突を確認 |
| `link-button.tsx` | なし（デフォルト） | 全スタイルを `className` で制御 | 同上 |
| `header-mobile.tsx` (UnloggedInMenu) | なし（デフォルト） | `className` で制御 | 同上 |
| `header-mobile.tsx` (LoggedInMenu) | なし（デフォルト） | `className` で制御 | 同上 |
| `header-desktop.tsx` (Documents) | `variant="light"` | `className` で制御 | `ghost` に変更 |
| `header-desktop.tsx` (Language) | `variant="bordered"` | `className` で制御 | `outline` に変更 |
| `header-desktop.tsx` (User menu) | `variant="light"` | `className` で制御 | `ghost` に変更 |
| `upload-preview.tsx` (Cancel) | `variant="bordered"` | `className` で制御 | `outline` に変更 |
| `upload-preview.tsx` (Upload) | なし（デフォルト） | `className` で制御 | 同上 |
| `upload-drop-area.tsx` | `variant="bordered"` | `className` で制御 | `outline` に変更 |
| `upload-success.tsx` (両ボタン) | なし（デフォルト） | 全スタイルを `className` で制御 | 同上 |
| `lgtm-image.tsx` (Copy/Favorite) | なし（デフォルト） | `className` で制御、`isIconOnly`、`radius="sm"` | `radius` prop を `className` に移行 |

**重要: スタイリング戦略**

このプロジェクトでは多くの Button が `variant` を指定せず、`className` でカスタムスタイルを全て制御している。v3 では variant 未指定時にデフォルト variant（`primary`）の BEM クラスが適用されるため、カスタムスタイルとの干渉が発生する可能性がある。

**対策（優先順位順）:**

1. **v3 インストール後、まずブラウザで目視確認する。** 干渉がなければ対処不要。
2. **干渉が発生した場合:** 以下のいずれかで対処する。
   - `variant="ghost"` を指定してデフォルトスタイルを最小限にし、`className` で上書き
   - v3 が提供する `unstyled` 相当の variant があれば使用（v3 ドキュメントで確認）
   - `className` の指定を `!important` 付きに変更（最終手段、例: `!bg-button-primary-base`）
3. **特にリスクの高いファイル:**
   - `upload-success.tsx`: variant なしで `bg-button-tertiary-base` / `bg-button-primary-base` を指定
   - `icon-button.tsx`: variant なしで `bg-button-secondary-base` / `bg-button-secondary-active` を指定
   - `header-mobile.tsx`: `UnloggedInMenu`/`LoggedInMenu` 内の Button が variant なし

---

## ステップ 13: 品質管理

### 13-0. Storybook ビルド確認（Chromatic デプロイ前の事前確認）

```bash
npm run build-storybook
```

Storybook のビルドが通ることを確認する。ビルドエラーが出た場合は、コンポーネントの import 漏れや型エラーの可能性が高い。

### 13-1. コードフォーマット

```bash
npm run format
```

### 13-2. Lint チェック

```bash
npm run lint
```

エラーが発生した場合は修正する。特に以下に注意:
- 未使用の import
- 型エラー

### 13-3. テスト実行

```bash
npm run test
```

全てのテストがパスすることを確認する。テストファイル内に HeroUI を直接 import しているものは存在しないため、テストコード自体の修正は不要なはず。

### 13-4. ビルド確認

```bash
npm run build
```

### 13-5. ブラウザでの表示確認

Chrome DevTools MCP を使って以下のページにアクセスし、表示崩れがないか確認する。

| URL | 確認項目 |
|---|---|
| `http://localhost:2222` | ホームページ全体の表示、ボタン、Copied! 表示 |
| `http://localhost:2222/en` | 英語版ホームページ |
| `http://localhost:2222/upload` | アップロードページ（DropArea、Preview、Progress、Success） |
| `http://localhost:2222/docs/how-to-use` | ドキュメントページ（CodeSnippet の表示とコピー機能） |
| `http://localhost:2222/docs/mcp` | MCP ドキュメントページ（CodeSnippet の表示） |
| `http://localhost:2222/docs/github-app` | GitHub App ドキュメントページ |

**モバイル表示の確認:**

Chrome DevTools MCP でモバイルサイズにリサイズし、以下を確認する。

| 確認項目 | 詳細 |
|---|---|
| ハンバーガーメニュー | Drawer が正常に開閉するか |
| 言語切り替え | Drawer の言語メニューが正常に動作するか |
| レスポンシブレイアウト | 全ページでモバイル表示が崩れていないか |

### 13-6. Storybook での確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下のストーリーが正常に表示されるか確認する。

| Storybook パス | 確認コンポーネント |
|---|---|
| `features/upload/UploadProgress` | ProgressBar の表示 |
| `features/upload/UploadForm` | UploadDropArea, UploadPreview の表示 |
| `features/upload/UploadSuccess` | UploadSuccess の表示とボタン |
| `components/HeaderDesktop` | Dropdown メニューの表示と動作 |
| `components/HeaderMobile` | Drawer メニューの表示と動作 |
| `components/IconButton` | ボタンの表示 |
| `components/LinkButton` | ボタンの表示 |
| `features/main/LgtmImage` | 画像カードのボタン表示 |
| `features/docs/DocsHowToUsePage` | CodeSnippet の表示（inline variant）とコピー機能 |
| `features/docs/DocsMcpPage` | CodeSnippet の表示（block/inline 両方）とコピー機能 |
| `features/docs/DocsGithubAppPage` | CodeSnippet の表示とコピー機能 |
| `features/main/HomePage` | ホームページ全体（ActionButtons, LgtmImages） |
| `features/upload/UploadPage` | アップロードページ全体 |

### 13-7. AI エージェントによるビジュアルリグレッションテスト（Before / After 比較）

**これが v3 移行において最も重要なデザイン崩れ検出手段である。**

ステップ 0 で取得したベースラインスクリーンショットと、移行後のスクリーンショットを AI エージェントが目視比較する。Chrome DevTools MCP を使用するため、追加の MCP 設定は不要。

#### 手順

##### (A) 移行後のスクリーンショット取得

ステップ 0 と同じ URL リストに対して、今度は `screenshots/after/` にスクリーンショットを保存する。

```
# Storybook ストーリー（ステップ 0-2 と同じ13個）
screenshots/after/upload-progress.png
screenshots/after/upload-form.png
screenshots/after/upload-success.png
screenshots/after/header-desktop.png
screenshots/after/header-mobile.png
screenshots/after/icon-button.png
screenshots/after/link-button.png
screenshots/after/lgtm-image.png
screenshots/after/docs-mcp-page.png
screenshots/after/docs-how-to-use.png
screenshots/after/docs-github-app.png
screenshots/after/home-page.png
screenshots/after/upload-page.png

# 実アプリ（ステップ 0-3 と同じ6個）
screenshots/after/app-home.png
screenshots/after/app-home-en.png
screenshots/after/app-upload.png
screenshots/after/app-docs-how-to-use.png
screenshots/after/app-docs-mcp.png
screenshots/after/app-docs-github-app.png

# Dropdown/Drawer の開いた状態（ステップ 0-2a と同じ3個）
screenshots/after/header-desktop-dropdown-open.png
screenshots/after/header-desktop-language-open.png
screenshots/after/header-mobile-drawer-open.png
```

##### (B) AI エージェントによる Before / After 比較

Read ツールで `screenshots/before/<name>.png` と `screenshots/after/<name>.png` を**ペアで読み込み**、以下の観点で差異を確認する。

**比較観点:**

| 観点 | 許容される差異 | 許容されない差異（要修正） |
|---|---|---|
| レイアウト | なし | 要素の位置ずれ、重なり、消失 |
| 色・背景色 | HeroUI v3 のデフォルトスタイルによる微細な変化 | カスタムデザイントークンの色が反映されていない |
| フォント・文字サイズ | なし | テキストが消えている、サイズが大幅に変わっている |
| ボタン | 角丸の微細な差 | ボタンが消えている、クリック不能に見える |
| コピーボタン（CodeSnippet） | アイコンの微細なスタイル差 | コピーボタンが消えている、位置が大幅にずれている |
| プログレスバー | トラック高さの微細な差 | バーが表示されない、色が全く異なる |
| Dropdown/Drawer | アニメーションの差 | メニューが開かない、項目が表示されない |

##### (C) 比較結果の判定

各ペアについて以下の判定を行う:

- **PASS**: 差異なし、または許容される微細な差異のみ
- **WARN**: 意図的な変更と思われる差異があるが、デザイン崩れではない
- **FAIL**: 意図しないデザイン崩れが検出された → コードを修正して再度 (A) から実施

全ペアが PASS または WARN になるまで繰り返す。

#### 特に注意してレビューすべきストーリー（リスク順）

| # | ストーリー | リスクレベル | リスク理由 |
|---|---|---|---|
| 1 | `docs-mcp-page` | **最高** | `CodeSnippet` を最も多く使用。Snippet → カスタム実装の変更で見た目が変わる可能性が最も高い |
| 2 | `header-desktop` | **高** | Dropdown 3つの Compound Component 移行。`classNames` 削除によるレイアウト変更の可能性 |
| 3 | `header-mobile` | **高** | Drawer の Compound Component 移行。開閉状態の制御ロジック変更 |
| 4 | `upload-progress` | **中** | Progress → ProgressBar でトラック/フィルの見た目が変わる可能性 |
| 5 | `icon-button` | **中** | Button のデフォルトスタイル（v3 BEM クラス）とカスタム className の干渉 |
| 6 | `lgtm-image` | **中** | Button の `radius` prop 削除による角丸変更 |
| 7 | `link-button` | **中** | Button のデフォルトスタイルとカスタム className の干渉 |

#### CodeSnippet に関する追加対策

`CodeSnippet` には専用の Storybook ストーリーが存在しない（`DocsMcpPage` 等のページストーリー経由でのみ確認可能）。Before / After 比較の精度を高めるため、以下の対策を実施する。

**対策:** 移行作業の一環として `src/features/docs/components/code-snippet.stories.tsx` を新規作成し、以下のバリエーションをカバーするストーリーを追加する。

```tsx
// 作成すべきストーリーのバリエーション:
// 1. variant="inline" - インラインコードスニペット
// 2. variant="block" + language="json" - JSON シンタックスハイライト
// 3. variant="block" + language="yaml" - YAML シンタックスハイライト
// 4. variant="block" + language="typescript" - TypeScript シンタックスハイライト
// 5. variant="block" + language="plaintext" - プレーンテキスト
```

**重要:** このストーリーファイルは **v3 移行のコード変更を行う前に作成** し、ステップ 0 のベースラインスクリーンショットに含める。これにより、Snippet → カスタム実装の移行前後を正確に比較できる。

#### Chromatic による追加の自動ビジュアルリグレッション

上記の AI エージェントによる比較に加えて、push 時に Chromatic（`.github/workflows/chromatic.yml`）が自動実行され、全ストーリーのビジュアル差分が検出される。Chromatic の結果は人間のレビュアーが確認する。AI エージェントによる比較と Chromatic による比較の二重チェック体制でデザイン崩れを防ぐ。

---

## 変更対象ファイル一覧

| # | ファイルパス | 変更種別 | 主な変更内容 |
|---|---|---|---|
| 1 | `package.json` | 修正 | 依存パッケージの更新 |
| 2 | `src/app/globals.css` | 修正 | CSS import の変更 |
| 3 | `src/app/hero.ts` | **削除** | heroui() プラグイン不要 |
| 4 | `src/components/heroui/providers.tsx` | 修正 | HeroUIProvider 削除、Toast.Provider |
| 5 | `src/components/header-desktop.tsx` | 修正 | Dropdown compound pattern、Button variant |
| 6 | `src/components/header-mobile.tsx` | 修正 | useOverlayState、Drawer compound pattern |
| 7 | `src/components/icon-button.tsx` | 修正 | Button props (isLoading→isPending) |
| 8 | `src/components/link-button.tsx` | 修正 | Button props |
| 9 | `src/features/main/components/lgtm-image.tsx` | 修正 | Button props (radius 削除) |
| 10 | `src/features/main/components/home-action-buttons.tsx` | 修正 | addToast → toast |
| 11 | `src/features/upload/components/upload-success.tsx` | 修正 | addToast → toast、Button |
| 12 | `src/features/upload/components/upload-preview.tsx` | 修正 | Button (isLoading→isPending, variant) |
| 13 | `src/features/upload/components/upload-progress.tsx` | 修正 | Progress → ProgressBar |
| 14 | `src/features/upload/components/upload-drop-area.tsx` | 修正 | Button variant |
| 15 | `src/features/docs/components/code-snippet.tsx` | 修正 | Snippet 削除、カスタム実装 |
| 16 | `src/features/docs/components/code-snippet.stories.tsx` | **新規作成** | CodeSnippet の Storybook ストーリー（Chromatic ビジュアルリグレッション用） |

**修正不要なファイル:**
- `src/app/layout.tsx` - `Providers` のインターフェース不変
- `.storybook/preview.tsx` - `Providers` のインターフェース不変
- 全 Storybook ストーリーファイル - コンポーネント内部の変更のみ
- 全テストファイル - HeroUI を直接 import していない

---

## 実装順序のまとめ

> **方針:** HeroUI の公式 Full Migration ガイドに従い、**コンポーネントコードの v3 形式への書き換えを先に行い、依存パッケージの切り替えを後に行う**。v2 と v3 は共存できないため、依存切り替え前のコード変更中はビルドが通らない状態になるが、全コード変更を事前に完了させることで依存切り替え後の破綻時間を最小化し、切り戻し性を高める。

### フェーズ A: 準備（v2 のまま実施）

1. **CodeSnippet 用 Storybook ストーリーの新規作成**（ステップ 13-7 参照、ベースライン取得前に必要）
2. **ベースラインスクリーンショット取得**（ステップ 0: 移行前の見た目を保存。Dropdown/Drawer の開いた状態も含む）

### フェーズ B: コード変更（v2 依存のまま v3 形式に書き換え）

> このフェーズではビルド・lint・テストは通らない。全てのコード変更を完了するまで品質管理は実行しない。

3. **CSS 設定の変更 + hero.ts 削除**（ステップ 2）
4. **Provider の変更**（ステップ 3）
5. **コンポーネントの移行**（ステップ 4〜10、並行作業可能）
6. **import 文の整理**（ステップ 11、各コンポーネント移行時に同時実施）

### フェーズ C: 依存切り替え

7. **依存パッケージの更新**（ステップ 1: `@heroui/react` v3 + `@heroui/styles` インストール、`framer-motion` 削除）
8. **v3 の Button API 確認**（ステップ 7-0: `as`/`startContent`/`ButtonProps` のサポート状況を確認し、必要に応じてコード修正）

### フェーズ D: 検証・調整

9. **Button スタイリングの確認と調整**（ステップ 12）
10. **品質管理**（ステップ 13-0〜13-6: format/lint/test/build/ブラウザ確認/Storybook確認）
11. **AI によるビジュアルリグレッションテスト**（ステップ 13-7: Before/After スクリーンショット比較。Dropdown/Drawer の開いた状態の比較を含む）
12. **Chromatic による追加ビジュアル確認**（push 後に自動実行、人間レビュアーが確認）

---

## リスクと注意点

1. **v2 と v3 の共存不可**: 移行は一括で行う必要がある。フェーズ B（コード変更）中はビルドが通らないが、全コード変更を完了させてからフェーズ C（依存切り替え）に進むことで、破綻時間を最小化する。
2. **Button のデフォルトスタイル変更**: v3 では BEM クラスが適用されるため、`className` でのカスタムスタイルとの干渉に注意（ステップ 12 参照）。
3. **Dropdown の `onAction` ナビゲーション**: v3 では `Dropdown.Item` 内に `<Link>` をネストせず、`onAction` + `router.push()` でナビゲーションする。`onAction` の引数は `Dropdown.Item` の `id` 値であるため、各メニューの `id` と遷移先 URL のマッピングが正しいことを確認すること。
4. **`startContent` prop の互換性**: v3 Button で `startContent` がサポートされるか未確認。children 内で直接配置する代替案を準備。
5. **`onPressStart` / `onPressEnd` の互換性**: v3 Button でこれらの props がサポートされるか確認が必要（`lgtm-image.tsx` で使用中）。
6. **`as` prop の互換性**: v3 Button で `as={Link}` パターンがサポートされるか確認が必要。`render` prop が代替手段（`icon-button.tsx`、`link-button.tsx`、`header-mobile.tsx` の `UnloggedInMenu`/`LoggedInMenu` が影響）。
7. **`ButtonProps` 型の互換性**: v3 での型名を確認し、`icon-button.tsx` の `onPress` 型を適切に更新。`ComponentProps<typeof Button>["onPress"]` で取得する代替案あり。
8. **`package-lock.json` の大幅な差分**: メジャーバージョンアップにより差分が非常に大きくなるが正常。PR の補足情報に明記すること。
