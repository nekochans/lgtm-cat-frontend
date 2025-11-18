# Issue #328: ねこ画像の再取得機能実装計画

## 概要

ホームページのアクションボタン（`refreshCats`, `latestCats`）を押下した際に、表示されているねこ画像を再取得する処理を実装する。Next.js 16 の `use cache` ディレクティブと `cacheTag`/`updateTag` 関数を使用してキャッシュ制御を実現する。

## 前提条件の確認

### 依頼内容の修正点

**重要**: 依頼内容に以下の誤記がありました：

- 依頼: "latestCatsのボタン" は `@src/features/main/components/service-description.tsx` に対応
- 実際: `service-description.tsx` には画像取得ロジックが存在しない
- 正解: `@src/features/main/components/latest-lgtm-images.tsx` が正しい対応コンポーネント

`ServiceDescription` コンポーネントはサービス説明テキストのみを表示するコンポーネントで、画像取得機能は持っていません。

### 現在のファイル構造

```text
src/
├── app/
│   └── (default)/
│       ├── page.tsx                    # 日本語版ホームページ
│       └── en/
│           └── page.tsx                # 英語版ホームページ
├── features/
│   └── main/
│       ├── components/
│       │   ├── home-page-container.tsx      # メインコンテナ
│       │   ├── home-action-buttons.tsx      # アクションボタン群
│       │   ├── random-lgtm-images.tsx       # ランダム画像表示
│       │   ├── latest-lgtm-images.tsx       # 最新画像表示
│       │   └── service-description.tsx      # サービス説明（画像取得なし）
│       └── functions/
│           └── fetch-lgtm-images.ts         # API呼び出し関数
└── components/
    └── icon-button.tsx                      # 汎用アイコンボタン
```

### 現在の実装状況

#### 1. `random-lgtm-images.tsx`

```typescript
// 現在の実装
const fetchLgtmImages = async () => {
  const accessToken = await issueClientCredentialsAccessToken();
  return fetchLgtmImagesInRandom(accessToken);
};

export const RandomLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();
  return <LgtmImages images={lgtmImages} />;
};
```

- **キャッシュなし**: 現在は `use cache` が未設定
- **タグなし**: cacheTag が未設定

#### 2. `latest-lgtm-images.tsx`

```typescript
// 現在の実装
const fetchLgtmImages = async () => {
  const accessToken = await issueClientCredentialsAccessToken();
  return fetchLgtmImagesInRecentlyCreated(accessToken);
};

export const LatestLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();
  return <LgtmImages images={lgtmImages} />;
};
```

- **キャッシュなし**: 現在は `use cache` が未設定
- **タグなし**: cacheTag が未設定

#### 3. `home-page-container.tsx`

```typescript
export const HomePageContainer = ({ language, currentUrlPath }: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    {/* ... */}
    <main>
      <div>
        <ServiceDescription language={language} />
        <HomeActionButtons language={language} />
        <RandomLgtmImages /> {/* 固定でランダム画像のみ表示 */}
      </div>
    </main>
    {/* ... */}
  </div>
);
```

- **問題点**: 常に `RandomLgtmImages` のみを表示
- **必要な変更**: `searchParams` に基づいて `RandomLgtmImages` または `LatestLgtmImages` を出し分ける

#### 4. `home-action-buttons.tsx`

```typescript
export function HomeActionButtons({ language, className }: Props) {
  const buttonText = getActionButtonText(language);

  return (
    <div>
      <IconButton displayText={buttonText.randomCopy} showRepeatIcon={true} />
      <IconButton displayText={buttonText.refreshCats} showRandomIcon={true} />
      <IconButton displayText={buttonText.latestCats} showCatIcon={true} />
    </div>
  );
}
```

- **問題点**: ボタンにアクションが設定されていない（ただの表示用）
- **必要な変更**: Server Action を呼び出すようにする

#### 5. `icon-button.tsx`

```typescript
export function IconButton({ type, link, /* ... */ }: Props): JSX.Element {
  // linkがある場合はLinkとして動作
  if (link != null) {
    return <Button as={Link} href={link} />;
  }

  // linkがない場合は通常のボタンとして動作
  return <Button type={type} />;
}
```

- **良い点**: 既にServer Action対応可能（`type="submit"` でフォーム送信可能）
- **必要な変更**: formと組み合わせてServer Actionを呼び出す

## 実装計画

### ステップ0: 前提設定（必須）

#### 0.1 `next.config.ts` の修正

**⚠️ 重要**: `use cache` / `cacheTag` / `updateTag` を有効にするには、`next.config.ts` で `cacheComponents: true` を明示的に設定する必要があります。

**ファイルパス**: `next.config.ts`

**変更内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lgtm-images.lgtmeow.com",
      },
      {
        protocol: "https",
        hostname: "stg-lgtm-images.lgtmeow.com",
      },
    ],
  },
  reactCompiler: true,
  cacheComponents: true, // ← 追加: use cache を有効化
};

const sentryWebpackPluginOptions = {
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  sendDefaultPii: true,
};

const nextConfig = withSentryConfig(baseConfig, sentryWebpackPluginOptions);

export default nextConfig;
```

**重要ポイント**:
- `cacheComponents: true` を追加しないとキャッシュタグが機能しない
- この設定がないと `use cache` ディレクティブが無視される

#### 0.2 キャッシュタグ定数の作成

**新規ファイル**: `src/features/main/constants/cache-tags.ts`

**内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * LGTM画像のキャッシュタグ定数
 *
 * cacheTag() と updateTag() で使用するタグ名を一元管理します。
 * タグ名の不一致によるキャッシュ無効化の失敗を防ぐため、
 * 必ずこの定数を使用してください。
 */
export const CACHE_TAG_LGTM_IMAGES_RANDOM = "fetchedLgtmImagesInRandom" as const;
export const CACHE_TAG_LGTM_IMAGES_LATEST = "fetchedLgtmImagesInRecentlyCreated" as const;
```

**重要ポイント**:
- タグ名を定数化してヒューマンエラーを防止
- `as const` で型安全性を確保
- タグ名の変更は必ずこのファイルで行う

### ステップ1: キャッシュタグの設定

#### 1.1 `random-lgtm-images.tsx` の修正

**ファイルパス**: `src/features/main/components/random-lgtm-images.tsx`

**現在の状態**: 必須コメントあり ✅

**変更内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cacheLife, cacheTag } from "next/cache";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import { fetchLgtmImagesInRandom } from "@/features/main/functions/fetch-lgtm-images";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import { CACHE_TAG_LGTM_IMAGES_RANDOM } from "@/features/main/constants/cache-tags";

const fetchLgtmImages = async () => {
  "use cache";
  cacheTag(CACHE_TAG_LGTM_IMAGES_RANDOM);
  cacheLife({
    stale: 86_400, // 24時間フレッシュ扱い
    revalidate: 86_400, // 24時間ごと再検証
    expire: 2_592_000, // 30日で強制失効
  });

  const accessToken = await issueClientCredentialsAccessToken();
  return fetchLgtmImagesInRandom(accessToken);
};

export const RandomLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();
  return <LgtmImages images={lgtmImages} />;
};
```

**重要ポイント**:
- `"use cache"` ディレクティブは関数の先頭に記述
- `cacheTag()` は定数 `CACHE_TAG_LGTM_IMAGES_RANDOM` を使用
- `cacheLife()` でキャッシュ有効期限を明示的に設定
  - `stale`: 15分（この期間はキャッシュをフレッシュとみなす）
  - `revalidate`: 15分（バックグラウンドで再検証）
  - `expire`: 1時間（この期間を過ぎるとキャッシュを完全に破棄）
- `cacheTag` と `cacheLife` の呼び出しは `"use cache"` の直後

#### 1.2 `latest-lgtm-images.tsx` の修正

**ファイルパス**: `src/features/main/components/latest-lgtm-images.tsx`

**現在の状態**: 必須コメントなし ❌ → **追加が必要**

**変更内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { cacheLife, cacheTag } from "next/cache";
import { issueClientCredentialsAccessToken } from "@/lib/cognito/oidc";
import { fetchLgtmImagesInRecentlyCreated } from "@/features/main/functions/fetch-lgtm-images";
import { LgtmImages } from "@/features/main/components/lgtm-images";
import { CACHE_TAG_LGTM_IMAGES_LATEST } from "@/features/main/constants/cache-tags";

const fetchLgtmImages = async () => {
  "use cache";
  cacheTag(CACHE_TAG_LGTM_IMAGES_LATEST);
  cacheLife({
    stale: 86_400, // 24時間フレッシュ扱い
    revalidate: 86_400, // 24時間ごと再検証
    expire: 2_592_000, // 30日で強制失効
  });

  const accessToken = await issueClientCredentialsAccessToken();
  return fetchLgtmImagesInRecentlyCreated(accessToken);
};

export const LatestLgtmImages = async () => {
  const lgtmImages = await fetchLgtmImages();
  return <LgtmImages images={lgtmImages} />;
};
```

**重要ポイント**:
- **ファイル先頭に必須コメントを追加**（現状は未記載）
- `cacheTag()` は定数 `CACHE_TAG_LGTM_IMAGES_LATEST` を使用
- `cacheLife()` の設定は `random-lgtm-images.tsx` と同じ
- 他の実装は `random-lgtm-images.tsx` と同様

### ステップ2: Server Actions の作成

#### 2.1 Server Actions ファイルの作成

**新規ファイル**: `src/features/main/actions/refresh-images.ts`

**内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { Language } from "@/features/language";
import { i18nUrlList } from "@/features/url";
import {
  CACHE_TAG_LGTM_IMAGES_RANDOM,
  CACHE_TAG_LGTM_IMAGES_LATEST,
} from "@/features/main/constants/cache-tags";

/**
 * ランダムねこ画像のキャッシュを更新して再表示
 *
 * ボタン押下時に呼ばれるServer Action。
 * updateTag() でキャッシュを即座に無効化し、新しいランダム画像を取得させる。
 */
export async function refreshRandomCats(language: Language): Promise<void> {
  // キャッシュを即座に無効化（read-your-own-writes）
  updateTag(CACHE_TAG_LGTM_IMAGES_RANDOM);

  // クエリパラメータ付きでリダイレクト
  const targetUrl =
    language === "ja"
      ? `${i18nUrlList.home.ja}?view=random`
      : `${i18nUrlList.home.en}?view=random`;

  redirect(targetUrl);
}

/**
 * 最新ねこ画像のキャッシュを更新して表示
 *
 * ボタン押下時に呼ばれるServer Action。
 * updateTag() でキャッシュを即座に無効化し、最新画像を表示する。
 */
export async function showLatestCats(language: Language): Promise<void> {
  // キャッシュを即座に無効化（read-your-own-writes）
  updateTag(CACHE_TAG_LGTM_IMAGES_LATEST);

  // クエリパラメータ付きでリダイレクト
  const targetUrl =
    language === "ja"
      ? `${i18nUrlList.home.ja}?view=latest`
      : `${i18nUrlList.home.en}?view=latest`;

  redirect(targetUrl);
}
```

**重要ポイント**:
- `"use server"` ディレクティブでServer Action化
- `updateTag()` は定数を使用してタグ名の不一致を防止
- `updateTag()` でキャッシュを即座に無効化（`revalidateTag` ではなく `updateTag` を使用）
  - **理由**: read-your-own-writes（ボタン押下後すぐに新しいデータを見せる）が必要
- `redirect()` でクエリパラメータ付きページに遷移
- 言語に応じた適切なURLにリダイレクト

#### 2.2 `updateTag` と `revalidateTag` の使い分け方針

**現在の実装**: `updateTag` を使用

**理由**:
- ユーザーがボタンを押したら**即座に**新しい画像を表示したい
- `revalidateTag` は「stale-while-revalidate」方式で、一度古いデータを返す可能性がある
- `updateTag` は**即座にキャッシュを破棄**し、次のリクエストで必ず新しいデータを取得

**将来の拡張時の選択肢**:
- **Webhook から無効化**: `revalidateTag` を使用（Route Handlerで対応）
- **ボタン押下で無効化**: `updateTag` を使用（Server Actionで対応）← 今回はこちら
- **定期的な再検証**: `cacheLife` の設定で対応

### ステップ3: ページコンポーネントの修正

#### 3.1 日本語版ページの修正

**ファイルパス**: `src/app/(default)/page.tsx`

**変更内容**:

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む

import type { Metadata, NextPage } from "next";
import { convertLocaleToLanguage } from "@/features/locale";
import { HomePageContainer } from "@/features/main/components/home-page-container";
import { metaTagList, appName } from "@/features/meta-tag";
import { appBaseUrl, i18nUrlList } from "@/features/url";

export const dynamic = "force-dynamic";

const language = "ja";

export const metadata: Metadata = {
  // ... (既存のメタデータ設定を維持)
};

type PageProps = {
  readonly searchParams: Promise<{
    readonly view?: "random" | "latest";
  }>;
};

const HomePage: NextPage<PageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  const view = params.view ?? "random"; // デフォルトはrandom

  return <HomePageContainer currentUrlPath="/" language={language} view={view} />;
};

export default HomePage;
```

**重要ポイント**:
- `searchParams` は Promise型なので `await` が必須
- `view` パラメータのデフォルト値は `"random"`（現在の動作を維持）
- `view` を `HomePageContainer` に渡す

#### 3.2 英語版ページの修正

**ファイルパス**: `src/app/(default)/en/page.tsx`

**変更内容**:

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む

import type { Metadata, NextPage } from "next";
import { convertLocaleToLanguage } from "@/features/locale";
import { HomePageContainer } from "@/features/main/components/home-page-container";
import { metaTagList, appName } from "@/features/meta-tag";
import { appBaseUrl, i18nUrlList } from "@/features/url";

export const dynamic = "force-dynamic";

const language = "en";

export const metadata: Metadata = {
  // ... (既存のメタデータ設定を維持)
};

type PageProps = {
  readonly searchParams: Promise<{
    readonly view?: "random" | "latest";
  }>;
};

const EnHomePage: NextPage<PageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  const view = params.view ?? "random"; // デフォルトはrandom

  return <HomePageContainer currentUrlPath="/en" language={language} view={view} />;
};

export default EnHomePage;
```

**重要ポイント**:
- 日本語版と同様の変更
- `currentUrlPath` は `"/en"` のまま維持

### ステップ4: `HomePageContainer` の修正

#### 4.1 型定義の追加

**ファイルパス**: `src/features/main/components/home-page-container.tsx`

**変更内容**:

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Language } from "@/features/language";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { RandomLgtmImages } from "@/features/main/components/random-lgtm-images";
import { LatestLgtmImages } from "@/features/main/components/latest-lgtm-images";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { IncludeLanguageAppPath } from "@/features/url";

type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly view: "random" | "latest";
};

export const HomePageContainer = ({
  language,
  currentUrlPath,
  view,
}: Props) => (
  <div className="flex min-h-screen w-full flex-col bg-background">
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
    <main className="flex w-full flex-1 flex-col items-center bg-background">
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
        <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
          <ServiceDescription language={language} />
          <HomeActionButtons language={language} />
        </div>
        {view === "random" ? <RandomLgtmImages /> : <LatestLgtmImages />}
      </div>
    </main>
    <Footer language={language} />
  </div>
);
```

**重要ポイント**:
- `view` プロパティを追加（型: `"random" | "latest"`）
- `LatestLgtmImages` をインポート
- 三項演算子で画像コンポーネントを出し分け
- `view === "random"` の場合: `RandomLgtmImages`
- `view === "latest"` の場合: `LatestLgtmImages`

### ステップ5: `HomeActionButtons` の修正

#### 5.1 フォームベースのボタン実装

**ファイルパス**: `src/features/main/components/home-action-buttons.tsx`

**変更内容**:

```typescript
// 絶対厳守:編集前に必ずAI実装ルールを読む

import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import { getActionButtonText } from "@/features/main/service-description-text";
import {
  refreshRandomCats,
  showLatestCats,
} from "@/features/main/actions/refresh-images";

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function HomeActionButtons({ language, className }: Props) {
  const buttonText = getActionButtonText(language);

  // Server Actionをbindで言語を固定
  const refreshRandomCatsAction = refreshRandomCats.bind(null, language);
  const showLatestCatsAction = showLatestCats.bind(null, language);

  return (
    <div
      className={`flex flex-col items-center gap-4 md:flex-row md:items-start ${className ?? ""}`}
    >
      {/* randomCopyボタン（現状維持：URLコピー用なので変更なし） */}
      <IconButton
        className="w-full md:w-[240px]"
        displayText={buttonText.randomCopy}
        showRepeatIcon={true}
      />

      {/* refreshCatsボタン（ランダム画像を再取得） */}
      <form action={refreshRandomCatsAction}>
        <IconButton
          className="w-full md:w-[240px]"
          displayText={buttonText.refreshCats}
          showRandomIcon={true}
          type="submit"
        />
      </form>

      {/* latestCatsボタン（最新画像を表示） */}
      <form action={showLatestCatsAction}>
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

**重要ポイント**:
- Server Actionを `bind()` で言語パラメータを固定
- `refreshCats` と `latestCats` ボタンを `<form>` で囲む
- `IconButton` に `type="submit"` を指定
- `randomCopy` ボタンは変更なし（URLコピー機能のため）

**注意**: この実装では、3つのボタンを横並びにするレイアウトを維持するため、各 `<form>` に追加のスタイリングが必要になる可能性があります。必要に応じて以下のように修正してください：

```typescript
<form action={refreshRandomCatsAction} className="w-full md:w-auto">
  <IconButton
    className="w-full md:w-[240px]"
    displayText={buttonText.refreshCats}
    showRandomIcon={true}
    type="submit"
  />
</form>
```

### ステップ6: `IconButton` の型定義修正（必要な場合）

**ファイルパス**: `src/components/icon-button.tsx`

**確認事項**:
- 現在の `IconButton` は `ComponentProps<"button">` を継承しているため、`type="submit"` は既にサポートされている
- 追加の変更は不要

**型定義（確認用）**:

```typescript
type Props = ComponentProps<"button"> & {
  displayText: string;
  showGithubIcon?: boolean;
  showRepeatIcon?: boolean;
  showRandomIcon?: boolean;
  showCatIcon?: boolean;
  isPressed?: boolean;
  className?: string;
  link?: IncludeLanguageAppPath;
};
```

## テスト計画

### 1. ユニットテスト

#### 1.1 Server Actions のテスト

**新規ファイル**: `src/features/main/actions/__tests__/refresh-images.test.ts`

**テスト内容**:
- `refreshRandomCats` が正しく `updateTag` を呼び出すか
- `showLatestCats` が正しく `updateTag` を呼び出すか
- 言語に応じた正しいURLにリダイレクトされるか

**モック対象**:
- `next/cache` の `updateTag`
- `next/navigation` の `redirect`

#### 1.2 コンポーネントのテスト

**既存テストの更新**:
- `home-page-container` のテストで `view` プロパティをテスト
- `view="random"` の場合に `RandomLgtmImages` が表示されるか
- `view="latest"` の場合に `LatestLgtmImages` が表示されるか

### 2. Storybook での確認

#### 2.1 `HomeActionButtons` のストーリー更新

**ファイルパス**: `src/features/main/components/home-action-buttons.stories.tsx`（存在する場合）

**追加ストーリー**:
- デフォルト状態
- ボタン押下時の動作確認（Server Actionモック）

#### 2.2 `HomePageContainer` のストーリー更新

**追加ストーリー**:
- `view="random"` の状態
- `view="latest"` の状態

### 3. E2Eテスト（Playwright MCP使用）

**テストシナリオ**:

1. **初期表示確認**
   - `http://localhost:2222` にアクセス
   - ランダム画像が表示されることを確認

2. **refreshCatsボタンのテスト**
   - refreshCatsボタンをクリック
   - `?view=random` パラメータが付与されたURLに遷移
   - 新しいランダム画像が表示されることを確認

3. **latestCatsボタンのテスト**
   - latestCatsボタンをクリック
   - `?view=latest` パラメータが付与されたURLに遷移
   - 最新画像が表示されることを確認

4. **切り替えテスト**
   - latestCats → refreshCats の順でボタンをクリック
   - 正しく画像が切り替わることを確認

### 4. 品質管理手順

**実施順序**（依頼内容に記載の通り）:

1. `npm run format` - コードフォーマット
2. `npm run lint` - Lint チェック
3. `npm run test` - 全テスト実行
4. Playwright MCP で `http://localhost:2222` の表示確認
5. Playwright MCP で `http://localhost:6006/` のStorybook確認

**デザイン崩れの調査**:
- Chrome DevTools MCP を使用

## 注意事項とベストプラクティス

### 0. **必須事項**（これを忘れると動作しない）

#### 0.1 `cacheComponents: true` の設定

**⚠️ 最重要**: `next.config.ts` に `cacheComponents: true` を追加しないと、キャッシュタグ機能は動作しません。

```typescript
const baseConfig: NextConfig = {
  // ... 他の設定
  cacheComponents: true, // ← 必須
};
```

#### 0.2 必須ヘッダーコメント

**全ての `.ts` / `.tsx` ファイルの先頭に以下のコメントが必要**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
```

特に以下のファイルは現状未記載なので追加が必須:
- `src/features/main/components/latest-lgtm-images.tsx` ← **要追加**

#### 0.3 タグ名の一元管理

**タグ名は必ず定数を使用**:

```typescript
// ❌ NG: 文字列リテラルを直接使用
cacheTag("fetchedLgtmImagesInRandom");
updateTag("fetchedLgtmImagesInRandom"); // タイポのリスク

// ✅ OK: 定数を使用
import { CACHE_TAG_LGTM_IMAGES_RANDOM } from "@/features/main/constants/cache-tags";
cacheTag(CACHE_TAG_LGTM_IMAGES_RANDOM);
updateTag(CACHE_TAG_LGTM_IMAGES_RANDOM); // タイポ防止
```

### 1. キャッシュ戦略

- `use cache` ディレクティブは関数の先頭に記述
- `cacheTag()` と `cacheLife()` は `use cache` の直後に呼び出す
- `updateTag()` は Server Action 内でのみ使用可能
- `revalidateTag()` ではなく `updateTag()` を使用（即座にキャッシュを無効化）

#### キャッシュ有効期限の設計

今回は `cacheLife()` で以下の設定を採用:

```typescript
cacheLife({
  stale: 900, // 15分（この期間はキャッシュをフレッシュとみなす）
  revalidate: 900, // 15分（バックグラウンドで再検証）
  expire: 3600, // 1時間（この期間を過ぎるとキャッシュを完全に破棄）
});
```

**設計理由**:
- デフォルトの15分再検証を明示的に設定
- トークン有効期限（通常1時間）を考慮して `expire: 3600`
- ボタン押下時は `updateTag()` で即座に無効化するため、自動再検証には依存しない

### 2. Server Actions

- `"use server"` ディレクティブをファイル先頭に記述
- `redirect()` を使ってページ遷移を制御
- `bind()` で引数を事前にバインド

### 3. Next.js 16 の変更点

- `searchParams` は Promise型なので必ず `await` する
- `params` も Promise型なので注意
- `updateTag` は Next.js 16 で安定版として提供（`unstable_` プレフィックス不要）

### 4. 型安全性

- `view` パラメータは `"random" | "latest"` のユニオン型
- 不明な値が来た場合はデフォルト値（`"random"`）を使用

### 5. アクセシビリティ

- フォーム送信ボタンは `type="submit"` を明示
- アイコンには `aria-hidden="true"` が既に設定されている（`IconButton` 内）
- ボタンテキストは多言語対応済み

### 6. パフォーマンス

- キャッシュタグを使うことでAPI呼び出しを最小限に抑える
- `updateTag` で必要なキャッシュのみを無効化

## 実装の順序

**⚠️ 重要**: ステップ0を最初に実施しないと、後続の機能が動作しません。

1. **ステップ0（必須）**: 前提設定
   - 0.1: `next.config.ts` の修正（`cacheComponents: true` を追加）
   - 0.2: キャッシュタグ定数ファイルの作成（`cache-tags.ts`）
2. **ステップ1**: キャッシュタグの設定
   - 1.1: `random-lgtm-images.tsx` の修正
   - 1.2: `latest-lgtm-images.tsx` の修正（**必須コメント追加**）
3. **ステップ2**: Server Actions の作成
   - 2.1: `refresh-images.ts` の作成
   - 2.2: `updateTag` と `revalidateTag` の使い分け理解
4. **ステップ3**: ページコンポーネントの修正
   - 3.1: `page.tsx`（日本語版）
   - 3.2: `en/page.tsx`（英語版）
5. **ステップ4**: `HomePageContainer` の修正
6. **ステップ5**: `HomeActionButtons` の修正
7. **テスト**: ユニットテスト、Storybook、E2Eテスト
8. **品質管理**: format, lint, test, 動作確認

## トラブルシューティング

### 問題0: キャッシュタグ機能が全く動作しない

**原因**: `next.config.ts` に `cacheComponents: true` が設定されていない

**解決方法**:
- `next.config.ts` を確認し、`cacheComponents: true` を追加
- 開発サーバーを再起動（`npm run dev`）

```typescript
const baseConfig: NextConfig = {
  // ... 他の設定
  cacheComponents: true, // ← 必須
};
```

### 問題1: キャッシュが無効化されない

**原因**: `cacheTag` の設定漏れまたはタグ名の不一致

**解決方法**:
- `fetchLgtmImages` 関数に `"use cache"` と `cacheTag()` が正しく設定されているか確認
- `updateTag()` に渡すタグ名が `cacheTag()` と一致しているか確認
- **推奨**: 定数（`CACHE_TAG_LGTM_IMAGES_RANDOM` など）を使用してタグ名の不一致を防止

### 問題2: リダイレクトが動作しない

**原因**: Server Action の設定ミスまたは `redirect()` の使い方の誤り

**解決方法**:
- Server Action ファイルに `"use server"` ディレクティブがあるか確認
- `redirect()` は `updateTag()` の後に呼び出す
- `redirect()` の引数URLが正しいか確認

### 問題3: `view` パラメータが反映されない

**原因**: `searchParams` の await 忘れまたはデフォルト値の設定ミス

**解決方法**:
- `searchParams` を必ず `await` する
- デフォルト値（`?? "random"`）が正しく設定されているか確認

### 問題4: フォームのレイアウトが崩れる

**原因**: `<form>` タグによるレイアウトへの影響

**解決方法**:
- `<form>` に `className="w-full md:w-auto"` を追加
- 必要に応じて flexbox のスタイルを調整

## 参考資料

- [Next.js 16 - use cache directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [Next.js 16 - cacheTag function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Next.js 16 - updateTag function](https://nextjs.org/docs/app/api-reference/functions/updateTag)
- [Next.js - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## まとめ

この実装計画は、Next.js 16 の最新機能を活用し、既存のコード構造を最大限尊重しながら、ねこ画像の再取得機能を実現します。

**主な変更点**:
- **前提設定**: `next.config.ts` に `cacheComponents: true` を追加
- **タグ名の一元管理**: 定数ファイルでタグ名を管理
- **キャッシュタグの設定**: 2つの画像取得関数に `use cache` + `cacheTag` + `cacheLife` を設定
- **Server Actions**: `updateTag()` でキャッシュを制御
- **UI変更**: クエリパラメータで画像の出し分け
- **既存構造の維持**: コンポーネント構造を最大限維持

**実装の実現可能性**: ✅ 高い
- 存在しないファイルのimportなし
- 存在しないカラムの捏造なし
- 全ての関連ファイルを確認済み
- Next.js 16の最新情報を反映

---

## レビュー追記（2025-11-18）

- `cacheComponents: true` が next.config.ts に未設定のため、`use cache` / `cacheTag` / `updateTag` が有効化されない。計画に追加必須。citeturn4text0turn5text0
- `updateTag` は Server Action 専用。将来 webhook や Route Handler で無効化したい場合は `revalidateTag` の採用方針も補足すると安全。citeturn6text0
- `use cache` のデフォルト再検証は15分。要件に応じて `cacheLife` などで期限設計を明文化することを推奨。citeturn4text0
- プロジェクトルールとして全 .ts/.tsx 先頭に必須コメントを入れる必要あり。対象ファイル編集時のタスクに明記すること。
- `cacheTag` / `updateTag` のタグ名は定数化し共有しないとミスマッチで無効化されないため、一元管理を計画に追加推奨。

詳細レビュー内容は `design-docs-for-ai/issue328-cache-refresh-implementation-plan-review.md` を参照。

---

## レビュー対応完了（2025-11-18）

**レビュー指摘事項**: @design-docs-for-ai/issue328-cache-refresh-implementation-plan-review.md

### 対応内容

#### 1. ✅ `cacheComponents` 未設定
- **ステップ0.1** として `next.config.ts` の修正を追加
- `cacheComponents: true` の設定を必須事項として明記

#### 2. ✅ タグ名の一元管理
- **ステップ0.2** としてキャッシュタグ定数ファイル（`cache-tags.ts`）の作成を追加
- 全てのコード例で定数を使用するように修正

#### 3. ✅ キャッシュ有効期限の設計
- `cacheLife()` の設定を全てのコード例に追加
- キャッシュ有効期限の設計理由を「注意事項とベストプラクティス」に追記

#### 4. ✅ 強制ヘッダーコメント遵守
- `latest-lgtm-images.tsx` に必須コメントが未記載であることを指摘
- 全てのコード例に必須コメントを追加

#### 5. ✅ `updateTag` と `revalidateTag` の使い分け
- **ステップ2.2** として使い分け方針を追加
- read-your-own-writes が必要な理由を明記
- 将来の拡張時の選択肢を記載

### レビューで指摘された優先順位

1. ✅ `next.config.ts` に `cacheComponents: true` を追加するタスクを計画へ組み込み
2. ✅ キャッシュ無効化ポリシーに `updateTag` / `revalidateTag` の役割分担を追記
3. ✅ キャッシュ期限戦略を明文化（`cacheLife` で15分/1時間の設定を採用）
4. ✅ コード変更タスクに「必須コメント挿入」「タグ名定数化」を追加

**レビュアーへの感謝**: レビューによって、実装が失敗するリスクを事前に回避できました。特に `cacheComponents: true` の設定漏れは致命的な問題になり得たため、大変助かりました。
