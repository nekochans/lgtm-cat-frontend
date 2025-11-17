# Issue #327: LGTM画像取得API関数実装 - 詳細実装計画書

## 📋 概要

### 目的
LGTM画像をAPIから取得する2つの関数を実装し、テストコードを含めた品質保証を完了させる。

### 実装対象
1. `src/features/main/types/lgtmImage.ts` - 型定義にBranded Typeを追加（拡張）
2. `src/features/main/functions/is-lgtm-image-url.ts` - LGTM画像URLバリデーション関数
3. `src/features/main/functions/fetch-lgtm-images.ts` - LGTM画像取得（ランダム＋最近作成の2つの関数を含む）
4. `src/features/main/functions/__tests__/is-lgtm-image-url.test.ts` - LGTM画像URLバリデーション関数のテスト
5. `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-random.test.ts` - ランダム画像取得のテスト
6. `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-recently-created.test.ts` - 最近作成された画像取得のテスト

### 技術スタック
- **言語**: TypeScript
- **バリデーション**: Zod v4
- **テストフレームワーク**: Vitest
- **モックライブラリ**: MSW (Mock Service Worker)
- **HTTPクライアント**: fetch API

---

## 🎯 型定義の確認

### 型定義の拡張（Branded Type の追加）

#### src/features/main/types/lgtmImage.ts
```typescript
import type { JwtAccessTokenString } from "@/features/oidc/types/access-token";

export type LgtmImageUrl = `https://${string}` & { readonly __brand: "lgtmImageUrl" };

export function createLgtmImageUrl(url: string): LgtmImageUrl {
  return url as LgtmImageUrl;
}

export type LgtmImageId = number & { readonly __brand: "lgtmImageId" };

export function createLgtmImageId(id: number): LgtmImageId {
  return id as LgtmImageId;
}

export type LgtmImage = { id: LgtmImageId; imageUrl: LgtmImageUrl };

export type FetchLgtmImages = (
  accessToken: JwtAccessTokenString
) => Promise<LgtmImage[]>;
```

**重要**:
- `LgtmImageUrl` は Branded Type として定義（`https://${string}` ベース）
- `createLgtmImageUrl` 関数で型作成を行う（プロジェクトのコーディング規約に準拠）
- `LgtmImageId` は Branded Type として定義（`number` ベース）
- `createLgtmImageId` 関数で型作成を行う（プロジェクトのコーディング規約に準拠）
- `LgtmImage.id` は `LgtmImageId` 型
- `LgtmImage.imageUrl` は `LgtmImageUrl` 型
- 両方とも Branded Types により型安全性を向上

### APIレスポンスの型（API側の型定義）

**実装方法**:
- Zod v4のスキーマで定義し、実行時に型をバリデーション
- `z.infer<typeof schema>` で型を推論（型アサーションは使用しない）
- **TypeScript型ガード関数を使って型安全性を確保**

```typescript
// zodスキーマによる型定義（.readonly() で readonly 化）
const apiLgtmImageResponseSchema = z.object({
  lgtmImages: z.array(
    z.object({
      id: z.string().refine((val) => /^\d+$/.test(val), {
        message: "id must be a numeric string",
      }),
      url: z.url().refine(isLgtmImageUrl, {
        message: "url must be a valid LGTM image URL (.webp extension and lgtmeow.com domain)",
      }),
    }).readonly()
  ).readonly(),
}).readonly();

// zodスキーマから型を推論（readonly プロパティとして推論される）
type ApiLgtmImageResponse = z.infer<typeof apiLgtmImageResponseSchema>;

// TypeScript型ガード関数を定義
function isValidApiLgtmImageResponse(apiResponse: unknown): apiResponse is ApiLgtmImageResponse {
  const result = apiLgtmImageResponseSchema.safeParse(apiResponse);
  return result.success;
}
```

**重要な相違点**:
1. APIレスポンスの `id` は `string` 型 → アプリケーション内では `LgtmImageId` 型（Branded Type）に変換が必要
   - **`z.string().refine()` で数値文字列かどうかをバリデーション**（例: `"1"`, `"123"` は OK、`"abc"` は NG）
   - 正規表現 `/^\d+$/` で数値文字列のみを許可
   - `Number.parseInt()` で `number` 型に変換後、`createLgtmImageId()` で `LgtmImageId` 型に変換
2. APIレスポンスの `url` は `string` 型 → アプリケーション内では `LgtmImageUrl` 型（Branded Type）に変換が必要
   - **`z.url().refine(isLgtmImageUrl)` で厳格なURLバリデーション**
   - `isLgtmImageUrl` 関数で以下をチェック:
     - `.webp` 拡張子で終わること
     - `lgtmeow.com` ドメインが含まれること
   - `createLgtmImageUrl()` で `LgtmImageUrl` 型に変換
   - プロパティ名も `url` → `imageUrl` にマッピングが必要
3. **HTTPステータスコード200でもレスポンス形式が不正な場合はエラーにする**
   - TypeScript型ガード関数 `isValidApiLgtmImageResponse()` でバリデーション
   - 内部でzodの `safeParse()` を使用
   - 型ガード関数により、チェック後は `ApiLgtmImageResponse` 型として型安全に扱える

---

## 🔧 実装する関数の仕様

### 共通仕様

#### 引数
- `accessToken: JwtAccessTokenString` - JWTアクセストークン（Bearer認証用）

#### 戻り値
- `Promise<LgtmImage[]>` - LGTM画像の配列

#### HTTPヘッダー
```
Authorization: Bearer <accessToken>
```

#### エラーハンドリング
- HTTPステータスコード 401（Unauthorized）の場合: カスタムエラーをthrow
- HTTPステータスコード 500（Internal Server Error）の場合: カスタムエラーをthrow
- **HTTPステータスコード 200 でもレスポンス形式が不正な場合: カスタムエラーをthrow**
  - **TypeScript型ガード関数 `isValidApiLgtmImageResponse(apiResponse: unknown): apiResponse is ApiLgtmImageResponse` でバリデーション**
  - 型ガード関数の内部でzodの `safeParse()` メソッドを使用
  - バリデーション失敗時は "Invalid API response format" エラーをthrow
  - 型ガード関数により、チェック後の変数は `ApiLgtmImageResponse` 型として推論される
- エラー時に以下の情報を取得してthrow:
  - `statusCode`: HTTPステータスコード
  - `statusText`: HTTPステータステキスト
  - `headers`: レスポンスヘッダー（`Record<string, string>` 形式）
  - `responseBody`: エラーレスポンスボディ（JSON→text→undefinedの順で試行）
- ネットワークエラーの場合: 適切なエラーメッセージを含むエラーをthrow

---

## 📁 ファイル1: lgtmImage.ts（型定義の拡張）

### ファイルパス
```
src/features/main/types/lgtmImage.ts
```

### 実装内容

**既存のコード**:
```typescript
import type { JwtAccessTokenString } from "@/features/oidc/types/access-token";

export type LgtmImageUrl = `https://${string}`;

export type LgtmImage = { id: number; imageUrl: LgtmImageUrl };

export type FetchLgtmImages = (
  accessToken: JwtAccessTokenString
) => Promise<LgtmImage[]>;
```

**拡張後のコード（完全版）**:
```typescript
import type { JwtAccessTokenString } from "@/features/oidc/types/access-token";

export type LgtmImageUrl = `https://${string}` & { readonly __brand: "lgtmImageUrl" };

export function createLgtmImageUrl(url: string): LgtmImageUrl {
  return url as LgtmImageUrl;
}

export type LgtmImageId = number & { readonly __brand: "lgtmImageId" };

export function createLgtmImageId(id: number): LgtmImageId {
  return id as LgtmImageId;
}

export type LgtmImage = { id: LgtmImageId; imageUrl: LgtmImageUrl };

export type FetchLgtmImages = (
  accessToken: JwtAccessTokenString
) => Promise<LgtmImage[]>;
```

### 実装のポイント

1. **Branded Type の追加**
   - `LgtmImageUrl` に `{ readonly __brand: "lgtmImageUrl" }` を追加
   - `LgtmImageId` 型を新規追加（`number` ベースの Branded Type）
   - プロジェクトのコーディング規約に準拠

2. **型作成関数の追加**
   - `createLgtmImageUrl(url: string): LgtmImageUrl` を追加
   - `createLgtmImageId(id: number): LgtmImageId` を追加
   - 型アサーション（`as`）を使用してBranded Typeを作成

3. **LgtmImage 型の更新**
   - `id: number` → `id: LgtmImageId` に変更
   - `imageUrl` は既に `LgtmImageUrl` 型だが、Branded Type として強化

4. **型安全性の向上**
   - 異なる種類のIDやURLの混同を防止
   - コンパイル時に型エラーを検出
   - ドメインモデルの明確化

---

## 📁 ファイル2: is-lgtm-image-url.ts

### ファイルパス
```
src/features/main/functions/is-lgtm-image-url.ts
```

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * LGTM画像URLの形式が正しいかどうかを検証する
 *
 * @param url - 検証対象のURL文字列
 * @returns URLが有効なLGTM画像URL（.webp拡張子、lgtmeow.comドメイン）である場合は true
 *
 * @example
 * ```typescript
 * isLgtmImageUrl("https://lgtm-images.lgtmeow.com/2025/11/14/11/image.webp") // => true
 * isLgtmImageUrl("https://example.com/image.webp") // => false (ドメインが違う)
 * isLgtmImageUrl("https://lgtm-images.lgtmeow.com/image.png") // => false (拡張子が違う)
 * isLgtmImageUrl("https://example.com/lgtmeow.com/image.webp") // => false (パスにlgtmeow.comが含まれているだけ)
 * ```
 */
export function isLgtmImageUrl(url: string): boolean {
  try {
    // URLをパースして厳密に検証
    const parsedUrl = new URL(url);

    // プロトコルが https: であることを確認
    if (parsedUrl.protocol !== "https:") {
      return false;
    }

    // ホスト名が lgtmeow.com またはそのサブドメインであることを確認
    const { hostname } = parsedUrl;
    if (hostname !== "lgtmeow.com" && !hostname.endsWith(".lgtmeow.com")) {
      return false;
    }

    // パス名が .webp 拡張子で終わることを確認
    if (!parsedUrl.pathname.endsWith(".webp")) {
      return false;
    }

    return true;
  } catch {
    // URLパースに失敗した場合は無効なURLとして扱う
    return false;
  }
}
```

### 実装のポイント

1. **厳密なURLバリデーション（セキュリティ重要）**
   - `new URL(url)` でURLをパースして構造を正しく解析
   - `protocol` プロパティで `https:` であることを確認
   - `hostname` プロパティで厳密にドメインを検証
     - `hostname === "lgtmeow.com"` （メインドメイン）
     - `hostname.endsWith(".lgtmeow.com")` （サブドメイン）
   - `pathname` プロパティで `.webp` 拡張子を確認
   - try-catch でURLパースエラー（不正な形式）をハンドリング

2. **脆弱なパターンマッチングを回避**
   - ❌ `url.includes("lgtmeow.com")` は危険
     - `https://example.com/lgtmeow.com/image.webp` が通過してしまう
     - `https://lgtmeow.com.evil.org/image.webp` が通過してしまう
   - ✅ `hostname` で厳密に検証することで攻撃を防ぐ

3. **早期リターンパターン**
   - 不正な条件に当てはまったら即座に `false` を返す
   - 全てのチェックをパスしたら `true` を返す

4. **exportして再利用可能に**
   - zodの `.refine()` で使用
   - 他の場所でも同じバリデーションロジックを再利用可能

---

## 📁 ファイル3: fetch-lgtm-images.ts

### ファイルパス
```
src/features/main/functions/fetch-lgtm-images.ts
```

**重要**: このファイルには `fetchLgtmImagesInRandom` と `fetchLgtmImagesInRecentlyCreated` の2つの関数が含まれます。共通ロジック（zodスキーマ、型定義、エラークラス、型ガード関数、変換関数）は1回だけ定義され、コードの重複を避けます

### 完全な実装コード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import * as z from "zod";
import type { JwtAccessTokenString } from "@/features/oidc/types/access-token";
import type { LgtmImage, FetchLgtmImages } from "@/features/main/types/lgtmImage";
import { createLgtmImageId, createLgtmImageUrl } from "@/features/main/types/lgtmImage";
import {
  fetchLgtmImagesInRandomUrl,
  fetchLgtmImagesInRecentlyCreatedUrl
} from "@/features/main/functions/api-url";
import { isLgtmImageUrl } from "@/features/main/functions/is-lgtm-image-url";

// ========================================
// 共通ロジック（zodスキーマ、型定義、エラークラス、型ガード関数、変換関数）
// ========================================

/**
 * APIレスポンスのzodスキーマ（.readonly() で readonly 化）
 */
const apiLgtmImageResponseSchema = z.object({
  lgtmImages: z.array(
    z.object({
      id: z.string().refine((val) => /^\d+$/.test(val), {
        message: "id must be a numeric string",
      }),
      url: z.url().refine(isLgtmImageUrl, {
        message: "url must be a valid LGTM image URL (.webp extension and lgtmeow.com domain)",
      }),
    }).readonly()
  ).readonly(),
}).readonly();

/**
 * APIレスポンスの型定義（zodスキーマから推論、readonly プロパティとして推論される）
 */
type ApiLgtmImageResponse = z.infer<typeof apiLgtmImageResponseSchema>;

/**
 * エラーオプションの型定義
 */
type FetchLgtmImagesErrorOptions = {
  readonly statusCode?: number;
  readonly statusText?: string;
  readonly headers?: Record<string, string>;
  readonly responseBody?: unknown;
};

/**
 * APIエラーを表すカスタムエラークラス
 */
class FetchLgtmImagesError extends Error {
  static {
    this.prototype.name = "FetchLgtmImagesError";
  }

  private readonly statusCode: number | undefined;

  private readonly statusText: string | undefined;

  private readonly headers: Record<string, string> | undefined;

  private readonly responseBody: unknown;

  constructor(message = "", options: FetchLgtmImagesErrorOptions = {}) {
    const { statusCode, statusText, headers, responseBody, ...rest } = options;
    super(message, rest);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.headers = headers;
    this.responseBody = responseBody;
  }
}

/**
 * APIレスポンスが正しい型かどうかを検証する型ガード関数
 *
 * @param apiResponse - 検証対象のAPIレスポンス
 * @returns APIレスポンスが ApiLgtmImageResponse 型である場合は true
 */
function isValidApiLgtmImageResponse(apiResponse: unknown): apiResponse is ApiLgtmImageResponse {
  const result = apiLgtmImageResponseSchema.safeParse(apiResponse);
  return result.success;
}

/**
 * APIレスポンスをLgtmImage配列に変換する
 */
function convertToLgtmImages(
  response: ApiLgtmImageResponse
): LgtmImage[] {
  return response.lgtmImages.map((item) => ({
    id: createLgtmImageId(Number.parseInt(item.id, 10)),
    imageUrl: createLgtmImageUrl(item.url),
  }));
}

// ========================================
// 関数1: fetchLgtmImagesInRandom
// ========================================

/**
 * ランダムなLGTM画像を取得する
 *
 * @param accessToken - JWTアクセストークン
 * @returns LGTM画像の配列
 * @throws {FetchLgtmImagesError} APIエラーが発生した場合
 */
export const fetchLgtmImagesInRandom: FetchLgtmImages = async (
  accessToken: JwtAccessTokenString
): Promise<LgtmImage[]> => {
  const url = fetchLgtmImagesInRandomUrl();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // エラーレスポンスのボディを取得（失敗してもOK）
      const errorResponseBody: unknown = await (async () => {
        try {
          return await response.json();
        } catch {
          try {
            return await response.text();
          } catch {
            return undefined;
          }
        }
      })();

      // headersをRecord<string, string>に変換
      const headersRecord: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersRecord[key] = value;
      });

      if (response.status === 401) {
        throw new FetchLgtmImagesError("Unauthorized", {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        });
      }

      if (response.status === 500) {
        throw new FetchLgtmImagesError("Internal Server Error", {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        });
      }

      throw new FetchLgtmImagesError(
        `HTTP Error: ${response.status} ${response.statusText}`,
        {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        }
      );
    }

    // レスポンスボディを取得
    const responseBodyRaw = await response.json();

    // 型ガード関数でバリデーション
    if (!isValidApiLgtmImageResponse(responseBodyRaw)) {
      // headersをRecord<string, string>に変換
      const headersRecord: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersRecord[key] = value;
      });

      throw new FetchLgtmImagesError("Invalid API response format", {
        statusCode: response.status,
        statusText: response.statusText,
        headers: headersRecord,
        responseBody: responseBodyRaw,
      });
    }

    // ここで responseBodyRaw は ApiLgtmImageResponse 型として推論される
    return convertToLgtmImages(responseBodyRaw);
  } catch (error) {
    if (error instanceof FetchLgtmImagesError) {
      throw error;
    }

    throw new FetchLgtmImagesError(
      `Failed to fetch LGTM images: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// ========================================
// 関数2: fetchLgtmImagesInRecentlyCreated
// ========================================

/**
 * 最近作成されたLGTM画像を取得する
 *
 * @param accessToken - JWTアクセストークン
 * @returns LGTM画像の配列
 * @throws {FetchLgtmImagesError} APIエラーが発生した場合
 */
export const fetchLgtmImagesInRecentlyCreated: FetchLgtmImages = async (
  accessToken: JwtAccessTokenString
): Promise<LgtmImage[]> => {
  const url = fetchLgtmImagesInRecentlyCreatedUrl();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // エラーレスポンスのボディを取得（失敗してもOK）
      const errorResponseBody: unknown = await (async () => {
        try {
          return await response.json();
        } catch {
          try {
            return await response.text();
          } catch {
            return undefined;
          }
        }
      })();

      // headersをRecord<string, string>に変換
      const headersRecord: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersRecord[key] = value;
      });

      if (response.status === 401) {
        throw new FetchLgtmImagesError("Unauthorized", {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        });
      }

      if (response.status === 500) {
        throw new FetchLgtmImagesError("Internal Server Error", {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        });
      }

      throw new FetchLgtmImagesError(
        `HTTP Error: ${response.status} ${response.statusText}`,
        {
          statusCode: response.status,
          statusText: response.statusText,
          headers: headersRecord,
          responseBody: errorResponseBody,
        }
      );
    }

    // レスポンスボディを取得
    const responseBodyRaw = await response.json();

    // 型ガード関数でバリデーション
    if (!isValidApiLgtmImageResponse(responseBodyRaw)) {
      // headersをRecord<string, string>に変換
      const headersRecord: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersRecord[key] = value;
      });

      throw new FetchLgtmImagesError("Invalid API response format", {
        statusCode: response.status,
        statusText: response.statusText,
        headers: headersRecord,
        responseBody: responseBodyRaw,
      });
    }

    // ここで responseBodyRaw は ApiLgtmImageResponse 型として推論される
    return convertToLgtmImages(responseBodyRaw);
  } catch (error) {
    if (error instanceof FetchLgtmImagesError) {
      throw error;
    }

    throw new FetchLgtmImagesError(
      `Failed to fetch LGTM images: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
```

### 実装のポイント

1. **ファイル構成とコードの統合**
   - **1つのファイルに2つの関数をまとめることでコードの重複を排除**
   - 共通ロジック（zodスキーマ、型定義、エラークラス、型ガード関数、変換関数）を1回だけ定義
   - `fetchLgtmImagesInRandom` と `fetchLgtmImagesInRecentlyCreated` の2つの関数を export
   - 両関数の違いは使用するURL取得関数のみ
   - 保守性が向上し、仕様変更時の修正漏れリスクを低減

2. **TypeScript型ガード関数とZod v4による実行時型ガード（最重要）**
   - `apiLgtmImageResponseSchema` でzodスキーマを定義
   - **`.refine()` で厳格なバリデーションを追加**
     - `id: z.string().refine((val) => /^\d+$/.test(val))` で数値文字列のみを許可（例: `"1"`, `"123"` は OK、`"abc"` は NG）
     - `url: z.url().refine(isLgtmImageUrl)` でLGTM画像URLの形式をチェック
       - `.webp` 拡張子で終わること
       - `lgtmeow.com` ドメインが含まれること
   - `z.url()` でURL形式のバリデーション（Zod v4のトップレベル関数を使用）
   - `isLgtmImageUrl` 関数をimportして再利用
   - `z.infer<typeof apiLgtmImageResponseSchema>` で型を推論
   - **型ガード関数 `isValidApiLgtmImageResponse(apiResponse: unknown): apiResponse is ApiLgtmImageResponse` を定義**
     - 内部で `safeParse()` メソッドを使用して実行時に型をバリデーション
     - `apiResponse is ApiLgtmImageResponse` という型プレディケートでTypeScriptの型推論を確実にする
     - この関数を通過した後、変数は `ApiLgtmImageResponse` 型として推論される
   - バリデーション失敗時は `FetchLgtmImagesError` をthrow
   - HTTPステータスコード200でもレスポンス形式が不正な場合はエラー
   - 型アサーション（`as`）は使用せず、型ガード関数による型安全性を確保

3. **型定義の明確化と readonly 化**
   - `ApiLgtmImageResponse` はzodスキーマから型を推論（`z.infer`）
   - zodスキーマが型定義の唯一の真実の源（Single Source of Truth）
   - コンパイル時と実行時の両方で型安全性を保証
   - **`.readonly()` メソッドで全てのプロパティを readonly 化**
     - オブジェクト、配列の各レベルで `.readonly()` を適用
     - `z.infer` で推論される型は自動的に readonly プロパティとなる
     - イミュータブルなデータフローを促進し、意図しない変更を防ぐ
     - プロジェクトのコーディング規約に準拠

4. **カスタムエラークラス（参考: `IssueClientCredentialsAccessTokenError`）**
   - `FetchLgtmImagesError` でエラーハンドリングを明確化
   - プロトタイプ名を静的ブロックで設定（プロジェクトのコーディング規約に準拠）
   - `FetchLgtmImagesErrorOptions` 型でオプショナルなエラー情報を定義
   - `private readonly` プロパティで `statusCode`, `statusText`, `headers`, `responseBody` を保持
   - `headers` は `Record<string, string>` 型（`response.headers.forEach()` で変換）
   - constructorはOptionsパターンで実装（分割代入で各プロパティを設定）

5. **型変換関数**
   - `convertToLgtmImages` で変換ロジックを分離
   - `id: string` → `number` → `LgtmImageId` への変換（`Number.parseInt` 後、`createLgtmImageId` 使用）
   - `url: string` → `LgtmImageUrl` への変換（`createLgtmImageUrl` 使用）
   - `url` → `imageUrl` へのプロパティ名変換
   - Branded Types（`LgtmImageId`, `LgtmImageUrl`）の使用により型安全性を向上

6. **エラーハンドリング**
   - HTTPステータスコード 401, 500 を個別に処理
   - HTTPステータスコード 200 でもレスポンス形式が不正な場合はエラー（zodバリデーション）
   - エラーレスポンスのボディを取得（JSON→text→undefinedの順で試行）
   - `response.headers` を `Record<string, string>` に変換
   - エラー情報（statusCode, statusText, headers, responseBody）を含めてthrow
   - ネットワークエラーをキャッチして適切なエラーメッセージを生成
   - 既存の `FetchLgtmImagesError` は再スローして情報を保持

7. **変数命名規約**
   - **`data` という変数名は絶対に使用しない**
   - `await response.json()` の結果は必ず `responseBody` または `responseBodyRaw` を使用
   - 意味が明確に伝わる変数名を使用

---

## 🧪 テストコード

### 共通のモック設定

#### 使用する既存のモック
- `src/mocks/api/external/lgtmeow/mock-fetch-lgtm-images.ts` - 成功レスポンス
- `src/mocks/api/error/mock-unauthorized-error.ts` - 401エラー
- `src/mocks/api/error/mock-internal-server-error.ts` - 500エラー

#### 使用する既存のモックボディ
- `src/mocks/api/fetch-lgtm-images-mock-body.ts`

### テスト用のディレクトリ構造

```
src/features/main/functions/__tests__/
├── is-lgtm-image-url.test.ts
└── fetch-lgtm-images/
    ├── fetch-lgtm-images-in-random.test.ts
    └── fetch-lgtm-images-in-recently-created.test.ts
```

**注意**: ディレクトリ `src/features/main/functions/__tests__/` と `src/features/main/functions/__tests__/fetch-lgtm-images/` は現在存在しないため、作成する必要があります。

---

## 📁 ファイル4: is-lgtm-image-url.test.ts

### ファイルパス
```
src/features/main/functions/__tests__/is-lgtm-image-url.test.ts
```

### 完全な実装コード

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import { isLgtmImageUrl } from "@/features/main/functions/is-lgtm-image-url";

describe("src/features/main/functions/is-lgtm-image-url.ts isLgtmImageUrl TestCases", () => {
  type TestTable = {
    url: string;
    expected: boolean;
  };

  it.each`
    url                                                                                          | expected
    ${"https://lgtm-images.lgtmeow.com/2025/11/14/11/13ae0652-277b-4369-9bad-37176dc122da.webp"} | ${true}
    ${"https://cdn.lgtmeow.com/images/test.webp"}                                                | ${true}
    ${"https://lgtmeow.com/path/to/image.webp"}                                                  | ${true}
    ${"http://lgtm-images.lgtmeow.com/image.webp"}                                               | ${false}
    ${"https://example.com/image.webp"}                                                          | ${false}
    ${"https://lgtm-images.lgtmeow.com/image.png"}                                               | ${false}
    ${"https://lgtm-images.lgtmeow.com/image.jpg"}                                               | ${false}
    ${"https://lgtm-images.lgtmeow.com/image.jpeg"}                                              | ${false}
    ${"https://lgtm-images.lgtmeow.com/image"}                                                   | ${false}
    ${""}                                                                                        | ${false}
    ${"https://lgtmeow.org/image.webp"}                                                          | ${false}
    ${"https://example.com/lgtmeow.com/image.webp"}                                              | ${false}
    ${"https://lgtmeow.com.evil.org/image.webp"}                                                 | ${false}
    ${"not-a-valid-url"}                                                                         | ${false}
  `(
    "should return $expected when url is $url",
    ({ url, expected }: TestTable) => {
      expect(isLgtmImageUrl(url)).toBe(expected);
    }
  );
});
```

### テストケースの説明

**テーブル駆動テスト**で14件のテストケースを実装:

1. **有効なLGTM画像URL（expected: true）**
   - 標準的なLGTM画像URL（サブドメイン + lgtmeow.com + .webp）
   - サブドメイン付きURL
   - 異なるパス構造のURL

2. **無効なURL（expected: false）**
   - httpプロトコル（httpsではない）
   - lgtmeow.comドメイン以外
   - .webp以外の拡張子（.png, .jpg, .jpeg）
   - 拡張子なし
   - 空文字列
   - 類似ドメイン（.org など）
   - **セキュリティ：パスにlgtmeow.comが含まれているだけの悪意のあるURL**
   - **セキュリティ：lgtmeow.com.evil.orgのような偽装ドメイン**
   - **不正な形式：URLとして解析できない文字列**

---

## 📁 ファイル5: fetch-lgtm-images-in-random.test.ts

### ファイルパス
```
src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-random.test.ts
```

### 完全な実装コード

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む
import { describe, expect, it, beforeAll, afterEach, afterAll } from "vitest";
import { http } from "msw";
import { setupServer } from "msw/node";
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { fetchLgtmImagesInRandomUrl } from "@/features/main/functions/api-url";
import { createLgtmImageId } from "@/features/main/types/lgtmImage";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";
import { mockUnauthorizedError } from "@/mocks/api/error/mock-unauthorized-error";
import { mockInternalServerError } from "@/mocks/api/error/mock-internal-server-error";

const mockHandlers = [http.get(fetchLgtmImagesInRandomUrl(), mockFetchLgtmImages)];

const server = setupServer(...mockHandlers);

describe("src/features/main/functions/fetch-lgtm-images.ts fetchLgtmImagesInRandom TestCases", () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const dummyAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  it("should return LGTM images when API call succeeds", async () => {
    const result = await fetchLgtmImagesInRandom(dummyAccessToken);

    expect(result).toHaveLength(9);
    expect(result[0]).toStrictEqual({
      id: createLgtmImageId(1),
      imageUrl: "https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp",
    });
    expect(result[8]).toStrictEqual({
      id: createLgtmImageId(9),
      imageUrl: "https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp",
    });
  });

  it("should throw FetchLgtmImagesError when API returns 401 Unauthorized", async () => {
    server.use(http.get(fetchLgtmImagesInRandomUrl(), mockUnauthorizedError));

    await expect(fetchLgtmImagesInRandom(dummyAccessToken)).rejects.toThrow(
      "Unauthorized"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 500 Internal Server Error", async () => {
    server.use(http.get(fetchLgtmImagesInRandomUrl(), mockInternalServerError));

    await expect(fetchLgtmImagesInRandom(dummyAccessToken)).rejects.toThrow(
      "Internal Server Error"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid id format", async () => {
    server.use(
      http.get(fetchLgtmImagesInRandomUrl(), () => {
        return new Response(
          JSON.stringify({
            lgtmImages: [
              {
                id: "abc", // 数値文字列ではない
                url: "https://lgtm-images.lgtmeow.com/2021/03/16/00/image.webp",
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );

    await expect(fetchLgtmImagesInRandom(dummyAccessToken)).rejects.toThrow(
      "Invalid API response format"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid url extension", async () => {
    server.use(
      http.get(fetchLgtmImagesInRandomUrl(), () => {
        return new Response(
          JSON.stringify({
            lgtmImages: [
              {
                id: "1",
                url: "https://lgtm-images.lgtmeow.com/2021/03/16/00/image.png", // .webpではない
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );

    await expect(fetchLgtmImagesInRandom(dummyAccessToken)).rejects.toThrow(
      "Invalid API response format"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid url domain", async () => {
    server.use(
      http.get(fetchLgtmImagesInRandomUrl(), () => {
        return new Response(
          JSON.stringify({
            lgtmImages: [
              {
                id: "1",
                url: "https://evil.com/image.webp", // lgtmeow.comドメインではない
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );

    await expect(fetchLgtmImagesInRandom(dummyAccessToken)).rejects.toThrow(
      "Invalid API response format"
    );
  });
});
```

### テストケースの説明

1. **成功ケース**: APIが正常にレスポンスを返す
   - 9件の画像データが返されることを確認
   - 1件目と9件目のデータが期待通りの形式であることを確認
   - `id` が `string` から `LgtmImageId` 型（Branded Type）に変換されていることを確認
   - `createLgtmImageId()` 関数を使用して期待値を作成
   - `url` が `imageUrl` にマッピングされていることを確認

2. **401エラーケース**: 認証エラー
   - `mockUnauthorizedError` を使用
   - "Unauthorized" メッセージでエラーがthrowされることを確認

3. **500エラーケース**: サーバーエラー
   - `mockInternalServerError` を使用
   - "Internal Server Error" メッセージでエラーがthrowされることを確認

4. **200ステータスだが `id` 形式が不正なケース**: zodバリデーションエラー
   - インラインモックで `id: "abc"` （数値文字列ではない）を返す
   - "Invalid API response format" メッセージでエラーがthrowされることを確認
   - zodの `.refine()` によるバリデーションが働くことを確認

5. **200ステータスだが `url` 拡張子が不正なケース**: zodバリデーションエラー
   - インラインモックで `.png` 拡張子のURLを返す
   - "Invalid API response format" メッセージでエラーがthrowされることを確認
   - `isLgtmImageUrl` 関数によるバリデーションが働くことを確認

6. **200ステータスだが `url` ドメインが不正なケース**: zodバリデーションエラー
   - インラインモックで `evil.com` ドメインのURLを返す
   - "Invalid API response format" メッセージでエラーがthrowされることを確認
   - `isLgtmImageUrl` 関数によるドメイン検証が働くことを確認

---

## 📁 ファイル6: fetch-lgtm-images-in-recently-created.test.ts

### ファイルパス
```
src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-recently-created.test.ts
```

### 完全な実装コード

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む
import { describe, expect, it, beforeAll, afterEach, afterAll } from "vitest";
import { http } from "msw";
import { setupServer } from "msw/node";
import { fetchLgtmImagesInRecentlyCreated } from "@/features/main/functions/fetch-lgtm-images";
import { fetchLgtmImagesInRecentlyCreatedUrl } from "@/features/main/functions/api-url";
import { createLgtmImageId } from "@/features/main/types/lgtmImage";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";
import { mockUnauthorizedError } from "@/mocks/api/error/mock-unauthorized-error";
import { mockInternalServerError } from "@/mocks/api/error/mock-internal-server-error";

const mockHandlers = [http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockFetchLgtmImages)];

const server = setupServer(...mockHandlers);

describe("src/features/main/functions/fetch-lgtm-images.ts fetchLgtmImagesInRecentlyCreated TestCases", () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const dummyAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  it("should return LGTM images when API call succeeds", async () => {
    const result = await fetchLgtmImagesInRecentlyCreated(dummyAccessToken);

    expect(result).toHaveLength(9);
    expect(result[0]).toStrictEqual({
      id: createLgtmImageId(1),
      imageUrl: "https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp",
    });
    expect(result[8]).toStrictEqual({
      id: createLgtmImageId(9),
      imageUrl: "https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp",
    });
  });

  it("should throw FetchLgtmImagesError when API returns 401 Unauthorized", async () => {
    server.use(http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockUnauthorizedError));

    await expect(fetchLgtmImagesInRecentlyCreated(dummyAccessToken)).rejects.toThrow(
      "Unauthorized"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 500 Internal Server Error", async () => {
    server.use(http.get(fetchLgtmImagesInRecentlyCreatedUrl(), mockInternalServerError));

    await expect(fetchLgtmImagesInRecentlyCreated(dummyAccessToken)).rejects.toThrow(
      "Internal Server Error"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid id format", async () => {
    server.use(
      http.get(fetchLgtmImagesInRecentlyCreatedUrl(), () => {
        return new Response(
          JSON.stringify({
            lgtmImages: [
              {
                id: "abc", // 数値文字列ではない
                url: "https://lgtm-images.lgtmeow.com/2021/03/16/00/image.webp",
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );

    await expect(fetchLgtmImagesInRecentlyCreated(dummyAccessToken)).rejects.toThrow(
      "Invalid API response format"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid url extension", async () => {
    server.use(
      http.get(fetchLgtmImagesInRecentlyCreatedUrl(), () => {
        return new Response(
          JSON.stringify({
            lgtmImages: [
              {
                id: "1",
                url: "https://lgtm-images.lgtmeow.com/2021/03/16/00/image.png", // .webpではない
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );

    await expect(fetchLgtmImagesInRecentlyCreated(dummyAccessToken)).rejects.toThrow(
      "Invalid API response format"
    );
  });

  it("should throw FetchLgtmImagesError when API returns 200 but response has invalid url domain", async () => {
    server.use(
      http.get(fetchLgtmImagesInRecentlyCreatedUrl(), () => {
        return new Response(
          JSON.stringify({
            lgtmImages: [
              {
                id: "1",
                url: "https://evil.com/image.webp", // lgtmeow.comドメインではない
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );

    await expect(fetchLgtmImagesInRecentlyCreated(dummyAccessToken)).rejects.toThrow(
      "Invalid API response format"
    );
  });
});
```

**注意**: このテストコードは `fetch-lgtm-images-in-random.test.ts` とほぼ同じです。唯一の違いは:
- テスト対象の関数: `fetchLgtmImagesInRecentlyCreated`
- 使用するURL: `fetchLgtmImagesInRecentlyCreatedUrl()`
- describeの説明文

---

## 📋 実装手順（ステップバイステップ）

### Step 1: 型定義ファイルの拡張（lgtmImage.ts）

1. ファイルを開く: `src/features/main/types/lgtmImage.ts`
2. 既存のコードを「ファイル1」セクションの「拡張後のコード（完全版）」で置き換える
3. ファイルを保存

**重要**: このステップで Branded Type（`LgtmImageId`, `LgtmImageUrl`）と型作成関数（`createLgtmImageId`, `createLgtmImageUrl`）を追加します。

### Step 2: テストディレクトリの作成

```bash
mkdir -p src/features/main/functions/__tests__/fetch-lgtm-images
```

### Step 3: is-lgtm-image-url.ts の実装

1. ファイルを作成: `src/features/main/functions/is-lgtm-image-url.ts`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

### Step 4: fetch-lgtm-images.ts の実装

1. ファイルを作成: `src/features/main/functions/fetch-lgtm-images.ts`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

**重要**: このファイルには `fetchLgtmImagesInRandom` と `fetchLgtmImagesInRecentlyCreated` の2つの関数が含まれます。

### Step 5: is-lgtm-image-url.test.ts の実装

1. ファイルを作成: `src/features/main/functions/__tests__/is-lgtm-image-url.test.ts`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

### Step 6: fetch-lgtm-images-in-random.test.ts の実装

1. ファイルを作成: `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-random.test.ts`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

### Step 7: fetch-lgtm-images-in-recently-created.test.ts の実装

1. ファイルを作成: `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-recently-created.test.ts`
2. 上記の完全な実装コードをコピー＆ペースト
3. ファイルを保存

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

特に以下のテストが成功することを確認:
- `src/features/main/functions/__tests__/is-lgtm-image-url.test.ts` (14件のテストケース)
- `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-random.test.ts` (6件のテストケース)
- `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-recently-created.test.ts` (6件のテストケース)

### 4. ビルド確認
```bash
npm run build
```
**ビルドエラーがないことを確認**

---

## 🚨 重要な注意事項

### 1. 型の不一致に注意

**絶対に捏造しないこと**:
- APIレスポンスの `id` は `string` 型（例: `"959"`）
- アプリケーション内の `LgtmImage.id` は `LgtmImageId` 型（Branded Type）
- 変換には `createLgtmImageId(Number.parseInt(item.id, 10))` を使用
- Branded Types により型安全性を向上

**絶対に捏造しないこと**:
- APIレスポンスの `url` は `string` 型
- アプリケーション内の `LgtmImage.imageUrl` は `LgtmImageUrl` 型（Branded Type）
- 変換には `createLgtmImageUrl(item.url)` を使用
- プロパティ名も `url` → `imageUrl` にマッピングが必要
- Branded Types により型安全性を向上

### 2. エラークラスの実装パターン

**参考実装**: `src/features/oidc/errors/issue-client-credentials-access-token-error.ts`

プロジェクトのコーディング規約に従い、以下のパターンを使用:

```typescript
type FetchLgtmImagesErrorOptions = {
  readonly statusCode?: number;
  readonly statusText?: string;
  readonly headers?: Record<string, string>;
  readonly responseBody?: unknown;
};

class FetchLgtmImagesError extends Error {
  static {
    this.prototype.name = "FetchLgtmImagesError";
  }

  private readonly statusCode: number | undefined;
  private readonly statusText: string | undefined;
  private readonly headers: Record<string, string> | undefined;
  private readonly responseBody: unknown;

  constructor(message = "", options: FetchLgtmImagesErrorOptions = {}) {
    const { statusCode, statusText, headers, responseBody, ...rest } = options;
    super(message, rest);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.headers = headers;
    this.responseBody = responseBody;
  }
}
```

**重要なポイント**:
- プロトタイプ名を静的ブロックで設定
- `private readonly` でプロパティを定義
- `headers` は `Record<string, string>` 型（`Headers` 型ではない）
- Optionsパターンでconstructorを実装
- 全てのエラー情報がオプショナル

### 3. 既存ファイルの確認

**拡張するファイル（Branded Type を追加）**:
- `src/features/main/types/lgtmImage.ts` - 型定義（Branded Type を追加して拡張）

**変更不可のファイル（既に存在しているファイル）**:
- `src/features/main/functions/api-url.ts` - URL取得関数（変更不可）
- `src/mocks/api/external/lgtmeow/mock-fetch-lgtm-images.ts` - モック関数（変更不可）
- `src/mocks/api/fetch-lgtm-images-mock-body.ts` - モックボディ（変更不可）
- `src/mocks/api/error/mock-unauthorized-error.ts` - 401エラーモック（変更不可）
- `src/mocks/api/error/mock-internal-server-error.ts` - 500エラーモック（変更不可）
- `src/constants/http-status-code.ts` - HTTPステータスコード定義（変更不可）

**重要**: 上記の変更不可ファイルは絶対に変更しないこと。`lgtmImage.ts` のみ Branded Type を追加する形で拡張します。

### 4. 存在しないimportの禁止

**絶対に存在しないファイルやモジュールをimportしないこと**:
- 全てのimportパスは既存のファイルを参照する
- 新しいライブラリのインストールは不要
- 既存の `fetch` API を使用する

### 5. テストディレクトリの作成

`src/features/main/functions/__tests__/fetch-lgtm-images/` ディレクトリは現在存在しないため、**必ず作成すること**:

```bash
mkdir -p src/features/main/functions/__tests__/fetch-lgtm-images
```

### 6. readonly の使用

プロジェクトのコーディング規約に従い、全ての型定義で `readonly` を使用:

```typescript
type ApiLgtmImageResponse = {
  readonly lgtmImages: ReadonlyArray<{
    readonly id: string;
    readonly url: string;
  }>;
};
```

### 7. 変数命名規約

- キャメルケースを使用
- **`data` という変数名は絶対に使用禁止** - 何の情報も表していない
- `await response.json()` の結果は必ず `responseBody` を使用
- 意味が伝わる名称を使用（例: `responseBody`, `lgtmImages`, `userProfile`）

**重要**: `data` は何のデータか全く分からないため、必ず具体的な名前を付けること

### 8. ファイル構成の設計判断

**採用した設計**:
- `fetchLgtmImagesInRandom` と `fetchLgtmImagesInRecentlyCreated` の2つの関数を1つのファイル `fetch-lgtm-images.ts` に統合
- 共通ロジック（zodスキーマ、型定義、型ガード関数、エラークラス、変換関数）をファイル内で1回だけ定義
- 両関数の違いは使用するURL取得関数のみ

**設計の利点**:
- コードの重複を排除（DRY原則）
- 仕様変更時の修正漏れリスクを低減
- 保守性の向上
- 型定義やバリデーションの一貫性を保証

---

## 🔍 トラブルシューティング

### 1. テストが失敗する場合

#### 症状: "Cannot find module '@/features/main/functions/fetch-lgtm-images'"

**原因**: ファイルが作成されていない、またはパスが間違っている

**解決方法**:
- ファイルが正しいパスに存在することを確認
- `src/features/main/functions/fetch-lgtm-images.ts` が存在すること

#### 症状: "Expected LgtmImageId, received number" または "Expected number, received string"

**原因**: `id` の型変換が正しく行われていない

**解決方法**:
```typescript
// ✅ 正しい
id: createLgtmImageId(Number.parseInt(item.id, 10))

// ❌ 間違い (Branded Type を使っていない)
id: Number.parseInt(item.id, 10)

// ❌ 間違い (number に変換していない)
id: item.id
```

#### 症状: "Property 'imageUrl' is missing" または "Type 'string' is not assignable to type 'LgtmImageUrl'"

**原因**: プロパティ名のマッピングが行われていない、または型変換が行われていない

**解決方法**:
```typescript
// ✅ 正しい
imageUrl: createLgtmImageUrl(item.url)

// ❌ 間違い (Branded Type を使っていない)
imageUrl: item.url as `https://${string}`

// ❌ 間違い (プロパティ名が違う)
url: createLgtmImageUrl(item.url)
```

### 2. MSWモックが動作しない場合

#### 症状: テストでAPIが実際に呼ばれてしまう

**原因**: MSWサーバーのセットアップが正しくない

**解決方法**:
```typescript
// 必ず以下の順序でセットアップ
beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

### 3. TypeScriptエラーが発生する場合

この問題は上記の「Property 'imageUrl' is missing」セクションで解決済みです。
`createLgtmImageUrl(item.url)` を使用してください。

---

## 📝 実装チェックリスト

実装完了前に、以下の全ての項目をチェックすること:

### 実装
- [ ] **`src/features/main/types/lgtmImage.ts` に Branded Type が追加されている**
- [ ] `LgtmImageId` 型（`number` ベースの Branded Type）が定義されている
- [ ] `createLgtmImageId(id: number): LgtmImageId` 関数が実装されている
- [ ] `LgtmImageUrl` 型に `{ readonly __brand: "lgtmImageUrl" }` が追加されている
- [ ] `createLgtmImageUrl(url: string): LgtmImageUrl` 関数が実装されている
- [ ] `LgtmImage` 型の `id` が `LgtmImageId` 型に変更されている
- [ ] `src/features/main/functions/__tests__/fetch-lgtm-images/` ディレクトリが作成されている
- [ ] **`is-lgtm-image-url.ts` が実装されている**
- [ ] **`fetch-lgtm-images.ts` が実装されている（`fetchLgtmImagesInRandom` と `fetchLgtmImagesInRecentlyCreated` の2関数を含む）**
- [ ] **`is-lgtm-image-url.test.ts` が実装されている**
- [ ] `fetch-lgtm-images-in-random.test.ts` が実装されている
- [ ] `fetch-lgtm-images-in-recently-created.test.ts` が実装されている

### 型定義とバリデーション
- [ ] `zod` がimportされている（`import * as z from "zod";`）
- [ ] **`isLgtmImageUrl` 関数がimportされている（`import { isLgtmImageUrl } from "@/features/main/functions/is-lgtm-image-url";`）**
- [ ] `apiLgtmImageResponseSchema` zodスキーマが定義されている
- [ ] **`id` フィールドに `.refine((val) => /^\d+$/.test(val))` で数値文字列のバリデーションが追加されている**
- [ ] `z.url()` を使ってURL形式をバリデーションしている（Zod v4のトップレベル関数）
- [ ] **`url` フィールドに `.refine(isLgtmImageUrl)` で厳格なURLバリデーションが追加されている**
- [ ] `ApiLgtmImageResponse` 型がzodスキーマから推論されている（`z.infer<typeof apiLgtmImageResponseSchema>`）
- [ ] **型ガード関数 `isValidApiLgtmImageResponse(apiResponse: unknown): apiResponse is ApiLgtmImageResponse` が定義されている**
- [ ] **型ガード関数の内部で `safeParse()` を使用している**
- [ ] **型ガード関数のチェック後、変数が `ApiLgtmImageResponse` 型として推論される**
- [ ] `FetchLgtmImagesErrorOptions` 型が定義されている
- [ ] `FetchLgtmImagesError` クラスが定義されている（参考実装に準拠）
- [ ] プロトタイプ名が静的ブロックで設定されている
- [ ] エラークラスのプロパティは `private readonly` で定義されている
- [ ] エラークラスのconstructorはOptionsパターンで実装されている
- [ ] `headers` の型は `Record<string, string>` である
- [ ] 全てのプロパティに `readonly` が付与されている

### 型変換
- [ ] `LgtmImageId` という Branded Type が定義されている
- [ ] `createLgtmImageId` 関数が実装されている
- [ ] `LgtmImageUrl` という Branded Type が定義されている
- [ ] `createLgtmImageUrl` 関数が実装されている
- [ ] `id: string` → `number` → `LgtmImageId` の変換が行われている
- [ ] `Number.parseInt()` で `number` に変換後、`createLgtmImageId()` で `LgtmImageId` に変換
- [ ] `url: string` → `LgtmImageUrl` の変換が行われている
- [ ] `createLgtmImageUrl()` で `LgtmImageUrl` に変換
- [ ] `url` → `imageUrl` のプロパティ名マッピングが行われている
- [ ] `convertToLgtmImages` 関数が実装されている

### エラーハンドリング
- [ ] HTTPステータスコード401エラーが適切に処理されている
- [ ] HTTPステータスコード500エラーが適切に処理されている
- [ ] HTTPステータスコード200でもレスポンス形式が不正な場合にエラーがthrowされている
- [ ] **型ガード関数 `isValidApiLgtmImageResponse()` でバリデーションが行われている**
- [ ] バリデーション失敗時に "Invalid API response format" エラーがthrowされている
- [ ] エラーレスポンスのボディが取得されている（JSON→text→undefined）
- [ ] `response.headers` が `Record<string, string>` に変換されている
- [ ] エラー情報（statusCode, statusText, headers, responseBody）がthrowされている
- [ ] ネットワークエラーが適切に処理されている
- [ ] カスタムエラーが再スローされている

### テストコード
- [ ] 成功ケースのテストが実装されている
- [ ] 401エラーケースのテストが実装されている
- [ ] 500エラーケースのテストが実装されている
- [ ] MSWサーバーのセットアップが正しい
- [ ] 既存のモック関数を使用している

### 品質管理
- [ ] `npm run format` が成功している
- [ ] `npm run lint` がエラー0で完了している
- [ ] `npm run test` が全てパスしている
- [ ] `npm run build` が成功している

### コーディング規約
- [ ] ファイル先頭に「絶対厳守：編集前に必ずAI実装ルールを読む」コメントがある
- [ ] キャメルケースの変数名を使用している
- [ ] 汎用的な変数名（`data`など）を避けている
- [ ] 既存ファイルを変更していない
- [ ] 存在しないファイルをimportしていない

---

## 🎯 成功基準

以下を全て満たすこと:

✅ **`isLgtmImageUrl` バリデーション関数が正しく実装されている**
✅ **`isLgtmImageUrl` は `new URL()` を使って厳密にドメイン検証を行っている（セキュリティ重要）**
✅ 2つのLGTM画像取得関数が正しく実装されている（`fetchLgtmImagesInRandom`, `fetchLgtmImagesInRecentlyCreated`）
✅ 3つのテストファイルが正しく実装されている
✅ **全てのテストケースが成功する（合計26件: isLgtmImageUrl 14件 + 各fetch関数 6件ずつ）**
✅ **HTTP 200 + 不正レスポンスのテストケースが追加されている（id形式不正、url拡張子不正、urlドメイン不正）**
✅ **TypeScript型ガード関数とzodによる実行時型ガードが実装されている（最重要）**
✅ **zodの `.refine()` で `id` が数値文字列かどうかをバリデーションしている**
✅ **zodの `.refine(isLgtmImageUrl)` でURLが `.webp` 拡張子と `lgtmeow.com` ドメインを含むことをバリデーションしている**
✅ HTTPステータスコード200でもレスポンス形式が不正な場合はエラーになる
✅ **型アサーション（`as`）を使用せず、TypeScript型ガード関数（`apiResponse is ApiLgtmImageResponse`）で型安全性を確保している**
✅ Branded Types（`LgtmImageId`, `LgtmImageUrl`）を使用して型安全性を向上
✅ 型変換が正しく行われている（`id: string` → `number` → `LgtmImageId`, `url: string` → `LgtmImageUrl`, `url` → `imageUrl`）
✅ 型作成関数 `createLgtmImageId`, `createLgtmImageUrl` を使用してBranded Typeを作成
✅ コーディング規約の「Branded Types の使用」に完全準拠
✅ **zodスキーマに `.readonly()` を適用して全てのプロパティを readonly 化している**
✅ **`z.infer` で推論される型は readonly プロパティとして推論される**
✅ エラーハンドリングが適切に実装されている
✅ `npm run format` が成功する
✅ `npm run lint` がエラー0で完了する
✅ `npm run test` が全てパスする
✅ `npm run build` が成功する
✅ コーディング規約に準拠している

---

## 📚 参考情報

### 使用・拡張するファイル

1. **型定義（拡張）**
   - `src/features/main/types/lgtmImage.ts` - Branded Type を追加して拡張

2. **URL取得関数（使用のみ）**
   - `src/features/main/functions/api-url.ts`

3. **モック関数**
   - `src/mocks/api/external/lgtmeow/mock-fetch-lgtm-images.ts`
   - `src/mocks/api/error/mock-unauthorized-error.ts`
   - `src/mocks/api/error/mock-internal-server-error.ts`

4. **モックボディ**
   - `src/mocks/api/fetch-lgtm-images-mock-body.ts`

5. **定数**
   - `src/constants/http-status-code.ts`

### コーディング規約ドキュメント

- `docs/basic-coding-guidelines.md` - 基本的なコーディングガイドライン
- `docs/project-coding-guidelines.md` - プロジェクト固有のコーディング規約

### APIエンドポイント

- ランダム画像: `{LGTMEOW_API_URL}/lgtm-images`
- 最近作成された画像: `{LGTMEOW_API_URL}/lgtm-images/recently-created`

---

**作成日**: 2025-11-15
**対象Issue**: #327
**担当**: AI実装者
