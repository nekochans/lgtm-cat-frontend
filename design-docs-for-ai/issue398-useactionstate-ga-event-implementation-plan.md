# Issue #398: useActionStateを使用したGAイベント送信の改善

## 概要

現在の実装では、フォームの`onSubmit`でGAイベントを送信した後にServer Actionが実行されるため、Server Actionの成功/失敗に関わらずGAイベントが記録されてしまう問題がある。

`useActionState`と`withCallbacks`パターンを使用して、Server Action成功時のみGAイベントを送信するように改善する。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/398

## 関連レビューコメント

https://github.com/nekochans/lgtm-cat-frontend/pull/412#discussion_r2652708243

## 参考資料

- [React Server Actions Toast with useActionState (Robin Wieruch)](https://www.robinwieruch.de/react-server-actions-toast-useactionstate/)
- [Next.js useActionState Documentation](https://nextjs.org/docs/app/getting-started/updating-data#showing-a-pending-state)

## Doneの定義

- [ ] Server Action成功時のみGAイベントが送信される
- [ ] Server Action失敗時にはエラートーストが表示される
- [ ] `useEffect`を使用せずに実装されている
- [ ] 既存のテストが全てパスする
- [ ] 新しいテストが追加されている
- [ ] 日本語版/英語版両方で動作確認が完了している

## 現在の問題点

### 問題のあるコード (現状)

```typescript
// home-action-buttons.tsx
const handleRefreshRandomCatsSubmit = useCallback(() => {
  sendClickTopFetchRandomCatButton();  // Server Action実行前にGAイベント送信
}, []);

<form action={refreshRandomCatsAction} onSubmit={handleRefreshRandomCatsSubmit}>
```

### 問題点

1. `onSubmit`はServer Action実行前に呼ばれる
2. Server Actionが失敗してもGAイベントは既に送信されている
3. アナリティクスの精度に影響する

### 現在のServer Actionの特性

```typescript
// refresh-images.ts
export async function refreshRandomCats(language: Language): Promise<void> {
  updateTag(CACHE_TAG_LGTM_IMAGES_RANDOM);
  redirect(targetUrl);  // redirect()を使用しているため戻り値がvoid
}
```

**重要**: `redirect()`はNext.jsの機能で、内部的にエラーをスローしてリダイレクトを実現する。このため、`useActionState`で通常の成功/失敗を判定するのが困難。

## 実装方針

### アプローチ

1. Server Actionを修正して、`redirect()`の代わりにリダイレクト先URLを返す
2. `withCallbacks`ユーティリティを作成して、Server Actionをラップ
3. `useActionState`を使用して状態管理
4. 成功時のみGAイベントを送信し、クライアント側でリダイレクト

### 処理フロー (改善後)

```
[ユーザー]
    |
    v ボタンクリック
[form submit]
    |
    v useActionState経由でServer Action実行
[Server Action]
    |
    +-- updateTag() 実行
    |
    v { status: "SUCCESS", redirectUrl: "..." } を返す
[withCallbacks]
    |
    +-- onSuccess: GAイベント送信
    |
    v router.push(redirectUrl) でリダイレクト
```

## 前提条件の確認

### ファイル構造

```text
src/
├── features/
│   └── main/
│       ├── actions/
│       │   ├── refresh-images.ts                   # 修正対象
│       │   └── __tests__/
│       │       └── refresh-images/
│       │           ├── refresh-random-cats.test.ts # 修正対象
│       │           └── show-latest-cats.test.ts    # 修正対象
│       ├── components/
│       │   └── home-action-buttons.tsx             # 修正対象
│       └── types/                                  # 新規作成
│           └── action-state.ts
└── utils/
    └── with-callbacks.ts                           # 新規作成
```

## 実装手順

**重要**: 以下の順序で実装すること。依存関係があるため順序を守る必要がある。

```
1. 型定義 (action-state.ts)
   ↓
2. ユーティリティ (with-callbacks.ts)
   ↓
3. Server Action修正 (refresh-images.ts)
   ↓
4. テスト修正 (refresh-random-cats.test.ts, show-latest-cats.test.ts)
   ↓
5. コンポーネント修正 (home-action-buttons.tsx)
   ↓
6. 新規テスト追加 (with-callbacks.test.ts)
```

### ステップ1: ActionState型を定義

**新規ファイル**: `src/features/main/types/action-state.ts`

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

### ステップ2: withCallbacksユーティリティを作成

**新規ファイル**: `src/utils/with-callbacks.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

type ActionState = {
  readonly status: "SUCCESS" | "ERROR";
  readonly [key: string]: unknown;
} | null;

/**
 * ActionStateからSUCCESS状態のみを抽出する条件型
 */
type SuccessState<T extends ActionState> = T extends {
  readonly status: "SUCCESS";
}
  ? T
  : never;

/**
 * ActionStateからERROR状態のみを抽出する条件型
 */
type ErrorState<T extends ActionState> = T extends { readonly status: "ERROR" }
  ? T
  : never;

type Callbacks<T extends ActionState> = {
  readonly onSuccess?: (result: SuccessState<NonNullable<T>>) => void;
  readonly onError?: (result: ErrorState<NonNullable<T>>) => void;
};

/**
 * Server Actionにコールバック機能を追加する高階関数
 * useEffectを使用せずに、Server Actionの結果に応じた処理を実行できる
 *
 * @see https://www.robinwieruch.de/react-server-actions-toast-useactionstate/
 */
export const withCallbacks = <Args extends unknown[], T extends ActionState>(
  fn: (...args: Args) => Promise<T>,
  callbacks: Callbacks<T>,
): ((...args: Args) => Promise<T>) => {
  return async (...args: Args): Promise<T> => {
    const result = await fn(...args);

    if (result?.status === "SUCCESS") {
      callbacks.onSuccess?.(result as SuccessState<NonNullable<T>>);
    }
    if (result?.status === "ERROR") {
      callbacks.onError?.(result as ErrorState<NonNullable<T>>);
    }

    return result;
  };
};
```

### ステップ3: Server Actionを修正

**修正ファイル**: `src/features/main/actions/refresh-images.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { updateTag } from "next/cache";
import type { Language } from "@/features/language";
import {
  CACHE_TAG_LGTM_IMAGES_LATEST,
  CACHE_TAG_LGTM_IMAGES_RANDOM,
} from "@/features/main/constants/cache-tags";
import type { RefreshImagesActionState } from "@/features/main/types/action-state";
import { i18nUrlList } from "@/features/url";

/**
 * ランダムなLGTM画像を再取得するためのキャッシュを更新し、リダイレクト先URLを返す
 *
 * @param prevState - useActionStateから渡される前回の状態 (使用しない)
 * @param language - 言語設定
 * @returns 成功時はリダイレクト先URL、失敗時はエラーメッセージ
 */
export async function refreshRandomCats(
  prevState: RefreshImagesActionState,
  language: Language,
): Promise<RefreshImagesActionState> {
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
}

/**
 * 最新のLGTM画像を表示するためのキャッシュを更新し、リダイレクト先URLを返す
 *
 * @param prevState - useActionStateから渡される前回の状態 (使用しない)
 * @param language - 言語設定
 * @returns 成功時はリダイレクト先URL、失敗時はエラーメッセージ
 */
export async function showLatestCats(
  prevState: RefreshImagesActionState,
  language: Language,
): Promise<RefreshImagesActionState> {
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
}
```

**変更点**:

1. `redirect()`を削除し、リダイレクト先URLを返すように変更
2. `prevState`引数を追加 (useActionStateの仕様)
3. 戻り値の型を`RefreshImagesActionState`に変更
4. try-catchでエラーハンドリングを追加

### ステップ4: テストコードを修正

**修正ファイル**: `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshRandomCats } from "@/features/main/actions/refresh-images";
import { CACHE_TAG_LGTM_IMAGES_RANDOM } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

describe("refreshRandomCats", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates random tag and returns ja redirect URL", async () => {
    const result = await refreshRandomCats(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=random`,
    });
  });

  it("updates random tag and returns en redirect URL", async () => {
    const result = await refreshRandomCats(null, "en");

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

    const result = await refreshRandomCats(null, "ja");

    expect(result).toEqual({
      status: "ERROR",
      message: "Failed to refresh images",
    });
  });
});
```

**修正ファイル**: `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { afterEach, describe, expect, it, vi } from "vitest";
import { showLatestCats } from "@/features/main/actions/refresh-images";
import { CACHE_TAG_LGTM_IMAGES_LATEST } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

describe("showLatestCats", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates latest tag and returns ja redirect URL", async () => {
    const result = await showLatestCats(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=latest`,
    });
  });

  it("updates latest tag and returns en redirect URL", async () => {
    const result = await showLatestCats(null, "en");

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

    const result = await showLatestCats(null, "ja");

    expect(result).toEqual({
      status: "ERROR",
      message: "Failed to show latest images",
    });
  });
});
```

**変更点**:

1. `redirect`モックを削除
2. `prevState`引数 (`null`) を追加
3. 戻り値のアサーションを追加
4. エラーケースのテストを追加

### ステップ5: HomeActionButtonsを修正

**修正ファイル**: `src/features/main/components/home-action-buttons.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import {
  refreshRandomCats,
  showLatestCats,
} from "@/features/main/actions/refresh-images";
import { getActionButtonText } from "@/features/main/service-description-text";
import type { RefreshImagesActionState } from "@/features/main/types/action-state";
import {
  sendClickTopFetchNewArrivalCatButton,
  sendClickTopFetchRandomCatButton,
  sendCopyMarkdownFromRandomButton,
} from "@/utils/gtm";
import { withCallbacks } from "@/utils/with-callbacks";

/**
 * Server Action のエラーメッセージをユーザー向けにサニタイズする
 * API由来の内部メッセージをそのまま表示しないようにする
 */
function sanitizeErrorMessage(error: string): string {
  if (error === "No images available") {
    return "No images available. Please try again later.";
  }
  return "An unexpected error occurred. Please try again later.";
}

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function HomeActionButtons({ language, className }: Props) {
  const router = useRouter();
  const buttonText = getActionButtonText(language);

  // refreshRandomCats用のuseActionState
  // 注意: stateは現在未使用だが、将来のエラー表示拡張に備えて保持
  const [_refreshState, refreshAction, isRefreshPending] = useActionState(
    withCallbacks(
      async (
        prevState: RefreshImagesActionState,
        _formData: FormData,
      ): Promise<RefreshImagesActionState> => {
        return refreshRandomCats(prevState, language);
      },
      {
        onSuccess: (result) => {
          sendClickTopFetchRandomCatButton();
          router.push(result.redirectUrl);
        },
        onError: () => {
          addToast({
            title: "Error",
            description: "Failed to refresh images. Please try again later.",
            color: "danger",
          });
        },
      },
    ),
    null,
  );

  // showLatestCats用のuseActionState
  const [_latestState, latestAction, isLatestPending] = useActionState(
    withCallbacks(
      async (
        prevState: RefreshImagesActionState,
        _formData: FormData,
      ): Promise<RefreshImagesActionState> => {
        return showLatestCats(prevState, language);
      },
      {
        onSuccess: (result) => {
          sendClickTopFetchNewArrivalCatButton();
          router.push(result.redirectUrl);
        },
        onError: () => {
          addToast({
            title: "Error",
            description: "Failed to load latest images. Please try again later.",
            color: "danger",
          });
        },
      },
    ),
    null,
  );

  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRandomCopy = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await copyRandomCat();

      if (result.success) {
        try {
          await navigator.clipboard.writeText(result.markdown);
          setIsCopied(true);

          // GAイベント送信: ランダムコピー成功時
          sendCopyMarkdownFromRandomButton();

          if (copyTimerRef.current != null) {
            clearTimeout(copyTimerRef.current);
          }
          copyTimerRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 1500);
        } catch {
          addToast({
            title: "Copy Failed",
            description:
              "Failed to copy to clipboard. Please check browser permissions.",
            color: "danger",
          });
        }
      } else {
        addToast({
          title: "Error",
          description: sanitizeErrorMessage(result.error),
          color: "danger",
        });
      }
    } catch {
      addToast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
    },
    [],
  );

  return (
    <div
      className={`flex flex-col items-center gap-4 md:flex-row md:items-start ${className ?? ""}`}
    >
      <div className="relative w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.randomCopy}
          isLoading={isLoading}
          onPress={handleRandomCopy}
          showRepeatIcon={true}
        />
        {isCopied ? (
          <div
            aria-live="polite"
            className="-translate-x-1/2 absolute bottom-full left-1/2 mb-2 rounded bg-[#7B2F1D] px-4 py-2 font-semibold text-sm text-white"
          >
            Copied!
          </div>
        ) : null}
      </div>
      <form action={refreshAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.refreshCats}
          isLoading={isRefreshPending}
          showRandomIcon={true}
          type="submit"
        />
      </form>
      <form action={latestAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.latestCats}
          isLoading={isLatestPending}
          showCatIcon={true}
          type="submit"
        />
      </form>
    </div>
  );
}
```

**変更点**:

1. `useRouter`をインポート
2. `useActionState`をインポート
3. `withCallbacks`をインポート
4. `RefreshImagesActionState`型をインポート
5. `onSubmit`ハンドラを削除
6. `useActionState` + `withCallbacks`パターンで状態管理
7. `onSuccess`コールバックでGAイベント送信 + `router.push()`でリダイレクト
8. `pending`状態をボタンの`isLoading`に使用

## テストへの影響

### 修正が必要なテストファイル

| ファイル | 影響 | 対応 |
|---------|------|------|
| `refresh-random-cats.test.ts` | `redirect`モック不要、戻り値検証に変更 | 修正 |
| `show-latest-cats.test.ts` | 同上 | 修正 |

### 新規テストの追加

| ファイル | 内容 |
|---------|------|
| `src/utils/__tests__/with-callbacks.test.ts` | `withCallbacks`ユーティリティのテスト |

### withCallbacksのテスト (新規)

**新規ファイル**: `src/utils/__tests__/with-callbacks.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it, vi } from "vitest";
import { withCallbacks } from "@/utils/with-callbacks";

type TestActionState =
  | { readonly status: "SUCCESS"; readonly data: string }
  | { readonly status: "ERROR"; readonly message: string }
  | null;

describe("withCallbacks", () => {
  it("calls onSuccess callback when action returns SUCCESS status", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "SUCCESS",
      data: "test data",
    });
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[string], TestActionState>(mockAction, {
      onSuccess,
      onError,
    });

    const result = await wrappedAction("arg1");

    expect(mockAction).toHaveBeenCalledWith("arg1");
    expect(onSuccess).toHaveBeenCalledWith({ status: "SUCCESS", data: "test data" });
    expect(onError).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "SUCCESS", data: "test data" });
  });

  it("calls onError callback when action returns ERROR status", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "ERROR",
      message: "Something went wrong",
    });
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[string], TestActionState>(mockAction, {
      onSuccess,
      onError,
    });

    const result = await wrappedAction("arg1");

    expect(mockAction).toHaveBeenCalledWith("arg1");
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({ status: "ERROR", message: "Something went wrong" });
    expect(result).toEqual({ status: "ERROR", message: "Something went wrong" });
  });

  it("does not call callbacks when action returns null", async () => {
    const mockAction = vi.fn().mockResolvedValue(null);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[], TestActionState>(mockAction, {
      onSuccess,
      onError,
    });

    const result = await wrappedAction();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("works without onError callback", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "SUCCESS",
      data: "test",
    });
    const onSuccess = vi.fn();

    const wrappedAction = withCallbacks<[], TestActionState>(mockAction, {
      onSuccess,
    });

    await wrappedAction();

    expect(onSuccess).toHaveBeenCalled();
  });
});
```

## ファイル変更一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `src/features/main/types/action-state.ts` | 新規 | ActionState型定義 |
| `src/utils/with-callbacks.ts` | 新規 | withCallbacksユーティリティ |
| `src/utils/__tests__/with-callbacks.test.ts` | 新規 | withCallbacksのテスト |
| `src/features/main/actions/refresh-images.ts` | 修正 | redirect()から戻り値への変更 |
| `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts` | 修正 | 戻り値検証に変更 |
| `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts` | 修正 | 戻り値検証に変更 |
| `src/features/main/components/home-action-buttons.tsx` | 修正 | useActionState導入 |

## リスク分析

### 影響範囲

1. **Server Actionのシグネチャ変更**
   - `prevState`引数の追加
   - 戻り値の変更 (`void` → `RefreshImagesActionState`)

2. **リダイレクト方式の変更**
   - サーバー側`redirect()` → クライアント側`router.push()`
   - ユーザー体験への影響: ほぼなし (同じ動作)

### デグレードリスク

**中程度**:
- Server Actionのシグネチャ変更によりテストの修正が必要
- `redirect()`から`router.push()`への変更でSSR/クライアントの動作が若干異なる可能性

### 軽減策

1. テストを先に修正して動作確認
2. 開発サーバーで実際の動作確認
3. 英語版/日本語版両方で確認

## 品質管理手順

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

### 4. ビルド確認

```bash
npm run build
```

### 5. Chrome DevTools MCPを使用したブラウザ確認

**重要**: `CLAUDE.md`の品質管理手順に従い、Chrome DevTools MCPを使用して確認を行う。

#### 5-1. 日本語版ページの確認

**確認URL**: `http://localhost:2222`

**確認手順**:

1. Chrome DevTools MCPで `http://localhost:2222` を開く
2. `mcp__chrome-devtools__take_snapshot` でページ状態を確認
3. 「ねこリフレッシュ」ボタンをクリック (`mcp__chrome-devtools__click`)
4. リダイレクト後、`mcp__chrome-devtools__list_console_messages` でエラーがないことを確認
5. `mcp__chrome-devtools__evaluate_script` で以下を実行してGAイベントを確認:

```javascript
() => window.dataLayer.filter(e => e.event === "ClickTopFetchRandomCatButton")
```

**期待される結果**: GAイベントが1件以上存在すること

#### 5-2. 英語版ページの確認

**確認URL**: `http://localhost:2222/en`

同様の手順で英語版でも動作確認を行う。

#### 5-3. エラーケースの確認

意図的にネットワークエラーを発生させ、エラートーストが表示されることを確認する。

### 6. Storybook確認

**確認URL**: `http://localhost:6006/`

**確認手順**:

1. Chrome DevTools MCPで `http://localhost:6006/` を開く
2. `mcp__chrome-devtools__take_snapshot` でStorybookが正常に表示されることを確認
3. 関連するコンポーネントのストーリーを確認

**注意**: StorybookではServer Actionが動作しないため、UIの表示確認のみ

## 実装時の注意事項

### 必ず確認すべき事項

1. **useActionStateのシグネチャ**: `[state, action, isPending] = useActionState(fn, initialState)`
2. **Server ActionのprevState引数**: useActionStateと併用する場合は必須
3. **router.push()の使用**: Server Component内では使用不可、Client Componentで使用

### 禁止事項

1. **useEffectでのGAイベント送信**: withCallbacksパターンで代替
2. **redirect()との併用**: redirect()を使うとuseActionStateで状態管理できない
3. **手動でのuseMemo/useCallback**: `reactCompiler: true`が有効なため、React Compilerが自動メモ化を行う

## まとめ

この実装計画では、以下の改善を実現します:

1. **Server Action成功時のみGAイベントを送信** - アナリティクスの精度向上
2. **Server Action失敗時にエラートーストを表示** - ユーザー体験の向上
3. **`useEffect`を使用しない実装** - Robin Wieruchの`withCallbacks`パターンを採用
4. **`pending`状態を活用したローディング表示** - ボタンのisLoadingに反映
5. **テストコードの適切な更新** - 戻り値検証とエラーケースの追加
6. **Chrome DevTools MCPを使用した品質確認** - CLAUDE.mdの品質管理手順に準拠

### 主な変更ファイル

| ファイル | 操作 | 主な変更内容 |
|---------|------|------------|
| `src/features/main/types/action-state.ts` | 新規 | Server Action状態の型定義 |
| `src/utils/with-callbacks.ts` | 新規 | コールバック付きServer Actionラッパー |
| `src/features/main/actions/refresh-images.ts` | 修正 | redirect()から戻り値への変更 |
| `src/features/main/components/home-action-buttons.tsx` | 修正 | useActionState導入、エラートースト追加 |

### 期待される効果

- **アナリティクス精度向上**: 失敗したリクエストはGAに記録されない
- **ユーザー体験向上**: エラー時に適切なフィードバックが表示される
- **コードの保守性向上**: `useEffect`を使わないシンプルな実装
