# Issue #425: DEP0169 url.parse() 非推奨警告の解消 - 詳細実装計画書

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

### 対象警告

| 項目 | 値 |
|------|-----|
| 警告コード | DEP0169 |
| 警告メッセージ | `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. |
| 発生条件 | Node.js 24以降 |
| 根本原因 | Next.js内部および依存パッケージ(`proxy-from-env`等)が`url.parse()`を使用 |

### 修正概要

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| ファイル | `src/instrumentation.ts` | `src/instrumentation.ts` |
| 処理 | Sentry初期化のみ | Sentry初期化 + DEP0169警告抑制 |
| 行数 | 約15行 | 約45行 |

**変更の本質**: Node.js 24以降で発生するDEP0169警告を`process.emit`のオーバーライドで抑制し、Logalertへの不要な警告通知を防ぐ

---

## 概要

### 目的

Next.jsを起動した際に発生する以下の警告を解消する:

```
(node:34048) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
```

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/425

### 技術スタック

- **フレームワーク**: Next.js 16.1.1 App Router
- **Node.js**: v24.12.0
- **React**: v19.2.3
- **Sentry SDK**: @sentry/nextjs v10.32.1

### 背景

- Node.js 24.7.0以降で`url.parse()`の使用に対してDEP0169警告が表示されるようになった
- この警告はNext.js内部(`next/dist/server/lib/router-utils/resolve-routes.js`等)および依存パッケージ(`proxy-from-env`)で発生
- プロジェクトのソースコード(`src/`)には`url.parse()`の直接使用はない
- Logalertから一定時間毎に警告が届くため早急な対応が必要

### 関連するNext.js Issue

- [vercel/next.js#83183](https://github.com/vercel/next.js/issues/83183) - カスタムサーバーでのDEP0169警告 (OPEN)

---

## 調査結果

### 警告発生箇所の特定

以下の調査により、`url.parse()`の使用箇所を特定しました。

#### プロジェクト内ソースコード

```bash
grep -r "url\.parse" src/
# 結果: 該当なし
```

**結論**: プロジェクト固有のコードには`url.parse()`の使用なし

#### 依存パッケージ

| パッケージ | url.parse使用 | 備考 |
|-----------|---------------|------|
| `proxy-from-env` | あり | `node_modules/proxy-from-env/index.js` |
| `next` | あり | `next/dist/server/lib/router-utils/resolve-routes.js`等 |
| `hosted-git-info` | あり | npm関連ツール (開発時のみ) |
| `normalize-package-data` | あり | npm関連ツール (開発時のみ) |

### 解決策の検討

| 解決策 | メリット | デメリット | 採用 |
|--------|----------|------------|------|
| 警告抑制 (`process.emit`オーバーライド) | 即座に警告を解消できる | 根本解決ではない | **採用** |
| Node.js 23へのダウングレード | 警告が発生しない | 最新Node.jsの機能が使えない | 不採用 |
| Next.js/依存パッケージの更新待ち | 根本解決 | 時期が不明、Logalertへの通知が続く | 不採用 |

### 参考情報

- [Node.js DEP0169 ドキュメント](https://nodejs.org/api/deprecations.html#DEP0169)
- [proxy-from-env Issue #30](https://github.com/Rob--W/proxy-from-env/issues/30)

---

## ファイル構成

### 修正対象ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/instrumentation.ts` | DEP0169警告を抑制する`process.emit`オーバーライドを追加 |

### 変更不要のファイル

| ファイルパス | 理由 |
|-------------|------|
| `src/instrumentation-client.ts` | クライアント側では警告は発生しない |
| `sentry.server.config.ts` | Sentry設定は変更不要 |
| `sentry.edge.config.ts` | Sentry設定は変更不要 |
| `next.config.ts` | Next.js設定は変更不要 |

---

## 変更内容詳細

> **実装者への注意**
>
> 以下の1ファイルを修正してください。
> ファイル先頭のコメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` は変更しないこと。

### Step 1: src/instrumentation.ts の修正

**ファイルパス**: `src/instrumentation.ts`

#### 現在のコード (全体)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { captureRequestError } from "@sentry/nextjs";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = captureRequestError;
```

#### 変更後のコード (全体)

```typescript
// 絶対厳守：編集前に必ずAI実装ルールを読む
import { captureRequestError } from "@sentry/nextjs";

/**
 * Node.js 24以降で発生するDEP0169警告を抑制する
 *
 * @see https://github.com/nekochans/lgtm-cat-frontend/issues/425
 * @see https://github.com/vercel/next.js/issues/83183
 *
 * 根本原因:
 * - Next.js内部およびproxy-from-env等の依存パッケージがurl.parse()を使用
 * - Node.js 24.7.0以降でDEP0169警告が表示されるようになった
 *
 * この対処は一時的なものであり、Next.jsおよび依存パッケージが
 * WHATWG URL APIに移行した後は削除すること
 */
function suppressDep0169Warning(): void {
  const originalEmit = process.emit.bind(process);

  // @ts-expect-error - process.emitのオーバーライドは型定義と互換性がない
  process.emit = function (
    name: string | symbol,
    warningEvent: unknown,
    ...args: unknown[]
  ) {
    if (
      name === "warning" &&
      typeof warningEvent === "object" &&
      warningEvent !== null &&
      "name" in warningEvent &&
      "code" in warningEvent &&
      warningEvent.name === "DeprecationWarning" &&
      warningEvent.code === "DEP0169"
    ) {
      return false;
    }
    return originalEmit(name, warningEvent, ...args);
  };
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    suppressDep0169Warning();
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = captureRequestError;
```

#### diff形式

```diff
 // 絶対厳守：編集前に必ずAI実装ルールを読む
 import { captureRequestError } from "@sentry/nextjs";

+/**
+ * Node.js 24以降で発生するDEP0169警告を抑制する
+ *
+ * @see https://github.com/nekochans/lgtm-cat-frontend/issues/425
+ * @see https://github.com/vercel/next.js/issues/83183
+ *
+ * 根本原因:
+ * - Next.js内部およびproxy-from-env等の依存パッケージがurl.parse()を使用
+ * - Node.js 24.7.0以降でDEP0169警告が表示されるようになった
+ *
+ * この対処は一時的なものであり、Next.jsおよび依存パッケージが
+ * WHATWG URL APIに移行した後は削除すること
+ */
+function suppressDep0169Warning(): void {
+  const originalEmit = process.emit.bind(process);
+
+  // @ts-expect-error - process.emitのオーバーライドは型定義と互換性がない
+  process.emit = function (
+    name: string | symbol,
+    warningEvent: unknown,
+    ...args: unknown[]
+  ) {
+    if (
+      name === "warning" &&
+      typeof warningEvent === "object" &&
+      warningEvent !== null &&
+      "name" in warningEvent &&
+      "code" in warningEvent &&
+      warningEvent.name === "DeprecationWarning" &&
+      warningEvent.code === "DEP0169"
+    ) {
+      return false;
+    }
+    return originalEmit(name, warningEvent, ...args);
+  };
+}
+
 export async function register(): Promise<void> {
   if (process.env.NEXT_RUNTIME === "nodejs") {
+    suppressDep0169Warning();
     await import("../sentry.server.config");
   }

   if (process.env.NEXT_RUNTIME === "edge") {
     await import("../sentry.edge.config");
   }
 }

 export const onRequestError = captureRequestError;
```

#### 変更ポイントの詳細

| 変更内容 | 理由 |
|----------|------|
| `suppressDep0169Warning`関数の追加 | DEP0169警告を抑制するロジックを分離 |
| `process.emit.bind(process)` | オリジナルの`process.emit`を正しいコンテキストで保存 |
| `@ts-expect-error`コメント | TypeScriptの型エラーを抑制 (process.emitのオーバーライドは型定義と互換性がない) |
| `warningEvent.name === "DeprecationWarning"` | DeprecationWarning以外の警告は通常通り処理 |
| `warningEvent.code === "DEP0169"` | DEP0169以外の非推奨警告は通常通り処理 |
| `return false` | 警告イベントの伝播を停止 |
| JSDocコメント | 将来のメンテナンス担当者向けに背景と削除条件を明記 |

### 実装上の注意点

1. **nodejsランタイム限定**: `suppressDep0169Warning()`は`NEXT_RUNTIME === "nodejs"`の場合のみ実行する (Edge Runtimeでは不要かつ`process`が利用不可)

2. **Sentry初期化前に実行**: 警告抑制はSentry初期化よりも前に実行することで、初期化時の警告も抑制する

3. **DEP0169のみを対象**: 他のDeprecationWarningは抑制しない (意図しない警告の見落としを防ぐ)

---

## 実装順序

以下の順序で実装を進めること:

### Step 1: ファイル修正

1. `src/instrumentation.ts` を開く
2. import文の後に`suppressDep0169Warning`関数を追加
3. `register`関数内の`NEXT_RUNTIME === "nodejs"`ブロックに`suppressDep0169Warning()`呼び出しを追加

### Step 2: 品質管理

4. `npm run format` を実行してコードをフォーマット
5. `npm run lint` を実行してコードをチェック
6. `npm run test` を実行して全てのテストがパスすることを確認
7. `npm run build` を実行してビルドが成功することを確認

### Step 3: 動作確認

8. 開発サーバーを再起動 (既存サーバーを停止後、`npm run dev`を実行)
9. Chrome DevTools MCPで`http://localhost:2222`にアクセスして警告がないことを確認
10. Chrome DevTools MCPで`http://localhost:2222/en`にアクセスして英語版が正常に動作することを確認
11. Chrome DevTools MCPで`http://localhost:6006/`にアクセスしてStorybookが正常に動作することを確認

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

### 4. ビルド確認

```bash
npm run build
```

**ビルドが正常に完了することを確認**

---

## 動作確認手順

> **前提条件**: 開発サーバー (`npm run dev`) およびStorybook (`npm run storybook`) は既に起動済みであることを前提としています。

> **注意**: 動作確認は品質管理手順 (format, lint, test, build) が完了した後に実行してください。

### 1. 開発サーバーの再起動

警告抑制コードを有効にするため、開発サーバーを再起動する必要があります。

**具体的な手順**:

```bash
# Step 1: 既存のサーバープロセスを確認
lsof -i :2222

# Step 2: 既存のプロセスを終了 (PIDは上記コマンドで確認)
# Ctrl+C で停止するか、以下のコマンドで強制終了
kill -9 <PID>

# Step 3: .nextキャッシュを削除 (推奨)
rm -rf .next

# Step 4: 新しいサーバーを起動
npm run dev
```

**起動完了の確認**:
```
▲ Next.js 16.1.1 (Turbopack, Cache Components)
- Local:         http://localhost:2222
```

上記のメッセージが表示されれば起動完了です。

### 2. Next.js開発サーバーログの確認

Next.js MCPの`get_logs`ツールでログファイルを確認します。

```
mcp__next-devtools__nextjs_call
  port: "2222"
  toolName: "get_logs"
```

ログファイルのパスを取得後、DEP0169警告が含まれていないことを確認:

```bash
grep -c "DEP0169" /path/to/next-development.log
```

**期待される結果**: 0 (警告が抑制されている)

### 3. ブラウザでの動作確認

Chrome DevTools MCPを使って`http://localhost:2222`にアクセス:

#### Step 3-1: ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222"
```

#### Step 3-2: ページのスナップショットを取得

```
mcp__chrome-devtools__take_snapshot
```

**確認項目**:
- ページが正常に表示されること
- LGTM画像が表示されること

#### Step 3-3: コンソールエラー/警告の確認

```
mcp__chrome-devtools__list_console_messages
  types: ["warn", "error"]
```

**確認項目**:
- DEP0169関連の警告が表示されていないこと
- その他の重大なエラーがないこと

### 4. 英語版ページでの動作確認

Chrome DevTools MCPを使って`http://localhost:2222/en`にアクセス:

#### Step 4-1: 英語版ページにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:2222/en"
```

#### Step 4-2: 表示確認

```
mcp__chrome-devtools__take_snapshot
```

**確認項目**:
- 英語版ページが正常に表示されること
- LGTM画像が表示されること

### 5. Storybookでの動作確認

Chrome DevTools MCPを使って`http://localhost:6006/`にアクセス:

#### Step 5-1: Storybookにアクセス

```
mcp__chrome-devtools__navigate_page
  type: "url"
  url: "http://localhost:6006/"
```

#### Step 5-2: 表示確認

```
mcp__chrome-devtools__take_snapshot
```

**確認項目**:
- Storybookが正常に表示されること
- コンポーネント一覧が表示されること

### 6. 作業完了後のサーバー停止

> **重要**: 動作確認完了後、起動したサーバーは必ず停止してください。

```bash
# 開発サーバーの停止
# ターミナルで Ctrl+C を押すか、以下のコマンドで強制終了
lsof -i :2222 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null

# Storybookサーバーの停止 (起動していた場合)
lsof -i :6006 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null
```

**確認**:
```bash
# サーバーが停止していることを確認
lsof -i :2222
lsof -i :6006
```

上記コマンドで何も出力されなければ、サーバーは正常に停止しています。

---

## トラブルシューティング

### Q1: 警告がまだ表示される場合

**確認事項**:

1. 開発サーバーを完全に再起動したか確認
   ```bash
   # 既存プロセスを確認
   lsof -i :2222
   # プロセスを終了
   kill -9 <PID>
   # 再起動
   npm run dev
   ```

2. `src/instrumentation.ts`が正しく保存されているか確認

3. `.next`キャッシュを削除して再起動:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Q2: TypeScriptエラーが発生する場合

**確認事項**:

1. `@ts-expect-error`コメントが正しい位置にあるか確認
2. `process.emit.bind(process)`でオリジナル関数を保存しているか確認
3. 型アノテーションが正しいか確認 (`name: string | symbol`)

### Q3: Sentryエラーが発生する場合

**確認事項**:

1. `suppressDep0169Warning()`がSentry初期化(`await import("../sentry.server.config")`)の前に呼び出されているか確認
2. `captureRequestError`のimportが維持されているか確認

### Q4: Edge Runtimeでエラーが発生する場合

**確認事項**:

1. `suppressDep0169Warning()`が`NEXT_RUNTIME === "nodejs"`ブロック内でのみ呼び出されているか確認
2. Edge Runtimeブロック(`NEXT_RUNTIME === "edge"`)には変更を加えていないか確認

---

## 禁止事項

> **絶対厳守**
>
> 以下の行為は絶対に禁止です。違反した場合は実装をやり直してください。

| No. | 禁止事項 | 理由 |
|-----|----------|------|
| 1 | **依頼内容に関係のない無駄な修正** | スコープ外の変更はバグの原因 |
| 2 | **src/instrumentation-client.ts の修正** | クライアント側には影響なし |
| 3 | **sentry.server.config.ts の修正** | Sentry設定は変更不要 |
| 4 | **sentry.edge.config.ts の修正** | Sentry設定は変更不要 |
| 5 | **next.config.ts の修正** | Next.js設定は変更不要 |
| 6 | **DEP0169以外の警告の抑制** | 他の警告は意図的に表示すべき |
| 7 | **Edge Runtimeでの警告抑制実行** | Edge Runtimeではprocessが利用不可 |
| 8 | **テストコードの追加・修正** | 既存テストに影響なし |

---

## 成功基準

以下を全て満たすこと:

### 警告の解消

- [ ] 開発サーバー起動時にDEP0169警告が表示されない
- [ ] Next.js MCPのログにDEP0169警告が記録されない

### 機能維持

- [ ] 日本語版ページ(`http://localhost:2222`)が正常に表示される
- [ ] 英語版ページ(`http://localhost:2222/en`)が正常に表示される
- [ ] LGTM画像が正常に表示される
- [ ] 画像クリックでマークダウンがコピーされる
- [ ] Storybookが正常に動作する
- [ ] Sentryのエラー監視が正常に動作する

### コード品質

- [ ] `npm run format`が正常完了する
- [ ] `npm run lint`がエラー0で完了する
- [ ] `npm run test`が全てパスする
- [ ] `npm run build`が正常完了する

---

## 最終チェックリスト

> **実装完了前に必ず確認**
>
> 全ての項目にチェックが入るまで実装完了とはなりません。

### Phase 1: ファイル修正

| チェック | ファイル | 確認項目 |
|:--------:|----------|----------|
| [ ] | `src/instrumentation.ts` | 先頭コメント `// 絶対厳守：編集前に必ずAI実装ルールを読む` を変更していない |
| [ ] | `src/instrumentation.ts` | `suppressDep0169Warning`関数を追加した |
| [ ] | `src/instrumentation.ts` | JSDocコメントでIssueリンクと背景を記載した |
| [ ] | `src/instrumentation.ts` | `@ts-expect-error`コメントを追加した |
| [ ] | `src/instrumentation.ts` | `process.emit.bind(process)`でオリジナル関数を保存している |
| [ ] | `src/instrumentation.ts` | DEP0169のみを抑制している (他の警告は通過) |
| [ ] | `src/instrumentation.ts` | `NEXT_RUNTIME === "nodejs"`ブロック内で`suppressDep0169Warning()`を呼び出している |
| [ ] | `src/instrumentation.ts` | Sentry初期化の前に`suppressDep0169Warning()`を呼び出している |
| [ ] | `src/instrumentation.ts` | `onRequestError`のexportを維持している |

### Phase 2: 品質管理

| チェック | コマンド | 期待結果 |
|:--------:|----------|----------|
| [ ] | `npm run format` | 正常完了 |
| [ ] | `npm run lint` | エラー0で完了 |
| [ ] | `npm run test` | 全テストパス |
| [ ] | `npm run build` | ビルド正常完了 |

### Phase 3: 警告確認

| チェック | 確認方法 | 期待結果 |
|:--------:|----------|----------|
| [ ] | 開発サーバー再起動 | DEP0169警告が表示されない |
| [ ] | Next.js MCPログ確認 | DEP0169警告が記録されていない |

### Phase 4: 動作確認

| チェック | 確認場所 | 確認項目 |
|:--------:|----------|----------|
| [ ] | `http://localhost:2222` | ページが正常に表示される (日本語版) |
| [ ] | `http://localhost:2222` | LGTM画像が表示される (日本語版) |
| [ ] | `http://localhost:2222` | コンソールにエラーがない (日本語版) |
| [ ] | `http://localhost:2222/en` | ページが正常に表示される (英語版) |
| [ ] | `http://localhost:2222/en` | LGTM画像が表示される (英語版) |
| [ ] | `http://localhost:6006/` | Storybookが正常に表示される |
| [ ] | 全ページ | デザイン崩れがない |

### Phase 5: サーバー停止

| チェック | 確認方法 | 期待結果 |
|:--------:|----------|----------|
| [ ] | `lsof -i :2222` | 出力なし (サーバー停止済み) |
| [ ] | `lsof -i :6006` | 出力なし (サーバー停止済み) |

---

## 技術的な補足

### process.emit のオーバーライドについて

Node.jsの`process`オブジェクトはEventEmitterを継承しており、`emit`メソッドを通じてイベントを発行します。DeprecationWarningは`warning`イベントとして発行されるため、このイベントをインターセプトすることで警告を抑制できます。

```typescript
// 警告イベントの構造
{
  name: "DeprecationWarning",
  code: "DEP0169",
  message: "`url.parse()` behavior is not standardized..."
}
```

### 将来の削除について

この警告抑制は一時的な対処です。以下の条件が満たされた場合、このコードを削除してください:

1. Next.jsが`url.parse()`をWHATWG URL APIに移行した場合
2. `proxy-from-env`パッケージが更新された場合
3. Node.jsでDEP0169が完全に削除された場合 (将来のバージョン)

削除時は以下の手順を実行:
1. `suppressDep0169Warning`関数を削除
2. `register`関数内の`suppressDep0169Warning()`呼び出しを削除
3. 開発サーバーを再起動してDEP0169警告が発生しないことを確認

---

## 参考情報

### 公式ドキュメント

- [Node.js Deprecations - DEP0169](https://nodejs.org/api/deprecations.html#DEP0169)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [WHATWG URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)

### 関連Issue

- [vercel/next.js#83183](https://github.com/vercel/next.js/issues/83183) - DEP0169警告に関するNext.js Issue
- [proxy-from-env#30](https://github.com/Rob--W/proxy-from-env/issues/30) - proxy-from-envでのurl.parse使用に関するIssue

### 関連プロジェクトドキュメント

- [プロジェクトコーディングガイドライン](/docs/project-coding-guidelines.md)
- [基本コーディングガイドライン](/docs/basic-coding-guidelines.md)

---

**作成日**: 2026-01-10
**最終更新**: 2026-01-10
**対象Issue**: #425
**担当**: AI実装者

### レビュー履歴

| 回 | 改善内容 |
|----|----------|
| 1回目 | 変数名`data`を`warningEvent`に変更 (プロジェクト規約準拠)、ビルド時確認手順追加、開発サーバー再起動手順の具体化 |
| 2回目 | 変更ポイント詳細表の変数名を更新、品質管理手順にビルド確認追加、実装順序に英語版確認追加 |
| 3回目 | 動作確認手順の重複を解消 (品質管理と動作確認の役割分担を明確化)、手順番号の整合性修正 |
| 追加 | 動作確認手順にサーバー停止手順を追加、最終チェックリストにPhase 5 (サーバー停止) を追加、サーバー起動済み前提を明記 - 最終版 |
