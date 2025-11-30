# Issue #371: ランダムコピーボタンの実装計画

## 概要

「ランダムコピー」ボタンをクリックした際に、APIからランダムに取得したLGTM画像の中から1つを選び、そのマークダウンソースをクリップボードにコピーする機能を実装する。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/371

## 実装対象

### 対象機能

`buttonText.randomCopy`（「ランダムコピー」/「Copy Random Cat」）が設定されたボタンをクリックした際に：

1. APIからランダムなLGTM画像リストを取得
2. その中から1つをランダムに選択
3. マークダウンソースをクリップボードにコピー
4. 「Copied!」フィードバックを表示

### マークダウンソース形式

```markdown
[![LGTMeow](${imageUrl})](${appBaseUrl()})
```

例：
```markdown
[![LGTMeow](https://lgtm-images.lgtmeow.com/xxx.webp)](https://lgtmeow.com)
```

## 前提条件の確認

### 現在のファイル構造

```text
src/
├── features/
│   ├── main/
│   │   ├── actions/
│   │   │   ├── refresh-images.ts          # 既存: ねこリフレッシュ/新着順のServer Actions
│   │   │   └── __tests__/
│   │   │       └── refresh-images/
│   │   ├── components/
│   │   │   ├── home-action-buttons.tsx    # 修正対象: ランダムコピーボタン
│   │   │   ├── home-page-container.tsx    # 親コンポーネント
│   │   │   ├── lgtm-image.tsx            # 参考: handleCopy の実装
│   │   │   └── lgtm-images.tsx
│   │   ├── functions/
│   │   │   └── fetch-lgtm-images.ts      # 再利用: fetchLgtmImagesInRandom
│   │   └── types/
│   │       └── lgtm-image.ts             # 型定義: LgtmImage, LgtmImageUrl
│   └── url.ts                            # appBaseUrl() の定義
├── components/
│   └── icon-button.tsx                   # IconButton コンポーネント
└── lib/
    └── cognito/
        └── oidc.ts                       # issueClientCredentialsAccessToken
```

### 参考実装

#### `lgtm-image.tsx` の `handleCopy` 実装

```typescript
const handleCopy = useCallback(() => {
  const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
  navigator.clipboard.writeText(markdown);
  setIsCopied(true);
  if (copyTimerRef.current != null) {
    clearTimeout(copyTimerRef.current);
  }
  copyTimerRef.current = setTimeout(() => {
    setIsCopied(false);
  }, 1500);
}, [imageUrl]);
```

**ポイント**:
- `appBaseUrl()` を使ってアプリのベースURLを取得
- `navigator.clipboard.writeText()` でクリップボードにコピー
- 1500ms後に `isCopied` をリセット

#### `home-action-buttons.tsx` の現在の実装

```typescript
export function HomeActionButtons({ language, className }: Props) {
  const buttonText = getActionButtonText(language);
  const refreshRandomCatsAction = refreshRandomCats.bind(null, language);
  const showLatestCatsAction = showLatestCats.bind(null, language);

  return (
    <div className={`flex flex-col items-center gap-4 md:flex-row md:items-start ${className ?? ""}`}>
      {/* ランダムコピーボタン - 現在はクリックハンドラなし */}
      <IconButton
        className="w-full md:w-[240px]"
        displayText={buttonText.randomCopy}
        showRepeatIcon={true}
      />
      {/* 他のボタン... */}
    </div>
  );
}
```

**問題点**:
- ランダムコピーボタンにはクリックハンドラが設定されていない
- コンポーネントがサーバーコンポーネントとして動作している

## 実装方針

### アーキテクチャの選択

**採用方式**: Server Action + クライアントコンポーネント

**理由**:
1. 既存の `fetchLgtmImagesInRandom` を再利用可能
2. アクセストークン取得はサーバーサイドで行う必要がある
3. クリップボードAPIはクライアントサイドでのみ使用可能
4. フィードバック表示（`isCopied` 状態）にはクライアント状態管理が必要

### レビュー指摘事項への対応

| 指摘 | 重要度 | 対応方針 |
|------|--------|---------|
| `onClick` と `onPress` の型不整合 | 重大 | `IconButton` に `onPress?: ButtonProps["onPress"]` を追加し、`ComponentProps<"button">` から `onClick` を除外 |
| コピー失敗時のフィードバック不足 | 中 | HeroUI トーストでエラーメッセージを表示 |
| ローディング中のボタン状態表示なし | 軽微 | `IconButton` に `isLoading` プロパティを追加し、HeroUI Button の `isLoading` を使用 |
| ローディング中のボタン無効化 | 軽微 | `isDisabled={isPressed \|\| isLoading}` とし、多重入力を確実に防止 |
| エラーメッセージの露出範囲 | 軽微 | API由来の内部メッセージをユーザー向け文言にサニタイズして表示 |

### 処理フロー

```
[ユーザー]
    │
    ▼ ボタンクリック
[HomeActionButtons (Client)]
    │
    ▼ Server Action 呼び出し
[copyRandomCat Server Action]
    │
    ├─▶ issueClientCredentialsAccessToken() でアクセストークン取得
    │
    ├─▶ fetchLgtmImagesInRandom() でランダム画像リスト取得
    │
    ├─▶ 画像リストから1つをランダムに選択
    │
    └─▶ マークダウンソースを生成して返す
    │
[HomeActionButtons (Client)]
    │
    ├─▶ navigator.clipboard.writeText() でコピー
    │
    └─▶ 「Copied!」フィードバックを表示（1500ms後に非表示）
```

## 実装手順

### ステップ1: Server Action の作成

**新規ファイル**: `src/features/main/actions/copy-random-cat.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { appBaseUrl } from "@/features/url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

export type CopyRandomCatResult =
  | { readonly success: true; readonly markdown: string }
  | { readonly success: false; readonly error: string };

/**
 * ランダムなLGTM画像を1つ取得し、マークダウンソースを返す
 */
export async function copyRandomCat(): Promise<CopyRandomCatResult> {
  try {
    const accessToken = await issueClientCredentialsAccessToken();
    const lgtmImages = await fetchLgtmImagesInRandom(accessToken);

    if (lgtmImages.length === 0) {
      return { success: false, error: "No images available" };
    }

    // ランダムに1つ選択
    const randomIndex = Math.floor(Math.random() * lgtmImages.length);
    const selectedImage = lgtmImages[randomIndex];

    // マークダウンソースを生成
    const markdown = `[![LGTMeow](${selectedImage.imageUrl})](${appBaseUrl()})`;

    return { success: true, markdown };
  } catch (error) {
    console.error("Failed to copy random cat:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
```

**実装ポイント**:
- `"use server"` ディレクティブでServer Actionとして定義
- 結果型を Union Type で定義し、成功/失敗を明確に区別
- `appBaseUrl()` はサーバーサイドでも実行可能（環境変数から取得）
- エラーハンドリングを適切に行い、クライアントにエラー情報を返す

### ステップ2: `HomeActionButtons` のクライアントコンポーネント化

**修正ファイル**: `src/features/main/components/home-action-buttons.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use client";

import { addToast } from "@heroui/toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import {
  refreshRandomCats,
  showLatestCats,
} from "@/features/main/actions/refresh-images";
import { getActionButtonText } from "@/features/main/service-description-text";

/**
 * Server Action のエラーメッセージをユーザー向けにサニタイズする
 * API由来の内部メッセージをそのまま表示しないようにする
 */
function sanitizeErrorMessage(error: string): string {
  // 既知のエラーメッセージはそのまま表示
  if (error === "No images available") {
    return "No images available. Please try again later.";
  }
  // API由来などの予期しないエラーは汎用メッセージに置換
  return "An unexpected error occurred. Please try again later.";
}

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function HomeActionButtons({ language, className }: Props) {
  const buttonText = getActionButtonText(language);
  const refreshRandomCatsAction = refreshRandomCats.bind(null, language);
  const showLatestCatsAction = showLatestCats.bind(null, language);

  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRandomCopy = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await copyRandomCat();

      if (result.success) {
        try {
          await navigator.clipboard.writeText(result.markdown);
          setIsCopied(true);

          if (copyTimerRef.current != null) {
            clearTimeout(copyTimerRef.current);
          }
          copyTimerRef.current = setTimeout(() => {
            setIsCopied(false);
          }, 1500);
        } catch {
          // クリップボードへの書き込みに失敗した場合
          addToast({
            title: "Copy Failed",
            description: "Failed to copy to clipboard. Please check browser permissions.",
            color: "danger",
          });
        }
      } else {
        // Server Action がエラーを返した場合（エラーメッセージをサニタイズ）
        addToast({
          title: "Error",
          description: sanitizeErrorMessage(result.error),
          color: "danger",
        });
      }
    } catch {
      // 予期しないエラーの場合（汎用メッセージを表示）
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
    []
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
            className="absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded bg-[#7B2F1D] px-4 py-2 font-semibold text-sm text-white"
          >
            Copied!
          </div>
        ) : null}
      </div>
      <form action={refreshRandomCatsAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.refreshCats}
          showRandomIcon={true}
          type="submit"
        />
      </form>
      <form action={showLatestCatsAction} className="w-full md:w-auto">
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.latestCats}
          showCatIcon={true}
          type="submit"
        />
      </form>
    </div>
  );
}
```

**変更点**:
1. `"use client"` ディレクティブを追加
2. `addToast` を `@heroui/toast` からインポート
3. `useState`, `useCallback`, `useRef`, `useEffect` をインポート
4. `isCopied`, `isLoading` 状態を追加
5. `handleRandomCopy` コールバック関数を追加
6. ランダムコピーボタンに `onPress={handleRandomCopy}` を追加（**`onClick` ではなく `onPress` を使用**）
7. ランダムコピーボタンに `isLoading={isLoading}` を追加（**ローディング状態の視覚的フィードバック**）
8. 「Copied!」フィードバック表示を追加（ボタン下部に絶対配置）
9. **エラー発生時にトースト通知を表示**（クリップボード書き込み失敗、Server Action エラー、予期しないエラー）
10. クリーンアップ用の `useEffect` を追加

### ステップ3: `IconButton` の型安全な `onPress` と `isLoading` 対応

**ファイル**: `src/components/icon-button.tsx`

#### 問題点（レビュー指摘）

現在の `IconButton` は `ComponentProps<"button">` を継承しており、`onClick` は `MouseEvent<HTMLButtonElement>` を受け取る型です。しかし、HeroUI の `Button` コンポーネントは `onPress` を使用し、これは `PressEvent` を受け取るシグネチャです。この2つは**型として非互換**であり、そのままマッピングすると型エラーまたはランタイム挙動の不整合が発生します。

#### 解決策

`ComponentProps<"button">` から `onClick` を除外し、代わりに `ButtonProps["onPress"]` を直接使用します。また、`isLoading` プロパティを追加して、ローディング状態の視覚的フィードバックを実現します。

**完全な修正コード**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";
import { Button, type ButtonProps } from "@heroui/react";
import Link from "next/link";
import type { ComponentProps, JSX } from "react";
import type { IncludeLanguageAppPath } from "@/features/url";
import { GithubIcon } from "./icons/github-icon";

// ... アイコンコンポーネント（RepeatIcon, RandomIcon, CatIcon）は変更なし ...

// onClick を除外し、onPress と isLoading を追加
type Props = Omit<ComponentProps<"button">, "onClick"> & {
  readonly displayText: string;
  readonly showGithubIcon?: boolean;
  readonly showRepeatIcon?: boolean;
  readonly showRandomIcon?: boolean;
  readonly showCatIcon?: boolean;
  readonly isPressed?: boolean;
  readonly isLoading?: boolean;
  readonly className?: string;
  readonly link?: IncludeLanguageAppPath;
  readonly onPress?: ButtonProps["onPress"];
};

export function IconButton({
  type,
  displayText,
  showGithubIcon,
  showRepeatIcon,
  showRandomIcon,
  showCatIcon,
  isPressed,
  isLoading,
  className,
  link,
  onPress,
}: Props): JSX.Element {
  // Figmaデザインに基づくスタイル（デザイントークン使用）
  const buttonClasses = `inline-flex items-center justify-center gap-2 rounded-lg px-7 py-2 font-bold font-inter text-xl text-text-br transition-colors duration-200 ${
    isPressed === true
      ? "bg-button-secondary-active"
      : "bg-button-secondary-base hover:bg-button-secondary-hover"
  } ${className ?? ""}`;

  const startContent = (
    <span aria-hidden="true" className="flex items-center gap-2">
      {showGithubIcon === true && (
        <GithubIcon color="default" height={20} width={20} />
      )}
      {showRepeatIcon === true && <RepeatIcon />}
      {showRandomIcon === true && <RandomIcon />}
      {showCatIcon === true && <CatIcon />}
    </span>
  );

  if (link != null) {
    return (
      <Button
        as={Link}
        className={buttonClasses}
        href={link}
        startContent={startContent}
      >
        {displayText}
      </Button>
    );
  }

  return (
    <Button
      className={buttonClasses}
      isDisabled={isPressed === true || isLoading === true}
      isLoading={isLoading}
      onPress={onPress}
      startContent={startContent}
      type={type}
    >
      {displayText}
    </Button>
  );
}
```

**変更点**:
1. `ButtonProps` を `@heroui/react` からインポート
2. 型定義で `Omit<ComponentProps<"button">, "onClick">` を使用して `onClick` を除外
3. `onPress?: ButtonProps["onPress"]` を追加（**型安全なイベントハンドラ**）
4. `isLoading?: boolean` を追加（**ローディング状態の視覚的フィードバック**）
5. HeroUI `Button` に `isLoading={isLoading}` を渡す
6. `onPress` を直接 HeroUI `Button` に渡す（型が一致するため変換不要）
7. 全てのプロパティに `readonly` を追加（コーディング規約準拠）
8. **`isDisabled={isPressed === true || isLoading === true}`** としてローディング中も無効化（**多重入力防止の強化**）

### ステップ4: テストの作成

**新規ファイル**: `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import { createLgtmImageId, createLgtmImageUrl } from "@/features/main/types/lgtm-image";

// モック設定
vi.mock("@/lib/cognito/oidc", () => ({
  issueClientCredentialsAccessToken: vi.fn(),
}));

vi.mock("@/features/main/functions/fetch-lgtm-images", () => ({
  fetchLgtmImagesInRandom: vi.fn(),
}));

vi.mock("@/features/url", () => ({
  appBaseUrl: vi.fn(() => "https://lgtmeow.com"),
}));

describe("copyRandomCat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return markdown when images are available", async () => {
    const mockAccessToken = "mock-access-token";
    const mockImages = [
      {
        id: createLgtmImageId(1),
        imageUrl: createLgtmImageUrl("https://lgtm-images.lgtmeow.com/test1.webp"),
      },
      {
        id: createLgtmImageId(2),
        imageUrl: createLgtmImageUrl("https://lgtm-images.lgtmeow.com/test2.webp"),
      },
    ];

    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );
    const { fetchLgtmImagesInRandom } = await import(
      "@/features/main/functions/fetch-lgtm-images"
    );

    vi.mocked(issueClientCredentialsAccessToken).mockResolvedValue(
      mockAccessToken as never
    );
    vi.mocked(fetchLgtmImagesInRandom).mockResolvedValue(mockImages);

    // Math.random をモックして特定のインデックスを選択させる
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await copyRandomCat();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toBe(
        "[![LGTMeow](https://lgtm-images.lgtmeow.com/test1.webp)](https://lgtmeow.com)"
      );
    }
  });

  it("should return error when no images are available", async () => {
    const mockAccessToken = "mock-access-token";

    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );
    const { fetchLgtmImagesInRandom } = await import(
      "@/features/main/functions/fetch-lgtm-images"
    );

    vi.mocked(issueClientCredentialsAccessToken).mockResolvedValue(
      mockAccessToken as never
    );
    vi.mocked(fetchLgtmImagesInRandom).mockResolvedValue([]);

    const result = await copyRandomCat();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("No images available");
    }
  });

  it("should return error when API call fails", async () => {
    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );

    vi.mocked(issueClientCredentialsAccessToken).mockRejectedValue(
      new Error("API Error")
    );

    const result = await copyRandomCat();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("API Error");
    }
  });
});
```

## ファイル変更一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `src/features/main/actions/copy-random-cat.ts` | 新規作成 | Server Action の実装 |
| `src/features/main/components/home-action-buttons.tsx` | 修正 | クライアントコンポーネント化、`onPress` ハンドラ追加、エラー時トースト表示 |
| `src/components/icon-button.tsx` | 修正 | `onClick` を除外し `onPress` を追加、`isLoading` プロパティ追加 |
| `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` | 新規作成 | Server Action のテスト |

## 依存関係の確認

### 使用する既存モジュール

| モジュール | パス | 用途 |
|----------|------|------|
| `issueClientCredentialsAccessToken` | `@/lib/cognito/oidc` | アクセストークン取得 |
| `fetchLgtmImagesInRandom` | `@/features/main/functions/fetch-lgtm-images` | ランダム画像取得 |
| `appBaseUrl` | `@/features/url` | アプリベースURL取得 |
| `LgtmImage`, `LgtmImageUrl` | `@/features/main/types/lgtm-image` | 型定義 |
| `IconButton` | `@/components/icon-button` | ボタンコンポーネント |
| `getActionButtonText` | `@/features/main/service-description-text` | ボタンテキスト取得 |
| `refreshRandomCats`, `showLatestCats` | `@/features/main/actions/refresh-images` | 既存Server Actions |

### 新規追加するimport

**`home-action-buttons.tsx`**:
```typescript
import { addToast } from "@heroui/toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
```

**`icon-button.tsx`**:
```typescript
import { Button, type ButtonProps } from "@heroui/react";
// ※ Button は既存、ButtonProps を追加
```

## リスク分析

### 影響範囲

1. **`HomeActionButtons` のクライアントコンポーネント化**
   - 既存の Server Action（`refreshRandomCats`, `showLatestCats`）の動作には影響しない
   - `form action` による Server Action 呼び出しはクライアントコンポーネントでも正常に動作する

2. **`IconButton` の修正**
   - **型定義の変更**: `ComponentProps<"button">` から `onClick` を除外し、`onPress` を追加
   - **後方互換性**: 既存の使用箇所では `onClick` を使用していないため、影響なし
   - **`link` プロパティ使用時**: `onPress` は設定されないため、既存の動作に影響なし
   - **`isLoading` プロパティ追加**: オプショナルのため既存コードへの影響なし

### デグレードリスク

**低い**:
- Server Action は独立した新規実装
- `IconButton` の型変更は後方互換性を維持
- 型安全性により実装ミスを防止（`onPress` と `onClick` の型不整合を解消）

### セキュリティ考慮

- アクセストークン取得はサーバーサイドで実行（クライアントに露出しない）
- API 呼び出しは既存の認証フローを使用
- クリップボードへの書き込みは `navigator.clipboard.writeText()` を使用（読み取り権限不要）

## 品質管理手順

### 1. コードフォーマット

```bash
npm run format
```

**期待される結果**: エラーなし

### 2. Lint チェック

```bash
npm run lint
```

**期待される結果**: エラーなし

### 3. テスト実行

```bash
npm run test
```

**期待される結果**: すべてのテストがパス

### 4. Playwright MCP を使用したブラウザ確認

#### 4-1. 日本語版の確認

**確認URL**: `http://localhost:2222`

**確認手順**:

1. ブラウザを起動して `http://localhost:2222` に移動
2. スナップショットを取得して「ランダムコピー」ボタンの存在を確認
3. 「ランダムコピー」ボタンをクリック
4. 「Copied!」フィードバックが表示されることを確認
5. 1.5秒後に「Copied!」が非表示になることを確認
6. クリップボードの内容がマークダウン形式であることを確認（手動またはスクリプトで）

**期待される動作**:
- ボタンクリック後、ボタン下部に「Copied!」が表示される
- 1.5秒後に「Copied!」が非表示になる
- クリップボードに `[![LGTMeow](画像URL)](https://lgtmeow.com)` 形式のテキストがコピーされる

#### 4-2. 英語版の確認

**確認URL**: `http://localhost:2222/en/`

**確認手順**:

1. ブラウザを起動して `http://localhost:2222/en/` に移動
2. スナップショットを取得して「Copy Random Cat」ボタンの存在を確認
3. 「Copy Random Cat」ボタンをクリック
4. 「Copied!」フィードバックが表示されることを確認
5. 1.5秒後に「Copied!」が非表示になることを確認

### 5. Storybook での確認

**確認URL**: `http://localhost:6006/`

#### 5-1. 既存の Storybook ストーリーの確認

現在、`HomeActionButtons` 用の Storybook ストーリーが存在するか確認が必要です。存在しない場合は以下の追加を検討してください。

**新規ストーリーファイル（任意）**: `src/features/main/components/home-action-buttons.stories.tsx`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Meta, StoryObj } from "@storybook/react";
import { HomeActionButtons } from "./home-action-buttons";

const meta = {
  component: HomeActionButtons,
  title: "features/main/HomeActionButtons",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HomeActionButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
  },
};

export const English: Story = {
  args: {
    language: "en",
  },
};
```

**確認項目**:
- 日本語版で「ランダムコピー」ボタンが表示されること
- 英語版で「Copy Random Cat」ボタンが表示されること
- ボタンをクリックして「Copied!」フィードバックが表示されること（Server Action のモックが必要な場合あり）

### 6. Chrome DevTools MCP でのデバッグ（必要に応じて）

デザイン崩れやスタイルの問題が発生した場合：

1. Chrome DevTools MCP で対象ページを開く
2. Elements パネルで「Copied!」表示のスタイルを確認
3. 必要に応じてスタイルを調整

## 実装時の注意事項

### 必ず確認すべき事項

1. **`"use client"` ディレクティブの追加**: `home-action-buttons.tsx` に必ず追加
2. **`onClick` ではなく `onPress` を使用**: HeroUI Button は `onPress` を使用するため、`IconButton` では `ButtonProps["onPress"]` 型を使用
3. **型定義の一貫性**: `CopyRandomCatResult` 型を正しく定義、`IconButton` の Props では `Omit` を使用して `onClick` を除外
4. **クリーンアップ**: タイマーのクリーンアップを `useEffect` で行う
5. **エラーハンドリング**: クリップボード書き込み失敗時も含め、全てのエラーケースでトースト通知を表示
6. **ローディング状態**: `isLoading` プロパティを使用してボタンの視覚的フィードバックを提供
7. **ローディング中のボタン無効化**: `isDisabled={isPressed === true || isLoading === true}` として多重入力を確実に防止
8. **エラーメッセージのサニタイズ**: `sanitizeErrorMessage` 関数を使用し、API由来の内部メッセージをそのまま表示しない

### 禁止事項

1. **アクセストークンのクライアント露出**: Server Action 内でのみ使用
2. **既存の Server Action の変更**: `refreshRandomCats`, `showLatestCats` は変更しない
3. **テストコードでのハードコード**: モックを適切に使用する
4. **`onClick` と `onPress` の混同**: HeroUI の `onPress` は `PressEvent` を受け取るため、`MouseEvent` 型の `onClick` をそのまま渡さない
5. **API由来のエラーメッセージをそのまま表示**: 必ず `sanitizeErrorMessage` を通してユーザー向けメッセージに変換する

## フィードバック表示のスタイル詳細

「Copied!」フィードバックは `LgtmImage` コンポーネントと同様のスタイルを採用：

```css
/* 背景色 */
background-color: #7B2F1D;

/* テキスト */
color: white;
font-weight: 600; /* font-semibold */
font-size: 0.875rem; /* text-sm */

/* パディング */
padding: 0.5rem 1rem; /* py-2 px-4 */

/* 角丸 */
border-radius: 0.25rem; /* rounded */

/* 配置 */
position: absolute;
top: 100%; /* ボタン下部 */
left: 50%;
transform: translateX(-50%);
margin-top: 0.5rem; /* mt-2 */
```

## 補足情報

### HeroUI Toast について

Issue #371 の補足情報には「トーストなのかツールチップなのか」という記載がありましたが、今回はユーザーの希望により「LgtmImage と同様」の方式を採用しました。

将来的にトースト通知に変更する場合は、以下のように実装可能です：

```typescript
import { addToast } from "@heroui/toast";

// コピー成功時
addToast({
  title: "Copied!",
  description: "Markdown has been copied to clipboard",
  color: "success",
});
```

### エラーハンドリング（実装済み）

本実装計画では、レビュー指摘に基づき、以下のエラーケースでトースト通知を表示するよう設計しています：

1. **Server Action エラー時**: `result.success === false` の場合
2. **クリップボード書き込み失敗時**: `navigator.clipboard.writeText()` が失敗した場合
3. **予期しないエラー時**: try-catch で捕捉されたその他のエラー

```typescript
// 実装例（HomeActionButtons の handleRandomCopy 内）
if (!result.success) {
  addToast({
    title: "Error",
    description: sanitizeErrorMessage(result.error),
    color: "danger",
  });
}
```

## まとめ

この実装計画では、以下の機能を実現します：

1. ✅ 「ランダムコピー」ボタンのクリックでランダムなLGTM画像のマークダウンをコピー
2. ✅ API から画像を取得し、その中から1つをランダムに選択
3. ✅ `LgtmImage` と同様の「Copied!」フィードバック表示
4. ✅ **型安全な実装**（`onPress` と `onClick` の型不整合を解消）
5. ✅ **エラー時のトースト通知**（クリップボード書き込み失敗、Server Action エラー）
6. ✅ **ローディング状態の視覚的フィードバック**（HeroUI Button の `isLoading` 使用）
7. ✅ テストカバレッジの確保
8. ✅ **ローディング中のボタン無効化**（`isDisabled` で多重入力を確実に防止）
9. ✅ **エラーメッセージのサニタイズ**（API内部メッセージをユーザー向け文言に変換）

**主な変更ファイル**:
- `src/features/main/actions/copy-random-cat.ts`（新規）
- `src/features/main/components/home-action-buttons.tsx`（修正）
- `src/components/icon-button.tsx`（修正）
- `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts`（新規）

## レビュー指摘対応チェックリスト

### 初回レビュー（v1）

| 指摘事項 | 対応状況 | 対応内容 |
|---------|---------|---------|
| `onClick` と `onPress` の型不整合 | ✅ 対応済み | `IconButton` の Props で `Omit<ComponentProps<"button">, "onClick">` を使用し、`onPress?: ButtonProps["onPress"]` を追加 |
| コピー失敗時のフィードバック不足 | ✅ 対応済み | `addToast` でエラー通知を表示（クリップボード失敗、Server Action エラー、予期しないエラー） |
| ローディング中のボタン状態表示なし | ✅ 対応済み | `IconButton` に `isLoading` プロパティを追加し、HeroUI Button の `isLoading` を使用 |

### 再レビュー（v2）

| 指摘事項 | 対応状況 | 対応内容 |
|---------|---------|---------|
| ローディング中のボタン無効化 | ✅ 対応済み | `isDisabled={isPressed === true \|\| isLoading === true}` としてローディング中も物理的に押下不可に |
| エラーメッセージの露出範囲 | ✅ 対応済み | `sanitizeErrorMessage` 関数を追加し、API由来の内部メッセージをユーザー向け汎用メッセージに変換 |
