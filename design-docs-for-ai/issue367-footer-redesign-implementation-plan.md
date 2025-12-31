# Issue #367: Footer改修 - 詳細実装計画書

## 概要

### 目的

Footer の改修を行い、デスクトップビューでもポリシーリンクを表示する。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/367

### 技術スタック

- **スタイリング**: Tailwind CSS 4
- **フレームワーク**: Next.js 16 App Router
- **React**: v19

**注**: 今回の修正ではTailwind CSSのみを使用し、HeroUIコンポーネントは使用しない。

---

## ファイル構成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/components/footer.tsx` | デスクトップビューでもポリシーリンクを表示 |

### 変更なしファイル (確認のみ)

| ファイルパス | 理由 |
|-------------|------|
| `src/components/footer.test.tsx` | 既存テストはリンクテキストの存在確認のため、レイアウト変更の影響なし |
| `src/components/footer.stories.tsx` | Props変更なしのため、ストーリー修正不要 |

---

## 実装詳細

### Footer の改修

**ファイルパス**: `src/components/footer.tsx`

#### 変更概要

1. **デスクトップビューでもポリシーリンクを表示**
   - `md:hidden` クラスを削除し、全画面サイズで表示

2. **レイアウトをデスクトップ向けに調整**
   - `max-w-[375px]` を `max-w-screen-2xl` に変更
   - 外側divに `justify-center` を追加 (中央寄せ)
   - 内側divの `flex-1 flex-col` を `flex-wrap` に変更
   - セパレーター (`/`) をリンク間に追加

3. **デザイントークンの使用**
   - `text-[#43281E]` を `text-orange-900` に変更 (Tailwind CSS 4のデザイントークン使用)

4. **アクセシビリティ対応**
   - セパレーター (`/`) に `aria-hidden="true"` を追加 (装飾的要素のため)

#### 修正後のコード

```tsx
// 絶対厳守：編集前に必ずAI実装ルールを読む
import Link from "next/link";
import type { JSX } from "react";
import { createExternalTransmissionPolicyLinksFromLanguages } from "@/features/external-transmission-policy/functions/external-transmission-policy";
import type { Language } from "@/features/language";
import { createPrivacyPolicyLinksFromLanguages } from "@/features/privacy/functions/privacy-policy";
import { createTermsOfUseLinksFromLanguages } from "@/features/terms/functions/terms-of-use";

export type Props = {
  language: Language;
};

const linkStyle =
  "font-inter text-sm font-normal leading-5 text-orange-900 hover:underline";

export function Footer({ language }: Props): JSX.Element {
  const terms = createTermsOfUseLinksFromLanguages(language);

  const privacy = createPrivacyPolicyLinksFromLanguages(language);

  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);

  return (
    <footer className="flex w-full flex-col">
      {/* ポリシーリンク部分: md:hidden を削除してデスクトップでも表示 */}
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-center px-0 py-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link className={linkStyle} href={terms.link} prefetch={false}>
            <p data-gtm-click="footer-terms-link">{terms.text}</p>
          </Link>
          <span aria-hidden="true" className="font-inter text-sm text-orange-900">/</span>
          <Link className={linkStyle} href={privacy.link} prefetch={false}>
            <p data-gtm-click="footer-privacy-link">{privacy.text}</p>
          </Link>
          <span aria-hidden="true" className="font-inter text-sm text-orange-900">/</span>
          <Link
            className={linkStyle}
            href={externalTransmissionPolicy.link}
            prefetch={false}
          >
            <p data-gtm-click="footer-external-transmission-policy-link">
              {externalTransmissionPolicy.text}
            </p>
          </Link>
        </div>
      </div>
      <div className="flex h-[60px] items-center justify-center self-stretch border-orange-200 border-t bg-orange-50">
        <p className="font-inter font-medium text-base text-orange-800">
          Copyright (c) nekochans
        </p>
      </div>
    </footer>
  );
}
```

#### 変更差分

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| ポリシーリンク表示 | `md:hidden` (モバイルのみ) | 常時表示 |
| 最大幅 | `max-w-[375px]` | `max-w-screen-2xl` |
| 外側div配置 | `items-center` のみ | `items-center justify-center` |
| 内側divレイアウト | `flex-1 flex-col` (縦並び) | `flex-wrap` (横並び・折り返し可) |
| セパレーター | なし | `/` を追加 (`aria-hidden="true"`, `font-inter` 付き) |
| リンク色 | `text-[#43281E]` | `text-orange-900` |

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: コンポーネントの修正

1. `src/components/footer.tsx` - デスクトップ対応

### Phase 2: 品質管理

2. `npm run format` を実行
3. `npm run lint` を実行
4. `npm run test` を実行
5. Chrome DevTools MCP での表示確認
6. Storybook での表示確認

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

#### Footer ポリシーリンクの確認 (日本語: `/` 、英語: `/en`)

- [ ] デスクトップビュー (768px以上) でポリシーリンクが表示される
- [ ] モバイルビュー (768px未満) でもポリシーリンクが表示される
- [ ] ポリシーリンクが横並びでセパレーター (`/`) で区切られている
- [ ] 画面幅が狭い場合、`flex-wrap` により適切に折り返される
- [ ] 英語版 (`/en`) でリンクテキストが長くても適切に折り返される
- [ ] リンク色が `text-orange-900` (茶色系) で表示される
- [ ] リンクホバー時にアンダーラインが表示される

#### Footer Copyright部分の確認

- [ ] Copyright部分のレイアウトが崩れていない
- [ ] 背景色 `bg-orange-50` が正しく表示される
- [ ] 上部ボーダー `border-t border-orange-200` が正しく表示される

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

- [ ] `Footer` > `ShowJapanese` ストーリーが正常に表示される
- [ ] `Footer` > `ShowEnglish` ストーリーが正常に表示される
- [ ] 両ストーリーでポリシーリンクとセパレーターが正しく表示される

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいパッケージのインストール禁止**
3. **ビジネスロジックの変更禁止** - UI変更のみに集中
4. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 成功基準

以下を全て満たすこと:

### Footer

- [ ] デスクトップビューでもポリシーリンクが表示される
- [ ] リンクが `flex-wrap` で横並びに配置される
- [ ] リンク間にセパレーター (`/`) が表示される
- [ ] セパレーターに `aria-hidden="true"` が設定される
- [ ] リンク色が `text-orange-900` で統一される
- [ ] Copyright部分に影響がない

### CI/テスト

- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

---

**作成日**: 2025-12-31
**対象Issue**: #367
**担当**: AI実装者
