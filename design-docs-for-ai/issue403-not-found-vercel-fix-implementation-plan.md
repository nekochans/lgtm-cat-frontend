# Issue #403: Vercel環境でのみ404ページが機能していない問題の修正

## 概要

### 目的

Vercel環境で404ページが「Loading...」のまま表示され続け、正しいエラーページが表示されない問題を修正する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/403

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4
- **ホスティング**: Vercel

### 変更の背景

ステージング環境 (Vercel) において、存在しないURLにアクセスした際に404エラーページが表示されず、「Loading...」というメッセージが表示され続ける問題が発生している。ローカル環境では正常に動作するため、Vercel環境固有の問題と考えられる。

---

## 問題の詳細

### 再現手順

1. ステージング環境にアクセス
2. 存在しないページ (例: `/how-to-use`) に遷移
3. 「Loading...」というメッセージが表示され、404エラーページが表示されない

### 再現環境

- Vercel環境のみで発生
- ローカル環境 (`npm run dev`) では正常に動作

### 影響

エンドユーザーに正しいエラーメッセージが伝わらず、離脱の可能性が高くなる。

---

## 原因分析

### 現在の実装構造

現在の `src/app/not-found.tsx` は以下の構造になっている:

```
NotFound (default export)
  └── Suspense (fallback={<NotFoundFallback />})
        └── NotFoundContent (async component)
              └── await headers()
              └── NotFoundPageContainer
```

### 問題の根本原因

**Next.js 16では、`not-found.tsx`内で`Suspense`を使用すると、Vercel環境でレンダリングがスタックする問題がある。**

具体的には:
1. `NotFound`コンポーネント内で`Suspense`を使用している
2. `NotFoundContent`は`async`コンポーネントで`await headers()`を呼び出している
3. Vercel環境では、この組み合わせにより`Suspense`の`fallback`である`NotFoundFallback`(「Loading...」)が表示され続ける

### 解決策

`Suspense`、`NotFoundFallback`、`NotFoundContent`を削除し、`NotFound`コンポーネント自体を`async`にして直接`headers()`を呼び出す。

この修正は、Next.js公式ドキュメントで推奨されている`not-found.tsx`の実装パターンに従う。

**参考: Next.js公式ドキュメントの例**

```tsx
import { headers } from 'next/headers'

export default async function NotFound() {
  const headersList = await headers()
  const domain = headersList.get('host')
  // ...
}
```

---

## 修正対象ファイル

| ファイルパス | 修正内容 |
|-------------|----------|
| `src/app/not-found.tsx` | `Suspense`パターンを削除し、`NotFound`を直接`async`コンポーネントに変更 |

### 関連ファイル (変更なし)

以下のファイルは本修正では**変更しない**が、動作確認に関連する:

| ファイルパス | 役割 |
|-------------|------|
| `src/features/errors/components/not-found-page-container.tsx` | 404ページのUIコンテナ |
| `src/features/errors/components/not-found-page-container.stories.tsx` | Storybookストーリー |
| `src/features/errors/components/error-layout.tsx` | エラーページ共通レイアウト |
| `src/features/errors/error-i18n.ts` | i18nテキスト定義 |
| `src/features/language.ts` | Language型定義 |
| `src/features/meta-tag.ts` | メタタグユーティリティ |

### 修正箇所の行番号 (現在の実装)

| 行番号 | 内容 | 操作 |
|--------|------|------|
| 5 | `import { Suspense } from "react";` | 削除 |
| 72-80 | `NotFoundFallback`コンポーネント | 削除 |
| 86-92 | `NotFoundContent`コンポーネント | 削除 |
| 94-100 | `NotFound`コンポーネント | 修正 |

**注意**: 行番号はファイル編集前の状態です。実装時は最新のファイルを確認してください。

---

## 修正前後の比較

### 修正前 (現在の実装)

```tsx
// src/app/not-found.tsx (修正前)
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { JSX } from "react";
import { Suspense } from "react";
import { NotFoundPageContainer } from "@/features/errors/components/not-found-page-container";
import type { Language } from "@/features/language";
import { notFoundMetaTag } from "@/features/meta-tag";

// metadataはビルド時に評価されるため、静的な値を使用
const metaTag = notFoundMetaTag("ja");

export const metadata: Metadata = {
  title: metaTag.title,
  robots: {
    index: false,
    follow: false,
  },
};

function detectLanguageFromHeaders(headersList: Headers): Language {
  // ... 言語判定ロジック
}

function NotFoundFallback(): JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col bg-orange-50">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    </div>
  );
}

async function NotFoundContent(): Promise<JSX.Element> {
  const headersList = await headers();
  const language = detectLanguageFromHeaders(headersList);

  return <NotFoundPageContainer language={language} />;
}

export default function NotFound(): JSX.Element {
  return (
    <Suspense fallback={<NotFoundFallback />}>
      <NotFoundContent />
    </Suspense>
  );
}
```

### 修正後

```tsx
// src/app/not-found.tsx (修正後)
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { JSX } from "react";
import { NotFoundPageContainer } from "@/features/errors/components/not-found-page-container";
import type { Language } from "@/features/language";
import { notFoundMetaTag } from "@/features/meta-tag";

// metadataはビルド時に評価されるため、静的な値を使用
// 動的な言語判定はコンポーネント内で行うが、metadataは日本語固定
// これは仕様として許容する(Next.jsのmetadataはリクエスト情報に依存できないため)
const metaTag = notFoundMetaTag("ja");

export const metadata: Metadata = {
  title: metaTag.title,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * リクエストヘッダーから言語を判定する
 * 判定優先順位:
 * 1. x-pathname ヘッダー(Next.jsミドルウェアで設定可能)
 * 2. x-matched-path ヘッダー(Next.js内部ヘッダー)
 * 3. next-url ヘッダー(Next.js内部ヘッダー)
 * 4. referer ヘッダー(遷移元URL)
 * 5. 日本語にフォールバック
 */
function detectLanguageFromHeaders(headersList: Headers): Language {
  // 優先度1: x-pathname(ミドルウェアで明示的に設定可能)
  const xPathname = headersList.get("x-pathname");
  if (xPathname?.startsWith("/en")) {
    return "en";
  }

  // 優先度2: x-matched-path(Next.js内部ヘッダー)
  const xMatchedPath = headersList.get("x-matched-path");
  if (xMatchedPath?.startsWith("/en")) {
    return "en";
  }

  // 優先度3: next-url(Next.js内部ヘッダー)
  const nextUrl = headersList.get("next-url");
  if (nextUrl?.startsWith("/en")) {
    return "en";
  }

  // 優先度4: referer(遷移元URL)
  const referer = headersList.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.pathname.startsWith("/en")) {
        return "en";
      }
    } catch {
      // URLパースエラーは無視
    }
  }

  // 優先度5: 日本語にフォールバック
  return "ja";
}

/**
 * Next.js 16対応:
 * not-found.tsxではSuspenseを使用せず、コンポーネント自体をasyncにして
 * 直接headers()をawaitすることで、Vercelでの読み込みスタックを防ぐ。
 */
export default async function NotFound(): Promise<JSX.Element> {
  const headersList = await headers();
  const language = detectLanguageFromHeaders(headersList);

  return <NotFoundPageContainer language={language} />;
}
```

---

## 変更点の詳細

### 削除するコード

1. **`import { Suspense } from "react";`** - Suspenseのインポートを削除
2. **`NotFoundFallback`コンポーネント** - Suspenseのfallback用コンポーネントを削除 (約8行)
3. **`NotFoundContent`コンポーネント** - 非同期内部コンポーネントを削除 (約5行)
4. **`Suspense`によるラッピング** - NotFoundコンポーネント内のSuspenseを削除

### 追加・変更するコード

1. **`NotFound`コンポーネントの変更**:
   - `function NotFound(): JSX.Element` から `async function NotFound(): Promise<JSX.Element>` に変更
   - コンポーネント内で直接 `await headers()` を呼び出し
   - `detectLanguageFromHeaders` で言語判定
   - `NotFoundPageContainer` を直接レンダリング

2. **コメントの追加**:
   - Next.js 16対応の理由を説明するコメントを追加

---

## 実装手順

### Step 1: not-found.tsx の修正

`src/app/not-found.tsx` を以下の手順で修正:

1. `Suspense` のインポートを削除
2. `NotFoundFallback` コンポーネントを削除
3. `NotFoundContent` コンポーネントを削除
4. `NotFound` コンポーネントを `async` に変更し、ロジックを統合

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

#### 404ページの表示確認

- [ ] 存在しないURL (例: `http://localhost:2222/nonexistent`) にアクセスして404ページが表示される
- [ ] 「Loading...」ではなく、正しい404ページが即座に表示される
- [ ] タイトル「404 ページが見つかりません」が表示される
- [ ] メッセージが正しく表示される
- [ ] LookingUpCat (見上げる猫) が表示される
- [ ] 「Go to HOME」ボタンが表示され、クリックするとトップページに遷移する
- [ ] Header / Footer が正常に表示される

#### 多言語対応確認

- [ ] `/en/nonexistent` にアクセスした場合、404ページで英語が表示される (パスヘッダーまたはrefererによる判定)
- [ ] 直接URLを入力した場合は日本語にフォールバックされる (仕様通り)

**注意**: 言語判定はヘッダーに依存するため、環境によって挙動が異なる可能性がある

#### レスポンシブデザイン

- [ ] デスクトップサイズ (1024px以上) でレイアウトが崩れない
- [ ] モバイルサイズ (375px程度) でレイアウトが崩れない

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

**確認URL一覧**:
- 日本語版: `http://localhost:6006/?path=/story/features-errors-notfoundpagecontainer--japanese`
- 英語版: `http://localhost:6006/?path=/story/features-errors-notfoundpagecontainer--english`

- [ ] `features/errors/NotFoundPageContainer` のストーリーが正常に表示される
  - [ ] `Japanese` が正常に表示される
  - [ ] `English` が正常に表示される
- [ ] Header / Footer が含まれている (ErrorLayoutによる)
- [ ] LookingUpCat が正常に表示される

### 6. 本番ビルドの確認

```bash
npm run build
```

- [ ] ビルドがエラーなく完了する
- [ ] `src/app/not-found.tsx` に関する警告がない

### 7. Vercel環境での最終確認 (デプロイ後)

**重要**: この問題はVercel環境でのみ発生するため、デプロイ後の確認が最も重要

**確認URL一覧** (ステージング環境):
- 日本語版: `https://lgtm-cat-frontend-git-staging-nekochans.vercel.app/nonexistent-page`
- 英語版: `https://lgtm-cat-frontend-git-staging-nekochans.vercel.app/en/nonexistent-page`

- [ ] ステージング環境で存在しないURLにアクセスして404ページが正常に表示される
- [ ] 「Loading...」ではなく、正しい404ページが表示されることを確認
- [ ] 日本語版・英語版の両方で確認
- [ ] 複数回リロードしても安定して404ページが表示される

---

## 技術的考慮事項

### なぜSuspenseを使用していたか

当初、`headers()`が非同期関数であるため、Next.js 16の`cacheComponents`要件を満たすために`Suspense`パターンを採用していた可能性がある。

### なぜSuspenseを削除するのか

1. **Next.js公式ドキュメントの推奨**: `not-found.tsx`では、コンポーネント自体を`async`にして直接データを取得することが推奨されている
2. **Vercel環境での問題**: `Suspense`を使用すると、Vercel環境でレンダリングがスタックする問題が発生する
3. **シンプルな実装**: `Suspense`を削除することで、コードがシンプルになり、デバッグが容易になる

### 多言語対応について

Issue #403 では「多言語化対応が難しいという結論なら常に日本語の404ページを返すという対処法でも問題はない」と記載されている。

今回の修正では:
- **多言語対応は維持**: `detectLanguageFromHeaders`関数による言語判定ロジックはそのまま維持
- **fallbackは日本語**: ヘッダーから言語を判定できない場合は日本語にフォールバック

この修正により、多言語対応を維持しながら問題を解決できる。

---

## 代替案 (フォールバック)

本修正で問題が解決しない場合の代替案:

### 代替案1: 多言語対応を諦めて日本語固定にする

Issue #403 で言及されている通り、「多言語化対応が難しいという結論なら常に日本語の404ページを返すという対処法でも問題はない」。

```tsx
// 代替案: 常に日本語で404ページを表示
export default function NotFound(): JSX.Element {
  return <NotFoundPageContainer language="ja" />;
}
```

**メリット**:
- `headers()` を使用しないため、よりシンプルで確実に動作する
- 非同期処理が不要になる

**デメリット**:
- 英語ユーザーに対しても日本語で404ページが表示される

### 代替案2: 静的な404ページを使用する

Next.jsの静的な404ページ機能を使用する。

```tsx
// metadata のみ定義し、コンポーネントは同期的に
export default function NotFound(): JSX.Element {
  // 言語判定なしで日本語固定
  return <NotFoundPageContainer language="ja" />;
}
```

### 採用優先順位

1. **まず本計画の修正を試す** (Suspense削除、async化)
2. 問題が解決しない場合は**代替案1** (日本語固定) を採用
3. それでも問題がある場合は**代替案2** (完全に静的) を採用

---

## リスクと軽減策

| リスク | 軽減策 |
|--------|--------|
| 修正後も問題が解決しない | ローカル環境とVercel環境の両方で十分にテストを行う |
| 言語判定が正しく動作しない | 既存の`detectLanguageFromHeaders`関数は変更しないため、動作に影響なし |
| パフォーマンスへの影響 | `Suspense`を削除することで、むしろレンダリングがシンプルになり、パフォーマンスが向上する可能性がある |

---

## トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| 修正後もローカルで「Loading...」が表示される | ブラウザキャッシュ | ハードリロード (Cmd+Shift+R) または開発サーバーの再起動 |
| `headers()` で型エラーが発生する | Next.js 16の非同期API | `await headers()` を使用し、`NotFound` を `async` 関数にする |
| `NotFoundPageContainer` が見つからない | インポートパスの誤り | `@/features/errors/components/not-found-page-container` を確認 |
| ビルドエラー: Suspense関連 | 削除が不完全 | `import { Suspense }` の削除を確認 |
| Vercelでデプロイ後も問題が続く | キャッシュ | Vercelダッシュボードから「Redeploy」を実行 |

### 修正が正しく適用されたことの確認方法

1. **ファイル内容の確認**:
   ```bash
   grep -n "Suspense" src/app/not-found.tsx
   ```
   結果が空であれば、Suspenseが正しく削除されている

2. **async関数の確認**:
   ```bash
   grep -n "async function NotFound" src/app/not-found.tsx
   ```
   結果が表示されれば、async化が正しく行われている

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **`detectLanguageFromHeaders`関数の言語判定ロジックを変更しない** (動作確認済みのため)
3. **`NotFoundPageContainer`コンポーネントを変更しない** (UIは正常に動作しているため)
4. **metadataの設定を変更しない** (日本語固定は仕様として採用済み)

---

## 成功基準

以下を全て満たすこと:

### コード修正

- [ ] `src/app/not-found.tsx` から `Suspense` が削除されている
- [ ] `src/app/not-found.tsx` から `NotFoundFallback` コンポーネントが削除されている
- [ ] `src/app/not-found.tsx` から `NotFoundContent` コンポーネントが削除されている
- [ ] `NotFound` コンポーネントが `async` 関数として実装されている
- [ ] `NotFound` コンポーネント内で直接 `await headers()` が呼び出されている

### 機能確認

- [ ] ローカル環境で存在しないURLにアクセスすると404ページが表示される
- [ ] 404ページが「Loading...」ではなく即座に表示される
- [ ] 多言語対応が正常に機能する (ヘッダーベースの判定)
- [ ] 「Go to HOME」ボタンが正常に動作する
- [ ] Header / Footer が各ページで正常に表示される

### CI/テスト/ビルド

- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする
- [ ] `npm run build` がエラー0で完了する

### Vercel環境 (デプロイ後)

- [ ] ステージング環境で404ページが正常に表示される
- [ ] 「Loading...」のまま表示されることがない

---

## 更新履歴

| 日時 | レビュー回 | 改善内容 |
|------|----------|---------|
| 2025-12-30 | 初版 | 実装計画書の初版作成 |
| 2025-12-30 | 1回目 | 関連ファイル一覧追加、修正箇所の行番号明示、Storybook確認URL追加、本番ビルド確認ステップ追加、Vercel環境確認URL追加、代替案セクション追加 |
| 2025-12-30 | 2回目 | トラブルシューティングセクション追加、成功基準にビルド確認追加、コードコメントの全角括弧を半角に修正、修正確認用のgrepコマンド追加 |
| 2025-12-30 | 3回目 | 行番号の正確性修正、クイックリファレンスセクション追加、確認URL一覧表追加、行番号に関する注意書き追加 |

---

## クイックリファレンス

### 修正の要約

| 項目 | 内容 |
|------|------|
| **修正ファイル** | `src/app/not-found.tsx` |
| **問題** | Vercel環境で「Loading...」のまま表示される |
| **原因** | `Suspense` パターンがVercel環境で正しく動作しない |
| **解決策** | `Suspense`を削除し、`NotFound`を`async`化 |

### 実行コマンド一覧

```bash
# 品質管理 (順番に実行)
npm run format
npm run lint
npm run test
npm run build

# 修正確認
grep -n "Suspense" src/app/not-found.tsx
grep -n "async function NotFound" src/app/not-found.tsx
```

### 確認URL一覧

| 環境 | URL |
|------|-----|
| ローカル (404) | http://localhost:2222/nonexistent |
| ローカル (Storybook) | http://localhost:6006/?path=/story/features-errors-notfoundpagecontainer--japanese |
| ステージング (404) | https://lgtm-cat-frontend-git-staging-nekochans.vercel.app/nonexistent-page |

---

**作成日**: 2025-12-30
**最終更新日**: 2025-12-30
**対象Issue**: #403
**担当**: AI実装者
