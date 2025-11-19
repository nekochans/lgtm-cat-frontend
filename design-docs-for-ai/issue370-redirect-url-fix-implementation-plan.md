# Issue #370: Vercel上でリダイレクト機能が動作しない問題の修正実装計画

## 概要

Vercel環境で「ねこリフレッシュ」「ねこ新着順」ボタンを押下すると500エラー（`TypeError: Invalid URL`）が発生する問題を修正する。

エラーの原因は、`src/features/url.ts` の `i18nUrlList.home.ja` が `"//"` という不正なパスになっており、これにクエリパラメータを付加すると `//?view=random` のような不正なURLが生成され、Next.js 16 の `redirect()` 関数でエラーとなることである。

## エラー詳細

### エラーメッセージ

```
⨯ TypeError: Invalid URL
    at async o (.next/server/chunks/ssr/_538221ba._.js:2:7661)
    at async r (.next/server/chunks/ssr/_538221ba._.js:3:2713)
    at async N (.next/server/chunks/ssr/_538221ba._.js:3:8114) {
  code: 'ERR_INVALID_URL',
  input: '//?view=random',
  base: 'http://n',
  page: '/'
}
```

### エラー発生メカニズム

1. **現在のURL構築ロジック**:
   - `src/features/url.ts` の `i18nUrlList.home.ja` が `${appPathList.home}/` と定義されている
   - `appPathList.home` は `"/"` のため、結果的に `"//"` となる

2. **redirect()関数での問題**:
   - `refresh-images.ts` で `${i18nUrlList.home.ja}?view=random` とクエリパラメータを付加
   - 結果: `//?view=random` という不正なURLが生成される
   - Next.js 16の `redirect()` 関数は内部でURLオブジェクトを生成する際にこの形式を処理できずエラーとなる

3. **環境による動作の違い**:
   - **ローカル環境**: エラーは出るが、何らかの理由で動作している（Next.js 16の開発モードの寛容な処理？）
   - **Vercel環境**: 本番ビルドでは厳密にエラーとなり500エラーが発生

## 前提条件の確認

### 現在のファイル構造

```text
src/
├── app/
│   ├── layout.tsx                    # ルートレイアウト（メタタグで i18nUrlList 使用）
│   └── (default)/
│       ├── page.tsx                  # 日本語版ホームページ（メタタグで i18nUrlList 使用）
│       └── en/
│           └── page.tsx              # 英語版ホームページ（メタタグで i18nUrlList 使用）
└── features/
    ├── url.ts                        # URL定義（修正対象）
    └── main/
        └── actions/
            ├── refresh-images.ts     # リダイレクト処理（i18nUrlList を使用）
            └── __tests__/
                └── refresh-images/
                    ├── refresh-random-cats.test.ts
                    └── show-latest-cats.test.ts
```

### 現在の実装

#### 1. `src/features/url.ts`（問題箇所）

```typescript
// appPathList の定義
export const appPathList = {
  home: "/",           // ホームは "/"
  upload: "/upload",
  terms: "/terms",
  privacy: "/privacy",
  error: "/error",
  maintenance: "/maintenance",
  "external-transmission-policy": "/external-transmission-policy",
  login: "/login",
} as const;

// i18nUrlList の定義（問題箇所）
export const i18nUrlList: I18nUrlList = {
  home: {
    ja: `${appPathList.home}/`,  // "/" + "/" = "//" になる！
    en: "/en/",
  },
  upload: {
    ja: `${appPathList.upload}/`,     // "/upload/" (正常)
    en: `/en${appPathList.upload}/`,  // "/en/upload/" (正常)
  },
  terms: {
    ja: `${appPathList.terms}/`,      // "/terms/" (正常)
    en: `/en${appPathList.terms}/`,   // "/en/terms/" (正常)
  },
  privacy: {
    ja: `${appPathList.privacy}/`,    // "/privacy/" (正常)
    en: `/en${appPathList.privacy}/`, // "/en/privacy/" (正常)
  },
  maintenance: {
    ja: `${appPathList.privacy}/`,    // "/privacy/" (正常)
    en: `/en${appPathList.privacy}/`, // "/en/privacy/" (正常)
  },
  "external-transmission-policy": {
    ja: `${appPathList["external-transmission-policy"]}/`,     // "/external-transmission-policy/" (正常)
    en: `/en${appPathList["external-transmission-policy"]}/`,  // "/en/external-transmission-policy/" (正常)
  },
  login: {
    ja: `${appPathList.login}/`,      // "/login/" (正常)
    en: `/en${appPathList.login}/`,   // "/en/login/" (正常)
  },
};
```

**問題**: `home.ja` が `"//"` になっている

#### 2. `src/features/main/actions/refresh-images.ts`（エラー発生箇所）

```typescript
export async function refreshRandomCats(language: Language): Promise<void> {
  updateTag(CACHE_TAG_LGTM_IMAGES_RANDOM);

  const targetUrl =
    language === "ja"
      ? `${i18nUrlList.home.ja}?view=random`  // "//" + "?view=random" = "//?view=random"
      : `${i18nUrlList.home.en}?view=random`; // "/en/" + "?view=random" = "/en/?view=random"

  redirect(targetUrl); // ここでエラー発生
}

export async function showLatestCats(language: Language): Promise<void> {
  updateTag(CACHE_TAG_LGTM_IMAGES_LATEST);

  const targetUrl =
    language === "ja"
      ? `${i18nUrlList.home.ja}?view=latest`  // "//" + "?view=latest" = "//?view=latest"
      : `${i18nUrlList.home.en}?view=latest`; // "/en/" + "?view=latest" = "/en/?view=latest"

  redirect(targetUrl); // ここでエラー発生
}
```

**問題**: 日本語版で不正なURL `//?view=random` が生成される

#### 3. `i18nUrlList` の使用箇所

`i18nUrlList` は以下の箇所で使用されています：

1. **メタタグ（`src/app/layout.tsx`, `src/app/(default)/page.tsx`, `src/app/(default)/en/page.tsx`）**:
   ```typescript
   export const metadata: Metadata = {
     alternates: {
       canonical: i18nUrlList.home.ja,  // 現在は "//" が設定される
       languages: {
         ja: i18nUrlList.home.ja,       // 現在は "//" が設定される
         en: i18nUrlList.home.en,       // "/en/" (正常)
       },
     },
   };
   ```
   **問題**: canonicalやlanguagesに `"//"` が設定されてしまう

2. **`createI18nUrl` 関数（`src/features/url.ts`）**:
   ```typescript
   export function createI18nUrl(
     appPathName: AppPathName,
     language: Language
   ): Url {
     const baseUrl = appBaseUrl();
     return `${baseUrl}${i18nUrlList[appPathName][language]}` as Url;
   }
   ```
   **影響**: `https://example.com//` のような不正なURLが生成される（動作はするが不適切）

3. **Server Actions（`src/features/main/actions/refresh-images.ts`）**:
   - 上述の通り、エラーの直接的な原因

4. **テストファイル**:
   - 動的に `i18nUrlList` を参照しているため、修正すれば自動的に正しい値を期待するようになる

## 修正方針

### 根本原因の修正

`src/features/url.ts` の `i18nUrlList.home.ja` を `"/"` に変更する。

**理由**:
1. **問題の根本解決**: `"//"` → `"/"` にすることで、すべての使用箇所で正しいパスが生成される
2. **一貫性の保持**: 他のパス（`upload`, `terms` など）と同様のパターンに従う
3. **影響範囲の最小化**: `i18nUrlList` を使用しているすべての箇所で自動的に正しい値が使われる

### 修正後の動作

| 使用箇所 | 修正前 | 修正後 |
|---------|-------|-------|
| メタタグ canonical | `"//"` | `"/"` |
| メタタグ languages.ja | `"//"` | `"/"` |
| redirect (日本語/random) | `//?view=random` | `/?view=random` |
| redirect (日本語/latest) | `//?view=latest` | `/?view=latest` |
| createI18nUrl (日本語) | `https://example.com//` | `https://example.com/` |

## 実装手順

### ステップ1: `src/features/url.ts` の修正

**変更内容**:

```typescript
export const i18nUrlList: I18nUrlList = {
  home: {
    ja: "/",  // 修正: `${appPathList.home}/` から "/" に変更
    en: "/en/",
  },
  upload: {
    ja: `${appPathList.upload}/`,
    en: `/en${appPathList.upload}/`,
  },
  // ... 他は変更なし
};
```

**実装方法**:
- Serena MCP の `replace_symbol_body` または正規表現置換を使用
- 対象: `i18nUrlList` 定義内の `home.ja` の値のみ

**変更箇所**: `src/features/url.ts` の120行目

**変更前**:
```typescript
home: {
  ja: `${appPathList.home}/`,
  en: "/en/",
},
```

**変更後**:
```typescript
home: {
  ja: "/",
  en: "/en/",
},
```

## テスト計画

### 1. 既存テストの確認

以下のテストファイルは `i18nUrlList` を動的に参照しているため、修正後は自動的に正しい値を期待するようになる：

- `src/features/main/actions/__tests__/refresh-images/refresh-random-cats.test.ts`
- `src/features/main/actions/__tests__/refresh-images/show-latest-cats.test.ts`

**確認コマンド**:
```bash
npm run test -- refresh-images
```

**期待される動作**:
- `refreshRandomCats("ja")` → `redirect("/?view=random")` が呼ばれる
- `refreshRandomCats("en")` → `redirect("/en/?view=random")` が呼ばれる
- `showLatestCats("ja")` → `redirect("/?view=latest")` が呼ばれる
- `showLatestCats("en")` → `redirect("/en/?view=latest")` が呼ばれる

### 2. 全テストの実行

```bash
npm run test
```

**期待される結果**: すべてのテストがパスする

### 3. Linterとフォーマットの確認

```bash
npm run format
npm run lint
```

**期待される結果**: エラーなし

### 4. ローカル環境での動作確認

#### 4-1. 開発サーバーでの確認

```bash
npm run dev
```

**確認項目**:
1. `http://localhost:2222` にアクセス
2. 「ねこリフレッシュ」ボタンを押下
   - **期待**: `/?view=random` にリダイレクトされる
   - **確認**: コンソールにエラーが出ないこと
3. 「ねこ新着順」ボタンを押下
   - **期待**: `/?view=latest` にリダイレクトされる
   - **確認**: コンソールにエラーが出ないこと
4. 英語版（`/en/`）でも同様に確認
   - **期待**: `/en/?view=random`, `/en/?view=latest` にリダイレクトされる

#### 4-2. 本番ビルドでの確認

```bash
npm run build
npm run start
```

**確認項目**:
1. `http://localhost:2222` にアクセス
2. 開発サーバーと同じ確認項目を実施

### 5. Playwright MCPを使用したブラウザ自動テスト

#### 5-1. 日本語版の確認

```typescript
// 手順:
// 1. ブラウザを起動して http://localhost:2222 に移動
// 2. スナップショットを取得してボタンの存在を確認
// 3. 「ねこリフレッシュ」ボタンをクリック
// 4. URLが /?view=random になることを確認
// 5. コンソールエラーがないことを確認
// 6. 同様に「ねこ新着順」ボタンで /?view=latest を確認
```

#### 5-2. 英語版の確認

```typescript
// 手順:
// 1. ブラウザを起動して http://localhost:2222/en/ に移動
// 2. スナップショットを取得してボタンの存在を確認
// 3. 「Refresh Cats」ボタンをクリック
// 4. URLが /en/?view=random になることを確認
// 5. コンソールエラーがないことを確認
// 6. 同様に「Latest Cats」ボタンで /en/?view=latest を確認
```

### 6. メタタグの確認

**確認コマンド**:
```bash
curl -s http://localhost:2222 | grep -E 'canonical|hreflang'
```

**期待される出力**:
```html
<link rel="canonical" href="/" />
<link rel="alternate" hreflang="ja" href="/" />
<link rel="alternate" hreflang="en" href="/en/" />
```

**現在の不正な出力**:
```html
<link rel="canonical" href="//" />
<link rel="alternate" hreflang="ja" href="//" />
<link rel="alternate" hreflang="en" href="/en/" />
```

## リスク分析

### 影響範囲

以下のファイルが `i18nUrlList` を使用しているため、影響を受ける可能性があります：

1. **直接的な影響（修正により改善）**:
   - `src/features/main/actions/refresh-images.ts` - リダイレクトが正常動作
   - `src/app/layout.tsx` - メタタグが正しくなる
   - `src/app/(default)/page.tsx` - メタタグが正しくなる
   - `src/app/(default)/en/page.tsx` - メタタグが正しくなる

2. **間接的な影響（要確認）**:
   - `src/features/url.ts` の `createI18nUrl` 関数 - より正しいURLを生成

### 後方互換性

**問題なし**:
- `"//"` は不正なパスであり、これを使用している既存の正常な機能は存在しない
- `"/"` に修正することで、すべての使用箇所で正しい動作となる

### デグレードリスク

**極めて低い**:
- 修正は1箇所の文字列定数のみ
- 他のパス定義（`upload`, `terms` など）は変更しない
- テストケースが動的に `i18nUrlList` を参照しているため、修正内容が自動的に検証される

## Next.js 16 の仕様確認

### redirect() 関数の動作

Context7のドキュメントから確認した仕様：

```typescript
redirect(path: string, type?: 'replace' | 'push')
```

- **path**: 相対パス（例: `/login`）または絶対URL
- **動作**: Server ActionsやServer Componentsから呼び出し可能
- **HTTPステータス**: コンテキストに応じて303または307
- **エラー**: 不正なURLの場合は `TypeError: Invalid URL` をスロー

**重要**: `"//"` はプロトコル相対URLとして解釈されるため、`base: 'http://n'` のような不正なベースURLと組み合わせるとエラーとなる。

## 補足情報

### なぜローカルでは動作するのか？

ローカル環境では以下の理由により、エラーが発生してもフォールバック処理が動作している可能性があります：

1. **開発モードの寛容な処理**: Next.js 16の開発サーバーは、エラーが発生してもより寛容に処理する可能性がある
2. **Fast Refresh**: エラー後にFast Refreshが動作し、正常な状態に戻る可能性がある
3. **キャッシュの影響**: ブラウザキャッシュやNext.jsのキャッシュにより、エラーが隠蔽されている可能性がある

しかし、**サーバーログには確実にエラーが出力されている**ため、本番環境では致命的なエラーとなります。

### Vercel環境での厳密なエラー処理

Vercel環境では本番ビルドが使用されるため：

1. **最適化されたビルド**: 開発モードのようなフォールバック処理がない
2. **厳密なエラー処理**: 不正なURLは即座に500エラーとなる
3. **Edge Runtime**: Vercel Edgeで動作する場合、より厳密なURL検証が行われる

## 実装時の注意事項

### 必ず確認すべき事項

1. **修正箇所の確認**: `i18nUrlList.home.ja` のみを修正し、他の定義は変更しない
2. **テストの実行**: 修正後は必ず全テストを実行する
3. **ローカル確認**: 開発サーバーと本番ビルドの両方で動作確認する
4. **コンソールエラー**: サーバーログにエラーが出ていないことを確認する

### 禁止事項

1. **他の定義の変更**: `upload`, `terms` などの定義は変更しない
2. **テストコードの修正**: テストは動的に `i18nUrlList` を参照しているため、期待値をハードコードしない
3. **症状への対処**: `refresh-images.ts` でURLを直接構築するような対処療法は避ける

## まとめ

この問題は、`src/features/url.ts` の `i18nUrlList.home.ja` が `"//"` という不正なパスになっていることが根本原因です。

修正は極めてシンプルで、`i18nUrlList.home.ja` を `"/"` に変更するだけです。この修正により：

1. ✅ リダイレクト機能が正常動作する
2. ✅ メタタグが正しく設定される
3. ✅ SEO的にも正しいURLが生成される
4. ✅ すべてのテストが自動的に正しい値を期待するようになる

**推奨実装時間**: 5分（修正とテスト実行のみ）
**推奨テスト時間**: 15分（全テスト、ローカル確認、Playwright確認）
