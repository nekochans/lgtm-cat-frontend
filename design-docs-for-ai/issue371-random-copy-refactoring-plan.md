# Issue #371: ランダムコピー機能のリファクタリング計画

## 概要

前回実装した「ランダムコピー」機能のリファクタリングを行う。具体的には以下の2点を改善する：

1. **`copyRandomCat` 関数の引数を依存性注入パターンに改修**
2. **マークダウン生成ロジックを共通関数として切り出し**

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/371

## 変更対象ファイル一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `src/features/main/functions/generate-lgtm-markdown.ts` | 新規作成 | マークダウン生成関数 |
| `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` | 新規作成 | マークダウン生成関数のテスト |
| `src/features/main/actions/copy-random-cat.ts` | 修正 | 引数を依存性注入パターンに変更、共通関数を利用 |
| `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` | 修正 | 引数変更に伴うテスト修正 |
| `src/features/main/components/home-action-buttons.tsx` | 修正 | `copyRandomCat` の呼び出し方法を変更 |
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

## 2. `copyRandomCat` の引数改修

### 2.1 背景と目的

現在の `copyRandomCat` 関数は、`lib` 層の技術的な関数を直接インポートしている：

**現在の実装（`src/features/main/actions/copy-random-cat.ts`）**:
```typescript
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { appBaseUrl } from "@/features/url";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

export async function copyRandomCat(): Promise<CopyRandomCatResult> {
  const accessToken = await issueClientCredentialsAccessToken();
  const lgtmImages = await fetchLgtmImagesInRandom(accessToken);
  // ...
}
```

これを依存性注入パターンに変更し、テスタビリティと関心の分離を改善する。

### 2.2 型定義の確認

以下の型が既に存在する：

**`src/features/oidc/types/access-token.ts`**:
```typescript
export type JwtAccessTokenString = string & {
  readonly __brand: "jwtAccessTokenString";
};

export type IssueClientCredentialsAccessToken =
  () => Promise<JwtAccessTokenString>;
```

**`src/features/main/types/lgtm-image.ts`**:
```typescript
export type FetchLgtmImages = (
  accessToken: JwtAccessTokenString
) => Promise<LgtmImage[]>;
```

### 2.3 修正後のファイル: `src/features/main/actions/copy-random-cat.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import type { FetchLgtmImages } from "@/features/main/types/lgtm-image";
import type { IssueClientCredentialsAccessToken } from "@/features/oidc/types/access-token";

export type CopyRandomCatResult =
  | { readonly success: true; readonly markdown: string }
  | { readonly success: false; readonly error: string };

/**
 * copyRandomCat に渡す依存関数のDTO
 */
export type CopyRandomCatDto = {
  readonly issueAccessTokenFunc: IssueClientCredentialsAccessToken;
  readonly fetchLgtmImagesFunc: FetchLgtmImages;
};

/**
 * ランダムなLGTM画像を1つ取得し、マークダウンソースを返す
 *
 * @param dto - 依存関数を含むDTO
 * @returns 成功時はマークダウン文字列、失敗時はエラーメッセージ
 */
export async function copyRandomCat(
  dto: CopyRandomCatDto
): Promise<CopyRandomCatResult> {
  const { issueAccessTokenFunc, fetchLgtmImagesFunc } = dto;

  try {
    const accessToken = await issueAccessTokenFunc();
    const lgtmImages = await fetchLgtmImagesFunc(accessToken);

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
1. `issueClientCredentialsAccessToken` と `fetchLgtmImagesInRandom` の直接インポートを削除
2. `CopyRandomCatDto` 型を新規定義
3. 引数として `dto: CopyRandomCatDto` を受け取るように変更
4. マークダウン生成に `generateLgtmMarkdown` 共通関数を使用
5. `appBaseUrl` のインポートを削除（共通関数内で呼び出されるため）

---

## 3. 呼び出し元の修正

### 3.1 `src/features/main/components/home-action-buttons.tsx` の修正

**変更箇所（handleRandomCopy 内）**:

```typescript
// 現在の実装
const result = await copyRandomCat();

// 修正後の実装
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";

const result = await copyRandomCat({
  issueAccessTokenFunc: issueClientCredentialsAccessToken,
  fetchLgtmImagesFunc: fetchLgtmImagesInRandom,
});
```

**完全な修正差分**:

追加するインポート文（ファイル先頭付近）:
```typescript
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
```

handleRandomCopy 関数内の変更（49行目付近）:
```typescript
// Before
const result = await copyRandomCat();

// After
const result = await copyRandomCat({
  issueAccessTokenFunc: issueClientCredentialsAccessToken,
  fetchLgtmImagesFunc: fetchLgtmImagesInRandom,
});
```

### 3.2 `src/features/main/components/lgtm-image.tsx` の修正

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

handleCopy 関数内の変更（25-26行目）:
```typescript
// Before
const handleCopy = useCallback(() => {
  const markdown = `[![LGTMeow](${imageUrl})](${appBaseUrl()})`;

// After
const handleCopy = useCallback(() => {
  const markdown = generateLgtmMarkdown(imageUrl);
```

---

## 4. テストの修正

### 4.1 `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` の修正

**修正後の完全なコード**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  copyRandomCat,
  type CopyRandomCatDto,
} from "@/features/main/actions/copy-random-cat";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtm-image";
import { createJwtAccessTokenString } from "@/features/oidc/types/access-token";

// generateLgtmMarkdown のモック
vi.mock("@/features/main/functions/generate-lgtm-markdown", () => ({
  generateLgtmMarkdown: vi.fn(
    (imageUrl: string) => `[![LGTMeow](${imageUrl})](https://lgtmeow.com)`
  ),
}));

describe("copyRandomCat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return markdown when images are available", async () => {
    const mockAccessToken = createJwtAccessTokenString("mock-access-token");
    const mockImages = [
      {
        id: createLgtmImageId(1),
        imageUrl: createLgtmImageUrl(
          "https://lgtm-images.lgtmeow.com/test1.webp"
        ),
      },
      {
        id: createLgtmImageId(2),
        imageUrl: createLgtmImageUrl(
          "https://lgtm-images.lgtmeow.com/test2.webp"
        ),
      },
    ];

    const mockDto: CopyRandomCatDto = {
      issueAccessTokenFunc: vi.fn().mockResolvedValue(mockAccessToken),
      fetchLgtmImagesFunc: vi.fn().mockResolvedValue(mockImages),
    };

    // Math.random をモックして特定のインデックスを選択させる
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await copyRandomCat(mockDto);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toBe(
        "[![LGTMeow](https://lgtm-images.lgtmeow.com/test1.webp)](https://lgtmeow.com)"
      );
    }
    expect(mockDto.issueAccessTokenFunc).toHaveBeenCalledTimes(1);
    expect(mockDto.fetchLgtmImagesFunc).toHaveBeenCalledWith(mockAccessToken);
  });

  it("should return error when no images are available", async () => {
    const mockAccessToken = createJwtAccessTokenString("mock-access-token");

    const mockDto: CopyRandomCatDto = {
      issueAccessTokenFunc: vi.fn().mockResolvedValue(mockAccessToken),
      fetchLgtmImagesFunc: vi.fn().mockResolvedValue([]),
    };

    const result = await copyRandomCat(mockDto);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("No images available");
    }
  });

  it("should return error when issueAccessTokenFunc fails", async () => {
    const mockDto: CopyRandomCatDto = {
      issueAccessTokenFunc: vi.fn().mockRejectedValue(new Error("Token Error")),
      fetchLgtmImagesFunc: vi.fn(),
    };

    const result = await copyRandomCat(mockDto);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Token Error");
    }
    expect(mockDto.fetchLgtmImagesFunc).not.toHaveBeenCalled();
  });

  it("should return error when fetchLgtmImagesFunc fails", async () => {
    const mockAccessToken = createJwtAccessTokenString("mock-access-token");

    const mockDto: CopyRandomCatDto = {
      issueAccessTokenFunc: vi.fn().mockResolvedValue(mockAccessToken),
      fetchLgtmImagesFunc: vi.fn().mockRejectedValue(new Error("Fetch Error")),
    };

    const result = await copyRandomCat(mockDto);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Fetch Error");
    }
  });
});
```

**変更点**:
1. 外部モジュールのモックを削除し、DTO経由でモック関数を注入
2. `createJwtAccessTokenString` を使用して型安全なモックを作成
3. `mockDto.issueAccessTokenFunc` と `mockDto.fetchLgtmImagesFunc` の呼び出し検証を追加
4. `issueAccessTokenFunc` 失敗時のテストケースを追加（より細かいエラーケースのカバー）
5. `generateLgtmMarkdown` のモックを追加

---

## 5. 実装手順

以下の順序で実装を行う：

### ステップ1: マークダウン生成関数の作成
1. `src/features/main/functions/generate-lgtm-markdown.ts` を新規作成
2. `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` を新規作成
3. `npm run test` で新規テストがパスすることを確認

### ステップ2: `copyRandomCat` の引数改修
1. `src/features/main/actions/copy-random-cat.ts` を修正
2. `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` を修正
3. `npm run test` でテストがパスすることを確認

### ステップ3: 呼び出し元の修正
1. `src/features/main/components/home-action-buttons.tsx` を修正
2. `src/features/main/components/lgtm-image.tsx` を修正

### ステップ4: 品質管理の実行
1. `npm run format` でコードをフォーマット
2. `npm run lint` でLintチェック
3. `npm run test` で全テストがパスすることを確認
4. Playwright MCP でブラウザ動作確認
5. Storybook での表示確認

---

## 6. 品質管理手順

### 6.1 コードフォーマット

```bash
npm run format
```

**期待される結果**: エラーなし

### 6.2 Lint チェック

```bash
npm run lint
```

**期待される結果**: エラーなし

### 6.3 テスト実行

```bash
npm run test
```

**期待される結果**: すべてのテストがパス

### 6.4 Playwright MCP を使用したブラウザ確認

#### 6.4.1 日本語版の確認

**確認URL**: `http://localhost:2222`

**確認手順**:
1. ブラウザを起動して `http://localhost:2222` に移動
2. スナップショットを取得して「ランダムコピー」ボタンの存在を確認
3. 「ランダムコピー」ボタンをクリック
4. 「Copied!」フィードバックが表示されることを確認
5. 1.5秒後に「Copied!」が非表示になることを確認

#### 6.4.2 英語版の確認

**確認URL**: `http://localhost:2222/en/`

**確認手順**:
1. ブラウザを起動して `http://localhost:2222/en/` に移動
2. スナップショットを取得して「Copy Random Cat」ボタンの存在を確認
3. 「Copy Random Cat」ボタンをクリック
4. 「Copied!」フィードバックが表示されることを確認
5. 1.5秒後に「Copied!」が非表示になることを確認

#### 6.4.3 LgtmImage コンポーネントのコピー機能確認

**確認手順**:
1. 日本語版または英語版のトップページで画像をクリック
2. 「Copied!」フィードバックが表示されることを確認
3. クリップボードの内容がマークダウン形式であることを確認

### 6.5 Storybook での確認

**確認URL**: `http://localhost:6006/`

**確認手順**:
1. LgtmImage のストーリーを開く
2. 画像をクリックしてコピー機能が動作することを確認
3. 「Copied!」フィードバックが表示されることを確認

### 6.6 Chrome DevTools MCP でのデバッグ（必要に応じて）

デザイン崩れやスタイルの問題が発生した場合：
1. Chrome DevTools MCP で対象ページを開く
2. Elements パネルでスタイルを確認
3. 必要に応じてスタイルを調整

---

## 7. 依存関係の確認

### 7.1 新規インポートが必要なモジュール

**`home-action-buttons.tsx` に追加**:
```typescript
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
```

**`lgtm-image.tsx` に追加**:
```typescript
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
```

**`lgtm-image.tsx` から削除**:
```typescript
import { appBaseUrl } from "@/features/url";
```

### 7.2 既存モジュールの依存関係

| モジュール | パス | 用途 |
|----------|------|------|
| `IssueClientCredentialsAccessToken` | `@/features/oidc/types/access-token` | アクセストークン取得関数の型 |
| `FetchLgtmImages` | `@/features/main/types/lgtm-image` | 画像取得関数の型 |
| `LgtmImageUrl` | `@/features/main/types/lgtm-image` | 画像URL の Branded Type |
| `appBaseUrl` | `@/features/url` | アプリベースURL取得 |
| `issueClientCredentialsAccessToken` | `@/lib/cognito/oidc` | アクセストークン取得の実装 |
| `fetchLgtmImagesInRandom` | `@/features/main/functions/fetch-lgtm-images` | ランダム画像取得の実装 |

---

## 8. リスク分析

### 8.1 後方互換性

- `copyRandomCat` の引数変更により、呼び出し元の修正が必要
- 呼び出し箇所は以下の2箇所のみ（限定的な影響範囲）:
  - `home-action-buttons.tsx`
  - `copy-random-cat.test.ts`

### 8.2 デグレードリスク

**低い**:
- マークダウン生成ロジック自体は変更なし（共通関数への切り出しのみ）
- テストで動作を保証

### 8.3 セキュリティ考慮

- アクセストークン取得は引き続きサーバーサイドで実行
- クライアントへのトークン露出なし

---

## 9. 実装時の注意事項

### 9.1 必ず確認すべき事項

1. **型の正確な使用**: `LgtmImageUrl` 型を正しく使用する
2. **インポートパスの確認**: 各ファイルで正しいパスからインポートしているか確認
3. **テストの網羅性**: 新規関数と修正箇所のテストが十分か確認
4. **`"use server"` ディレクティブ**: Server Action ファイルに必ず含める

### 9.2 禁止事項

1. **ビジネスロジックの変更**: マークダウンのフォーマット自体は変更しない
2. **既存の動作の変更**: リファクタリングであり、機能追加ではない
3. **不要なファイルの作成**: 指定されたファイルのみを作成・修正する

---

## 10. まとめ

このリファクタリングにより、以下の改善を実現する：

1. ✅ **DRY原則の適用**: マークダウン生成ロジックを共通化
2. ✅ **テスタビリティの向上**: 依存性注入パターンによりモックが容易に
3. ✅ **関心の分離**: `lib` 層への直接依存を `features` 層で解決
4. ✅ **型安全性の維持**: Branded Types を活用した型安全な実装

**作成・修正ファイル数**: 6ファイル
- 新規: 2ファイル
- 修正: 4ファイル
