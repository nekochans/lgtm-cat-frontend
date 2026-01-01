# Issue #393: Metadataに設定しているlocaleの設定をOpen Graph locale形式に変更する - 実装計画

## 概要

Next.jsのMetadataにおける `openGraph.locale` の値がOpen Graph locale形式 (例: "ja_JP", "en_US") ではなく、言語コード (例: "ja", "en") になっている問題を修正する。

> **用語の注意**: BCP 47の標準表記はハイフン区切り (例: `ja-JP`, `en-US`) ですが、Open Graphの `og:locale` プロパティでは慣習的にアンダースコア区切り (例: `ja_JP`, `en_US`) を使用します。本ドキュメントでは、この形式を「Open Graph locale形式」と呼びます。

## 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/393

## Done の定義

- [ ] `locale` に設定する値がOpen Graph locale形式のロケール文字列 (例: "ja_JP", "en_US") に変更されている事

---

## 変更対象サマリー

- **open-graph-locale.ts**: 1ファイル (locale.ts からリネーム + 型定義変更 + 関数変更)
- **テストファイル**: 1ファイル (新規作成)
- **ページファイル**: 13ファイル (インポートパスと関数呼び出し変更)
- **合計**: 15ファイル

---

## 命名規則の変更

このファイルは Open Graph locale 専用となるため、以下のように命名を変更します：

| 現在 | 変更後 | 理由 |
|------|--------|------|
| ファイル名: `locale.ts` | `open-graph-locale.ts` | ファイルの責務を明確化 |
| 定数: `locales` | `openGraphLocales` | Open Graph専用であることを明示 |
| 型: `Locale` | `OpenGraphLocale` | ルーティング用localeとの混同を防止 |
| 関数: `convertLocaleToLanguage` | `convertLanguageToOpenGraphLocale` | 変換方向と用途を明確化 |

---

## 現在の問題

### 問題の詳細

1. `openGraph.locale` はOpen Graph locale形式のロケール文字列 (例: "ja_JP", "en_US") を期待している
2. 現在の `convertLocaleToLanguage` 関数は `Language` 型 ("ja" | "en") を返している
3. 関数名と実際の動作が一致していない (Locale を Language に変換するという名前だが、実質的に同じ型を返すだけ)
4. ファイル名やType名が曖昧で、Open Graph専用であることが分かりにくい

### 現在のコード構造

```typescript
// src/features/locale.ts (現在)
const locales = languages; // ["en", "ja"]
export type Locale = (typeof locales)[number]; // "en" | "ja"

export function convertLocaleToLanguage(locale: unknown): Language {
  if (isLocale(locale)) {
    return locale; // "ja" または "en" を返す
  }
  return "ja";
}
```

---

## 対象ファイル一覧

### 1. locale.ts → open-graph-locale.ts (リネーム + 型定義変更 + 関数変更)

| 変更前 | 変更後 | 変更内容 |
|--------|--------|---------|
| `src/features/locale.ts` | `src/features/open-graph-locale.ts` | ファイルリネーム、`OpenGraphLocale` 型に変更、`convertLanguageToOpenGraphLocale` 関数を新規追加、不要なコードを削除 |

### 2. テストファイル (新規作成)

| ファイルパス | 変更内容 |
|-------------|---------|
| `src/features/__tests__/open-graph-locale/convert-language-to-open-graph-locale.test.ts` | `convertLanguageToOpenGraphLocale` 関数のテストを新規作成 |

### 3. ページファイル (インポートパスと関数呼び出し変更)

| ファイルパス | 変更行 | 変更内容 |
|-------------|--------|---------|
| `src/app/layout.tsx` | 6, 33行目 | import文とlocale値の変更 |
| `src/app/(default)/page.tsx` | 4, 27行目 | import文とlocale値の変更 |
| `src/app/(default)/en/page.tsx` | 4, 27行目 | import文とlocale値の変更 |
| `src/app/(default)/upload/page.tsx` | 3, 26行目 | import文とlocale値の変更 |
| `src/app/(default)/en/upload/page.tsx` | 3, 26行目 | import文とlocale値の変更 |
| `src/app/(default)/privacy/page.tsx` | 4, 29行目 | import文とlocale値の変更 |
| `src/app/(default)/en/privacy/page.tsx` | 4, 29行目 | import文とlocale値の変更 |
| `src/app/(default)/terms/page.tsx` | 4, 29行目 | import文とlocale値の変更 |
| `src/app/(default)/en/terms/page.tsx` | 4, 29行目 | import文とlocale値の変更 |
| `src/app/(default)/external-transmission-policy/page.tsx` | 5, 29行目 | import文とlocale値の変更 |
| `src/app/(default)/en/external-transmission-policy/page.tsx` | 5, 29行目 | import文とlocale値の変更 |
| `src/app/(default)/maintenance/page.tsx` | 5, 25行目 | import文とlocale値の変更 |
| `src/app/(default)/en/maintenance/page.tsx` | 5, 25行目 | import文とlocale値の変更 |

---

## 実装詳細

### 1. src/features/locale.ts → src/features/open-graph-locale.ts

#### 1.1 現在のコード (全体)

```typescript
// src/features/locale.ts
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { type Language, languages } from "./language";

const locales = languages;

export type Locale = (typeof locales)[number];

function isLocale(value: unknown): value is Locale {
  if (typeof value !== "string") {
    return false;
  }

  return locales.includes(value as Locale);
}

export function convertLocaleToLanguage(locale: unknown): Language {
  if (isLocale(locale)) {
    return locale;
  }

  return "ja";
}
```

#### 1.2 修正後のコード (全体)

```typescript
// src/features/open-graph-locale.ts
// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Language } from "./language";

/**
 * Open Graph locale形式のロケール文字列
 *
 * 注意: BCP 47の標準表記はハイフン区切り (ja-JP, en-US) ですが、
 * Open Graphの og:locale プロパティでは慣習的にアンダースコア区切りを使用します。
 */
// 注意: 日本語サイトのため日本語を先頭に配置
const openGraphLocales = ["ja_JP", "en_US"] as const;

export type OpenGraphLocale = (typeof openGraphLocales)[number];

/**
 * Language から OpenGraphLocale への変換マップ
 *
 * 重要: Record<Language, OpenGraphLocale> 形式を維持することで、
 * 将来 Language が増えた場合に TypeScript が網羅性チェックを行い、
 * マップへの追加漏れをコンパイル時に検出できます。
 */
const languageToOpenGraphLocaleMap: Record<Language, OpenGraphLocale> = {
  ja: "ja_JP",
  en: "en_US",
};

export function convertLanguageToOpenGraphLocale(
  language: Language,
): OpenGraphLocale {
  return languageToOpenGraphLocaleMap[language];
}
```

#### 1.3 変更点の説明

1. **ファイル名の変更**: `locale.ts` → `open-graph-locale.ts`
2. **openGraphLocales 定数**: `languages` への参照を削除し、Open Graph locale形式の `["ja_JP", "en_US"]` を直接定義 (日本語サイトのため日本語を先頭に配置)
3. **型名と値の変更**: `Locale` 型 (`"en" | "ja"`) を `OpenGraphLocale` 型 (`"ja_JP" | "en_US"`) にリネームし、値もOpen Graph locale形式に変更
4. **languageToOpenGraphLocaleMap**: Language から OpenGraphLocale へのマッピングを定義 (`Record<Language, OpenGraphLocale>` 形式で網羅性を保証)
5. **convertLanguageToOpenGraphLocale 関数**: Language を受け取り、対応する OpenGraphLocale を返す
6. **不要なコードの削除**:
   - `isLocale` 関数 (外部から使用されていない)
   - `convertLocaleToLanguage` 関数 (Issue の要件により削除)
   - `languages` 変数のインポート (Language 型のみをインポートするように変更)
7. **コメントの追加**: 用語の違い (BCP 47 vs Open Graph locale形式) を明確に注釈

---

### 2. テストファイルの新規作成

#### 2.1 ディレクトリ作成

`src/features/__tests__/open-graph-locale/` ディレクトリを新規作成する。

#### 2.2 src/features/__tests__/open-graph-locale/convert-language-to-open-graph-locale.test.ts

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { describe, expect, it } from "vitest";
import {
  type OpenGraphLocale,
  convertLanguageToOpenGraphLocale,
} from "@/features/open-graph-locale";
import type { Language } from "@/features/language";

describe("src/features/open-graph-locale.ts convertLanguageToOpenGraphLocale TestCases", () => {
  type TestTable = {
    language: Language;
    expected: OpenGraphLocale;
  };

  it.each`
    language | expected
    ${"ja"}  | ${"ja_JP"}
    ${"en"}  | ${"en_US"}
  `(
    "should return OpenGraphLocale. language: $language",
    ({ language, expected }: TestTable) => {
      expect(convertLanguageToOpenGraphLocale(language)).toStrictEqual(
        expected,
      );
    },
  );
});
```

---

### 3. ページファイルの修正 (全13ファイル)

全てのファイルで同じパターンの変更を行う。

#### 3.1 変更パターン

**import文の変更:**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**locale値の変更:**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.2 src/app/layout.tsx の修正

**6行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**33行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.3 src/app/(default)/page.tsx の修正

**4行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**27行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.4 src/app/(default)/en/page.tsx の修正

**4行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**27行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.5 src/app/(default)/upload/page.tsx の修正

**3行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**26行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.6 src/app/(default)/en/upload/page.tsx の修正

**3行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**26行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.7 src/app/(default)/privacy/page.tsx の修正

**4行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**29行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.8 src/app/(default)/en/privacy/page.tsx の修正

**4行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**29行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.9 src/app/(default)/terms/page.tsx の修正

**4行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**29行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.10 src/app/(default)/en/terms/page.tsx の修正

**4行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**29行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.11 src/app/(default)/external-transmission-policy/page.tsx の修正

**5行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**29行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.12 src/app/(default)/en/external-transmission-policy/page.tsx の修正

**5行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**29行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.13 src/app/(default)/maintenance/page.tsx の修正

**5行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**25行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

#### 3.14 src/app/(default)/en/maintenance/page.tsx の修正

**5行目 (import文):**

```typescript
// 変更前
import { convertLocaleToLanguage } from "@/features/locale";

// 変更後
import { convertLanguageToOpenGraphLocale } from "@/features/open-graph-locale";
```

**25行目 (locale値):**

```typescript
// 変更前
locale: convertLocaleToLanguage(language),

// 変更後
locale: convertLanguageToOpenGraphLocale(language),
```

---

## 推奨される実装順序

**重要**: locale.ts のリネームと修正を先に行わないと、他のファイルでの import エラーが発生するため、必ず順序を守ること。

### Step 1: locale.ts のリネームと修正 (必須: 最初に実行)

1. `src/features/locale.ts` を `src/features/open-graph-locale.ts` にリネームする
2. ファイル内容を修正する (型定義と関数を変更)
3. この時点でビルドエラーが発生するが、Step 3で解消される

### Step 2: テストファイルの作成

1. `src/features/__tests__/open-graph-locale/` ディレクトリを作成
2. `convert-language-to-open-graph-locale.test.ts` を作成

### Step 3: ページファイルの修正 (並列実行可能)

以下の13ファイルは順不同で修正可能:

**ルートレイアウト (1ファイル):**
- `src/app/layout.tsx`

**日本語ページ (6ファイル):**
- `src/app/(default)/page.tsx`
- `src/app/(default)/upload/page.tsx`
- `src/app/(default)/privacy/page.tsx`
- `src/app/(default)/terms/page.tsx`
- `src/app/(default)/external-transmission-policy/page.tsx`
- `src/app/(default)/maintenance/page.tsx`

**英語ページ (6ファイル):**
- `src/app/(default)/en/page.tsx`
- `src/app/(default)/en/upload/page.tsx`
- `src/app/(default)/en/privacy/page.tsx`
- `src/app/(default)/en/terms/page.tsx`
- `src/app/(default)/en/external-transmission-policy/page.tsx`
- `src/app/(default)/en/maintenance/page.tsx`

### 効率的な一括置換

IDE の一括置換機能を使う場合:

**Step 1: インポートパスの置換**
- 検索: `from "@/features/locale"`
- 置換: `from "@/features/open-graph-locale"`

**Step 2: 関数名の置換**
- 検索: `convertLocaleToLanguage`
- 置換: `convertLanguageToOpenGraphLocale`

---

## 品質管理手順

実装完了後、以下の手順で品質管理を実施する。

### 1. コードフォーマット

```bash
npm run format
```

全てのファイルがフォーマットされることを確認する。

### 2. Lintチェック

```bash
npm run lint
```

エラーや警告が出ないことを確認する。

### 3. テスト実行

```bash
npm run test
```

全てのテストがパスすることを確認する。特に新規作成した `convert-language-to-open-graph-locale.test.ts` がパスすることを確認する。

### 4. 開発サーバーでの表示確認

Chrome DevTools MCPを使用して `http://localhost:2222` にアクセスし、以下を確認する:

**確認項目:**

- [ ] トップページ (`/`) が正常に表示されること
- [ ] 英語版トップページ (`/en`) が正常に表示されること
- [ ] アップロードページ (`/upload`) が正常に表示されること
- [ ] 英語版アップロードページ (`/en/upload`) が正常に表示されること
- [ ] プライバシーポリシーページ (`/privacy`) が正常に表示されること
- [ ] 英語版プライバシーポリシーページ (`/en/privacy`) が正常に表示されること
- [ ] 利用規約ページ (`/terms`) が正常に表示されること
- [ ] 英語版利用規約ページ (`/en/terms`) が正常に表示されること
- [ ] 外部送信ポリシーページ (`/external-transmission-policy`) が正常に表示されること
- [ ] 英語版外部送信ポリシーページ (`/en/external-transmission-policy`) が正常に表示されること
- [ ] メンテナンスページ (`/maintenance`) が正常に表示されること
- [ ] 英語版メンテナンスページ (`/en/maintenance`) が正常に表示されること

**OGPメタタグの確認 (DevToolsのElementsパネルで確認):**

確認手順:
1. Chrome DevToolsでページを開く
2. DevToolsの「Elements」パネルを開く
3. `<head>` タグ内を確認する
4. `<meta property="og:locale" content="...">` を探す

- [ ] 日本語ページ (`/`, `/upload`, `/privacy`, `/terms`, `/external-transmission-policy`, `/maintenance`) で `<meta property="og:locale" content="ja_JP">` が出力されていること
- [ ] 英語ページ (`/en`, `/en/upload`, `/en/privacy`, `/en/terms`, `/en/external-transmission-policy`, `/en/maintenance`) で `<meta property="og:locale" content="en_US">` が出力されていること

### 5. Storybookでの表示確認

Chrome DevTools MCPを使用して `http://localhost:6006/` にアクセスし、以下を確認する:

**確認項目:**

- [ ] 既存のStorybookコンポーネントが正常に表示されること (今回の変更はページファイルのみなので、Storybookへの影響はないはず)

---

## 注意事項

1. **Open Graph locale形式について**: Open Graphの `locale` プロパティは、アンダースコア区切りのロケール文字列を期待しています。日本語は `ja_JP`、英語 (米国) は `en_US` を使用します。これはBCP 47の標準表記 (`ja-JP`, `en-US`) とは異なりますのでご注意ください。

2. **型安全性**: `convertLanguageToOpenGraphLocale` 関数は `Language` 型を引数に取るため、型安全です。不正な値が渡される心配はありません。

3. **languageToOpenGraphLocaleMap の網羅性保証**: `Record<Language, OpenGraphLocale>` 形式を使用しているため、将来 `Language` 型に新しい言語が追加された場合、TypeScriptがマップへの追加漏れをコンパイル時に検出します。この形式は必ず維持してください。

4. **既存のページ動作への影響**: この変更はOGPメタタグの `locale` 値のみを変更するため、ページの表示や動作には影響しません。

5. **import文の順序**: `npm run format` 実行後、import文の順序が自動調整される場合があります。本ドキュメントのコードサンプルはあくまで参考であり、最終的な順序はフォーマッタの出力に従ってください。

6. **ファイル先頭コメント**: 新規作成するテストファイルには `// 絶対厳守：編集前に必ずAI実装ルールを読む` を必ず追加してください。

7. **convertLocaleToLanguage の削除**: Issue の要件に従い、`convertLocaleToLanguage` 関数は削除します。この関数は外部から参照されていないため、削除しても問題ありません。

8. **isLocale の削除**: `isLocale` 関数も外部から参照されていないため、削除しても問題ありません。

9. **languages のインポート削除**: 既存の `languages` 定義が locale のソースとして使われなくなりますが、`languages` 自体は `language.ts` に残り、他の箇所で使用されているため影響はありません。

10. **ファイル名の変更について**: `locale.ts` → `open-graph-locale.ts` へのリネームにより、このファイルがOpen Graph専用であることが明確になります。将来、別の用途でlocale機能が必要になった場合も衝突しません。

---

## 実装後の確認チェックリスト

- [ ] `npm run format` が正常終了すること
- [ ] `npm run lint` でエラーが出ないこと
- [ ] `npm run test` で全てのテストがパスすること
- [ ] `http://localhost:2222` で以下の全ページが正常に表示されること:
  - [ ] `/` (トップページ)
  - [ ] `/en` (英語版トップページ)
  - [ ] `/upload` (アップロードページ)
  - [ ] `/en/upload` (英語版アップロードページ)
  - [ ] `/privacy` (プライバシーポリシー)
  - [ ] `/en/privacy` (英語版プライバシーポリシー)
  - [ ] `/terms` (利用規約)
  - [ ] `/en/terms` (英語版利用規約)
  - [ ] `/external-transmission-policy` (外部送信ポリシー)
  - [ ] `/en/external-transmission-policy` (英語版外部送信ポリシー)
  - [ ] `/maintenance` (メンテナンス)
  - [ ] `/en/maintenance` (英語版メンテナンス)
- [ ] 日本語ページのOGP localeが `ja_JP` になっていること (DevToolsで確認)
- [ ] 英語ページのOGP localeが `en_US` になっていること (DevToolsで確認)
- [ ] `http://localhost:6006/` でStorybookが正常に動作すること

---

## 技術的補足

### BCP 47とOpen Graph locale形式の違い

| 規格 | 形式 | 例 |
|------|------|-----|
| BCP 47 (標準) | ハイフン区切り | `ja-JP`, `en-US`, `en-GB` |
| Open Graph locale | アンダースコア区切り | `ja_JP`, `en_US`, `en_GB` |

BCP 47 (Best Current Practice 47) は、言語タグの標準規格です。形式は `language-region` で、例えば:

- `ja-JP`: 日本語 (日本)
- `en-US`: 英語 (アメリカ)
- `en-GB`: 英語 (イギリス)

Open Graphの `og:locale` プロパティでは、ハイフンの代わりにアンダースコアを使用する慣習があります (例: `ja_JP`, `en_US`)。

本プロジェクトでは Open Graph 用途のため、アンダースコア区切りを使用しています。

### 変更の影響範囲

この変更により、SNSでページを共有した際に正しいロケール情報が伝達されるようになります。これにより:

- Facebookなどのプラットフォームでページの言語が正しく認識される
- 適切な言語でのプレビュー表示が期待できる

### 将来の影響範囲確認手順

今後 `metadata` を生成する他のファイルが追加された場合に備え、以下の検索手順で `openGraph.locale` の参照箇所を確認できます:

```bash
# プロジェクト内で openGraph.locale を使用している箇所を検索
grep -r "openGraph" --include="*.ts" --include="*.tsx" src/app/

# または、locale の変換関数を使用している箇所を検索
grep -r "convertLanguageToOpenGraphLocale" --include="*.ts" --include="*.tsx" src/
```

新しいページを追加した際は、上記コマンドで既存ページと同じパターンで `locale` が設定されているか確認してください。

---

## トラブルシューティング

### 1. ビルドエラー: `convertLocaleToLanguage` が見つからない

**原因**: locale.ts をリネーム・修正後、ページファイルのimport文がまだ古いパスと関数名を参照している。

**対処法**: 全てのページファイルで以下を変更する:
1. インポートパス: `@/features/locale` → `@/features/open-graph-locale`
2. 関数名: `convertLocaleToLanguage` → `convertLanguageToOpenGraphLocale`

一括置換機能を使用するのが効率的。

### 2. テストファイルのimportエラー

**原因**: `src/features/__tests__/open-graph-locale/` ディレクトリが存在しない。

**対処法**: テストファイル作成前に `mkdir -p src/features/__tests__/open-graph-locale` でディレクトリを作成する。

### 3. OGP localeが変わっていない

**原因**: ブラウザキャッシュが効いている可能性がある。

**対処法**:
1. ブラウザのキャッシュをクリアする
2. DevToolsの「Network」タブで「Disable cache」をチェックする
3. ページをハードリロード (Ctrl+Shift+R または Cmd+Shift+R) する

### 4. Lintエラー: import文の順序

**原因**: 手動でimport文を追加した場合、アルファベット順になっていない可能性がある。

**対処法**: `npm run format` を実行すると自動的に修正される。

### 5. TypeScriptエラー: languageToOpenGraphLocaleMap に追加漏れ

**原因**: `Language` 型に新しい言語が追加されたが、`languageToOpenGraphLocaleMap` に対応するエントリが追加されていない。

**対処法**: `languageToOpenGraphLocaleMap` に新しい言語のマッピングを追加する。`Record<Language, OpenGraphLocale>` 形式のおかげで、TypeScriptがコンパイル時にこのエラーを検出します。

### 6. ファイルが見つからないエラー

**原因**: `locale.ts` のリネームが完了していない、または Git の追跡が更新されていない。

**対処法**:
1. `git mv src/features/locale.ts src/features/open-graph-locale.ts` でリネームする
2. または、新しいファイルを作成して古いファイルを削除する
