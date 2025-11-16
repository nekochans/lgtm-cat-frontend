# Issue #327: ホームページコンポーネント実装計画書（改訂版）

## 改訂履歴

- **2025-11-16 改訂**: レビューフィードバックを反映
  - レスポンシブ対応追加（モバイルでは縦積み）
  - コンテナスタイルを固定高さから適切なpaddingに変更
  - 多言語対応（i18n）を実装
- **2025-11-16 再レビュー後**: 追加留意点を反映
  - Figma実高さ検証の明記
  - 背景色の検討事項追加
  - QA項目を拡充

## 概要

ホームページ（`home-page-container.tsx`）にサービス説明テキストと3つのアクションボタンを追加します。

**重要な変更点**:
- **レスポンシブ対応**: モバイル（〜767px）では縦積み、タブレット以上（768px〜）では横並び
- **多言語対応**: 日本語・英語に対応
- **コンテナスタイル**: コンテンツ量に応じた自動調整

## 実装対象

1. **サービス説明テキスト**（多言語対応）
   - 日本語: 「猫のLGTM画像を共有出来るサービスです。画像をクリックするとGitHub Markdownがコピーされます。」
   - 英語: "A service for sharing cat LGTM images. Click on an image to copy the GitHub Markdown."

2. **3つのアクションボタン**（多言語対応）
   - ランダムコピー / Random Copy（icon/repeatアイコン）
   - ねこリフレッシュ / Refresh Cats（icon/randomアイコン）
   - ねこ新着順 / Latest Cats（icon/catアイコン）

## Figmaデザイン参照

- メインデザイン: `https://www.figma.com/design/zkmgb1HoYkaMwitEVaHQyF/LGTMeow-UI-2024?node-id=862-10457`
- コンテナ: `node-id=947-2911`
- 説明テキスト: `node-id=947-2912`
- ボタン1（ランダムコピー）: `node-id=947-2914`
- ボタン2（ねこリフレッシュ）: `node-id=947-2918`
- ボタン3（ねこ新着順）: `node-id=947-2922`
- アイコン（repeat）: `node-id=947-2915`
- アイコン（random）: `node-id=947-2919`
- アイコン（cat）: `node-id=947-2923`

## 実装方針

### コンポーネント分割

複数のコンポーネントとヘルパー関数に分割して実装します：

1. **`service-description-text.ts`**: 多言語対応のテキスト取得ヘルパー関数
2. **`service-description.tsx`**: サービス説明テキスト表示コンポーネント（多言語対応）
3. **`home-action-buttons.tsx`**: 3つのアクションボタン配置コンポーネント（レスポンシブ・多言語対応）
4. **`home-page-container.tsx`**: 既存ファイルを修正して上記コンポーネントを配置

### レスポンシブ対応

- **モバイル（〜767px）**: ボタンを縦積み、幅100%
- **タブレット以上（768px〜）**: ボタンを横並び、幅240px固定
- Tailwind CSS 4のブレークポイント（`md:`）を使用

### 多言語対応（i18n）

- 既存の`Language`型（`"ja" | "en"`）を使用
- `src/features/meta-tag.ts`と同様のパターンで実装
- switch文でlanguageに応じた文言を返すヘルパー関数を作成

**英語文言について**:
- 現在の英語文言は日本語の直訳です
- ブランドトーンや自然な英語表現に合わせる必要があれば、実装時に調整してください
- 例: "A service for sharing cat LGTM images." → より親しみやすい表現に変更可能

### ボタンの動作仕様

**重要**: 現時点ではボタンのクリックイベント処理は未実装でOK。UIのみを実装します。

## 作成するファイル

### 1. `src/features/main/service-description-text.ts`

**ファイルパス**: `src/features/main/service-description-text.ts`

**目的**: サービス説明テキストの多言語対応ヘルパー関数

**実装内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { assertNever } from "@/utils/assert-never";
import type { Language } from "@/features/language";

type ServiceDescriptionText = {
  readonly line1: string;
  readonly line2: string;
};

export function getServiceDescriptionText(
  language: Language
): ServiceDescriptionText {
  switch (language) {
    case "ja":
      return {
        line1: "猫のLGTM画像を共有出来るサービスです。",
        line2: "画像をクリックするとGitHub Markdownがコピーされます。",
      };
    case "en":
      return {
        line1: "A service for sharing cat LGTM images.",
        line2: "Click on an image to copy the GitHub Markdown.",
      };
      // 注意: 英語の文言は直訳です。ブランドトーンに合わせる必要があれば調整してください
    default:
      return assertNever(language);
  }
}

export function getActionButtonText(
  language: Language
): {
  readonly randomCopy: string;
  readonly refreshCats: string;
  readonly latestCats: string;
} {
  switch (language) {
    case "ja":
      return {
        randomCopy: "ランダムコピー",
        refreshCats: "ねこリフレッシュ",
        latestCats: "ねこ新着順",
      };
    case "en":
      return {
        randomCopy: "Random Copy",
        refreshCats: "Refresh Cats",
        latestCats: "Latest Cats",
      };
    default:
      return assertNever(language);
  }
}
```

**重要な実装ポイント**:

- **既存パターン踏襲**: `src/features/meta-tag.ts`と同じパターンで実装
- **assertNever使用**: 型安全性を確保するために必ずdefault caseで`assertNever`を使用
- **インポートパス**:
  - `@/utils/assert-never`: 既存のユーティリティ（**確認済み**）
  - `@/features/language`: 既存の型定義（**確認済み**）
- **型定義**: すべてのプロパティに`readonly`を使用
- **return型**: 関数の戻り値の型を明示的に定義

### 2. `src/features/main/components/service-description.tsx`

**ファイルパス**: `src/features/main/components/service-description.tsx`

**目的**: サービス説明テキストを表示するコンポーネント（多言語対応）

**実装内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { getServiceDescriptionText } from "@/features/main/service-description-text";

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function ServiceDescription({ language, className }: Props) {
  const text = getServiceDescriptionText(language);

  return (
    <div className={className}>
      <p className="mb-0 text-center font-inter text-xl font-normal leading-7 text-text-br">
        {text.line1}
      </p>
      <p className="text-center font-inter text-xl font-normal leading-7 text-text-br">
        {text.line2}
      </p>
    </div>
  );
}
```

**重要な実装ポイント**:

- **language props**: 親コンポーネントから`Language`型のpropsを受け取る
- **ヘルパー関数使用**: `getServiceDescriptionText`を使用して言語に応じたテキストを取得
- **Server Component**: `use client`ディレクティブは不要（動的テキストだが、サーバー側で解決）
- **インポートパス**:
  - `@/features/language`: Language型のインポート（**既存**）
  - `@/features/main/service-description-text`: 新規作成するヘルパー関数
- **Tailwind CSS 4のクラス**:
  - `text-center`: テキスト中央揃え
  - `font-inter`: Interフォント（既存のデザイントークン）
  - `text-xl`: フォントサイズ20px（Figmaデザインに基づく）
  - `font-normal`: フォントウェイト400
  - `leading-7`: 行の高さ28px（Figmaデザインに基づく）
  - `text-text-br`: テキストカラー（既存のデザイントークン、orange-900相当）
  - `mb-0`: 最初の段落のマージンボトムを0に（2つの段落の間隔を調整）

### 3. `src/features/main/components/home-action-buttons.tsx`

**ファイルパス**: `src/features/main/components/home-action-buttons.tsx`

**目的**: 3つのアクションボタンを配置するコンポーネント（レスポンシブ・多言語対応）

**実装内容**:

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む

import { IconButton } from "@/components/icon-button";
import type { Language } from "@/features/language";
import { getActionButtonText } from "@/features/main/service-description-text";

type Props = {
  readonly language: Language;
  readonly className?: string;
};

export function HomeActionButtons({ language, className }: Props) {
  const buttonText = getActionButtonText(language);

  return (
    <div
      className={`flex flex-col items-center gap-4 md:flex-row md:items-start ${className ?? ""}`}
    >
      <IconButton
        displayText={buttonText.randomCopy}
        showRepeatIcon={true}
        className="w-full md:w-[240px]"
      />
      <IconButton
        displayText={buttonText.refreshCats}
        showRandomIcon={true}
        className="w-full md:w-[240px]"
      />
      <IconButton
        displayText={buttonText.latestCats}
        showCatIcon={true}
        className="w-full md:w-[240px]"
      />
    </div>
  );
}
```

**重要な実装ポイント**:

- **language props**: 親コンポーネントから`Language`型のpropsを受け取る
- **ヘルパー関数使用**: `getActionButtonText`を使用して言語に応じたボタンテキストを取得
- **レスポンシブ対応**:
  - **コンテナ**: `flex-col md:flex-row` でモバイルは縦積み、タブレット以上で横並び
  - **中央揃え**: `items-center md:items-start` でモバイルは中央、タブレット以上で上揃え
  - **ボタン幅**: `w-full md:w-[240px]` でモバイルは100%、タブレット以上で固定240px
- **既存コンポーネント使用**: `@/components/icon-button` を必ずインポート（**存在しないパスをインポートしないこと**）
- **既存のアイコン使用**: `icon-button.tsx`には既に`RepeatIcon`, `RandomIcon`, `CatIcon`が定義されている
  - `showRepeatIcon={true}`: Repeatアイコン（ランダムコピー）を表示
  - `showRandomIcon={true}`: Randomアイコン（ねこリフレッシュ）を表示
  - `showCatIcon={true}`: Catアイコン（ねこ新着順）を表示
- **配置**: `gap-4` でボタン間の間隔は16px
- **Server Component**: 現時点ではクリックイベント処理がないため`use client`不要
  - **注意**: 将来的にクリックイベントを実装する際は`use client`ディレクティブを追加する必要あり

**既存のIconButtonコンポーネントの仕様（参考）**:

```typescript
// src/components/icon-button.tsx（既存）
type Props = ComponentProps<"button"> & {
  displayText: string;              // ボタンテキスト（必須）
  showGithubIcon?: boolean;         // GitHubアイコン表示
  showRepeatIcon?: boolean;         // Repeatアイコン表示
  showRandomIcon?: boolean;         // Randomアイコン表示
  showCatIcon?: boolean;            // Catアイコン表示
  isPressed?: boolean;              // 押下状態
  className?: string;               // 追加スタイル
  link?: IncludeLanguageAppPath;    // リンク先（linkがある場合はLinkコンポーネントとして動作）
};
```

### 4. `src/features/main/components/home-page-container.tsx` の修正

**ファイルパス**: `src/features/main/components/home-page-container.tsx`

**変更箇所**: 23-26行目のaria-hidden divを置き換え

**修正前**:

```typescript
<div
  aria-hidden
  className="flex h-[210px] w-full max-w-[1020px] flex-col items-center gap-6 rounded-xl px-[12px] pt-[40px] pb-[32px]"
/>
```

**修正後**:

```typescript
<div className="flex w-full max-w-[1020px] flex-col items-center gap-7 rounded-xl px-3 pb-8 pt-10">
  <ServiceDescription language={language} />
  <HomeActionButtons language={language} />
</div>
```

**背景色について（デザイン確認後に追加検討）**:

Figmaデザインでヒーローブロックに背景色がある場合は、以下のように追加してください：

```typescript
<div className="flex w-full max-w-[1020px] flex-col items-center gap-7 rounded-xl bg-[#fff4e9] px-3 pb-8 pt-10">
  <ServiceDescription language={language} />
  <HomeActionButtons language={language} />
</div>
```

- デザインを確認し、背景色が不要であれば上記の追加は不要です
- 背景色が必要な場合のみ `bg-[#fff4e9]` を追加してください

**必要なインポート追加**:

```typescript
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { ServiceDescription } from "@/features/main/components/service-description";
```

**重要な実装ポイント**:

- **language props渡し**: 既存のprops `language` を各コンポーネントに渡す
- **正確なインポートパス**:
  - `@/features/main/components/home-action-buttons` （**必ず確認すること**）
  - `@/features/main/components/service-description` （**必ず確認すること**）
- **コンテナスタイル**:
  - **固定高さ削除**: `h-[210px]` を削除し、コンテンツに応じた自動調整
  - **padding調整**: `px-3 pt-10 pb-8` で適切な余白を確保（px-[12px]=px-3, pt-[40px]=pt-10, pb-[32px]=pb-8）
  - **既存スタイル維持**: `w-full max-w-[1020px] rounded-xl` は維持
- **配置**: `flex flex-col items-center gap-7` で縦並び、中央揃え、間隔28px（Figmaのgap-7相当）
- **Figmaデザインに基づく**:
  - `gap-7`: 28px（Figmaで`gap-[var(--spacing\/7,28px)]`と指定されている）
  - `items-center`: 子要素を中央揃え

## Tailwind CSS 4 カスタムデザイントークン

既存のプロジェクトで使用されているカスタムデザイントークン:

- **色**:
  - `bg-[#fff4e9]`: 背景色（orange-50相当）
  - `text-text-br`: テキスト色（orange-900相当、#7c2d12）
  - `bg-button-secondary-base`: ボタン背景色（amber-300相当、#fcd34d）
  - `bg-button-secondary-hover`: ボタンホバー時の背景色
  - `bg-button-secondary-active`: ボタン押下時の背景色

- **フォント**:
  - `font-inter`: Interフォント
  - `text-xl`: 20px
  - `leading-7`: 28px

- **間隔**:
  - `gap-4`: 16px
  - `gap-7`: 28px
  - `px-7`: 28px（パディング左右）
  - `py-2`: 8px（パディング上下）

## 実装手順

### ステップ1: 多言語対応ヘルパー関数を作成

1. `src/features/main/service-description-text.ts` を新規作成
2. 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を記載
3. 上記の実装内容をコピー
4. **重要**: インポートパスを確認
   - `@/utils/assert-never`: 既存ユーティリティ
   - `@/features/language`: 既存型定義
5. 保存

### ステップ2: ServiceDescriptionコンポーネントを作成

1. `src/features/main/components/service-description.tsx` を新規作成
2. 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を記載
3. 上記の実装内容をコピー
4. **重要**: インポートパスを確認
   - `@/features/language`: 既存型定義
   - `@/features/main/service-description-text`: ステップ1で作成
5. 保存

### ステップ3: HomeActionButtonsコンポーネントを作成

1. `src/features/main/components/home-action-buttons.tsx` を新規作成
2. 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を記載
3. 上記の実装内容をコピー
4. **重要**: インポートパスを確認
   - `@/components/icon-button`: 既存コンポーネント
   - `@/features/language`: 既存型定義
   - `@/features/main/service-description-text`: ステップ1で作成
5. 保存

### ステップ4: home-page-container.tsxを修正

1. `src/features/main/components/home-page-container.tsx` を開く
2. ファイル先頭に以下のインポートを追加:
   ```typescript
   import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
   import { ServiceDescription } from "@/features/main/components/service-description";
   ```
3. 23-26行目のaria-hidden divを削除
4. 以下のコードに置き換え:
   ```typescript
   <div className="flex w-full max-w-[1020px] flex-col items-center gap-7 rounded-xl px-3 pb-8 pt-10">
     <ServiceDescription language={language} />
     <HomeActionButtons language={language} />
   </div>
   ```
5. **重要**: `language` propsが各コンポーネントに渡されていることを確認
6. 保存

## 品質管理手順

**実装完了後、必ず以下の順番で実行してください**:

### 1. コードフォーマット

```bash
npm run format
```

- Ultracite（Biome）でコードを自動フォーマット
- エラーが出た場合は修正してから次へ

### 2. Linter実行

```bash
npm run lint
```

- コードスタイルと型チェック
- エラーが出た場合は修正してから次へ

### 3. テスト実行

```bash
npm run test
```

- すべてのテストがパスすることを確認
- 失敗した場合は原因を調査して修正

### 4. ローカル開発サーバーで表示確認

```bash
# 開発サーバーが起動していない場合
npm run dev
```

- Playwright MCPを使って `http://localhost:2222` にアクセス
- サービス説明テキストと3つのボタンが正しく表示されているか確認
- Figmaデザインと比較して視覚的に確認

**確認ポイント（デスクトップ表示）**:
- [ ] サービス説明テキストが2行で中央揃えされているか
- [ ] 3つのボタンが横並びで表示されているか（タブレット以上）
- [ ] 各ボタンのアイコンとテキストが正しく表示されているか
- [ ] ボタンの幅が240pxで統一されているか（タブレット以上）
- [ ] ボタン間の間隔が適切か（gap-4 = 16px）
- [ ] テキストとボタンの間隔が適切か（gap-7 = 28px）
- [ ] コンテナの余白が適切か（px-3 pt-10 pb-8）

**確認ポイント（モバイル表示）**:
- [ ] ブラウザを767px以下に縮小して確認
- [ ] 3つのボタンが縦に並んでいるか
- [ ] ボタンの幅が画面幅いっぱいに広がっているか
- [ ] 横スクロールが発生していないか
- [ ] ボタン間の間隔が適切か（gap-4 = 16px）

**確認ポイント（多言語対応）**:
- [ ] 日本語ページ (`http://localhost:2222/`) でテキストが日本語で表示されるか
- [ ] 英語ページ (`http://localhost:2222/en`) でテキストが英語で表示されるか
- [ ] 各言語でボタンテキストが正しく表示されるか

**確認ポイント（Figmaデザイン整合性）**:
- [ ] **ヒーローブロックの高さ**: Figmaデザインと目視比較し、高さが適切か確認
  - paddingでスペースが不足している場合は `min-h-[210px]` などを追加検討
- [ ] **背景色の有無**: Figmaでヒーローブロックに背景色がある場合は `bg-[#fff4e9]` を追加
- [ ] **モバイルで横スクロールが発生しないこと**: 767px以下で確認
- [ ] **JA/EN表記が正しく切り替わること**: 両方のURLで確認

### 5. Storybookで表示確認（オプション）

```bash
npm run storybook
```

- Playwright MCPを使って `http://localhost:6006/` にアクセス
- 新しく作成したコンポーネントのStorybookを確認（Storyファイルを作成した場合）

### 6. Chrome DevTools MCPでデバッグ（必要に応じて）

- デザイン崩れがある場合はChrome DevTools MCPを使って調査
- 要素のスタイルを検証
- レイアウトの問題を特定

## 注意事項

### 実装時の重要な注意点

1. **先頭コメント必須**: すべての`.ts`/`.tsx`ファイルに `// 絶対厳守：編集前に必ずAI実装ルールを読む` を記載

2. **存在しないファイルをインポートしない**:
   - `@/components/icon-button` は既に存在（**確認済み**）
   - 新規作成するファイルのパスを正確に記載
   - タイポに注意

3. **既存のアイコンを使用**:
   - `icon-button.tsx`には既に`RepeatIcon`, `RandomIcon`, `CatIcon`が定義されている
   - Figmaから新しいアイコン画像をダウンロードする必要はない
   - 既存のアイコンコンポーネントを使用すること

4. **型定義**:
   - `type`を使用（`interface`ではない）
   - プロパティには`readonly`を使用
   - キャメルケースを使用

5. **Tailwind CSS 4のクラス名**:
   - カスタムデザイントークンを使用（例: `text-text-br`）
   - 任意の値は`[]`で囲む（例: `w-[240px]`）
   - `className`プロパティで追加スタイルを受け取れるようにする

6. **Server ComponentとClient Component**:
   - 現時点ではすべてServer Componentで実装
   - `use client`ディレクティブは不要
   - **将来的にクリックイベントを実装する際は`use client`を追加すること**

7. **無駄な修正禁止**:
   - 依頼内容に関係のない修正は絶対に行わない
   - 既存のコードで動作している部分は変更しない

8. **テストコードの上書き禁止**:
   - ビジネスロジックが誤っている状態でテストを合格させるための上書きは絶対禁止

## トラブルシューティング

### よくあるエラーと対処法

#### 1. インポートエラー

**エラー例**:
```
Module not found: Can't resolve '@/components/icon-button'
```

**対処法**:
- ファイルパスが正しいか確認
- タイポがないか確認
- `icon-button.tsx`が`src/components/`に存在するか確認

#### 2. Tailwindクラス名エラー

**エラー例**:
```
Unknown at rule @apply
```

**対処法**:
- Tailwind CSS 4の構文を使用しているか確認
- カスタムデザイントークンが定義されているか確認

#### 3. 型エラー

**エラー例**:
```
Type '{ displayText: string; showRepeatIcon: true; }' is not assignable to type 'Props'
```

**対処法**:
- IconButtonのProps型定義を確認
- 必須プロパティが不足していないか確認

#### 4. レイアウト崩れ

**対処法**:
- Figmaデザインと比較
- Chrome DevTools MCPで要素を検証
- Tailwindクラスが正しく適用されているか確認

## 参考情報

### 既存のファイル構造

```
src/
├── components/
│   ├── icon-button.tsx                    # 既存（使用）
│   ├── footer.tsx                         # 既存
│   └── header.tsx                         # 既存
├── features/
│   ├── language.ts                        # 既存（Language型）
│   └── main/
│       ├── service-description-text.ts    # 新規作成（ヘルパー関数）
│       └── components/
│           ├── home-page-container.tsx    # 既存（修正）
│           ├── service-description.tsx    # 新規作成
│           ├── home-action-buttons.tsx    # 新規作成
│           ├── random-lgtm-images.tsx     # 既存
│           └── lgtm-images.tsx            # 既存
├── utils/
│   └── assert-never.ts                    # 既存（使用）
```

### IconButtonコンポーネントの内部実装（参考）

```typescript
// src/components/icon-button.tsx（既存）

// RepeatIconコンポーネント（既に定義済み）
function RepeatIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Repeat icon</title>
      <path d="..." fill="#FFF7ED" />
    </svg>
  );
}

// RandomIconコンポーネント（既に定義済み）
function RandomIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Random icon</title>
      <path d="..." fill="#FFF7ED" />
    </svg>
  );
}

// CatIconコンポーネント（既に定義済み）
function CatIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cat icon</title>
      <path d="..." fill="#FFF7ED" />
    </svg>
  );
}

export function IconButton({
  type,
  displayText,
  showGithubIcon,
  showRepeatIcon,
  showRandomIcon,
  showCatIcon,
  isPressed,
  className,
  link,
}: Props): JSX.Element {
  // ボタンスタイル
  const buttonClasses = `inline-flex items-center justify-center gap-2 rounded-lg px-7 py-2 font-bold font-inter text-xl text-text-br transition-colors duration-200 ${
    isPressed === true
      ? "bg-button-secondary-active"
      : "bg-button-secondary-base hover:bg-button-secondary-hover"
  } ${className ?? ""}`;

  // アイコン表示
  const startContent = (
    <>
      {showGithubIcon === true && (
        <GithubIcon color="default" height={20} width={20} />
      )}
      {showRepeatIcon === true && <RepeatIcon />}
      {showRandomIcon === true && <RandomIcon />}
      {showCatIcon === true && <CatIcon />}
    </>
  );

  // linkプロパティがある場合はLinkコンポーネントとして動作
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

  // 通常のボタンとして動作
  return (
    <Button
      className={buttonClasses}
      isDisabled={isPressed}
      startContent={startContent}
      type={type}
    >
      {displayText}
    </Button>
  );
}
```

## まとめ

この実装計画書（改訂版）に従って実装することで、以下が達成されます:

1. ✅ サービス説明テキストの表示（**多言語対応**）
2. ✅ 3つのアクションボタンの配置（**多言語対応**）
3. ✅ **レスポンシブ対応**（モバイル: 縦積み、タブレット以上: 横並び）
4. ✅ 既存のIconButtonコンポーネントの再利用
5. ✅ Figmaデザインに忠実な実装
6. ✅ コンポーネント分割による保守性の向上
7. ✅ Server Componentとしての実装（パフォーマンス最適化）
8. ✅ **コンテンツに応じた自動調整**（固定高さなし）

**改訂版での主な変更点**:

- ✅ **レスポンシブ対応**: `flex-col md:flex-row`, `w-full md:w-[240px]` でモバイルとデスクトップの表示を最適化
- ✅ **多言語対応**: `Language`型を使用し、既存パターン（`src/features/meta-tag.ts`）に従ったヘルパー関数を実装
- ✅ **コンテナスタイル**: 固定高さ `h-[210px]` を削除し、適切なpadding（`px-3 pt-10 pb-8`）でスペースを確保

**実装者へのメッセージ**:

この設計書には、実装に必要なすべての情報が含まれています。**レビューフィードバックと再レビューを反映した最終版**です。特に以下の点に注意してください:

**必須事項**:
- **存在しないファイルをインポートしないこと**（すべてのパスを確認済み）
- **既存のアイコンコンポーネントを使用すること**（新しいアイコンは不要）
- **先頭コメントを必ず記載すること**
- **language propsを必ず渡すこと**（各コンポーネントに）
- **レスポンシブ対応のクラスを正しく記述すること**（`flex-col md:flex-row`など）
- **品質管理手順を必ず実行すること**（format → lint → test → 表示確認）

**表示確認の重要ポイント**:
- **モバイル表示とデスクトップ表示の両方を確認すること**
- **日本語と英語の両方で表示確認すること**
- **Figmaデザインと目視比較すること**（特に高さと背景色）
- **モバイルで横スクロールが発生しないことを確認**

**デザイン調整が必要な場合**:
- ヒーローブロックの高さが不足している場合: `min-h-[210px]` を追加検討
- 背景色が必要な場合: `bg-[#fff4e9]` を追加検討
- 英語文言のトーンを調整する場合: `service-description-text.ts` を編集

不明点がある場合は、この設計書を再度確認するか、質問してください。
