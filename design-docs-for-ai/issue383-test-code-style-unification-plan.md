# Issue #383: テストコードの書き方統一 - 詳細実装計画書

## 概要

### 目的

テストコードの書き方がバラバラになっているため、統一されたスタイルにリファクタリングする。また、決定したルールを `docs/project-coding-guidelines.md` に追記する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/383

### 技術スタック

- **テストフレームワーク**: Vitest
- **テストユーティリティ**: @testing-library/react, msw
- **フレームワーク**: Next.js 16 App Router
- **React**: v19

---

## 現状分析

### 準拠しているテストファイル (参考パターン)

以下のファイルは既に統一されたスタイルに準拠している:

| ファイルパス | describeブロック名 | スタイル |
|-------------|-------------------|----------|
| `src/features/__tests__/language/might-extract-language-from-app-path.test.ts` | `src/features/language.ts mightExtractLanguageFromAppPath TestCases` | テーブル駆動型、英語it |
| `src/features/__tests__/language/remove-language-from-app-path.test.ts` | `src/features/language.ts removeLanguageFromAppPath TestCases` | テーブル駆動型、英語it |
| `src/features/__tests__/url/is-include-language-app-path.test.ts` | `src/features/url.ts isIncludeLanguageAppPath TestCases` | テーブル駆動型、英語it |
| `src/features/__tests__/open-graph-locale/convert-language-to-open-graph-locale.test.ts` | `src/features/open-graph-locale.ts convertLanguageToOpenGraphLocale TestCases` | テーブル駆動型、英語it |
| `src/features/main/functions/__tests__/is-lgtm-image-url.test.ts` | `src/features/main/functions/is-lgtm-image-url.ts isLgtmImageUrl TestCases` | テーブル駆動型、英語it |
| `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-random.test.ts` | `src/features/main/functions/fetch-lgtm-images.ts fetchLgtmImagesInRandom TestCases` | 複数it、英語it |
| `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-recently-created.test.ts` | `src/features/main/functions/fetch-lgtm-images.ts fetchLgtmImagesInRecentlyCreated TestCases` | 複数it、英語it |
| `src/app/(default)/api/lgtm-images/__tests__/route.test.ts` | `src/app/(default)/api/lgtm-images/route.ts GET TestCases` | 複数it、英語it |

### 準拠していないテストファイル (変更対象)

| ファイルパス | 現在のdescribe名 | 問題点 |
|-------------|------------------|--------|
| `src/components/footer.test.tsx` | (describeなし) | describeがない、itメッセージが曖昧 |
| `src/features/upload/__tests__/upload-validator.test.ts` | `validateUploadFile` | ファイルパスなし、日本語it |
| `src/features/upload/components/__tests__/upload-form.test.tsx` | `UploadForm` | ファイルパスなし、日本語it |
| `src/features/upload/components/__tests__/upload-progress.test.tsx` | `UploadProgress` | ファイルパスなし、日本語it |
| `src/features/upload/components/__tests__/upload-success.test.tsx` | `UploadSuccess` | ファイルパスなし、日本語it |
| `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` | `generateLgtmMarkdown` | ファイルパスなし (itは既に英語) |
| `src/utils/__tests__/with-callbacks.test.ts` | `withCallbacks` | ファイルパスなし (itは既に英語) |
| `src/features/upload/actions/__tests__/generate-upload-url-action.test.ts` | `generateUploadUrlAction` | ファイルパスなし、日本語it |
| `src/features/upload/actions/__tests__/validate-and-create-lgtm-image-action.test.ts` | `validateAndCreateLgtmImageAction` | ファイルパスなし、日本語it |
| `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` | `copyRandomCatAction` | ファイルパスなし (itは既に英語、日本語コメントあり) |
| `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts` | `refreshRandomCatsAction` | ファイルパスなし (itは既に英語) |
| `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts` | `showLatestCatsAction` | ファイルパスなし (itは既に英語) |

### クイックリファレンス表

全ての変更対象ファイルと必要な変更の概要:

| # | ファイル | describe変更 | it英語化 | ネストdescribe削除 | コメント英語化 |
|---|----------|--------------|----------|-------------------|---------------|
| 1 | `footer.test.tsx` | 追加必要 | 必要 | - | - |
| 2 | `upload-validator.test.ts` | 必要 | 必要 | 削除必要 | - |
| 3 | `upload-form.test.tsx` | 必要 | 必要 | 削除必要 | - |
| 4 | `upload-progress.test.tsx` | 必要 | 必要 | 削除必要 | - |
| 5 | `upload-success.test.tsx` | 必要 | 必要 | 削除必要 | - |
| 6 | `generate-lgtm-markdown.test.ts` | 必要 | 不要(既に英語) | - | - |
| 7 | `with-callbacks.test.ts` | 必要 | should形式に修正必要 | - | - |
| 8 | `generate-upload-url-action.test.ts` | 必要 | 必要 | 削除必要 | 必要 |
| 9 | `validate-and-create-lgtm-image-action.test.ts` | 必要 | 必要 | 削除必要 | 必要 |
| 10 | `copy-random-cat.test.ts` | 必要 | 不要(既に英語) | - | 必要 |
| 11 | `refresh-random-cats.test.ts` | 必要 | should形式に修正必要 | - | - |
| 12 | `show-latest-cats.test.ts` | 必要 | should形式に修正必要 | - | - |

---

## 統一ルール

Issueの要件とVitestのベストプラクティスに基づき、以下のルールを適用する:

### 1. ファイル配置ルール

テストファイルは以下の構成で配置する:

```
src/<機能>/__tests__/<サブ機能>/<関数名>.test.ts
```

**例**:
- `src/features/__tests__/language/might-extract-language-from-app-path.test.ts`
- `src/features/main/functions/__tests__/fetch-lgtm-images/fetch-lgtm-images-in-random.test.ts`

### 2. describeブロックの書き方

**形式**: `"<ファイルパス> <関数名/コンポーネント名> TestCases"`

**例**:
```typescript
describe("src/features/language.ts mightExtractLanguageFromAppPath TestCases", () => {
  // ...
});
```

**Componentの場合**:
```typescript
describe("src/components/footer.tsx Footer TestCases", () => {
  // ...
});
```

### 3. describeのネストルール

- トップレベルの `describe` は1ファイルに1つまで (Issue #383の要件)
- **ネストした `describe` は禁止**
- テストケースのグループ化は `it` の命名で表現する

**例**:
```typescript
describe("src/features/upload/functions/upload-validator.ts validateUploadFile TestCases", () => {
  it("should allow PNG files", () => { ... });
  it("should allow JPEG files", () => { ... });
  it("should reject GIF files", () => { ... });
  it("should reject files larger than 5MB", () => { ... });
});
```

### 4. itの名前ルール

- **英語で統一** (必須)
- **何をテストしているか分かりやすい名称** (必須)
- **必須フォーマット**: `"should <期待する動作>"` または `"should <期待する動作> when <条件>"`

**良い例**:
```typescript
it("should return language when appPath contains valid language", () => { ... });
it("should allow PNG files", () => { ... });
it("should reject files larger than 5MB", () => { ... });
```

**悪い例**:
```typescript
it("PNGファイルは許可される", () => { ... }); // 日本語NG
it("test1", () => { ... }); // 意味不明
```

### 5. テーブル駆動型テストの書き方

複数のパラメータでテストを行う場合は `it.each` を使用:

```typescript
describe("src/features/language.ts mightExtractLanguageFromAppPath TestCases", () => {
  interface TestTable {
    readonly appPath: IncludeLanguageAppPath;
    readonly expected: Language | null;
  }

  it.each`
    appPath         | expected
    ${"/en"}        | ${"en"}
    ${"/ja"}        | ${"ja"}
    ${"/en/upload"} | ${"en"}
  `(
    "should return $expected when appPath is $appPath",
    ({ appPath, expected }: TestTable) => {
      expect(mightExtractLanguageFromAppPath(appPath)).toStrictEqual(expected);
    }
  );
});
```

**ポイント**:
- `TestTable` interface を定義して型安全性を確保
- `readonly` を使用
- テンプレートリテラル形式 (`it.each\`...\``) を使用

### 6. hooksの使用順序

Vitestのhooksは以下の順序でインポート・使用する:

```typescript
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

describe("...", () => {
  beforeAll(() => { ... });
  beforeEach(() => { ... });
  afterEach(() => { ... });
  afterAll(() => { ... });

  it("...", () => { ... });
});
```

---

## 変更内容

### 1. docs/project-coding-guidelines.md への追記

テストコードの書き方ルールを追記する。

### 2. 各テストファイルの修正

以下の修正を行う:

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/components/footer.test.tsx` | describeブロック追加、itメッセージを英語化 |
| `src/features/upload/__tests__/upload-validator.test.ts` | describeにファイルパス追加、itメッセージを英語化、ネストdescribe削除 |
| `src/features/upload/components/__tests__/upload-form.test.tsx` | describeにファイルパス追加、itメッセージを英語化、ネストdescribe削除 |
| `src/features/upload/components/__tests__/upload-progress.test.tsx` | describeにファイルパス追加、itメッセージを英語化、ネストdescribe削除 |
| `src/features/upload/components/__tests__/upload-success.test.tsx` | describeにファイルパス追加、itメッセージを英語化、ネストdescribe削除 |
| `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` | describeにファイルパス追加 |
| `src/utils/__tests__/with-callbacks.test.ts` | describeにファイルパス追加、itメッセージをshould形式に修正 |
| `src/features/upload/actions/__tests__/generate-upload-url-action.test.ts` | describeにファイルパス追加、itメッセージを英語化、ネストdescribe削除、コメント英語化 |
| `src/features/upload/actions/__tests__/validate-and-create-lgtm-image-action.test.ts` | describeにファイルパス追加、itメッセージを英語化、ネストdescribe削除、コメント英語化 |
| `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` | describeにファイルパス追加、コメント英語化 |
| `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts` | describeにファイルパス追加、itメッセージをshould形式に修正 |
| `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts` | describeにファイルパス追加、itメッセージをshould形式に修正 |

---

## 実装詳細

### 1. docs/project-coding-guidelines.md への追記

**ファイルパス**: `docs/project-coding-guidelines.md`

**追記位置**: ファイル末尾 (既存のセクションの後)

**追記内容**:

```markdown
## テストコードの書き方

Vitestを使用したテストコードの書き方を統一します。

### ファイル配置

テストファイルは以下の構成で配置します:

```
src/<機能>/__tests__/<サブ機能>/<関数名>.test.ts
```

### describeブロックの命名

トップレベルの `describe` には以下の形式で名前を付けます:

```
"<ファイルパス> <関数名/コンポーネント名> TestCases"
```

```typescript
// 関数のテストの場合
describe("src/features/language.ts mightExtractLanguageFromAppPath TestCases", () => {
  // ...
});

// Componentのテストの場合
describe("src/components/footer.tsx Footer TestCases", () => {
  // ...
});
```

### describeのネストルール

- トップレベルの `describe` は1ファイルに1つまで (Issue #383の要件)
- **ネストした `describe` は禁止**
- テストケースのグループ化は `it` の命名で表現する

```typescript
describe("src/features/upload/functions/upload-validator.ts validateUploadFile TestCases", () => {
  it("should allow PNG files", () => { ... });
  it("should allow JPEG files", () => { ... });
  it("should reject GIF files", () => { ... });
  it("should reject files larger than 5MB", () => { ... });
});
```

### itの命名規則

- **英語で統一** (必須)
- **何をテストしているか分かりやすい名称を付ける** (必須)
- **必須フォーマット**: `"should <期待する動作>"` または `"should <期待する動作> when <条件>"`

```typescript
// 必須フォーマット
it("should return language when appPath contains valid language", () => { ... });
it("should allow PNG files", () => { ... });
it("should reject files larger than 5MB", () => { ... });
it("should return error when API call fails", () => { ... });

// 禁止
it("PNGファイルは許可される", () => { ... }); // 日本語NG
it("test1", () => { ... }); // 意味不明
it("allows PNG files", () => { ... }); // should で始まっていない
```

### テーブル駆動型テスト

複数のパラメータでテストを行う場合は `it.each` を使用します:

```typescript
describe("src/features/language.ts mightExtractLanguageFromAppPath TestCases", () => {
  interface TestTable {
    readonly appPath: IncludeLanguageAppPath;
    readonly expected: Language | null;
  }

  it.each`
    appPath         | expected
    ${"/en"}        | ${"en"}
    ${"/ja"}        | ${"ja"}
    ${"/en/upload"} | ${"en"}
  `(
    "should return $expected when appPath is $appPath",
    ({ appPath, expected }: TestTable) => {
      expect(mightExtractLanguageFromAppPath(appPath)).toStrictEqual(expected);
    }
  );
});
```

**ポイント**:
- `TestTable` interface を定義して型安全性を確保
- プロパティには `readonly` を使用
- テンプレートリテラル形式 (`it.each\`...\``) を使用

### hooksの使用順序

Vitestのhooksは以下の順序で使用します:

```typescript
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

describe("...", () => {
  beforeAll(() => { ... });
  beforeEach(() => { ... });
  afterEach(() => { ... });
  afterAll(() => { ... });

  it("...", () => { ... });
});
```
```

---

### 2. src/components/footer.test.tsx の修正

**ファイルパス**: `src/components/footer.test.tsx`

**テスト対象ファイル**: `src/components/footer.tsx`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/footer";

describe("src/components/footer.tsx Footer TestCases", () => {
  it("should display Japanese links when language is ja", () => {
    render(<Footer language="ja" />);

    expect(screen.getByRole("link", { name: "利用規約" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "プライバシーポリシー" })
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "外部送信ポリシー" })).toBeTruthy();
  });

  it("should display English links when language is en", () => {
    render(<Footer language="en" />);

    expect(screen.getByRole("link", { name: "Terms of Use" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "External Transmission Policy" })
    ).toBeTruthy();
  });
});
```

**変更点**:
- `describe` をimportに追加
- `describe("src/components/footer.tsx Footer TestCases", ...)` でラップ
- itメッセージを英語化: `"show language is ja"` -> `"should display Japanese links when language is ja"`
- itメッセージを英語化: `"show language is en"` -> `"should display English links when language is en"`

---

### 3. src/features/upload/__tests__/upload-validator.test.ts の修正

**ファイルパス**: `src/features/upload/__tests__/upload-validator.test.ts`

**テスト対象ファイル**: `src/features/upload/functions/upload-validator.ts`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it } from "vitest";
import { validateUploadFile } from "../functions/upload-validator";

describe("src/features/upload/functions/upload-validator.ts validateUploadFile TestCases", () => {
  it("should allow PNG files", () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(true);
  });

  it("should allow JPEG files", () => {
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(true);
  });

  it("should reject GIF files", () => {
    const file = new File(["test"], "test.gif", { type: "image/gif" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("invalid_extension");
      expect(result.fileType).toBe("gif");
    }
  });

  it("should reject WebP files", () => {
    const file = new File(["test"], "test.webp", { type: "image/webp" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("invalid_extension");
    }
  });

  it("should reject files with invalid extension even if MIME type is allowed", () => {
    // Example: MIME is image/png but extension is .gif
    const file = new File(["test"], "test.gif", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("invalid_extension");
      expect(result.fileType).toBe("gif");
    }
  });

  it("should allow files up to 5MB", () => {
    const content = new Uint8Array(5 * 1024 * 1024); // 5MB
    const file = new File([content], "test.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(true);
  });

  it("should reject files larger than 5MB", () => {
    const content = new Uint8Array(5 * 1024 * 1024 + 1); // 5MB + 1byte
    const file = new File([content], "test.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorType).toBe("file_too_large");
    }
  });
});
```

**変更点**:
- トップレベルdescribe: `"validateUploadFile"` -> `"src/features/upload/functions/upload-validator.ts validateUploadFile TestCases"`
- ネストdescribe削除: `"許可されたファイル"`, `"許可されないファイル"`, `"ファイルサイズ"` を全て削除しフラット化
- it: `"PNGファイルは許可される"` -> `"should allow PNG files"`
- it: `"JPEGファイルは許可される"` -> `"should allow JPEG files"`
- it: `"GIFファイルは許可されない"` -> `"should reject GIF files"`
- it: `"WebPファイルは許可されない"` -> `"should reject WebP files"`
- it: `"MIMEタイプが許可されていても拡張子が不正なら許可されない"` -> `"should reject files with invalid extension even if MIME type is allowed"`
- it: `"5MB以下のファイルは許可される"` -> `"should allow files up to 5MB"`
- it: `"5MBを超えるファイルは許可されない"` -> `"should reject files larger than 5MB"`
- コメントも英語化: `// 例: MIMEはimage/pngだが拡張子が.gif` -> `// Example: MIME is image/png but extension is .gif`

---

### 4. src/features/upload/components/__tests__/upload-form.test.tsx の修正

**ファイルパス**: `src/features/upload/components/__tests__/upload-form.test.tsx`

**テスト対象ファイル**: `src/features/upload/components/upload-form.tsx`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadForm } from "../upload-form";

describe("src/features/upload/components/upload-form.tsx UploadForm TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display drop area text in Japanese when language is ja", () => {
    render(<UploadForm language="ja" />);

    expect(screen.getByText("ここに画像をドロップ")).toBeInTheDocument();
    expect(screen.getByText("またはファイルの選択")).toBeInTheDocument();
  });

  it("should display precautions in Japanese when language is ja", () => {
    render(<UploadForm language="ja" />);

    expect(screen.getByText("注意事項")).toBeInTheDocument();
    expect(
      screen.getByText(
        "拡張子が png, jpg, jpeg の画像のみアップロード出来ます。"
      )
    ).toBeInTheDocument();
  });

  it("should display drop area text in English when language is en", () => {
    render(<UploadForm language="en" />);

    expect(screen.getByText("Drop image here")).toBeInTheDocument();
    expect(screen.getByText("Select an image file")).toBeInTheDocument();
  });

  it("should display precautions in English when language is en", () => {
    render(<UploadForm language="en" />);

    expect(screen.getByText("Precautions")).toBeInTheDocument();
    expect(
      screen.getByText("png, jpg, jpeg images are available.")
    ).toBeInTheDocument();
  });
});
```

**変更点**:
- トップレベルdescribe: `"UploadForm"` -> `"src/features/upload/components/upload-form.tsx UploadForm TestCases"`
- ネストdescribe削除: `"日本語表示"`, `"英語表示"` を削除しフラット化
- it: `"ドロップエリアのテキストが日本語で表示される"` -> `"should display drop area text in Japanese when language is ja"`
- it: `"注意事項が日本語で表示される"` -> `"should display precautions in Japanese when language is ja"`
- it: `"ドロップエリアのテキストが英語で表示される"` -> `"should display drop area text in English when language is en"`
- it: `"注意事項が英語で表示される"` -> `"should display precautions in English when language is en"`

---

### 5. src/features/upload/components/__tests__/upload-progress.test.tsx の修正

**ファイルパス**: `src/features/upload/components/__tests__/upload-progress.test.tsx`

**テスト対象ファイル**: `src/features/upload/components/upload-progress.tsx`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UploadProgress } from "../upload-progress";

describe("src/features/upload/components/upload-progress.tsx UploadProgress TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display uploading text in Japanese when language is ja", () => {
    render(
      <UploadProgress
        fileName="cat.jpg"
        language="ja"
        previewUrl="blob:http://localhost/test"
        progress={50}
      />
    );

    expect(screen.getByText("ただいまアップロード中...")).toBeInTheDocument();
  });

  it("should set correct aria-label for progress bar when language is ja", () => {
    render(
      <UploadProgress
        fileName="cat.jpg"
        language="ja"
        previewUrl="blob:http://localhost/test"
        progress={50}
      />
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "ただいまアップロード中..."
    );
  });

  it("should display uploading text in English when language is en", () => {
    render(
      <UploadProgress
        fileName="cat.jpg"
        language="en"
        previewUrl="blob:http://localhost/test"
        progress={50}
      />
    );

    expect(screen.getByText("Uploading...")).toBeInTheDocument();
  });

  it("should display correctly at 0% progress", () => {
    render(
      <UploadProgress
        fileName="cat.jpg"
        language="ja"
        previewUrl="blob:http://localhost/test"
        progress={0}
      />
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });

  it("should display correctly at 100% progress", () => {
    render(
      <UploadProgress
        fileName="cat.jpg"
        language="ja"
        previewUrl="blob:http://localhost/test"
        progress={100}
      />
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });
});
```

**変更点**:
- トップレベルdescribe: `"UploadProgress"` -> `"src/features/upload/components/upload-progress.tsx UploadProgress TestCases"`
- ネストdescribe削除: `"日本語表示"`, `"英語表示"`, `"プログレス値"` を削除しフラット化
- it: `"アップロード中テキストが日本語で表示される"` -> `"should display uploading text in Japanese when language is ja"`
- it: `"プログレスバーのaria-labelが正しく設定される"` -> `"should set correct aria-label for progress bar when language is ja"`
- it: `"アップロード中テキストが英語で表示される"` -> `"should display uploading text in English when language is en"`
- it: `"プログレス0%で正しく表示される"` -> `"should display correctly at 0% progress"`
- it: `"プログレス100%で正しく表示される"` -> `"should display correctly at 100% progress"`

---

### 6. src/features/upload/components/__tests__/upload-success.test.tsx の修正

**ファイルパス**: `src/features/upload/components/__tests__/upload-success.test.tsx`

**テスト対象ファイル**: `src/features/upload/components/upload-success.tsx`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
import { UploadSuccess } from "../upload-success";

const testLgtmImageUrl = createLgtmImageUrl(
  "https://lgtm-images.lgtmeow.com/test.webp"
);

// happy-dom環境ではnavigator.clipboardが存在しないため、グローバルにモックを設定
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});

describe("src/features/upload/components/upload-success.tsx UploadSuccess TestCases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display success message in Japanese when language is ja", () => {
    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(
      screen.getByText("アップロード成功しました！")
    ).toBeInTheDocument();
  });

  it("should display button text in Japanese when language is ja", () => {
    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(
      screen.getByRole("button", { name: "閉じる" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Markdownソースをコピー" })
    ).toBeInTheDocument();
  });

  it("should display latest images link in Japanese when language is ja", () => {
    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    const link = screen.getByRole("link", { name: "こちら" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/?view=latest");
  });

  it("should display success message in English when language is en", () => {
    render(
      <UploadSuccess
        language="en"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(screen.getByText("Upload successful!")).toBeInTheDocument();
  });

  it("should display button text in English when language is en", () => {
    render(
      <UploadSuccess
        language="en"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy Markdown Source" })
    ).toBeInTheDocument();
  });

  it("should display latest images link in English when language is en", () => {
    render(
      <UploadSuccess
        language="en"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    const link = screen.getByRole("link", { name: "here" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/en?view=latest");
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={onClose}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    await user.click(screen.getByRole("button", { name: "閉じる" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should display Copied! message when copy button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Markdownソースをコピー" })
    );

    // Copied!メッセージが表示されることでクリップボードへのコピーが成功したことを確認
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });

  it("should display Copied! message when image is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UploadSuccess
        language="ja"
        lgtmImageUrl={testLgtmImageUrl}
        onClose={vi.fn()}
        previewImageUrl="blob:http://localhost/test-image"
      />
    );

    // 画像をラップしているbuttonをクリック
    const imageButton = screen.getByRole("button", {
      name: "Uploaded LGTM image",
    });
    await user.click(imageButton);

    // Copied!メッセージが表示されることでクリップボードへのコピーが成功したことを確認
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });
});
```

**変更点**:
- トップレベルdescribe: `"UploadSuccess"` -> `"src/features/upload/components/upload-success.tsx UploadSuccess TestCases"`
- ネストdescribe削除: `"日本語表示"`, `"英語表示"`, `"閉じるボタン動作"`, `"コピー機能"` を削除しフラット化
- it: `"成功メッセージが日本語で表示される"` -> `"should display success message in Japanese when language is ja"`
- it: `"ボタンテキストが日本語で表示される"` -> `"should display button text in Japanese when language is ja"`
- it: `"最新画像へのリンクが日本語で表示される"` -> `"should display latest images link in Japanese when language is ja"`
- it: `"成功メッセージが英語で表示される"` -> `"should display success message in English when language is en"`
- it: `"ボタンテキストが英語で表示される"` -> `"should display button text in English when language is en"`
- it: `"最新画像へのリンクが英語で表示される"` -> `"should display latest images link in English when language is en"`
- it: `"閉じるボタンをクリックするとonCloseが呼ばれる"` -> `"should call onClose when close button is clicked"`
- it: `"コピーボタンをクリックするとCopied!メッセージが表示される"` -> `"should display Copied! message when copy button is clicked"`
- it: `"画像クリックでもCopied!メッセージが表示される"` -> `"should display Copied! message when image is clicked"`

---

### 7. src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts の修正

**ファイルパス**: `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts`

**テスト対象ファイル**: `src/features/main/functions/generate-lgtm-markdown.ts`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateLgtmMarkdown } from "@/features/main/functions/generate-lgtm-markdown";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";

vi.mock("@/features/url", () => ({
  appBaseUrl: vi.fn(() => "https://lgtmeow.com"),
}));

describe("src/features/main/functions/generate-lgtm-markdown.ts generateLgtmMarkdown TestCases", () => {
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

**変更点**:
- トップレベルdescribe: `"generateLgtmMarkdown"` -> `"src/features/main/functions/generate-lgtm-markdown.ts generateLgtmMarkdown TestCases"`
- 既存のitメッセージは英語なので変更なし

---

### 8. src/utils/__tests__/with-callbacks.test.ts の修正

**ファイルパス**: `src/utils/__tests__/with-callbacks.test.ts`

**テスト対象ファイル**: `src/utils/with-callbacks.ts`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it, vi } from "vitest";
import { withCallbacks } from "@/utils/with-callbacks";

type TestActionState =
  | { readonly status: "SUCCESS"; readonly data: string }
  | { readonly status: "ERROR"; readonly message: string }
  | null;

describe("src/utils/with-callbacks.ts withCallbacks TestCases", () => {
  it("should call onSuccess callback when action returns SUCCESS status", async () => {
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
    expect(onSuccess).toHaveBeenCalledWith({
      status: "SUCCESS",
      data: "test data",
    });
    expect(onError).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "SUCCESS", data: "test data" });
  });

  it("should call onError callback when action returns ERROR status", async () => {
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
    expect(onError).toHaveBeenCalledWith({
      status: "ERROR",
      message: "Something went wrong",
    });
    expect(result).toEqual({
      status: "ERROR",
      message: "Something went wrong",
    });
  });

  it("should not call callbacks when action returns null", async () => {
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

  it("should work without onError callback", async () => {
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

  it("should work without onSuccess callback", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "ERROR",
      message: "error",
    });
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[], TestActionState>(mockAction, {
      onError,
    });

    await wrappedAction();

    expect(onError).toHaveBeenCalled();
  });
});
```

**変更点**:
- トップレベルdescribe: `"withCallbacks"` -> `"src/utils/with-callbacks.ts withCallbacks TestCases"`
- it: `"calls onSuccess callback when action returns SUCCESS status"` -> `"should call onSuccess callback when action returns SUCCESS status"`
- it: `"calls onError callback when action returns ERROR status"` -> `"should call onError callback when action returns ERROR status"`
- it: `"does not call callbacks when action returns null"` -> `"should not call callbacks when action returns null"`
- it: `"works without onError callback"` -> `"should work without onError callback"`
- it: `"works without onSuccess callback"` -> `"should work without onSuccess callback"`

---

### 9. src/features/upload/actions/__tests__/generate-upload-url-action.test.ts の修正

**ファイルパス**: `src/features/upload/actions/__tests__/generate-upload-url-action.test.ts`

**テスト対象ファイル**: `src/features/upload/actions/generate-upload-url-action.ts`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateUploadUrlAction } from "../generate-upload-url-action";

// R2 client mock
const mockGenerateR2PresignedPutUrl = vi.fn();

vi.mock("@/lib/cloudflare/r2/presigned-url", () => ({
  generateR2PresignedPutUrl: () => mockGenerateR2PresignedPutUrl(),
}));

describe("src/features/upload/actions/generate-upload-url-action.ts generateUploadUrlAction TestCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateR2PresignedPutUrl.mockResolvedValue({
      putUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
      objectKey: "uploads/test-uuid.jpg",
    });
  });

  it("should return presigned PUT URL with valid MIME type and size", async () => {
    const result = await generateUploadUrlAction(
      "image/jpeg",
      1024 * 1024,
      "ja"
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.presignedPutUrl).toContain("https://r2.example.com");
      expect(result.objectKey).toBe("uploads/test-uuid.jpg");
    }
  });

  it("should return error when MIME type is not allowed", async () => {
    const result = await generateUploadUrlAction(
      "image/gif",
      1024 * 1024,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("JPEG");
    }
    // R2 call should not be made
    expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
  });

  it("should return error when file size exceeds 5MB", async () => {
    const result = await generateUploadUrlAction(
      "image/jpeg",
      6 * 1024 * 1024,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("5MB");
    }
    // R2 call should not be made
    expect(mockGenerateR2PresignedPutUrl).not.toHaveBeenCalled();
  });

  it("should return error when R2 call fails", async () => {
    mockGenerateR2PresignedPutUrl.mockRejectedValue(new Error("R2 error"));

    const result = await generateUploadUrlAction(
      "image/jpeg",
      1024 * 1024,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("エラー");
    }
  });
});
```

**変更点**:
- トップレベルdescribe: `"generateUploadUrlAction"` -> `"src/features/upload/actions/generate-upload-url-action.ts generateUploadUrlAction TestCases"`
- ネストdescribe削除: `"正常系"`, `"異常系 - 前検証"`, `"異常系 - R2エラー"` を削除しフラット化
- it: `"有効なMIMEタイプとサイズで署名付きPUT URLを返す"` -> `"should return presigned PUT URL with valid MIME type and size"`
- it: `"MIMEタイプが許可されていない場合、エラーを返す"` -> `"should return error when MIME type is not allowed"`
- it: `"ファイルサイズが5MBを超える場合、エラーを返す"` -> `"should return error when file size exceeds 5MB"`
- it: `"R2への呼び出しが失敗した場合、エラーを返す"` -> `"should return error when R2 call fails"`
- コメントも英語化: `// R2への呼び出しは行われない` -> `// R2 call should not be made`
- コメントも英語化: `// R2クライアントのモック` -> `// R2 client mock`

---

### 10. src/features/upload/actions/__tests__/validate-and-create-lgtm-image-action.test.ts の修正

**ファイルパス**: `src/features/upload/actions/__tests__/validate-and-create-lgtm-image-action.test.ts`

**テスト対象ファイル**: `src/features/upload/actions/validate-and-create-lgtm-image-action.ts`

#### 完全な変更後のコード

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { httpStatusCode } from "@/constants/http-status-code";
import { lgtmeowApiUrl } from "@/features/main/functions/api-url";
import { mockCreateLgtmImageError } from "@/mocks/api/external/lgtmeow/mock-create-lgtm-image-error";
import { mockIsAcceptableCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image";
import { mockIsAcceptableCatImageNotCatImage } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-not-cat-image";
import { mockIsAcceptableCatImagePayloadTooLargeError } from "@/mocks/api/external/lgtmeow/mock-is-acceptable-cat-image-payload-too-large-error";
import { validateAndCreateLgtmImageAction } from "../validate-and-create-lgtm-image-action";

// Mock next/cache (revalidateTag is used in Server Action)
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

// Mock Cognito authentication
vi.mock("@/lib/cognito/oidc", () => ({
  issueClientCredentialsAccessToken: vi.fn(() =>
    Promise.resolve("mock-access-token")
  ),
}));

// Mock R2 client
vi.mock("@/lib/cloudflare/r2/presigned-url", () => ({
  generateR2PresignedGetUrl: vi.fn(() =>
    Promise.resolve({
      getUrl: "https://r2.example.com/uploads/test.jpg?signature=xxx",
    })
  ),
}));

// API base URL (from environment variables)
const apiBaseUrl = lgtmeowApiUrl();

// Mock successful LGTM image creation (returns imageUrl)
const mockCreateLgtmImageSuccess = () =>
  HttpResponse.json(
    {
      imageUrl:
        "https://lgtm-images.lgtmeow.com/2021/03/16/22/ff92782d-fae7-4a7a-b042-adbfccf64826.webp",
    },
    { status: httpStatusCode.accepted, statusText: "Accepted" }
  );

const server = setupServer(
  http.post(`${apiBaseUrl}/cat-images/validate/url`, mockIsAcceptableCatImage),
  http.post(`${apiBaseUrl}/v2/lgtm-images`, mockCreateLgtmImageSuccess)
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe("src/features/upload/actions/validate-and-create-lgtm-image-action.ts validateAndCreateLgtmImageAction TestCases", () => {
  const testObjectKey = "uploads/test-uuid.jpg";

  it("should return createdLgtmImageUrl when successful", async () => {
    const result = await validateAndCreateLgtmImageAction(
      testObjectKey,
      "ja"
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.createdLgtmImageUrl).toContain(
        "https://lgtm-images.lgtmeow.com"
      );
    }
  });

  it("should return error message when image is not a cat", async () => {
    server.use(
      http.post(
        `${apiBaseUrl}/cat-images/validate/url`,
        mockIsAcceptableCatImageNotCatImage
      )
    );

    const result = await validateAndCreateLgtmImageAction(
      testObjectKey,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("猫");
    }
  });

  it("should return error message when API returns PayloadTooLarge error", async () => {
    server.use(
      http.post(
        `${apiBaseUrl}/cat-images/validate/url`,
        mockIsAcceptableCatImagePayloadTooLargeError
      )
    );

    const result = await validateAndCreateLgtmImageAction(
      testObjectKey,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("サイズ");
    }
  });

  it("should return error message when LGTM image creation API returns non-202", async () => {
    server.use(
      http.post(`${apiBaseUrl}/v2/lgtm-images`, mockCreateLgtmImageError)
    );

    const result = await validateAndCreateLgtmImageAction(
      testObjectKey,
      "ja"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorMessages[0]).toContain("エラー");
    }
  });
});
```

**変更点**:
- トップレベルdescribe: `"validateAndCreateLgtmImageAction"` -> `"src/features/upload/actions/validate-and-create-lgtm-image-action.ts validateAndCreateLgtmImageAction TestCases"`
- ネストdescribe削除: `"正常系"`, `"異常系 - 猫画像判定API"`, `"異常系 - LGTM画像作成API失敗"` を削除しフラット化
- it: `"成功した場合、createdLgtmImageUrlを返す"` -> `"should return createdLgtmImageUrl when successful"`
- it: `"猫画像でない場合、エラーメッセージを返す"` -> `"should return error message when image is not a cat"`
- it: `"APIからPayloadTooLargeエラーが返る場合、エラーメッセージを返す"` -> `"should return error message when API returns PayloadTooLarge error"`
- it: `"LGTM画像作成APIが非202を返す場合、エラーメッセージを返す"` -> `"should return error message when LGTM image creation API returns non-202"`
- コメントも英語化: `// next/cacheをモック (revalidateTagはServer Action内で使用)` -> `// Mock next/cache (revalidateTag is used in Server Action)`
- コメントも英語化: `// Cognito認証をモック` -> `// Mock Cognito authentication`
- コメントも英語化: `// R2クライアントのモック` -> `// Mock R2 client`
- コメントも英語化: `// APIのベースURL (環境変数から取得)` -> `// API base URL (from environment variables)`
- コメントも英語化: `// LGTM画像作成成功モック (imageUrlを返す)` -> `// Mock successful LGTM image creation (returns imageUrl)`

---

### 11. src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts の修正

**ファイルパス**: `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts`

**テスト対象ファイル**: `src/features/main/actions/copy-random-cat-action.ts`

#### 完全な変更後のコード

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

// Redis mock (simulates no cache)
vi.mock("@upstash/redis", () => {
  const MockRedis = class {
    get = vi.fn().mockResolvedValue(null);
    set = vi.fn().mockResolvedValue("OK");
    expire = vi.fn().mockResolvedValue(1);
  };
  return { Redis: MockRedis };
});

// appBaseUrl mock (returns consistent URL)
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

describe("src/features/main/actions/copy-random-cat-action.ts copyRandomCatAction TestCases", () => {
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
    // Mock Math.random to select the first image
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
- トップレベルdescribe: `"copyRandomCatAction"` -> `"src/features/main/actions/copy-random-cat-action.ts copyRandomCatAction TestCases"`
- コメントを英語化: `// Redis をモック(キャッシュなしを模擬)` -> `// Redis mock (simulates no cache)`
- コメントを英語化: `// appBaseUrl をモック(一貫したURLを返すため)` -> `// appBaseUrl mock (returns consistent URL)`
- コメントを英語化: `// Math.random をモックして最初の画像を選択させる` -> `// Mock Math.random to select the first image`
- 既存のitメッセージは英語なので変更なし

---

### 12. src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts の修正

**ファイルパス**: `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts`

**テスト対象ファイル**: `src/features/main/actions/refresh-images-action.ts`

#### 完全な変更後のコード

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

describe("src/features/main/actions/refresh-images-action.ts refreshRandomCatsAction TestCases", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should update random tag and return ja redirect URL", async () => {
    const result = await refreshRandomCatsAction(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=random`,
    });
  });

  it("should update random tag and return en redirect URL", async () => {
    const result = await refreshRandomCatsAction(null, "en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.en}?view=random`,
    });
  });

  it("should return error state when updateTag throws", async () => {
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
- トップレベルdescribe: `"refreshRandomCatsAction"` -> `"src/features/main/actions/refresh-images-action.ts refreshRandomCatsAction TestCases"`
- it: `"updates random tag and returns ja redirect URL"` -> `"should update random tag and return ja redirect URL"`
- it: `"updates random tag and returns en redirect URL"` -> `"should update random tag and return en redirect URL"`
- it: `"returns error state when updateTag throws"` -> `"should return error state when updateTag throws"`

---

### 13. src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts の修正

**ファイルパス**: `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts`

**テスト対象ファイル**: `src/features/main/actions/refresh-images-action.ts`

#### 完全な変更後のコード

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

describe("src/features/main/actions/refresh-images-action.ts showLatestCatsAction TestCases", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should update latest tag and return ja redirect URL", async () => {
    const result = await showLatestCatsAction(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=latest`,
    });
  });

  it("should update latest tag and return en redirect URL", async () => {
    const result = await showLatestCatsAction(null, "en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.en}?view=latest`,
    });
  });

  it("should return error state when updateTag throws", async () => {
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
- トップレベルdescribe: `"showLatestCatsAction"` -> `"src/features/main/actions/refresh-images-action.ts showLatestCatsAction TestCases"`
- it: `"updates latest tag and returns ja redirect URL"` -> `"should update latest tag and return ja redirect URL"`
- it: `"updates latest tag and returns en redirect URL"` -> `"should update latest tag and return en redirect URL"`
- it: `"returns error state when updateTag throws"` -> `"should return error state when updateTag throws"`

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: ドキュメントの更新

1. `docs/project-coding-guidelines.md` にテストコードの書き方ルールを追記

### Phase 2: テストファイルの修正 (関数テスト)

2. `src/features/upload/__tests__/upload-validator.test.ts` を修正
3. `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` を修正
4. `src/utils/__tests__/with-callbacks.test.ts` を修正

### Phase 3: テストファイルの修正 (アクションテスト)

5. `src/features/upload/actions/__tests__/generate-upload-url-action.test.ts` を修正
6. `src/features/upload/actions/__tests__/validate-and-create-lgtm-image-action.test.ts` を修正
7. `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` を修正
8. `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts` を修正
9. `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts` を修正

### Phase 4: テストファイルの修正 (Componentテスト)

10. `src/components/footer.test.tsx` を修正
11. `src/features/upload/components/__tests__/upload-form.test.tsx` を修正
12. `src/features/upload/components/__tests__/upload-progress.test.tsx` を修正
13. `src/features/upload/components/__tests__/upload-success.test.tsx` を修正

### Phase 5: 品質管理

14. `npm run format` を実行
15. `npm run lint` を実行
16. `npm run test` を実行して全てパスすることを確認
17. Chrome DevTools MCP で `http://localhost:2222` にアクセスして表示確認
18. Chrome DevTools MCP で `http://localhost:6006/` にアクセスしてStorybookの表示確認

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

- [ ] `/` (日本語版ホームページ) が正常に表示される
- [ ] `/en` (英語版ホームページ) が正常に表示される
- [ ] `/upload` (日本語版アップロードページ) が正常に表示される
- [ ] `/en/upload` (英語版アップロードページ) が正常に表示される

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

- [ ] UploadForm コンポーネントのストーリーが正常に表示される
- [ ] UploadProgress コンポーネントのストーリーが正常に表示される
- [ ] UploadSuccess コンポーネントのストーリーが正常に表示される
- [ ] Footer コンポーネントのストーリーが正常に表示される

---

## 注意事項

### itメッセージの英語化について

日本語のitメッセージを英語化する際は、テストの意図を正確に伝える表現を使用すること。以下は変換の参考例:

| 日本語 | 英語 |
|--------|------|
| 〜は許可される | should allow ~ |
| 〜は許可されない | should reject ~ |
| 〜が表示される | should display ~ |
| 〜を返す | should return ~ |
| 〜が呼ばれる | should call ~ |

### テストの動作は変更しない

テストコードのスタイルのみを変更し、テストの動作自体は変更しないこと。変更後もテストが同じ内容をテストしていることを確認すること。

### インポートの整理

`describe` を新たにインポートする場合は、Vitestからのインポートに追加する:

```typescript
// 変更前
import { expect, it } from "vitest";

// 変更後
import { describe, expect, it } from "vitest";
```

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **テストのロジック変更禁止** - スタイルの統一のみに集中
3. **ビジネスロジックが誤っている状態で、テストコードを"上書きしてまで"合格させる行為は絶対に禁止**
4. **新しいテストの追加禁止** - 既存テストの修正のみ
5. **テストケースの削除禁止** - 全てのテストを維持すること

---

## 成功基準

以下を全て満たすこと:

### ドキュメント更新

- [ ] `docs/project-coding-guidelines.md` にテストコードの書き方ルールが追記されている

### テストファイルの修正

- [ ] 全てのテストファイルのトップレベルdescribeが `"<ファイルパス> <関数名> TestCases"` 形式になっている
- [ ] 全てのitメッセージが英語のshould形式で統一されている
- [ ] ネスト describe が存在しない

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 機能確認

- [ ] 開発サーバーで各ページが正常に表示される
- [ ] Storybookで各コンポーネントが正常に表示される

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### Phase 1: ドキュメント更新
- [ ] `docs/project-coding-guidelines.md` にテストコードの書き方ルールを追記

### Phase 2: 関数テストの修正
- [ ] `src/features/upload/__tests__/upload-validator.test.ts` を修正
- [ ] `src/features/main/functions/__tests__/generate-lgtm-markdown.test.ts` を修正
- [ ] `src/utils/__tests__/with-callbacks.test.ts` を修正

### Phase 3: アクションテストの修正
- [ ] `src/features/upload/actions/__tests__/generate-upload-url-action.test.ts` を修正
- [ ] `src/features/upload/actions/__tests__/validate-and-create-lgtm-image-action.test.ts` を修正
- [ ] `src/features/main/actions/__tests__/copy-random-cat/copy-random-cat.test.ts` を修正
- [ ] `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts` を修正
- [ ] `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts` を修正

### Phase 4: Componentテストの修正
- [ ] `src/components/footer.test.tsx` を修正
- [ ] `src/features/upload/components/__tests__/upload-form.test.tsx` を修正
- [ ] `src/features/upload/components/__tests__/upload-progress.test.tsx` を修正
- [ ] `src/features/upload/components/__tests__/upload-success.test.tsx` を修正

### Phase 5: 品質管理
- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] Chrome DevTools MCP で `http://localhost:2222` の表示確認完了
- [ ] Chrome DevTools MCP で `http://localhost:6006/` の表示確認完了

### 最終確認
- [ ] 全てのテストファイルがルールに準拠している
- [ ] コードコメントも英語化されている(対象: `generate-upload-url-action.test.ts`, `validate-and-create-lgtm-image-action.test.ts`, `copy-random-cat.test.ts`)
- [ ] 不要な変更が含まれていない
