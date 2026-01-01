# Issue #371: ランダムコピー機能のリファクタリング計画

## 概要

前回実装した「ランダムコピー」機能のリファクタリングを行う。具体的には以下を改善する：

1. **マークダウン生成ロジックを共通関数として切り出し**（DRY原則の適用）

> **注意**: 当初は `copyRandomCat` 関数を依存性注入パターンに改修する予定だったが、Server Actions は関数を引数として受け取れない（シリアライズ不可）ため、この方針は取りやめた。詳細は「6. 実装時の学び」を参照。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/371

## 変更対象ファイル一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `src/features/main/functions/generate-lgtm-markdown.ts` | 新規作成 | マークダウン生成関数 |
| `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` | 新規作成 | マークダウン生成関数のテスト |
| `src/features/main/actions/copy-random-cat.ts` | 修正 | 共通関数を利用するように変更 |
| `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` | 修正 | msw を使ったテストに改善 |
| `src/features/main/components/lgtm-image.tsx` | 修正 | 共通関数を利用するように変更 |

---

## 1. マークダウン生成関数の共通化

### 1.1 背景と目的

現在、マークダウン生成ロジックが2箇所に重複している：

**`src/features/main/components/lgtm-image.tsx` (26行目)**:
```typescript
const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
```

**`src/features/main/actions/copy-random-cat.ts` (30行目)**:
```typescript
const markdown = `[![LGTMeow](${selectedImage.imageUrl})](${appBaseUrl()})`;
```

このロジックを共通関数として切り出し、DRY原則に従った実装に改善する。

### 1.2 新規ファイル: `src/features/main/functions/generate-lgtm-markdown.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { LgtmImageUrl } from "@/features/main/types/lgtm-image";
import { appBaseUrl } from "@/features/url";

/**
 * LGTM画像のマークダウンソースを生成する
 *
 * @param imageUrl - LGTM画像のURL（LgtmImageUrl型）
 * @returns マークダウン形式の文字列
 *
 * @example
 * ```typescript
 * const markdown = generateLgtmMarkdown(createLgtmImageUrl("https://lgtm-images.lgtmeow.com/xxx.webp"));
 * // => "[![LGTMeow](https://lgtm-images.lgtmeow.com/xxx.webp)](https://lgtmeow.com)"
 * ```
 */
export function generateLgtmMarkdown(imageUrl: LgtmImageUrl): string {
  return `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
}
```

**実装ポイント**:
- 引数は `LgtmImageUrl` 型（Branded Type）で型安全性を確保
- `appBaseUrl()` は関数内部で呼び出す（features層の関数なので直接依存OK）
- JSDoc コメントで使用例を明示

### 1.3 新規ファイル: `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";

vi.mock("@/features/url", () => ({
  appBaseUrl: vi.fn(() => "https://lgtmeow.com"),
}));

describe("generateLgtmMarkdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should generate markdown with correct format", () => {
    const imageUrl = createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/test.webp"
    );

    const result = generateLgtmMarkdown(imageUrl);

    expect(result).toBe(
      "[![LGTMeow](https://lgtm-images.lgtmeow.com/test.webp)](https://lgtmeow.com)"
    );
  });

  it("should use appBaseUrl for the link destination", async () => {
    const { appBaseUrl } = await import("@/features/url");
    vi.mocked(appBaseUrl).mockReturnValue("https://example.com");

    const imageUrl = createLgtmImageUrl(
      "https://lgtm-images.lgtmeow.com/another.webp"
    );

    const result = generateLgtmMarkdown(imageUrl);

    expect(result).toBe(
      "[![LGTMeow](https://lgtm-images.lgtmeow.com/another.webp)](https://example.com)"
    );
    expect(appBaseUrl).toHaveBeenCalled();
  });
});
```

---

## 2. `copyRandomCat` の修正

### 2.1 実装方針

当初は依存性注入パターンを検討したが、Server Actions は関数を引数として受け取れないため、直接インポート形式を維持する。共通関数 `generateLgtmMarkdown` のみを利用するように変更する。

### 2.2 修正後のファイル: `src/features/main/actions/copy-random-cat.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
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

    // マークダウンソースを生成（共通関数を使用）
    const markdown = generateLgtmMarkdown(selectedImage.imageUrl);

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

**変更点**:
1. `appBaseUrl` のインポートを削除（共通関数内で呼び出されるため）
2. マークダウン生成に `generateLgtmMarkdown` 共通関数を使用

---

## 3. 呼び出し元の修正

### 3.1 `src/features/main/components/lgtm-image.tsx` の修正

**変更箇所（handleCopy 内）**:

```typescript
// 現在の実装（25-26行目）
const handleCopy = useCallback(() => {
  const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;
  // ...
}, [imageUrl]);

// 修正後の実装
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";

const handleCopy = useCallback(() => {
  const markdown = generateLgtmMarkdown(imageUrl);
  // ...
}, [imageUrl]);
```

**完全な修正差分**:

削除するインポート文:
```typescript
import { appBaseUrl } from "@/features/url";
```

追加するインポート文:
```typescript
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
```

---

## 4. テストの修正

### 4.1 `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` の修正

**msw を使用したテストに改善**:

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
import { copyRandomCat } from "@/features/main/actions/copy-random-cat";
import { fetchLgtmImagesInRandomUrl } from "@/features/main/functions/api-url";
import { mockIssueClientCredentialsAccessToken } from "@/mocks/api/external/cognito/mock-issue-client-credentials-access-token";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";

// Redis をモック（キャッシュなしを模擬）
vi.mock("@upstash/redis", () => {
  const MockRedis = class {
    get = vi.fn().mockResolvedValue(null);
    set = vi.fn().mockResolvedValue("OK");
    expire = vi.fn().mockResolvedValue(1);
  };
  return { Redis: MockRedis };
});

// appBaseUrl をモック（一貫したURLを返すため）
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

describe("copyRandomCat", () => {
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

    const result = await copyRandomCat();

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

    const result = await copyRandomCat();

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

    const result = await copyRandomCat();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("failed to issueAccessToken");
    }
  });
});
```

**テストの改善点**:
1. `vi.mock()` ではなく `msw` を使用してHTTPリクエストをモック
2. 既存のモックハンドラー（`mockIssueClientCredentialsAccessToken`, `mockFetchLgtmImages`）を再利用
3. Redis はクラスとして `vi.mock()` でモック（キャッシュなしを模擬）
4. `generateLgtmMarkdown` はモックせず、実際の実装を使用
5. `appBaseUrl` は `importOriginal` を使用して部分的にモック

---

## 5. 実装手順

以下の順序で実装を行う：

### ステップ1: マークダウン生成関数の作成
1. `src/features/main/functions/generate-lgtm-markdown.ts` を新規作成
2. `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` を新規作成
3. `npm run test` で新規テストがパスすることを確認

### ステップ2: `copyRandomCat` の修正
1. `src/features/main/actions/copy-random-cat.ts` を修正（共通関数を使用）
2. `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` を修正（msw を使用）
3. `npm run test` でテストがパスすることを確認

### ステップ3: 呼び出し元の修正
1. `src/features/main/components/lgtm-image.tsx` を修正

### ステップ4: 品質管理の実行
1. `npm run format` でコードをフォーマット
2. `npm run lint` でLintチェック
3. `npm run test` で全テストがパスすることを確認
4. Playwright MCP でブラウザ動作確認

---

## 6. 実装時の学び

### 6.1 Server Actions と依存性注入パターンの非互換性

**問題**: 当初の設計では `copyRandomCat` 関数を依存性注入パターンに改修する予定だったが、実装時に以下のエラーが発生した：

```
Error: Attempted to call a temporary Client Reference from the server but it is on the client.
It's not possible to invoke a client function from the server, it can only be rendered as a
Component or passed to props of a Client Component.
```

**原因**: Server Actions（`"use server"` ディレクティブ）は、クライアントとサーバー間でデータをシリアライズして送信する。JavaScript の関数はシリアライズ不可能なため、引数として渡すことができない。

**解決策**:
- 依存性注入パターンを取りやめ、直接インポート形式を維持
- テストでは `msw` を使用してHTTPリクエストをモック
- `generateLgtmMarkdown` 共通関数の切り出しのみを実施

### 6.2 msw を使用したテストのメリット

- より実践的なテスト（実際のHTTP通信に近い形でテスト可能）
- 既存のモックハンドラーを再利用できる
- `vi.mock()` より保守性が高い

---

## 7. 品質管理手順

### 7.1 コードフォーマット

```bash
npm run format
```

**期待される結果**: エラーなし

### 7.2 Lint チェック

```bash
npm run lint
```

**期待される結果**: エラーなし

### 7.3 テスト実行

```bash
npm run test
```

**期待される結果**: すべてのテストがパス

### 7.4 Playwright MCP を使用したブラウザ確認

#### 7.4.1 日本語版の確認

**確認URL**: `http://localhost:2222`

**確認手順**:
1. ブラウザを起動して `http://localhost:2222` に移動
2. スナップショットを取得して「ランダムコピー」ボタンの存在を確認
3. 「ランダムコピー」ボタンをクリック
4. 「Copied!」フィードバックが表示されることを確認
5. 1.5秒後に「Copied!」が非表示になることを確認

#### 7.4.2 LgtmImage コンポーネントのコピー機能確認

**確認手順**:
1. 日本語版のトップページで画像をクリック
2. 「Copied!」フィードバックが表示されることを確認
3. クリップボードの内容がマークダウン形式であることを確認

---

## 8. 依存関係の確認

### 8.1 新規インポートが必要なモジュール

**`lgtm-image.tsx` に追加**:
```typescript
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
```

**`lgtm-image.tsx` から削除**:
```typescript
import { appBaseUrl } from "@/features/url";
```

### 8.2 既存モジュールの依存関係

| モジュール | パス | 用途 |
|----------|------|------|
| `LgtmImageUrl` | `@/features/main/types/lgtm-image` | 画像URL の Branded Type |
| `appBaseUrl` | `@/features/url` | アプリベースURL取得 |
| `issueClientCredentialsAccessToken` | `@/lib/cognito/oidc` | アクセストークン取得の実装 |
| `fetchLgtmImagesInRandom` | `@/features/main/functions/fetch-lgtm-images` | ランダム画像取得の実装 |

---

## 9. リスク分析

### 9.1 後方互換性

- `copyRandomCat` のシグネチャは変更なし（引数なしのまま）
- 呼び出し元の修正は不要

### 9.2 デグレードリスク

**低い**:
- マークダウン生成ロジック自体は変更なし（共通関数への切り出しのみ）
- テストで動作を保証

### 9.3 セキュリティ考慮

- アクセストークン取得は引き続きサーバーサイドで実行
- クライアントへのトークン露出なし

---

## 10. まとめ

このリファクタリングにより、以下の改善を実現する：

1. ✅ **DRY原則の適用**: マークダウン生成ロジックを共通化
2. ✅ **テストの改善**: msw を使用したより実践的なテスト
3. ✅ **型安全性の維持**: Branded Types を活用した型安全な実装

**作成・修正ファイル数**: 5ファイル
- 新規: 2ファイル
- 修正: 3ファイル

**学び**: Server Actions は関数を引数として受け取れないため、依存性注入パターンは適用できない。代わりに msw を使用したテストで十分なテスタビリティを確保できる。
