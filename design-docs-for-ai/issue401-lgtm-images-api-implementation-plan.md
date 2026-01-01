# Issue #401: 後方互換性維持の為 `GET /api/lgtm-images` を実装する

## 概要

後方互換性維持のために、`GET /api/lgtm-images` APIエンドポイントを実装する。このエンドポイントは、かつてPages Routerで実装されていたAPIエンドポイントの後方互換性を維持するために必要であり、現在も一部のサードパーティツールから利用されている。

## GitHub Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/401

## 背景・経緯

- 既にAPIはドキュメントも含めて外部公開されている: https://api.lgtmeow.com/redoc
- 一部でかつてPages Routerで作っていた際にNext.js上に実装されたAPIエンドポイントが、まだ一部サードパーティーツールから利用されている
- 利用されているサードパーティツール:
  - https://zenn.dev/miyasic/articles/lgtm-shellscript
  - https://zenn.dev/snaka/scraps/decca213c14ec4

## 実装対象

### レスポンス形式

`GET /api/lgtm-images` は以下の形式のJSONを返す:

```json
[
  {
    "id": 35,
    "imageUrl": "https://lgtm-images.lgtmeow.com/2021/03/16/22/e3fe2715-4155-45fc-b1cc-916db866f78f.webp"
  },
  {
    "id": 138,
    "imageUrl": "https://lgtm-images.lgtmeow.com/2021/11/16/22/ae21402b-64a6-4697-bfac-06b9766f75af.webp"
  }
]
```

**重要なポイント**:
- レスポンスは配列形式 (ルートレベルが配列)
- `id` は数値型 (`number`)
- `imageUrl` は文字列型 (`string`)

### 外部APIとの変換

外部API (`LGTMEOW_API_URL/lgtm-images`) のレスポンス形式:

```json
{
  "lgtmImages": [
    { "id": "35", "url": "https://..." }
  ]
}
```

新しいAPIエンドポイントのレスポンス形式:

```json
[
  { "id": 35, "imageUrl": "https://..." }
]
```

**変換が必要な点**:
- 外部API: `{ lgtmImages: [...] }` -> 新API: `[...]` (配列をアンラップ)
- 外部API: `id: string` -> 新API: `id: number` (型変換)
- 外部API: `url: string` -> 新API: `imageUrl: string` (プロパティ名変更)

## 前提条件の確認

### 現在のファイル構造

```text
src/
├── app/
│   ├── (default)/
│   │   # 注意: src/app/(default)/api/ は存在しない (新規作成が必要)
│   └── edge/
├── features/
│   └── main/
│       ├── functions/
│       │   ├── fetch-lgtm-images.ts   # 既存: LGTM画像取得ロジック
│       │   ├── api-url.ts             # 既存: API URLの定義
│       │   └── __tests__/
│       │       └── fetch-lgtm-images/
│       │           ├── fetch-lgtm-images-in-random.test.ts
│       │           └── fetch-lgtm-images-in-recently-created.test.ts
│       └── types/
│           └── lgtm-image.ts          # 既存: 型定義
├── lib/
│   └── cognito/
│       └── oidc.ts                    # 既存: アクセストークン取得
├── mocks/
│   └── api/
│       ├── fetch-lgtm-images-mock-body.ts
│       ├── external/
│       │   └── lgtmeow/
│       │       └── mock-fetch-lgtm-images.ts
│       └── error/
│           └── mock-internal-server-error.ts
└── constants/
    └── http-status-code.ts            # 既存: HTTPステータスコード定義
```

### 再利用する既存モジュール

| モジュール | パス | 用途 |
|----------|------|------|
| `fetchLgtmImagesInRandom` | `@/features/main/functions/fetch-lgtm-images` | ランダムLGTM画像取得 (戻り値は `LgtmImage[]`) |
| `FetchLgtmImagesError` | `@/features/main/functions/fetch-lgtm-images` | API呼び出しエラー時の例外クラス |
| `issueClientCredentialsAccessToken` | `@/lib/cognito/oidc` | アクセストークン取得 |
| `httpStatusCode` | `@/constants/http-status-code` | HTTPステータスコード |
| `mockFetchLgtmImages` | `@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images` | テスト用モック |
| `mockInternalServerError` | `@/mocks/api/error/mock-internal-server-error` | テスト用エラーモック |

## 実装方針

### アーキテクチャ

Next.js 16 App RouterのRoute Handlerを使用してAPIエンドポイントを実装する。

**理由**:
1. 既存の `fetchLgtmImagesInRandom` を完全に再利用可能
2. サーバーサイドでアクセストークンを取得するため、セキュリティが確保される
3. App Router の Route Handler は標準の `Response` オブジェクトを使用するため、シンプルで理解しやすい

### 処理フロー

```
[外部クライアント]
    │
    ▼ GET /api/lgtm-images
[Route Handler]
    │
    ├─▶ issueClientCredentialsAccessToken() でアクセストークン取得
    │
    ├─▶ fetchLgtmImagesInRandom() でランダム画像リスト取得
    │
    └─▶ LgtmImage[] をそのままJSONレスポンスとして返却
          (Branded TypeはJSONシリアライズ時にプリミティブ型として出力される)
```

## 実装手順

### ステップ1: APIエラーレスポンス用の型定義ファイル作成

**新規ファイル**: `src/app/(default)/api/lgtm-images/types.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * エラーレスポンスの型
 */
export type LgtmImageApiErrorResponse = {
  readonly code: number;
  readonly message: string;
};
```

**実装ポイント**:
- プロパティに `readonly` を付与 (コーディング規約準拠)
- 成功レスポンスは既存の `LgtmImage` 型をそのまま使用 (Branded Typeを維持)

### ステップ2: Sentry連携用ヘルパー関数の作成

**新規ファイル**: `src/lib/sentry/might-set-request-id-to-sentry-from-error.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import * as Sentry from "@sentry/nextjs";

/**
 * headers プロパティを持つエラーオブジェクトの型
 */
type ErrorWithHeaders = {
  readonly headers?: Record<string, string>;
};

/**
 * エラーオブジェクトから x-request-id を取得し、Sentry のタグに設定する
 * FetchLgtmImagesError などの headers プロパティを持つエラーに対応
 */
export const mightSetRequestIdToSentryFromError = (
  error: ErrorWithHeaders
): void => {
  const xRequestId = error.headers?.["x-request-id"];
  if (xRequestId != null) {
    Sentry.getCurrentScope().setTag("x_request_id", xRequestId);
  }
};
```

**実装ポイント**:
- `ErrorWithHeaders` 型を定義して汎用性を確保
- 既存の `mightSetRequestIdToSentry` と同様のロジック
- `FetchLgtmImagesError` だけでなく、`headers` プロパティを持つ任意のエラーに対応可能
- ファイル名は既存の命名規則に従いケバブケースで作成

### ステップ3: Route Handler の実装

**新規ファイル**: `src/app/(default)/api/lgtm-images/route.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import * as Sentry from "@sentry/nextjs";
import { httpStatusCode } from "@/constants/http-status-code";
import {
  FetchLgtmImagesError,
  fetchLgtmImagesInRandom,
} from "@/features/main/functions/fetch-lgtm-images";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import { mightSetRequestIdToSentryFromError } from "@/lib/sentry/might-set-request-id-to-sentry-from-error";
import type { LgtmImageApiErrorResponse } from "./types";

/**
 * GET /api/lgtm-images
 * 後方互換性維持のためのLGTM画像取得APIエンドポイント
 */
export async function GET(): Promise<Response> {
  try {
    const accessToken = await issueClientCredentialsAccessToken();
    const lgtmImages = await fetchLgtmImagesInRandom(accessToken);

    return Response.json(lgtmImages, {
      status: httpStatusCode.ok,
    });
  } catch (error) {
    // FetchLgtmImagesError の場合は x-request-id を Sentry に設定
    if (error instanceof FetchLgtmImagesError) {
      mightSetRequestIdToSentryFromError(error);
    }

    // Sentry にエラーを送信
    Sentry.captureException(error);

    const errorResponse: LgtmImageApiErrorResponse = {
      code: httpStatusCode.internalServerError,
      message: "Internal Server Error",
    };

    return Response.json(errorResponse, {
      status: httpStatusCode.internalServerError,
    });
  }
}
```

**実装ポイント**:
1. `GET` 関数をexportする (App Router の Route Handler 規約)
2. `Response.json()` を使用してJSONレスポンスを返す (`Content-Type: application/json` は自動設定される)
3. `httpStatusCode` 定数を使用してステータスコードを設定
4. `LgtmImage[]` をそのまま返す (Branded Typeを維持、JSONシリアライズ時にプリミティブ型として出力される)
5. エラーハンドリングで500エラーを返す
6. **Sentry連携**: `FetchLgtmImagesError` の場合は `x-request-id` をタグに設定し、`Sentry.captureException` でエラーを送信
7. **HTTPメソッドの制限**: `GET` のみをexportしているため、他のメソッド (POST, PUT, DELETE等) は自動的に405 Method Not Allowedが返される

> **Note**: CORSについて - このAPIは主にサーバーサイドのシェルスクリプト (curl) から呼び出されるため、CORSヘッダーは不要です。ブラウザからの直接アクセスが必要な場合は、別途CORSの設定を検討してください。

> **Note**: `console.error` は削除しました。エラーログは Sentry に集約されるため、コンソール出力は不要です。

### ステップ4: テストの作成

**新規ディレクトリ**: `src/app/(default)/api/lgtm-images/__tests__/`

**新規ファイル**: `src/app/(default)/api/lgtm-images/__tests__/route.test.ts`

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import * as Sentry from "@sentry/nextjs";
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
import { fetchLgtmImagesInRandomUrl } from "@/features/main/functions/api-url";
import { mockFetchLgtmImages } from "@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images";
import { mockInternalServerError } from "@/mocks/api/error/mock-internal-server-error";
import { GET } from "../route";

// Sentry をモック
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  getCurrentScope: vi.fn(() => ({
    setTag: vi.fn(),
  })),
}));

// Cognitoのアクセストークン取得をモック
vi.mock("@/lib/cognito/oidc", () => ({
  issueClientCredentialsAccessToken: vi.fn(() =>
    Promise.resolve("mock-access-token")
  ),
}));

// mightSetRequestIdToSentryFromError をモック
vi.mock("@/lib/sentry/might-set-request-id-to-sentry-from-error", () => ({
  mightSetRequestIdToSentryFromError: vi.fn(),
}));

const mockHandlers = [
  http.get(fetchLgtmImagesInRandomUrl(), mockFetchLgtmImages),
];

const server = setupServer(...mockHandlers);

describe("src/app/(default)/api/lgtm-images/route.ts GET TestCases", () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("should return LGTM images with correct format when API call succeeds", async () => {
    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody).toHaveLength(9);

    // 最初の画像のフォーマットを確認
    expect(responseBody[0]).toStrictEqual({
      id: 1,
      imageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/00/71a7a8d4-33c2-4399-9c5b-4ea585c06580.webp",
    });

    // 最後の画像のフォーマットを確認
    expect(responseBody[8]).toStrictEqual({
      id: 9,
      imageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp",
    });

    // 型の確認
    for (const image of responseBody) {
      expect(typeof image.id).toBe("number");
      expect(typeof image.imageUrl).toBe("string");
    }

    // 成功時は Sentry.captureException が呼ばれないことを確認
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("should return 500 error and send to Sentry when external API returns error", async () => {
    server.use(http.get(fetchLgtmImagesInRandomUrl(), mockInternalServerError));

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toStrictEqual({
      code: 500,
      message: "Internal Server Error",
    });

    // Sentry.captureException が呼ばれたことを確認
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it("should return 500 error and send to Sentry when access token retrieval fails", async () => {
    const { issueClientCredentialsAccessToken } = await import(
      "@/lib/cognito/oidc"
    );
    vi.mocked(issueClientCredentialsAccessToken).mockRejectedValueOnce(
      new Error("Failed to retrieve access token")
    );

    const response = await GET();
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toStrictEqual({
      code: 500,
      message: "Internal Server Error",
    });

    // Sentry.captureException が呼ばれたことを確認
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});
```

**実装ポイント**:
1. MSW (Mock Service Worker) を使用して外部APIをモック
2. `issueClientCredentialsAccessToken` は `vi.mock` でモック
3. `@sentry/nextjs` と `mightSetRequestIdToSentryFromError` は `vi.mock` でモック
4. 既存のモックファイル (`mockFetchLgtmImages`, `mockInternalServerError`) を再利用
5. レスポンス形式が後方互換性を満たしているかを検証
   - 配列形式であること
   - `id` が `number` 型であること
   - `imageUrl` が `string` 型であること
6. エラーケースのテストを含む:
   - 外部API エラー時 (`Sentry.captureException` が呼ばれることを確認)
   - アクセストークン取得失敗時 (`Sentry.captureException` が呼ばれることを確認)
7. 成功時は `Sentry.captureException` が呼ばれないことを確認
8. `vi` を `vitest` からインポート (重要)
9. `beforeEach` で `vi.clearAllMocks()` を実行してモックをリセット

## ファイル変更一覧

| ファイルパス | 操作 | 説明 |
|------------|------|------|
| `src/lib/sentry/might-set-request-id-to-sentry-from-error.ts` | 新規作成 | Sentry連携用ヘルパー関数 |
| `src/app/(default)/api/lgtm-images/types.ts` | 新規作成 | APIエラーレスポンスの型定義 |
| `src/app/(default)/api/lgtm-images/route.ts` | 新規作成 | Route Handler の実装 |
| `src/app/(default)/api/lgtm-images/__tests__/route.test.ts` | 新規作成 | Route Handler のテスト |

## ディレクトリ構造 (実装後)

```text
src/
├── lib/
│   └── sentry/
│       ├── might-set-request-id-to-sentry.ts            # 既存
│       └── might-set-request-id-to-sentry-from-error.ts # 新規: エラー用ヘルパー
└── app/
    ├── (default)/
    │   └── api/
    │       └── lgtm-images/
    │           ├── types.ts           # 新規: エラーレスポンス型定義
    │           ├── route.ts           # 新規: Route Handler
    │           └── __tests__/
    │               └── route.test.ts  # 新規: テスト
    └── edge/
```

## リスク分析

### 影響範囲

1. **新規APIエンドポイントの追加**
   - 既存の機能に影響なし
   - 後方互換性を維持するための新規実装

2. **外部APIへの依存**
   - `LGTMEOW_API_URL/lgtm-images` への依存
   - アクセストークン取得のためのCognito依存

### デグレードリスク

**低い**:
- 新規エンドポイントの追加のみ
- 既存のコードを変更しない
- 既存のモジュールを再利用するため、実装が安定している

### セキュリティ考慮

- アクセストークンはサーバーサイドでのみ使用 (クライアントに露出しない)
- 認証・認可は外部API側で行われる
- エラーメッセージは詳細を隠蔽 (内部エラーの詳細をクライアントに返さない)

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

### 4. curlでAPIの動作確認

#### 4-1. 正常系の確認

```bash
curl -s http://localhost:2222/api/lgtm-images | jq
```

**期待されるレスポンス**:

```json
[
  {
    "id": 35,
    "imageUrl": "https://lgtm-images.lgtmeow.com/..."
  },
  ...
]
```

**確認項目**:
- ステータスコードが200であること
- レスポンスが配列形式であること
- 各要素に `id` (number) と `imageUrl` (string) が含まれていること

#### 4-2. レスポンスヘッダーの確認

```bash
curl -i http://localhost:2222/api/lgtm-images 2>&1 | head -20
```

**期待されるヘッダー**:
- `HTTP/1.1 200 OK` または `HTTP/2 200`
- `content-type: application/json` (`Response.json()` により自動設定)

> **Note**: `-I` オプションはHEADリクエストを送信するため、Route Handlerが対応していない場合は405を返す可能性があります。`-i` オプションでGETリクエストのヘッダーを確認してください。

## 実装時の注意事項

### 必ず確認すべき事項

1. **ファイル先頭コメント**: 全てのソースファイルの先頭に `// 絶対厳守：編集前に必ずAI実装ルールを読む` を記載
2. **型定義**: `readonly` を全てのプロパティに付与
3. **変数命名**: キャメルケースを使用、`const` を優先
4. **エラーハンドリング**: 詳細なエラー情報をクライアントに露出しない
5. **既存モジュールの再利用**: `fetchLgtmImagesInRandom` などを直接再利用

### 禁止事項

1. **アクセストークンのクライアント露出**: サーバーサイドでのみ使用
2. **既存コードの変更**: 新規ファイルの追加のみ
3. **存在しないファイルのimport**: 必ず既存ファイルの存在を確認してからimport
4. **存在しないプロパティの使用**: 既存の型定義を確認してから使用

## 依存関係の確認

### インポートするモジュール (全て既存)

#### route.ts で使用

| モジュール | パス | 確認済み |
|----------|------|---------|
| `Sentry` | `@sentry/nextjs` | package.json |
| `httpStatusCode` | `@/constants/http-status-code` | src/constants/http-status-code.ts |
| `FetchLgtmImagesError`, `fetchLgtmImagesInRandom` | `@/features/main/functions/fetch-lgtm-images` | src/features/main/functions/fetch-lgtm-images.ts |
| `issueClientCredentialsAccessToken` | `@/lib/cognito/oidc` | src/lib/cognito/oidc.ts |

#### route.test.ts で使用

| モジュール | パス | 確認済み |
|----------|------|---------|
| `Sentry` | `@sentry/nextjs` | package.json |
| `fetchLgtmImagesInRandomUrl` | `@/features/main/functions/api-url` | src/features/main/functions/api-url.ts |
| `mockFetchLgtmImages` | `@/mocks/api/external/lgtmeow/mock-fetch-lgtm-images` | src/mocks/api/external/lgtmeow/mock-fetch-lgtm-images.ts |
| `mockInternalServerError` | `@/mocks/api/error/mock-internal-server-error` | src/mocks/api/error/mock-internal-server-error.ts |

### 新規作成するモジュール

| モジュール | パス | 用途 |
|----------|------|------|
| `mightSetRequestIdToSentryFromError` | `@/lib/sentry/might-set-request-id-to-sentry-from-error` | エラーから x-request-id を取得し Sentry に設定 |

## まとめ

この実装計画では、以下の機能を実現します:

1. `GET /api/lgtm-images` エンドポイントの実装
2. 後方互換性のあるレスポンス形式 (`[{ id: number, imageUrl: string }, ...]`)
3. 既存の `fetchLgtmImagesInRandom` を再利用
4. MSWを使用したテストカバレッジの確保
5. エラーハンドリングの実装
6. Sentry連携によるエラー監視 (`x-request-id` タグ付き)

**主な変更ファイル**:
- `src/lib/sentry/might-set-request-id-to-sentry-from-error.ts` (新規)
- `src/app/(default)/api/lgtm-images/types.ts` (新規)
- `src/app/(default)/api/lgtm-images/route.ts` (新規)
- `src/app/(default)/api/lgtm-images/__tests__/route.test.ts` (新規)

## レビュー履歴

### レビュー1回目

| 指摘事項 | 対応状況 | 対応内容 |
|---------|---------|---------|
| テストコードで `vi` がインポートされていない | 対応済み | `vi` を `vitest` からインポートするよう修正 |
| `Response.json()` は自動的に `Content-Type` を設定する | 対応済み | 明示的なヘッダー設定を削除 |
| アクセストークン取得失敗時のテストケースが不足 | 対応済み | テストケースを追加 |
| CORSヘッダーの考慮 | 対応済み | Noteとして記載 (シェルスクリプトからの利用のため不要) |
| HTTPメソッドの制限について明記 | 対応済み | 実装ポイントに追記 |
| curlのヘッダー確認コマンドが不適切 | 対応済み | `-I` を `-i` に変更 |

### レビュー2回目

| 指摘事項 | 対応状況 | 対応内容 |
|---------|---------|---------|
| テストの説明文を既存パターンに合わせる | 対応済み | `describe` の説明文をファイルパス形式に変更 |
| レビュー履歴の追加 | 対応済み | 本セクションを追加 |

### レビュー3回目

| 指摘事項 | 対応状況 | 対応内容 |
|---------|---------|---------|
| テストの assertion を既存パターンに合わせる | 対応済み | `toEqual` を `toStrictEqual` に統一 |
| 未使用の `mockUnauthorizedError` 参照を削除 | 対応済み | ファイル構造と依存関係テーブルから削除 |

### 追加要望: Sentry連携

| 要望内容 | 対応状況 | 対応内容 |
|---------|---------|---------|
| エラー時に Sentry へエラーを送信したい | 対応済み | `Sentry.captureException` を追加 |
| `x-request-id` を Sentry タグに設定したい | 対応済み | `mightSetRequestIdToSentryFromError` ヘルパー関数を新規作成 |
| テストで Sentry 連携を検証 | 対応済み | テストコードに Sentry モックと検証を追加 |

### レビュー4回目

| 指摘事項 | 対応状況 | 対応内容 |
|---------|---------|---------|
| Branded Typeからプリミティブ型への変換は不要 | 対応済み | `LgtmImageApiResponse` 型と `convertToApiResponse` 関数を削除。`LgtmImage[]` をそのまま返すように修正 |
| 処理フローの記述が古い | 対応済み | 「レスポンス形式に変換」を「LgtmImage[] をそのままJSONレスポンスとして返却」に修正 |
| ファイル変更一覧の types.ts 説明が不正確 | 対応済み | 「APIレスポンスの型定義」を「APIエラーレスポンスの型定義」に修正 |
| 依存関係テーブルに直接 import しないモジュールが含まれている | 対応済み | route.ts 用と route.test.ts 用にテーブルを分離し、各ファイルで実際に import するモジュールのみ記載 |
| 再利用する既存モジュールに不要な型定義が含まれている | 対応済み | `LgtmImage` 等を削除し、`FetchLgtmImagesError` を追加。`fetchLgtmImagesInRandom` に戻り値の注記を追加 |
| ディレクトリ構造の types.ts コメントが不正確 | 対応済み | 「型定義」を「エラーレスポンス型定義」に修正 |
| ファイル配置場所が不正確 | 対応済み | `src/app/api/` を `src/app/(default)/api/` に修正 (ルートグループ内に配置) |
