# Issue #374: Home、アップロード ページ全体を確認出来るStorybook追加 - 詳細実装計画書

## 概要

### 目的

ビジュアルリグレッションテストのために、Homeページとアップロードページ全体を確認できるStorybookを追加する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/374

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **Storybook**: v8系
- **ビジュアルリグレッションテスト**: Chromatic
- **スタイリング**: Tailwind CSS v4

---

## 現状分析

### 対象コンポーネント

| ファイルパス | Storybook有無 | 備考 |
|-------------|--------------|------|
| `src/features/main/components/home-page.tsx` | **なし** | 今回追加対象 |
| `src/features/main/components/upload-page.tsx` | **なし** | 今回追加対象 |

### Issue完了条件との整合性について

Issue #374 の完了条件には「`src/features/main/components/` と `src/features/upload/components/` 配下全体を確認出来るStorybook」と記載されている。

本設計書では **ページ単位** でのStorybook追加を行う方針としている。理由は以下の通り:

1. **main/components配下**: `HomePage` と `UploadPage` のStorybookを追加することで、ページ全体の視覚的確認が可能になる。個別のサブコンポーネント (`ServiceDescription`, `HomeActionButtons` 等) は、ページStorybookを通じて間接的に確認できる。

2. **upload/components配下**: `UploadForm` は既に `upload-form.stories.tsx` でカバー済み。`UploadPage` のStorybookを追加することで、ページ全体としての確認も可能になる。

**補足**: コンポーネント単位での網羅が必要な場合は、追加のStorybook作成が必要となるが、ビジュアルリグレッションテストの目的においてはページ単位での確認で十分と判断した。

### 参考となる既存Storybook

| ファイルパス | パターン |
|-------------|----------|
| `src/features/errors/components/error-page.stories.tsx` | ページ全体、fullscreenレイアウト、日英バリエーション |
| `src/features/errors/components/not-found-page.stories.tsx` | ページ全体、fullscreenレイアウト、日英バリエーション |
| `src/features/errors/components/maintenance-page.stories.tsx` | ページ全体、fullscreenレイアウト、日英バリエーション |
| `src/features/upload/components/upload-form.stories.tsx` | DIパターン、デコレーター使用、初期状態指定 |

### 技術的課題

#### HomePageの課題

`HomePage` は以下のサーバーコンポーネントを含む:

- `RandomLgtmImages` (async サーバーコンポーネント)
- `LatestLgtmImages` (async サーバーコンポーネント)

これらは `"use cache"` ディレクティブと外部API呼び出しを行うため、Storybookで直接レンダリングできない。

**解決策**: DIパターンを導入し、`lgtmImagesSlot` propsを追加してサーバーコンポーネント部分を外部から注入可能にする。

#### UploadPageの課題

`UploadPage` は `UploadForm` を含む。`UploadForm` は既にDIパターンが実装されているが、`UploadPage` 自体にはDIパターンが実装されていない。

**解決策**: `UploadPage` にも同様のDIパターンを導入し、`UploadForm` のpropsを伝播できるようにする。

---

## 依存関係の確認

### HomePage の依存関係

```
HomePage
├── PageLayout (@/components/page-layout)
│   ├── Header
│   └── Footer
├── ServiceDescription
├── HomeActionButtons ("use client")
├── RandomLgtmImages (async サーバーコンポーネント) - view="random"時
│   └── LgtmImages
└── LatestLgtmImages (async サーバーコンポーネント) - view="latest"時
    └── LgtmImages
```

### HomePage Props

```typescript
interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly view: "random" | "latest";
}
```

### UploadPage の依存関係

```
UploadPage
├── PageLayout (@/components/page-layout)
│   ├── Header
│   └── Footer
└── UploadForm ("use client" - DIパターン実装済み)
```

### UploadPage Props

```typescript
interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}
```

### 型定義の確認

**Language型** (`src/features/language.ts`):
```typescript
export type Language = "en" | "ja";
```

**IncludeLanguageAppPath型** (`src/features/url.ts`):
```typescript
export type IncludeLanguageAppPath =
  | AppPath
  | `/${Language}${AppPath}`
  | `/${Language}`
  | "/";
```

**LgtmImage型** (`src/features/main/types/lgtm-image.ts`):
```typescript
export interface LgtmImage {
  id: LgtmImageId;
  imageUrl: LgtmImageUrl;
}
```

---

## 実装方針

### 方針概要

1. **HomePageにDIパターンを導入**: `lgtmImagesSlot` propsを追加し、サーバーコンポーネント部分を外部から注入可能にする
2. **UploadPageにDIパターンを導入**: `UploadForm` のpropsを伝播可能にする
3. **Storybookファイルを作成**: 既存のエラーページStorybookパターンに準拠

### 設計原則

- **後方互換性を維持**: 既存のProps使用方法を変更しない (オプショナルpropsとして追加)
- **実運用コードへの影響を最小化**: Storybook用のpropsはオプショナルとし、デフォルト値で実際のコンポーネントを使用
- **既存パターンに準拠**: エラーページStorybookのパターン (`fullscreen` レイアウト、日英バリエーション) を踏襲

---

## 変更内容

### 1. src/features/main/components/home-page.tsx の修正

**変更箇所**: DIパターンを導入し、`lgtmImagesSlot` propsを追加

### 2. src/features/main/components/upload-page.tsx の修正

**変更箇所**: DIパターンを導入し、`UploadForm` のpropsを伝播可能に

### 3. src/features/main/components/home-page.stories.tsx の新規作成

**新規ファイル**: HomePageのStorybookを作成

### 4. src/features/main/components/upload-page.stories.tsx の新規作成

**新規ファイル**: UploadPageのStorybookを作成

---

## 実装詳細

### 1. src/features/main/components/home-page.tsx の修正

**ファイルパス**: `src/features/main/components/home-page.tsx`

**現在のコード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { LatestLgtmImages } from "@/features/main/components/latest-lgtm-images";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly view: "random" | "latest";
}

export const HomePage = ({ language, currentUrlPath, view }: Props) => (
  <PageLayout
    currentUrlPath={currentUrlPath}
    isLoggedIn={false}
    language={language}
    mainClassName="flex w-full flex-1 flex-col items-center bg-background"
  >
    <div className="flex w-full max-w-[1300px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
      <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
        <ServiceDescription language={language} />
        <HomeActionButtons language={language} />
      </div>
      {view === "random" ? <RandomLgtmImages /> : <LatestLgtmImages />}
    </div>
  </PageLayout>
);
```

**変更後のコード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { LatestLgtmImages } from "@/features/main/components/latest-lgtm-images";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly view: "random" | "latest";
  /**
   * LGTMイメージ表示スロット (Storybook等でのモック用)
   * 省略時は view に応じた実際のサーバーコンポーネントが使用される
   */
  readonly lgtmImagesSlot?: ReactNode;
}

export const HomePage = ({
  language,
  currentUrlPath,
  view,
  lgtmImagesSlot,
}: Props) => {
  const renderLgtmImages = () => {
    if (lgtmImagesSlot != null) {
      return lgtmImagesSlot;
    }
    return view === "random" ? <RandomLgtmImages /> : <LatestLgtmImages />;
  };

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1300px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
        <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
          <ServiceDescription language={language} />
          <HomeActionButtons language={language} />
        </div>
        {renderLgtmImages()}
      </div>
    </PageLayout>
  );
};
```

**変更点**:
- `ReactNode` をインポートに追加
- `lgtmImagesSlot` オプショナルpropsを追加 (JSDocコメント付き)
- アロー関数を通常の関数ボディに変更 (条件分岐のため)
- `renderLgtmImages` ヘルパー関数を追加

---

### 2. src/features/main/components/upload-page.tsx の修正

**ファイルパス**: `src/features/main/components/upload-page.tsx`

**現在のコード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import { UploadForm } from "@/features/upload/components/upload-form";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

export function UploadPage({ language, currentUrlPath }: Props) {
  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    >
      {/* モーダル風の背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" />
      {/* フォームコンテナ (オーバーレイの上に表示) */}
      <div className="relative z-10 w-full max-w-[700px]">
        <UploadForm language={language} />
      </div>
    </PageLayout>
  );
}
```

**変更後のコード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { ComponentProps } from "react";
import { PageLayout } from "@/components/page-layout";
import type { Language } from "@/features/language";
import { UploadForm } from "@/features/upload/components/upload-form";
import type { IncludeLanguageAppPath } from "@/features/url";

/**
 * UploadForm の Props から language を除外した型
 * UploadPage から UploadForm へ props を伝播するために使用
 */
type UploadFormProps = Omit<ComponentProps<typeof UploadForm>, "language">;

interface Props extends UploadFormProps {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

export function UploadPage(props: Props) {
  const { language, currentUrlPath, ...uploadFormProps } = props;

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    >
      {/* モーダル風の背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" />
      {/* フォームコンテナ (オーバーレイの上に表示) */}
      <div className="relative z-10 w-full max-w-[700px]">
        <UploadForm language={language} {...uploadFormProps} />
      </div>
    </PageLayout>
  );
}
```

**変更点**:
- `ComponentProps` を使用して `UploadForm` の props 型を自動的に取得
- `Omit` を使用して `language` を除外 (UploadPage で既に定義しているため)
- インターフェース継承パターンで型定義を簡潔化
- 個別の型インポートを削除し、`ComponentProps` に置き換え
- **スプレッド構文を使用してpropsを伝播** - `UploadForm` に新しいpropsが追加された際も自動的に伝播されるため保守性が高い

---

### 3. src/features/main/components/home-page.stories.tsx の新規作成

**ファイルパス**: `src/features/main/components/home-page.stories.tsx`

**コード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import {
  createLgtmImageId,
  createLgtmImageUrl,
} from "@/features/main/types/lgtm-image";
import { fetchLgtmImagesMockBody } from "@/mocks/api/fetch-lgtm-images-mock-body";
import { HomePage } from "./home-page";

/**
 * モックLGTM画像データを生成
 */
const mockImages = fetchLgtmImagesMockBody.lgtmImages.map((image) => ({
  id: createLgtmImageId(Number(image.id)),
  imageUrl: createLgtmImageUrl(image.url),
}));

/**
 * Storybookで使用するモックLGTM画像コンポーネント
 */
const MockLgtmImages = () => (
  <LgtmImages hideHeartIcon={true} images={mockImages} />
);

const meta = {
  component: HomePage,
  title: "features/main/HomePage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版ホームページ (ランダム表示)
 */
export const JapaneseRandom: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "random",
    lgtmImagesSlot: <MockLgtmImages />,
  },
};

/**
 * 日本語版ホームページ (最新表示)
 */
export const JapaneseLatest: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "latest",
    lgtmImagesSlot: <MockLgtmImages />,
  },
};

/**
 * 英語版ホームページ (ランダム表示)
 */
export const EnglishRandom: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    view: "random",
    lgtmImagesSlot: <MockLgtmImages />,
  },
};

/**
 * 英語版ホームページ (最新表示)
 */
export const EnglishLatest: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en",
    view: "latest",
    lgtmImagesSlot: <MockLgtmImages />,
  },
};

/**
 * 画像が少ない場合の表示確認
 */
export const FewImages: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "random",
    lgtmImagesSlot: (
      <LgtmImages hideHeartIcon={true} images={mockImages.slice(0, 3)} />
    ),
  },
};

/**
 * 画像がない場合の表示確認
 */
export const EmptyImages: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/",
    view: "random",
    lgtmImagesSlot: <LgtmImages hideHeartIcon={true} images={[]} />,
  },
};
```

---

### 4. src/features/main/components/upload-page.stories.tsx の新規作成

**ファイルパス**: `src/features/main/components/upload-page.stories.tsx`

**コード**:
```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { createLgtmImageUrl } from "@/features/main/types/lgtm-image";
import {
  createImageSizeTooLargeErrorMessage,
  errorMessageNotCatImage,
  errorMessagePersonFaceInImage,
} from "@/features/upload/functions/upload-i18n";
import { UploadPage } from "./upload-page";

/**
 * モック用のダミーファイルを作成
 */
function createDummyFile(name: string, type: string): File {
  const blob = new Blob(["dummy content"], { type });
  return new File([blob], name, { type });
}

/**
 * 成功用のモック関数群を作成
 */
function createSuccessMocks() {
  return {
    generateUploadUrlAction: async () =>
      Promise.resolve({
        success: true as const,
        presignedPutUrl: "https://mock-storage.example.com/upload",
        objectKey: "mock-object-key",
      }),
    uploadToStorage: async () => Promise.resolve({ success: true as const }),
    validateAndCreateLgtmImageAction: async () =>
      Promise.resolve({
        success: true as const,
        createdLgtmImageUrl: createLgtmImageUrl(
          "https://lgtm-images.lgtmeow.com/mock-lgtm.webp"
        ),
        previewImageUrl:
          "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
      }),
  };
}

const meta = {
  component: UploadPage,
  title: "features/main/UploadPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UploadPage>;

export default meta;

type Story = StoryObj<typeof meta>;

// ========================================
// 基本的な初期状態Stories
// ========================================

/**
 * 日本語版アップロードページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
  },
};

/**
 * 英語版アップロードページ
 * 注意: currentUrlPath は本番実装に合わせて "/upload" を使用
 * (英語版でも日本語版と同じパスが使用されている)
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/upload",
  },
};

// ========================================
// UIの各状態を表示するStories (初期状態指定)
// ========================================

/**
 * プレビュー状態 - ファイル選択後の確認画面
 */
export const Preview: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "preview",
    initialPreviewUrl:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
    initialSelectedFile: createDummyFile("test-cat.jpg", "image/jpeg"),
  },
};

/**
 * アップロード中状態 - プログレスバー表示
 */
export const Uploading: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "uploading",
    initialPreviewUrl:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
    initialSelectedFile: createDummyFile("test-cat.jpg", "image/jpeg"),
    initialUploadProgress: 45,
  },
};

/**
 * アップロード成功状態 - LGTM画像生成完了
 */
export const Success: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "success",
    initialLgtmImageUrl: createLgtmImageUrl(
      "https://placehold.co/373x371/fed7aa/7c2d12?text=LGTM"
    ),
    initialPreviewImageUrlForSuccess:
      "https://placehold.co/373x371/fed7aa/7c2d12?text=Preview",
  },
};

/**
 * エラー状態 - 猫画像でない場合
 */
export const ErrorNotCatImage: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "error",
    initialErrorMessages: [errorMessageNotCatImage("ja")],
  },
};

/**
 * エラー状態 - ファイルサイズが大きすぎる場合
 */
export const ErrorFileTooLarge: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "error",
    initialErrorMessages: createImageSizeTooLargeErrorMessage("ja"),
  },
};

/**
 * エラー状態 - 人の顔が検出された場合
 */
export const ErrorPersonFaceInImage: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    initialState: "error",
    initialErrorMessages: [errorMessagePersonFaceInImage("ja")],
  },
};

// ========================================
// インタラクティブなStories (モック関数注入)
// ファイルをドロップして実際にアップロードフローをテスト可能
// ========================================

/**
 * インタラクティブ - アップロード成功フロー
 * ファイルをドロップするとモックで成功レスポンスを返す
 */
export const InteractiveSuccess: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/upload",
    ...createSuccessMocks(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "ファイルをドロップすると、モックされた成功レスポンスでアップロードフローを体験できます。",
      },
    },
  },
};
```

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: コンポーネントの修正

1. `src/features/main/components/home-page.tsx` を修正 (DIパターン導入)
2. `src/features/main/components/upload-page.tsx` を修正 (DIパターン導入)

### Phase 2: Storybookファイルの作成

3. `src/features/main/components/home-page.stories.tsx` を新規作成
4. `src/features/main/components/upload-page.stories.tsx` を新規作成

### Phase 3: 品質管理

5. `npm run format` を実行してコードをフォーマット
6. `npm run lint` を実行してLintエラーがないことを確認
7. `npm run test` を実行して全てパスすることを確認
8. Chrome DevTools MCP で `http://localhost:2222` にアクセスして表示確認
9. Chrome DevTools MCP で `http://localhost:6006/` にアクセスしてStorybookの表示確認

**重要**: 各Phase完了後は次のPhaseに進む前に、変更が正しく動作することを確認すること

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
- [ ] `/?view=random` (ランダム表示) が正常に表示される
- [ ] `/?view=latest` (最新表示) が正常に表示される
- [ ] `/upload` (日本語版アップロードページ) が正常に表示される
- [ ] `/en/upload` (英語版アップロードページ) が正常に表示される

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

- [ ] `features/main/HomePage` が表示される
  - [ ] JapaneseRandom ストーリーが正常に表示される
  - [ ] JapaneseLatest ストーリーが正常に表示される
  - [ ] EnglishRandom ストーリーが正常に表示される
  - [ ] EnglishLatest ストーリーが正常に表示される
  - [ ] FewImages ストーリーが正常に表示される
  - [ ] EmptyImages ストーリーが正常に表示される
- [ ] `features/main/UploadPage` が表示される
  - [ ] Japanese ストーリーが正常に表示される
  - [ ] English ストーリーが正常に表示される
  - [ ] Preview ストーリーが正常に表示される
  - [ ] Uploading ストーリーが正常に表示される
  - [ ] Success ストーリーが正常に表示される
  - [ ] ErrorNotCatImage ストーリーが正常に表示される
  - [ ] ErrorFileTooLarge ストーリーが正常に表示される
  - [ ] ErrorPersonFaceInImage ストーリーが正常に表示される
  - [ ] InteractiveSuccess ストーリーが正常に表示される

---

## 注意事項

### 後方互換性の維持

- 既存の `HomePage` と `UploadPage` の呼び出し元 (`src/app/` 配下のページコンポーネント) は変更不要
- 追加したpropsは全てオプショナルで、デフォルトでは従来の動作を維持

### currentUrlPath について

実際の呼び出し元を確認すると:

| ページ | 呼び出し元ファイル | currentUrlPath の値 |
|--------|-------------------|-------------------|
| 日本語版Home | `src/app/(default)/page.tsx` | `"/"` |
| 英語版Home | `src/app/(default)/en/page.tsx` | `"/en"` |
| 日本語版Upload | `src/app/(default)/upload/page.tsx` | `appPathList.upload` (`"/upload"`) |
| 英語版Upload | `src/app/(default)/en/upload/page.tsx` | `appPathList.upload` (`"/upload"`) |

**重要**: 英語版UploadPageでも `currentUrlPath` には `"/upload"` が使われている(本番の実装に準拠)。Storybookでも本番と同じ値を使用し、`PageLayout` の選択状態やリンク生成が本番と一致するようにしている。

### サーバーコンポーネントの取り扱い

- `RandomLgtmImages` と `LatestLgtmImages` はサーバーコンポーネントであり、Storybookでは直接レンダリングできない
- Storybookでは `lgtmImagesSlot` を使用してモックの `LgtmImages` コンポーネントを注入する
- 実運用では `lgtmImagesSlot` を省略し、実際のサーバーコンポーネントが使用される

### 型安全性の確保

- 全ての新しいpropsに適切な型を定義
- Branded Types (`LgtmImageUrl`, `LgtmImageId`) を使用して型安全性を維持

---

## トラブルシューティング

### Storybookで HomePage がレンダリングされない

**原因**: `HomeActionButtons` コンポーネント内のサーバーアクションが失敗している可能性がある。

**対処法**:
- `HomeActionButtons` は `"use client"` コンポーネントであり、サーバーアクション (`refreshRandomCatsAction`, `showLatestCatsAction`, `copyRandomCatAction`) を呼び出す
- Storybookではこれらのアクションは実際には実行されないが、ボタンの表示自体は問題なく動作する
- アクションボタンをクリックした際のエラーはStorybookの動作確認範囲外

### Lintエラーが発生する

**原因**: インポートの順序やコードスタイルが規約に準拠していない可能性がある。

**対処法**:
1. `npm run format` を実行してコードをフォーマット
2. 再度 `npm run lint` を実行して確認
3. それでもエラーが残る場合は、エラーメッセージに従って手動で修正

### Storybookで型エラーが発生する

**原因**: `ComponentProps` の型推論が正しく行われていない可能性がある。

**対処法**:
- `UploadForm` のpropsが変更された場合、`UploadPage` の型も自動的に更新される
- 型エラーが発生した場合は、`UploadForm` のprops定義を確認

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存の動作を壊す変更は禁止** - 後方互換性を必ず維持
3. **Storybookファイル以外のテストファイルの変更は禁止** (今回のスコープ外)
4. **サーバーコンポーネントの削除や大幅な変更は禁止** - DIパターンの導入のみ

---

## 成功基準

以下を全て満たすこと:

### ファイルの作成・修正

- [ ] `src/features/main/components/home-page.tsx` にDIパターンが導入されている
- [ ] `src/features/main/components/upload-page.tsx` にDIパターンが導入されている
- [ ] `src/features/main/components/home-page.stories.tsx` が新規作成されている
- [ ] `src/features/main/components/upload-page.stories.tsx` が新規作成されている

### 後方互換性

- [ ] 既存の `HomePage` の呼び出し元 (`src/app/(default)/page.tsx` 等) が変更なしで動作する
- [ ] 既存の `UploadPage` の呼び出し元 (`src/app/(default)/upload/page.tsx` 等) が変更なしで動作する

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### Storybook確認

- [ ] HomePage の全ストーリーがStorybookで正常に表示される
- [ ] UploadPage の全ストーリーがStorybookで正常に表示される

### 機能確認

- [ ] 開発サーバーで各ページが正常に表示される
- [ ] 日英両方の言語で正常に動作する

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### Phase 1: 型定義の確認
- [ ] `src/features/upload/types/upload.ts` の型定義を確認

### Phase 2: コンポーネントの修正
- [ ] `src/features/main/components/home-page.tsx` を修正
- [ ] `src/features/main/components/upload-page.tsx` を修正

### Phase 3: Storybookファイルの作成
- [ ] `src/features/main/components/home-page.stories.tsx` を新規作成
- [ ] `src/features/main/components/upload-page.stories.tsx` を新規作成

### Phase 4: 品質管理
- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] Chrome DevTools MCP で `http://localhost:2222` の表示確認完了
- [ ] Chrome DevTools MCP で `http://localhost:6006/` の表示確認完了

### 最終確認
- [ ] 全てのStorybookストーリーが正常に表示される
- [ ] 後方互換性が維持されている
- [ ] 不要な変更が含まれていない
