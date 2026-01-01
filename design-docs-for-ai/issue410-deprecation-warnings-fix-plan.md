# Issue #410: 依存パッケージ更新後の非推奨警告修正 - 詳細実装計画書

## 目次

1. [クイックリファレンス](#クイックリファレンス)
2. [概要](#概要)
3. [調査結果](#調査結果)
4. [ファイル構成](#ファイル構成)
5. [変更内容詳細](#変更内容詳細) - **実装はここから**
6. [実装順序](#実装順序)
7. [品質管理手順](#品質管理手順)
8. [動作確認手順](#動作確認手順)
9. [トラブルシューティング](#トラブルシューティング)
10. [禁止事項](#禁止事項)
11. [成功基準](#成功基準)
12. [最終チェックリスト](#最終チェックリスト)

---

## クイックリファレンス

### 警告1: Sentry disableLogger

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| オプション名 | `disableLogger: true` | `webpack: { treeshake: { removeDebugLogging: true } }` |
| ファイル | `next.config.ts` | `next.config.ts` |
| 行番号 | 32行目 | - |

### 警告2: Sentry automaticVercelMonitors

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| オプション名 | `automaticVercelMonitors: true` | `webpack: { automaticVercelMonitors: true }` |
| ファイル | `next.config.ts` | `next.config.ts` |
| 行番号 | 33行目 | - |

### 警告3: Next.js Image objectPosition

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| プロパティ | `objectPosition="center top"` | `style={{ objectPosition: "center top" }}` |
| ファイル | `src/features/main/components/lgtm-image.tsx` | 同ファイル |
| 行番号 | 118行目 | - |

**変更の本質**: 依存パッケージ更新後に発生した非推奨警告を解消し、将来の互換性を確保する

---

## 概要

### 目的

依存パッケージを最新安定版に更新した後に発生した以下の非推奨警告を修正する:

1. **Sentry警告** (2つ): `disableLogger` と `automaticVercelMonitors` オプションの移行
2. **Next.js Image警告** (1つ): `objectPosition` プロパティの移行

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/410

### 技術スタック

- **フレームワーク**: Next.js 16.1.1 App Router
- **React**: v19.2.3
- **Sentry SDK**: @sentry/nextjs v10.32.1
- **スタイリング**: Tailwind CSS 4

### 警告の詳細

#### 警告1: Sentry disableLogger

```
[@sentry/nextjs] DEPRECATION WARNING: disableLogger is deprecated and will be removed in a future version. Use webpack.treeshake.removeDebugLogging instead.
```

#### 警告2: Sentry automaticVercelMonitors

```
[@sentry/nextjs] DEPRECATION WARNING: automaticVercelMonitors is deprecated and will be removed in a future version. Use webpack.automaticVercelMonitors instead.
```

#### 警告3: Next.js Image objectPosition

```
Image with src "..." has legacy prop "objectPosition". Did you forget to run the codemod?
Read more: https://nextjs.org/docs/messages/next-image-upgrade-to-13
```

---

## 調査結果

### 外部ドキュメント調査

以下の公式ドキュメントを調査し、正確な修正方法を確認しました。

#### Sentry SDK

- [Sentry v9 to v10 Migration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v9-to-v10/)
- [Sentry Build Options](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/)

#### Next.js Image

- [Next.js Image Component API](https://github.com/vercel/next.js/blob/v16.1.0/docs/01-app/03-api-reference/02-components/image.mdx)
- [Next.js Codemods](https://github.com/vercel/next.js/blob/v16.1.0/docs/01-app/02-guides/upgrading/codemods.mdx)
- [Next.js Image Legacy Comparison](https://github.com/vercel/next.js/blob/v16.1.0/docs/02-pages/04-api-reference/01-components/image-legacy.mdx)

### 警告メッセージからの確認

ビルド実行 (`npm run build`) およびブラウザコンソールから、警告メッセージの正確な内容と修正方法を確認しました。

---

## ファイル構成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `next.config.ts` | Sentry設定オプションを新しい形式に移行 |
| `src/features/main/components/lgtm-image.tsx` | `objectPosition` プロパティを `style` プロパティに移行 |

### 変更不要のファイル

| ファイルパス | 理由 |
|-------------|------|
| `sentry.server.config.ts` | Sentry init オプションには変更なし |
| `sentry.edge.config.ts` | Sentry init オプションには変更なし |
| `src/features/main/components/lgtm-image.stories.tsx` | Storybook は変更不要 (表示確認のみ) |

---

## 変更内容詳細

> **実装者への注意**
>
> 以下の2ファイルを修正してください。
> 各ファイル先頭のコメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` は変更しないこと。

### Step 1: next.config.ts の修正

**ファイルパス**: `next.config.ts`

#### 現在のコード (26-35行目)

```typescript
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
```

#### 変更後のコード

```typescript
const sentryWebpackPluginOptions = {
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  sendDefaultPii: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
};
```

#### diff形式

```diff
 const sentryWebpackPluginOptions = {
   silent: !process.env.CI,
   authToken: process.env.SENTRY_AUTH_TOKEN,
   org: process.env.SENTRY_ORG,
   project: process.env.SENTRY_PROJECT,
   widenClientFileUpload: true,
-  disableLogger: true,
-  automaticVercelMonitors: true,
   sendDefaultPii: true,
+  webpack: {
+    treeshake: {
+      removeDebugLogging: true,
+    },
+    automaticVercelMonitors: true,
+  },
 };
```

#### 変更ポイントの詳細

| 変更前 | 変更後 | 理由 |
|--------|--------|------|
| `disableLogger: true` | `webpack: { treeshake: { removeDebugLogging: true } }` | Sentry SDK v10 で非推奨になったため |
| `automaticVercelMonitors: true` | `webpack: { automaticVercelMonitors: true }` | Sentry SDK v10 で非推奨になったため |

### Step 2: lgtm-image.tsx の修正

**ファイルパス**: `src/features/main/components/lgtm-image.tsx`

#### 現在のコード (114-122行目)

```tsx
<Image
  alt="LGTM image"
  className="object-contain"
  fill
  objectPosition="center top"
  priority={false}
  sizes="(max-width: 768px) 100vw, 390px"
  src={imageUrl}
/>
```

#### 変更後のコード

```tsx
<Image
  alt="LGTM image"
  className="object-contain"
  fill
  priority={false}
  sizes="(max-width: 768px) 100vw, 390px"
  src={imageUrl}
  style={{ objectPosition: "center top" }}
/>
```

#### diff形式

```diff
 <Image
   alt="LGTM image"
   className="object-contain"
   fill
-  objectPosition="center top"
   priority={false}
   sizes="(max-width: 768px) 100vw, 390px"
   src={imageUrl}
+  style={{ objectPosition: "center top" }}
 />
```

#### 変更ポイントの詳細

| 変更前 | 変更後 | 理由 |
|--------|--------|------|
| `objectPosition="center top"` | `style={{ objectPosition: "center top" }}` | Next.js 13以降で `objectPosition` プロパティが非推奨になり、CSS の `style` プロパティを使用する形式に移行したため |

---

## 実装順序

以下の順序で実装を進めること:

### Step 1: next.config.ts の修正

1. `next.config.ts` を開く
2. `disableLogger: true,` の行を削除
3. `automaticVercelMonitors: true,` の行を削除
4. `sendDefaultPii: true,` の後に `webpack` オブジェクトを追加

### Step 2: lgtm-image.tsx の修正

5. `src/features/main/components/lgtm-image.tsx` を開く
6. `objectPosition="center top"` の行を削除
7. `src={imageUrl}` の後に `style={{ objectPosition: "center top" }}` を追加

### Step 3: 品質管理

8. `npm run format` を実行
9. `npm run lint` を実行
10. `npm run test` を実行

### Step 4: 動作確認

11. `npm run build` を実行してSentry警告が消えていることを確認
12. 日本語版ページ (`http://localhost:2222`) でobjectPosition警告が消えていることを確認 (Chrome DevTools MCP)
13. 英語版ページ (`http://localhost:2222/en`) でobjectPosition警告が消えていることを確認 (Chrome DevTools MCP)
14. Storybook (`http://localhost:6006/`) でLgtmImageストーリーが正常に表示されることを確認 (Chrome DevTools MCP)

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

---

## 動作確認手順

### 1. ビルド時の警告確認

```bash
npm run build 2>&1 | grep -E "DEPRECATION|WARNING|legacy prop"
```

**期待される結果**: 出力がないこと (警告が解消されていること)

完全なビルドログも確認:

```bash
npm run build
```

**確認項目**:
- `[@sentry/nextjs] DEPRECATION WARNING: disableLogger` が表示されないこと
- `[@sentry/nextjs] DEPRECATION WARNING: automaticVercelMonitors` が表示されないこと

### 2. 開発サーバーでの表示確認

Chrome DevTools MCP を使って `http://localhost:2222` にアクセスし、以下を確認:

#### Step 2-1: ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222"
```

#### Step 2-2: コンソールエラー/警告の確認

```
mcp__chrome-devtools__list_console_messages
  types: ["warn", "error"]
```

**確認項目**:
- `has legacy prop "objectPosition"` という警告が表示されないこと

#### Step 2-3: 画像表示の確認

```
mcp__chrome-devtools__take_screenshot
```

**確認項目**:
- LGTM画像が正常に表示されていること
- 画像の位置 (center top) が維持されていること

### 3. 画像の動作確認

#### Step 3-1: 画像クリック動作

```
mcp__chrome-devtools__take_snapshot
```

スナップショットから LGTM 画像のボタン要素を特定し、クリック操作を確認:

**確認項目**:
- 画像をクリックしてマークダウンがコピーされること
- "Copied!" メッセージが表示されること

### 4. 英語版ページでの表示確認

Chrome DevTools MCP を使って `http://localhost:2222/en` にアクセスし、以下を確認:

#### Step 4-1: 英語版ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222/en"
```

#### Step 4-2: コンソールエラー/警告の確認

```
mcp__chrome-devtools__list_console_messages
  types: ["warn", "error"]
```

**確認項目**:
- `has legacy prop "objectPosition"` という警告が表示されないこと

#### Step 4-3: 画像表示の確認

```
mcp__chrome-devtools__take_screenshot
```

**確認項目**:
- LGTM画像が正常に表示されていること
- 画像の位置 (center top) が維持されていること

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセス:

#### Step 5-1: LgtmImage ストーリーを開く

サイドバーから `Lgtm Image` を探して開く

**利用可能なストーリー**:
- `Default` - 基本的な画像表示
- `AnotherImage` - 別の画像での表示
- `HiddenHeartIcon` - ハートアイコン非表示時の表示

**確認項目**:
- [ ] Default ストーリーが正常に表示される
- [ ] AnotherImage ストーリーが正常に表示される
- [ ] HiddenHeartIcon ストーリーが正常に表示される
- [ ] 全てのストーリーで画像が `center top` の位置で表示されている (画像上部が見切れていない)
- [ ] コンソールに `objectPosition` 関連の警告が表示されていない

---

## トラブルシューティング

### Q1: ビルド時にまだ警告が表示される場合

**確認事項**:
1. `next.config.ts` が正しく保存されているか確認
2. `node_modules/.cache` を削除して再ビルド:
   ```bash
   rm -rf node_modules/.cache
   npm run build
   ```
3. 変更した設定が正しい形式か再確認

### Q2: 画像の位置がおかしい場合

**確認事項**:
1. `style={{ objectPosition: "center top" }}` が正しく記述されているか確認
2. `className="object-contain"` が維持されているか確認
3. 開発者ツールで適用されている CSS を確認

### Q3: Lintエラーが発生する場合

**対処**:
- `npm run format` を実行してフォーマットを修正

### Q4: TypeScript エラーが発生する場合

**確認事項**:
1. `style` プロパティの型が正しいか確認
2. `webpack` オブジェクトの構造が正しいか確認

---

## 禁止事項

> **絶対厳守**
>
> 以下の行為は絶対に禁止です。違反した場合は実装をやり直してください。

| No. | 禁止事項 | 理由 |
|-----|----------|------|
| 1 | **依頼内容に関係のない無駄な修正** | スコープ外の変更はバグの原因 |
| 2 | **sentry.server.config.ts の修正** | 今回の警告は next.config.ts の設定が対象 |
| 3 | **sentry.edge.config.ts の修正** | 今回の警告は next.config.ts の設定が対象 |
| 4 | **LgtmImage コンポーネントの他の部分の修正** | objectPosition 以外は変更不要 |
| 5 | **他の Image コンポーネントの修正** | lgtm-image.tsx 以外に objectPosition を使用している箇所はない |
| 6 | **テストコードの追加・修正** | 既存テストに影響なし |

---

## 成功基準

以下を全て満たすこと:

### 警告の解消

- [ ] `npm run build` で Sentry の `disableLogger` 非推奨警告が表示されない
- [ ] `npm run build` で Sentry の `automaticVercelMonitors` 非推奨警告が表示されない
- [ ] ブラウザコンソールで `objectPosition` legacy prop 警告が表示されない

### 機能維持

- [ ] LGTM画像が正常に表示される
- [ ] 画像の位置 (center top) が維持されている
- [ ] 画像クリックでマークダウンがコピーされる
- [ ] "Copied!" メッセージが表示される
- [ ] Sentry のエラー監視が正常に動作する (本番環境で確認)

### コード品質

- [ ] `npm run format` が正常完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

---

## 最終チェックリスト

> **実装完了前に必ず確認**
>
> 全ての項目にチェックが入るまで実装完了とはなりません。

### Phase 1: ファイル修正

| チェック | ファイル | 確認項目 |
|:--------:|----------|----------|
| [ ] | `next.config.ts` | 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を変更していない |
| [ ] | `next.config.ts` | `disableLogger: true` を削除した |
| [ ] | `next.config.ts` | `automaticVercelMonitors: true` を削除した |
| [ ] | `next.config.ts` | `webpack` オブジェクトを追加した |
| [ ] | `next.config.ts` | `webpack.treeshake.removeDebugLogging: true` を設定した |
| [ ] | `next.config.ts` | `webpack.automaticVercelMonitors: true` を設定した |
| [ ] | `lgtm-image.tsx` | 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を変更していない |
| [ ] | `lgtm-image.tsx` | `objectPosition="center top"` を削除した |
| [ ] | `lgtm-image.tsx` | `style={{ objectPosition: "center top" }}` を追加した |

### Phase 2: 品質管理

| チェック | コマンド | 期待結果 |
|:--------:|----------|----------|
| [ ] | `npm run format` | 正常完了 |
| [ ] | `npm run lint` | エラー0で完了 |
| [ ] | `npm run test` | 全テストパス |

### Phase 3: 警告確認

| チェック | 確認方法 | 期待結果 |
|:--------:|----------|----------|
| [ ] | `npm run build` | Sentry 非推奨警告が表示されない |
| [ ] | ブラウザコンソール | objectPosition 警告が表示されない |

### Phase 4: 動作確認

| チェック | 確認場所 | 確認項目 |
|:--------:|----------|----------|
| [ ] | `http://localhost:2222` | LGTM画像が正常に表示される (日本語版) |
| [ ] | `http://localhost:2222` | 画像の位置 (center top) が維持されている (日本語版) |
| [ ] | `http://localhost:2222` | 画像クリックでマークダウンがコピーされる (日本語版) |
| [ ] | `http://localhost:2222` | コンソールにobjectPosition警告が表示されない (日本語版) |
| [ ] | `http://localhost:2222/en` | LGTM画像が正常に表示される (英語版) |
| [ ] | `http://localhost:2222/en` | 画像の位置 (center top) が維持されている (英語版) |
| [ ] | `http://localhost:2222/en` | コンソールにobjectPosition警告が表示されない (英語版) |
| [ ] | `http://localhost:6006/` | LgtmImage Default ストーリーが正常に表示される |
| [ ] | `http://localhost:6006/` | LgtmImage AnotherImage ストーリーが正常に表示される |
| [ ] | `http://localhost:6006/` | LgtmImage HiddenHeartIcon ストーリーが正常に表示される |
| [ ] | 全ページ | デザイン崩れがない |

---

## 技術的な補足

### Sentry webpack オプションの構造

Sentry SDK v10 では、一部のオプションが `webpack` 名前空間に移動しました:

```typescript
// 新しい構造
{
  webpack: {
    treeshake: {
      removeDebugLogging: true,  // 旧: disableLogger
    },
    automaticVercelMonitors: true,  // 移動
  },
}
```

### Next.js Image style プロパティ

Next.js 13 以降、`objectFit`、`objectPosition`、`layout` などのプロパティは非推奨となり、CSS の `style` プロパティを使用する形式に移行しました。

```tsx
// 旧形式 (非推奨)
<Image objectPosition="center top" />

// 新形式
<Image style={{ objectPosition: "center top" }} />
```

この変更により、より柔軟なスタイリングが可能になり、CSS の標準的な書き方と統一されます。

---

## 参考情報

### 公式ドキュメント

- [Sentry v9 to v10 Migration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v9-to-v10/)
- [Sentry Build Options](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)

### 関連プロジェクトドキュメント

- [プロジェクトコーディングガイドライン](/docs/project-coding-guidelines.md)
- [基本コーディングガイドライン](/docs/basic-coding-guidelines.md)

---

**作成日**: 2026-01-01
**最終更新**: 2026-01-01 (レビュー3回目反映 - 最終版)
**対象Issue**: #410
**担当**: AI実装者

### レビュー履歴

| 回 | 改善内容 |
|----|----------|
| 1回目 | 英語版ページでの確認手順追加、Storybookストーリー名の正確な記載、最終チェックリストの拡充 |
| 2回目 | 実装順序Step 4の動作確認項目を詳細化 |
| 3回目 | 概要セクションの警告数を正確に記載 (Sentry 2つ + Next.js Image 1つ) |
