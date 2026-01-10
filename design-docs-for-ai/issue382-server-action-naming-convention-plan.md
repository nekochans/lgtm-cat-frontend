# Issue #382: サーバーアクション関数の命名規則統一 - 詳細実装計画書

## 概要

### 目的

`docs/project-coding-guidelines.md` の「Server Actionの命名規則」に従い、サーバーアクション関数の命名規則を統一する。

**命名規則の要点:**
- 関数名: 末尾に `Action` を付与 (例: `refreshRandomCats` → `refreshRandomCatsAction`)
- 型名: 末尾に `Action` を付与 (例: `RefreshRandomCatsAction`)
- ファイル名: 末尾に `-action` を付与 (例: `refresh-images.ts` → `refresh-images-action.ts`)

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/382

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4

---

## 現状分析

### 準拠しているアクションファイル

以下のファイルは既に命名規則に準拠している:

| ファイルパス | 関数名 | 型名 |
|-------------|--------|------|
| `src/features/upload/actions/generate-upload-url-action.ts` | `generateUploadUrlAction` | `GenerateUploadUrlAction` |
| `src/features/upload/actions/validate-and-create-lgtm-image-action.ts` | `validateAndCreateLgtmImageAction` | `ValidateAndCreateLgtmImageAction` |

### 準拠していないアクションファイル (変更対象)

| ファイルパス | 現在の関数名 | 問題点 |
|-------------|--------------|--------|
| `src/features/main/actions/refresh-images.ts` | `refreshRandomCats`, `showLatestCats` | 関数名・ファイル名に `Action` / `-action` がない |
| `src/features/main/actions/copy-random-cat.ts` | `copyRandomCat` | 関数名・ファイル名に `Action` / `-action` がない |

### 影響を受けるファイル

#### 参照ファイル (インポートパスと関数名の更新が必要)

| ファイルパス | 参照している関数 |
|-------------|------------------|
| `src/features/main/components/home-action-buttons.tsx` | `refreshRandomCats`, `showLatestCats`, `copyRandomCat` |
| `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts` | `refreshRandomCats` |
| `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts` | `showLatestCats` |
| `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` | `copyRandomCat` |

#### 型定義ファイル (新しい型定義の追加)

| ファイルパス | 追加する型 |
|-------------|-----------|
| `src/features/main/types/action-state.ts` | `RefreshRandomCatsAction`, `ShowLatestCatsAction`, `CopyRandomCatAction` |

#### ドキュメントファイル (ファイル一覧の更新)

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/CLAUDE.md` | ファイル一覧の `refresh-images.ts` → `refresh-images-action.ts`、`copy-random-cat.ts` → `copy-random-cat-action.ts` |
| `src/AGENTS.md` | ファイル一覧の `refresh-images.ts` → `refresh-images-action.ts`、`copy-random-cat.ts` → `copy-random-cat-action.ts` |

---

## 変更内容

### 1. ファイル名の変更

| 変更前 | 変更後 |
|--------|--------|
| `src/features/main/actions/refresh-images.ts` | `src/features/main/actions/refresh-images-action.ts` |
| `src/features/main/actions/copy-random-cat.ts` | `src/features/main/actions/copy-random-cat-action.ts` |

### 2. 関数名の変更

| ファイル | 変更前 | 変更後 |
|---------|--------|--------|
| `refresh-images-action.ts` | `refreshRandomCats` | `refreshRandomCatsAction` |
| `refresh-images-action.ts` | `showLatestCats` | `showLatestCatsAction` |
| `copy-random-cat-action.ts` | `copyRandomCat` | `copyRandomCatAction` |

### 3. 型定義の追加

`src/features/main/types/action-state.ts` に以下の型定義を追加:

- `RefreshRandomCatsAction` - refreshRandomCatsAction関数の型
- `ShowLatestCatsAction` - showLatestCatsAction関数の型
- `CopyRandomCatResult` - copyRandomCatAction関数の結果型 (copy-random-cat.tsから移動)
- `CopyRandomCatAction` - copyRandomCatAction関数の型

**設計判断の理由:**
- `CopyRandomCatResult` を `action-state.ts` に移動する理由は、`CopyRandomCatAction` 型の戻り値として参照する必要があるため
- 型定義を一箇所に集約することで、依存関係が明確になる
- 既存の `RefreshImagesActionState` と同じファイルに配置することで、Server Action関連の型が一元管理される

---

## ファイル構成

### 修正対象ファイル一覧

#### Phase 1: 型定義の追加

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/main/types/action-state.ts` | 3つの型定義を追加 |

#### Phase 2: アクションファイルのリネームと修正

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/main/actions/refresh-images.ts` | `refresh-images-action.ts` にリネーム、関数名変更、型明示 |
| `src/features/main/actions/copy-random-cat.ts` | `copy-random-cat-action.ts` にリネーム、関数名変更、型明示 |

#### Phase 3: 参照ファイルの更新

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/main/components/home-action-buttons.tsx` | インポートパスと関数名を更新 |
| `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts` | インポートパスと関数名を更新、describeブロック名を更新 |
| `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts` | インポートパスと関数名を更新、describeブロック名を更新 |
| `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` | インポートパスと関数名を更新、describeブロック名を更新 |

#### Phase 3.5: ドキュメントファイルの更新

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/CLAUDE.md` | ディレクトリ構成のファイル一覧を更新 |
| `src/AGENTS.md` | ディレクトリ構成のファイル一覧を更新 |

---

## 実装詳細

### 1. 型定義の追加

**ファイルパス**: `src/features/main/types/action-state.ts`

#### 変更前のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * Server Actionの状態を表す型
 * SUCCESS: 成功時、リダイレクト先URLを含む
 * ERROR: 失敗時、エラーメッセージを含む
 */
export type RefreshImagesActionState =
  | { readonly status: "SUCCESS"; readonly redirectUrl: string }
  | { readonly status: "ERROR"; readonly message: string }
  | null;
```

#### 変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";

/**
 * Server Actionの状態を表す型
 * SUCCESS: 成功時、リダイレクト先URLを含む
 * ERROR: 失敗時、エラーメッセージを含む
 */
export type RefreshImagesActionState =
  | { readonly status: "SUCCESS"; readonly redirectUrl: string }
  | { readonly status: "ERROR"; readonly message: string }
  | null;

/**
 * refreshRandomCatsAction関数の型
 *
 * Server Actionとして使用するため、関数名の末尾に "Action" を付与
 * これによりTS71007警告を回避
 */
export type RefreshRandomCatsAction = (
  prevState: RefreshImagesActionState,
  language: Language
) => Promise<RefreshImagesActionState>;

/**
 * showLatestCatsAction関数の型
 *
 * Server Actionとして使用するため、関数名の末尾に "Action" を付与
 * これによりTS71007警告を回避
 */
export type ShowLatestCatsAction = (
  prevState: RefreshImagesActionState,
  language: Language
) => Promise<RefreshImagesActionState>;

/**
 * copyRandomCatAction の結果型
 */
export type CopyRandomCatResult =
  | { readonly success: true; readonly markdown: string }
  | { readonly success: false; readonly error: string };

/**
 * copyRandomCatAction関数の型
 *
 * Server Actionとして使用するため、関数名の末尾に "Action" を付与
 * これによりTS71007警告を回避
 */
export type CopyRandomCatAction = () => Promise<CopyRandomCatResult>;
```

**変更点**:
- `Language` 型のimportを追加
- `RefreshRandomCatsAction` 型を追加
- `ShowLatestCatsAction` 型を追加
- `CopyRandomCatResult` 型を追加 (copy-random-cat.tsから移動)
- `CopyRandomCatAction` 型を追加

---

### 2. refresh-images-action.ts の修正

**ファイル移動**:

```bash
git mv src/features/main/actions/refresh-images.ts src/features/main/actions/refresh-images-action.ts
```

**ファイルパス**: `src/features/main/actions/refresh-images-action.ts` (リネーム後)

#### 変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { updateTag } from "next/cache";
import type { Language } from "@/features/language";
import {
  CACHE_TAG_LGTM_IMAGES_LATEST,
  CACHE_TAG_LGTM_IMAGES_RANDOM,
} from "@/features/main/constants/cache-tags";
import type {
  RefreshImagesActionState,
  RefreshRandomCatsAction,
  ShowLatestCatsAction,
} from "@/features/main/types/action-state";
import { i18nUrlList } from "@/features/url";

/**
 * ランダムなLGTM画像を再取得するためのキャッシュを更新し、リダイレクト先URLを返す
 *
 * @param _prevState - useActionStateから渡される前回の状態 (使用しない)
 * @param language - 言語設定
 * @returns 成功時はリダイレクト先URL、失敗時はエラーメッセージ
 *
 * RefreshRandomCatsAction 型に準拠した実装
 */
// biome-ignore lint/suspicious/useAwait: Server Actions must be async (Next.js requirement)
export const refreshRandomCatsAction: RefreshRandomCatsAction = async (
  _prevState: RefreshImagesActionState,
  language: Language
): Promise<RefreshImagesActionState> => {
  try {
    updateTag(CACHE_TAG_LGTM_IMAGES_RANDOM);

    const targetUrl =
      language === "ja"
        ? `${i18nUrlList.home.ja}?view=random`
        : `${i18nUrlList.home.en}?view=random`;

    return { status: "SUCCESS", redirectUrl: targetUrl };
  } catch {
    return { status: "ERROR", message: "Failed to refresh images" };
  }
};

/**
 * 最新のLGTM画像を表示するためのキャッシュを更新し、リダイレクト先URLを返す
 *
 * @param _prevState - useActionStateから渡される前回の状態 (使用しない)
 * @param language - 言語設定
 * @returns 成功時はリダイレクト先URL、失敗時はエラーメッセージ
 *
 * ShowLatestCatsAction 型に準拠した実装
 */
// biome-ignore lint/suspicious/useAwait: Server Actions must be async (Next.js requirement)
export const showLatestCatsAction: ShowLatestCatsAction = async (
  _prevState: RefreshImagesActionState,
  language: Language
): Promise<RefreshImagesActionState> => {
  try {
    updateTag(CACHE_TAG_LGTM_IMAGES_LATEST);

    const targetUrl =
      language === "ja"
        ? `${i18nUrlList.home.ja}?view=latest`
        : `${i18nUrlList.home.en}?view=latest`;

    return { status: "SUCCESS", redirectUrl: targetUrl };
  } catch {
    return { status: "ERROR", message: "Failed to show latest images" };
  }
};
```

**変更点**:
- ファイル名を `refresh-images.ts` から `refresh-images-action.ts` に変更
- `RefreshRandomCatsAction`, `ShowLatestCatsAction` 型をimport
- `refreshRandomCats` → `refreshRandomCatsAction` (関数名変更)
- `showLatestCats` → `showLatestCatsAction` (関数名変更)
- 関数宣言を `async function` から `const: Type = async` 形式に変更 (型明示)
- JSDocに「型に準拠した実装」のコメントを追加

---

### 3. copy-random-cat-action.ts の修正

**ファイル移動**:

```bash
git mv src/features/main/actions/copy-random-cat.ts src/features/main/actions/copy-random-cat-action.ts
```

**ファイルパス**: `src/features/main/actions/copy-random-cat-action.ts` (リネーム後)

#### 変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import type {
  CopyRandomCatAction,
  CopyRandomCatResult,
} from "@/features/main/types/action-state";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

/**
 * ランダムなLGTM画像を1つ取得し、マークダウンソースを返す
 *
 * CopyRandomCatAction 型に準拠した実装
 */
export const copyRandomCatAction: CopyRandomCatAction =
  async (): Promise<CopyRandomCatResult> => {
    try {
      const accessToken = await issueClientCredentialsAccessToken();
      const lgtmImages = await fetchLgtmImagesInRandom(accessToken);

      if (lgtmImages.length === 0) {
        return { success: false, error: "No images available" };
      }

      // ランダムに1つ選択
      const randomIndex = Math.floor(Math.random() * lgtmImages.length);
      const selectedImage = lgtmImages[randomIndex];

      // マークダウンソースを生成 (共通関数を使用)
      const markdown = generateLgtmMarkdown(selectedImage.imageUrl);

      return { success: true, markdown };
    } catch (error) {
      console.error("Failed to copy random cat:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };
```

**変更点**:
- ファイル名を `copy-random-cat.ts` から `copy-random-cat-action.ts` に変更
- `CopyRandomCatResult` 型定義を削除 (action-state.tsに移動)
- `CopyRandomCatAction`, `CopyRandomCatResult` 型をimport
- `copyRandomCat` → `copyRandomCatAction` (関数名変更)
- 関数宣言を `async function` から `const: Type = async` 形式に変更 (型明示)
- JSDocに「型に準拠した実装」のコメントを追加

---

### 4. home-action-buttons.tsx の修正

**ファイルパス**: `src/features/main/components/home-action-buttons.tsx`

#### 変更箇所一覧 (正確な行番号)

| 行番号 | 変更前 | 変更後 |
|--------|--------|--------|
| 10 | `import { copyRandomCat } from "@/features/main/actions/copy-random-cat";` | `import { copyRandomCatAction } from "@/features/main/actions/copy-random-cat-action";` |
| 11-14 | `import { refreshRandomCats, showLatestCats, } from "@/features/main/actions/refresh-images";` | `import { refreshRandomCatsAction, showLatestCatsAction, } from "@/features/main/actions/refresh-images-action";` |
| 51 | `refreshRandomCats(prevState, language),` | `refreshRandomCatsAction(prevState, language),` |
| 76 | `showLatestCats(prevState, language),` | `showLatestCatsAction(prevState, language),` |
| 106 | `const result = await copyRandomCat();` | `const result = await copyRandomCatAction();` |

#### 変更前のインポート部分 (行10-14)

```typescript
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import {
  refreshRandomCats,
  showLatestCats,
} from "@/features/main/actions/refresh-images";
```

#### 変更後のインポート部分

```typescript
import { copyRandomCatAction } from "@/features/main/actions/copy-random-cat-action";
import {
  refreshRandomCatsAction,
  showLatestCatsAction,
} from "@/features/main/actions/refresh-images-action";
```

#### 変更前の関数呼び出し部分 (3箇所)

```typescript
// 1. refreshRandomCats の呼び出し (行51)
refreshRandomCats(prevState, language),

// 2. showLatestCats の呼び出し (行76)
showLatestCats(prevState, language),

// 3. copyRandomCat の呼び出し (行106)
const result = await copyRandomCat();
```

#### 変更後の関数呼び出し部分

```typescript
// 1. refreshRandomCatsAction の呼び出し (行51)
refreshRandomCatsAction(prevState, language),

// 2. showLatestCatsAction の呼び出し (行76)
showLatestCatsAction(prevState, language),

// 3. copyRandomCatAction の呼び出し (行106)
const result = await copyRandomCatAction();
```

---

### 5. テストファイルの修正

#### 5.1 refresh-random-cats.test.ts

**ファイルパス**: `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts`

#### 変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshRandomCatsAction } from "@/features/main/actions/refresh-images-action";
import { CACHE_TAG_LGTM_IMAGES_RANDOM } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

describe("refreshRandomCatsAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates random tag and returns ja redirect URL", async () => {
    const result = await refreshRandomCatsAction(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=random`,
    });
  });

  it("updates random tag and returns en redirect URL", async () => {
    const result = await refreshRandomCatsAction(null, "en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.en}?view=random`,
    });
  });

  it("returns error state when updateTag throws", async () => {
    updateTagMock.mockImplementation(() => {
      throw new Error("Cache update failed");
    });

    const result = await refreshRandomCatsAction(null, "ja");

    expect(result).toEqual({
      status: "ERROR",
      message: "Failed to refresh images",
    });
  });
});
```

**変更点**:
- インポートパスを `refresh-images` から `refresh-images-action` に変更
- 関数名を `refreshRandomCats` から `refreshRandomCatsAction` に変更
- describeブロック名を `refreshRandomCatsAction` に変更

---

#### 5.2 show-latest-cats.test.ts

**ファイルパス**: `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts`

#### 変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import { showLatestCatsAction } from "@/features/main/actions/refresh-images-action";
import { CACHE_TAG_LGTM_IMAGES_LATEST } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

describe("showLatestCatsAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates latest tag and returns ja redirect URL", async () => {
    const result = await showLatestCatsAction(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=latest`,
    });
  });

  it("updates latest tag and returns en redirect URL", async () => {
    const result = await showLatestCatsAction(null, "en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.en}?view=latest`,
    });
  });

  it("returns error state when updateTag throws", async () => {
    updateTagMock.mockImplementation(() => {
      throw new Error("Cache update failed");
    });

    const result = await showLatestCatsAction(null, "ja");

    expect(result).toEqual({
      status: "ERROR",
      message: "Failed to show latest images",
    });
  });
});
```

**変更点**:
- インポートパスを `refresh-images` から `refresh-images-action` に変更
- 関数名を `showLatestCats` から `showLatestCatsAction` に変更
- describeブロック名を `showLatestCatsAction` に変更

---

#### 5.3 copy-random-cat.test.ts

**ファイルパス**: `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts`

#### 変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { http } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { copyRandomCatAction } from "@/features/main/actions/copy-random-cat-action";
import { fetchLgtmImagesInRandomUrl } from "@/features/main/functions/api-url";
import { mockIssueClientCredentialsAccessToken } from "@/mocks/api/external/cognito/mock-issue-client-credentials-access-token";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";

// Redis をモック (キャッシュなしを模擬)
vi.mock("@upstash/redis", () => {
  const MockRedis = class {
    get = vi.fn().mockResolvedValue(null);
    set = vi.fn().mockResolvedValue("OK");
    expire = vi.fn().mockResolvedValue(1);
  };
  return { Redis: MockRedis };
});

// appBaseUrl をモック (一貫したURLを返すため)
vi.mock("@/features/url", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/url")>();
  return {
    ...actual,
    appBaseUrl: vi.fn(() => "https://lgtmeow.com"),
  };
});

const cognitoTokenEndpoint = process.env.COGNITO_TOKEN_ENDPOINT ?? "";

const mockHandlers = [
  http.post(cognitoTokenEndpoint, mockIssueClientCredentialsAccessToken),
  http.get(fetchLgtmImagesInRandomUrl(), mockFetchLgtmImages),
];

const server = setupServer(...mockHandlers);

describe("copyRandomCatAction", () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it("should return markdown when images are available", async () => {
    // Math.random をモックして最初の画像を選択させる
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await copyRandomCatAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toBe(
        "[![LGTMeow](https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp)](https://lgtmeow.com)"
      );
    }
  });

  it("should return error when no images are available", async () => {
    server.use(
      http.get(fetchLgtmImagesInRandomUrl(), () =>
        Response.json({ lgtmImages: [] }, { status: 200 })
      )
    );

    const result = await copyRandomCatAction();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("No images available");
    }
  });

  it("should return error when API call fails", async () => {
    server.use(
      http.post(cognitoTokenEndpoint, () =>
        Response.json({ error: "unauthorized" }, { status: 401 })
      )
    );

    const result = await copyRandomCatAction();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("failed to issueAccessToken");
    }
  });
});
```

**変更点**:
- インポートパスを `copy-random-cat` から `copy-random-cat-action` に変更
- 関数名を `copyRandomCat` から `copyRandomCatAction` に変更
- describeブロック名を `copyRandomCatAction` に変更

---

### 6. ドキュメントファイルの更新

#### 6.1 src/CLAUDE.md

**ファイルパス**: `src/CLAUDE.md`

#### 変更箇所 (行27-29)

**変更前**:

```text
│       ├── actions/
│       │   ├── refresh-images.ts            # 画像更新アクション
│       │   └── copy-random-cat.ts           # ランダム猫コピーアクション
```

**変更後**:

```text
│       ├── actions/
│       │   ├── refresh-images-action.ts     # 画像更新アクション
│       │   └── copy-random-cat-action.ts    # ランダム猫コピーアクション
```

**変更点**:
- `refresh-images.ts` → `refresh-images-action.ts` にファイル名を更新
- `copy-random-cat.ts` → `copy-random-cat-action.ts` にファイル名を更新

---

#### 6.2 src/AGENTS.md

**ファイルパス**: `src/AGENTS.md`

#### 変更箇所 (行27-29)

**変更前**:

```text
│       ├── actions/
│       │   ├── refresh-images.ts            # 画像更新アクション
│       │   └── copy-random-cat.ts           # ランダム猫コピーアクション
```

**変更後**:

```text
│       ├── actions/
│       │   ├── refresh-images-action.ts     # 画像更新アクション
│       │   └── copy-random-cat-action.ts    # ランダム猫コピーアクション
```

**変更点**:
- `refresh-images.ts` → `refresh-images-action.ts` にファイル名を更新
- `copy-random-cat.ts` → `copy-random-cat-action.ts` にファイル名を更新
- 注: `src/CLAUDE.md` と `src/AGENTS.md` は同じ内容のため、両方を同様に更新する

---

## ファイル操作コマンド一覧

### ファイルリネーム

```bash
git mv src/features/main/actions/refresh-images.ts src/features/main/actions/refresh-images-action.ts
git mv src/features/main/actions/copy-random-cat.ts src/features/main/actions/copy-random-cat-action.ts
```

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: 型定義の追加

1. `src/features/main/types/action-state.ts` に型定義を追加
   - `RefreshRandomCatsAction` 型を追加
   - `ShowLatestCatsAction` 型を追加
   - `CopyRandomCatResult` 型を追加 (copy-random-cat.tsから移動)
   - `CopyRandomCatAction` 型を追加

### Phase 2: アクションファイルのリネームと修正

2. `refresh-images.ts` を `refresh-images-action.ts` にリネーム
3. `refresh-images-action.ts` の関数名を変更、型を明示
4. `copy-random-cat.ts` を `copy-random-cat-action.ts` にリネーム
5. `copy-random-cat-action.ts` の関数名を変更、型を明示、`CopyRandomCatResult` 型定義を削除

### Phase 3: 参照ファイルの更新

6. `home-action-buttons.tsx` のインポートパスと関数名を更新
7. `refresh-random-cats.test.ts` を更新
8. `show-latest-cats.test.ts` を更新
9. `copy-random-cat.test.ts` を更新

### Phase 3.5: ドキュメントファイルの更新

10. `src/CLAUDE.md` のファイル一覧を更新
11. `src/AGENTS.md` のファイル一覧を更新

### Phase 4: 品質管理

12. `npm run format` を実行
13. `npm run lint` を実行
14. `npm run test` を実行
15. Chrome DevTools MCP での表示確認
16. Storybook での表示確認

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

Chrome DevTools MCP を使って `http://localhost:2222` にアクセスし、以下を確認:

#### 機能確認

- [ ] `/` (日本語版ホームページ) が正常に表示される
- [ ] `/en` (英語版ホームページ) が正常に表示される
- [ ] 「ランダムな猫」ボタンをクリックすると画像が更新される
- [ ] 「新着の猫」ボタンをクリックすると画像が更新される
- [ ] 「ランダムコピー」ボタンをクリックするとマークダウンがクリップボードにコピーされる

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

- [ ] 変更したコンポーネントに影響するStorybookストーリーが正常に表示される

---

## 注意事項

### biome-ignore コメントについて

`refreshRandomCatsAction` と `showLatestCatsAction` は `async` 関数だが内部で `await` を使用していないため、`biome-ignore lint/suspicious/useAwait` コメントが必要です。

```typescript
// biome-ignore lint/suspicious/useAwait: Server Actions must be async (Next.js requirement)
export const refreshRandomCatsAction: RefreshRandomCatsAction = async (
```

**理由**: Next.js の Server Actions は `async` 関数として定義する必要がありますが、`updateTag` は同期的に動作するため `await` が不要です。Biome はこれを警告するため、コメントで抑制します。

**対照的に**: `copyRandomCatAction` は内部で `await issueClientCredentialsAccessToken()` を使用しているため、biome-ignore コメントは不要です。

### 型インポートパスについて

型のインポートは絶対パス (`@/features/main/types/action-state`) を使用します。これは既存のコードベースの慣習に従っています。

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいパッケージのインストール禁止**
3. **ビジネスロジックの変更禁止** - リファクタリングのみに集中
4. **テストコードのビジネスロジック上書き禁止** - テストが失敗する場合は実装を修正
5. **biome-ignoreコメントの無断削除禁止** - 必要なコメントは維持すること

---

## 成功基準

以下を全て満たすこと:

### ファイル名の変更

- [ ] `refresh-images.ts` が `refresh-images-action.ts` にリネームされている
- [ ] `copy-random-cat.ts` が `copy-random-cat-action.ts` にリネームされている

### 関数名の変更

- [ ] `refreshRandomCats` が `refreshRandomCatsAction` に変更されている
- [ ] `showLatestCats` が `showLatestCatsAction` に変更されている
- [ ] `copyRandomCat` が `copyRandomCatAction` に変更されている

### 型定義の追加

- [ ] `action-state.ts` に `RefreshRandomCatsAction` 型が追加されている
- [ ] `action-state.ts` に `ShowLatestCatsAction` 型が追加されている
- [ ] `action-state.ts` に `CopyRandomCatResult` 型が追加されている
- [ ] `action-state.ts` に `CopyRandomCatAction` 型が追加されている

### 型の明示

- [ ] `refreshRandomCatsAction` 関数に `RefreshRandomCatsAction` 型が明示されている
- [ ] `showLatestCatsAction` 関数に `ShowLatestCatsAction` 型が明示されている
- [ ] `copyRandomCatAction` 関数に `CopyRandomCatAction` 型が明示されている

### 参照ファイルの更新

- [ ] `home-action-buttons.tsx` のインポートパスと関数名が更新されている
- [ ] 全てのテストファイルのインポートパスと関数名が更新されている
- [ ] 全てのテストファイルのdescribeブロック名が更新されている

### ドキュメントファイルの更新

- [ ] `src/CLAUDE.md` のファイル一覧が `refresh-images-action.ts`、`copy-random-cat-action.ts` に更新されている
- [ ] `src/AGENTS.md` のファイル一覧が `refresh-images-action.ts`、`copy-random-cat-action.ts` に更新されている

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 機能確認

- [ ] ホームページの「ランダムな猫」「新着の猫」「ランダムコピー」ボタンが正常に動作する
