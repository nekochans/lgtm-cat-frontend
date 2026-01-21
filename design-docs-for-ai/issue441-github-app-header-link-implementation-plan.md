# Issue #441: GitHub Appページのヘッダーリンク追加 - 追加実装計画書

## 概要

### 目的

GitHub App ドキュメントページ (`/docs/github-app`) へのリンクをヘッダーナビゲーションに追加する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/441

### 背景

GitHub App ドキュメントページの本体実装は完了済み。しかし、既存の「How to Use」「MCP」ページと同様に、ヘッダーのドキュメントドロップダウンメニューにリンクを追加する必要がある。

---

## 現状分析

### 既存のヘッダーナビゲーション構造

**HeaderDesktop (`src/components/header-desktop.tsx`):**
- ドキュメントドロップダウンメニューに「How to Use」と「MCP」がある
- `createHowToUseLinksFromLanguages(language)` と `createMcpLinksFromLanguages(language)` を使用

**HeaderMobile (`src/components/header-mobile.tsx`):**
- ナビゲーションメニューに「How to Use」と「MCP」のリンクがある
- `howToUseText(language)` と `mcpText(language)` を使用
- `createIncludeLanguageAppPath("docs-how-to-use", language)` と `createIncludeLanguageAppPath("docs-mcp", language)` でリンクを生成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/docs/functions/github-app.ts` | **新規作成** - `createGitHubAppLinksFromLanguages` 関数 |
| `src/components/header-i18n.ts` | `githubAppText` 関数を追加 |
| `src/components/header-desktop.tsx` | GitHub Appのドロップダウンアイテムを追加 |
| `src/components/header-mobile.tsx` | GitHub Appのリンクを追加 |

### 参考にする既存実装

| ファイルパス | 参考ポイント |
|-------------|-------------|
| `src/features/docs/functions/mcp.ts` | `createMcpLinksFromLanguages` 関数の実装パターン |
| `src/components/header-i18n.ts` | `mcpText` 関数の実装パターン |

---

## 変更内容

### 1. src/features/docs/functions/github-app.ts の新規作成

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "@/features/language";
import type { LinkAttribute } from "@/features/link-attribute";
import { createIncludeLanguageAppPath } from "@/features/url";
import { assertNever } from "@/utils/assert-never";

export function createGitHubAppLinksFromLanguages(
  language: Language
): LinkAttribute {
  switch (language) {
    case "en":
      return {
        text: "GitHub App",
        link: createIncludeLanguageAppPath("docs-github-app", language),
      };
    case "ja":
      return {
        text: "GitHub App",
        link: createIncludeLanguageAppPath("docs-github-app", language),
      };
    default:
      return assertNever(language);
  }
}
```

---

### 2. src/components/header-i18n.ts の修正

**追加位置**: `mcpText` 関数の直後に追加

```typescript
export function githubAppText(language: Language): string {
  switch (language) {
    case "ja":
      return "GitHub App";
    case "en":
      return "GitHub App";
    default:
      return assertNever(language);
  }
}
```

---

### 3. src/components/header-desktop.tsx の修正

**変更箇所1**: import 文に `createGitHubAppLinksFromLanguages` を追加

```typescript
// 変更前
import { createHowToUseLinksFromLanguages } from "@/features/docs/functions/how-to-use";
import { createMcpLinksFromLanguages } from "@/features/docs/functions/mcp";

// 変更後
import { createGitHubAppLinksFromLanguages } from "@/features/docs/functions/github-app";
import { createHowToUseLinksFromLanguages } from "@/features/docs/functions/how-to-use";
import { createMcpLinksFromLanguages } from "@/features/docs/functions/mcp";
```

**変更箇所2**: コンポーネント内に `githubApp` 変数を追加

```typescript
// 変更前
const howToUse = createHowToUseLinksFromLanguages(language);
const mcp = createMcpLinksFromLanguages(language);

// 変更後
const githubApp = createGitHubAppLinksFromLanguages(language);
const howToUse = createHowToUseLinksFromLanguages(language);
const mcp = createMcpLinksFromLanguages(language);
```

**変更箇所3**: DropdownMenu 内に GitHub App のアイテムを追加（MCP の直後）

```typescript
// 変更前
<DropdownItem
  as={Link}
  className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
  href={mcp.link}
  key="mcp"
>
  {mcp.text}
</DropdownItem>

// 変更後
<DropdownItem
  as={Link}
  className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
  href={mcp.link}
  key="mcp"
>
  {mcp.text}
</DropdownItem>
<DropdownItem
  as={Link}
  className="data-[hover=true]:!bg-orange-300 rounded-lg px-3 py-2 font-bold text-background text-xl"
  href={githubApp.link}
  key="github-app"
>
  {githubApp.text}
</DropdownItem>
```

---

### 4. src/components/header-mobile.tsx の修正

**変更箇所1**: import 文に `githubAppText` を追加

```typescript
// 変更前
import {
  closeMenuAriaLabel,
  favoriteListText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  mcpText,
  meowlistText,
  openMenuAriaLabel,
  switchLanguageAriaLabel,
  uploadText,
} from "@/components/header-i18n";

// 変更後
import {
  closeMenuAriaLabel,
  favoriteListText,
  githubAppText,
  homeText,
  howToUseText,
  loginText,
  logoutText,
  mcpText,
  meowlistText,
  openMenuAriaLabel,
  switchLanguageAriaLabel,
  uploadText,
} from "@/components/header-i18n";
```

**変更箇所2**: `UnloggedInMenu` コンポーネント内にリンクを追加（MCP の直後）

```typescript
// 変更前
<Link
  className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
  href={createIncludeLanguageAppPath("docs-mcp", language)}
  onClick={onCloseMenus}
>
  {mcpText(language)}
</Link>

// 変更後
<Link
  className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
  href={createIncludeLanguageAppPath("docs-mcp", language)}
  onClick={onCloseMenus}
>
  {mcpText(language)}
</Link>
<Link
  className="flex h-[70px] items-center border-orange-200 border-b px-5 py-3 text-background text-base"
  href={createIncludeLanguageAppPath("docs-github-app", language)}
  onClick={onCloseMenus}
>
  {githubAppText(language)}
</Link>
```

---

## 実装順序

### Phase 1: リンク生成関数の作成

1. `src/features/docs/functions/github-app.ts` を新規作成

### Phase 2: i18nテキスト関数の追加

2. `src/components/header-i18n.ts` に `githubAppText` 関数を追加

### Phase 3: ヘッダーコンポーネントの修正

3. `src/components/header-desktop.tsx` を修正
4. `src/components/header-mobile.tsx` を修正

### Phase 4: 品質管理

5. `npm run format` を実行
6. `npm run lint` を実行
7. `npm run test` を実行
8. Chrome DevTools MCP で表示確認
   - デスクトップ版: ドキュメントドロップダウンに「GitHub App」が表示されることを確認
   - モバイル版: ナビゲーションメニューに「GitHub App」が表示されることを確認
9. Storybook で Header コンポーネントの表示確認

---

## 成功基準

- [ ] `src/features/docs/functions/github-app.ts` が新規作成されている
- [ ] `src/components/header-i18n.ts` に `githubAppText` 関数が追加されている
- [ ] `src/components/header-desktop.tsx` のドキュメントドロップダウンに GitHub App のリンクが追加されている
- [ ] `src/components/header-mobile.tsx` のナビゲーションメニューに GitHub App のリンクが追加されている
- [ ] デスクトップ版で「GitHub App」リンクが表示され、クリックで `/docs/github-app` に遷移できる
- [ ] モバイル版で「GitHub App」リンクが表示され、クリックで `/docs/github-app` に遷移できる
- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のヘッダースタイルやレイアウトの変更は禁止**
3. **リンクの順序変更は禁止**（How to Use → MCP → GitHub App の順序を維持）
