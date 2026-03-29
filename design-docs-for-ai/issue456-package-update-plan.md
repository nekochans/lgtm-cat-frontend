# Issue #456: @heroui/react 以外のpackageを最新安定版に更新する

## 概要

`@heroui/react` を除く全ての依存パッケージを現時点での最新安定版に更新する。

## Done の定義

- [ ] `@heroui/react` 以外の依存packageが現時点での最新安定版に更新されている事
- [ ] `npm run build` が正常に完了する事
- [ ] `npm run lint` が正常に完了する事
- [ ] `npm run test` が全てパスする事

## 前提条件

- Node.js: v24.12.0（chromatic 16.0.0 が Node 18 サポートを廃止しているが、問題なし）
- 開発サーバー（`npm run dev`）およびStorybook（`npm run storybook`）は起動済みの前提

## 更新対象パッケージ一覧

### dependencies

| パッケージ名 | 現在のバージョン | 更新後のバージョン | 変更種別 | 備考 |
|---|---|---|---|---|
| `@aws-sdk/client-s3` | 3.1012.0 | 3.1019.0 | パッチ | |
| `@aws-sdk/s3-request-presigner` | 3.1012.0 | 3.1019.0 | パッチ | |
| `@next/third-parties` | 16.2.0 | 16.2.1 | パッチ | Next.js と同一バージョンで揃える |
| `@sentry/nextjs` | 10.44.0 | 10.46.0 | マイナー | |
| `next` | 16.2.0 | 16.2.1 | パッチ | セキュリティ修正5件を含む（CVE-2026-27977〜27980, CVE-2026-29057） |
| `recharts` | 3.8.0 | 3.8.1 | パッチ | |

### devDependencies

| パッケージ名 | 現在のバージョン | 更新後のバージョン | 変更種別 | 備考 |
|---|---|---|---|---|
| `@biomejs/biome` | 2.4.8 | 2.4.9 | パッチ | |
| `@chromatic-com/storybook` | 5.0.1 | 5.1.1 | マイナー | |
| `@storybook/addon-a11y` | 10.3.0 | 10.3.3 | パッチ | Storybook関連は全て10.3.3に揃える |
| `@storybook/addon-docs` | 10.3.0 | 10.3.3 | パッチ | |
| `@storybook/addon-onboarding` | 10.3.0 | 10.3.3 | パッチ | |
| `@storybook/addon-vitest` | 10.3.0 | 10.3.3 | パッチ | |
| `@storybook/nextjs-vite` | 10.3.0 | 10.3.3 | パッチ | |
| `@vitest/browser-playwright` | 4.1.0 | 4.1.2 | パッチ | Vitest関連は全て4.1.2に揃える |
| `@vitest/coverage-v8` | 4.1.0 | 4.1.2 | パッチ | |
| `chromatic` | 15.3.0 | 16.0.0 | **メジャー** | 破壊的変更: Node 18 サポート廃止のみ |
| `jsdom` | 29.0.0 | 29.0.1 | パッチ | |
| `msw` | 2.12.13 | 2.12.14 | パッチ | `mockServiceWorker.js` 再生成の可能性あり |
| `storybook` | 10.3.0 | 10.3.3 | パッチ | |
| `typescript` | 5.9.3 | 6.0.2 | **メジャー** | `tsconfig.json` の修正が必要 |
| `ultracite` | 7.3.2 | 7.4.0 | マイナー | Biome プリセット |
| `vitest` | 4.1.0 | 4.1.2 | パッチ | |

### 更新対象外

| パッケージ名 | 現在のバージョン | 最新バージョン | 除外理由 |
|---|---|---|---|
| `@heroui/react` | 2.8.10 | 3.0.1 | Issue指定で対象外（v3移行は別issueで対応） |

### 更新不要（既に最新安定版）

`@storybook/addon-viewport`（9.0.8）は10.x系が存在しないため更新不要。その他のリストに無いパッケージは `npm outdated` で確認済みであり、既に最新安定版。

## メジャーバージョンアップの影響分析

### 1. TypeScript 5.9.3 → 6.0.2（メジャー）

TypeScript 6.0 はGo製コンパイラ（TypeScript 7.0）への移行準備リリースであり、以下の破壊的変更がある。

#### 本プロジェクトに影響する変更

##### (A) `types` フィールドのデフォルトが空配列に変更

- **変更内容**: 以前は `node_modules/@types` 配下の全パッケージが自動で読み込まれていたが、6.0ではデフォルトが `[]`（空配列）に変更された
- **影響**: 現在の `tsconfig.json` に `types` フィールドが未設定のため、`@types/node` が自動読み込みされなくなり、`process` 等のグローバル型が解決できずビルドエラーになる
- **対応**: `tsconfig.json` の `compilerOptions` に `"types": ["node"]` を追加する
  - `@types/react` は JSX の型解決に import 文で参照されるためグローバル型宣言ではなく、`types` への明示指定は不要
  - `@types/node` は `process`, `Buffer`, `__dirname` 等のグローバル型に必要なため明示する

##### (B) `esModuleInterop` が常に有効化

- **変更内容**: `esModuleInterop` と `allowSyntheticDefaultImports` は常に有効になり、`false` に設定できなくなった
- **影響**: 本プロジェクトは `esModuleInterop: true` を明示設定しているため動作への影響はないが、冗長な設定となる
- **対応**: `tsconfig.json` から `"esModuleInterop": true` を削除する（冗長な設定の除去）

##### (C) `rootDir` のデフォルト変更

- **変更内容**: `rootDir` が未設定の場合、tsconfig.jsonが存在するディレクトリがデフォルトになる（以前はソースファイルの共通祖先ディレクトリ）
- **影響**: 本プロジェクトでは `rootDir` を明示設定していないが、`noEmit: true` のため出力ディレクトリ構造には影響しない。ただし TS 6.0 が新旧デフォルトの差分を検出した場合、diagnostic 5011 が発生する可能性がある
- **対応**: `npm run build` 実行時にエラーが出た場合のみ、`"rootDir": "."` を追加する（事前には変更しない）

#### 本プロジェクトに影響しない変更

| 変更 | 影響しない理由 |
|---|---|
| `moduleResolution: classic` 廃止 | `"bundler"` を使用中 |
| `target: es5` 非推奨 | `"ES2017"` を使用中 |
| `alwaysStrict: false` 廃止 | `strict: true` を使用中（`alwaysStrict: false` は未設定） |
| `outFile` 廃止 | 使用していない |
| `baseUrl` 非推奨 | 使用していない（`paths` のみ使用） |

### 2. chromatic 15.3.0 → 16.0.0（メジャー）

- **破壊的変更**: Node.js 18 のサポートが廃止され、GitHub Action が Node 24 に更新された
- **本プロジェクトへの影響**: Node.js 24.12.0 を使用しているため**影響なし**
- **対応**: 特別な対応不要

## 実装手順

### 全体フロー

```
Step 1: パッケージ更新
  ↓
Step 2: tsconfig.json 修正（TypeScript 6.0 対応）
  ↓
Step 3: MSW の mockServiceWorker.js 確認
  ↓
Step 4: フォーマットの実行（npm run format）
  ↓
Step 5: リントの実行（npm run lint）
  ↓
Step 6: ビルドの実行（npm run build）
  ↓ エラーがあれば修正して Step 4 に戻る
Step 7: テストの実行（npm run test）
  ↓ エラーがあれば修正して Step 4 に戻る
Step 8: Chrome DevTools MCP で動作確認
```

### Step 1: package.json の更新

`@heroui/react` **以外の** 全パッケージを最新安定版に更新する。再現性のためバージョンを明示指定する。

#### 1-1. dependencies の更新

```bash
npm install \
  @aws-sdk/client-s3@3.1019.0 \
  @aws-sdk/s3-request-presigner@3.1019.0 \
  @next/third-parties@16.2.1 \
  @sentry/nextjs@10.46.0 \
  next@16.2.1 \
  recharts@3.8.1
```

#### 1-2. devDependencies の更新

```bash
npm install --save-dev \
  @biomejs/biome@2.4.9 \
  @chromatic-com/storybook@5.1.1 \
  @storybook/addon-a11y@10.3.3 \
  @storybook/addon-docs@10.3.3 \
  @storybook/addon-onboarding@10.3.3 \
  @storybook/addon-vitest@10.3.3 \
  @storybook/nextjs-vite@10.3.3 \
  @vitest/browser-playwright@4.1.2 \
  @vitest/coverage-v8@4.1.2 \
  chromatic@16.0.0 \
  jsdom@29.0.1 \
  msw@2.12.14 \
  storybook@10.3.3 \
  typescript@6.0.2 \
  ultracite@7.4.0 \
  vitest@4.1.2
```

#### 1-3. インストール後の確認

以下を確認する:

1. `package.json` 内の `@heroui/react` のバージョンが `"2.8.10"` のまま変更されていない事
2. `npm outdated` を実行し、`@heroui/react` 以外に outdated なパッケージが存在しない事
3. `npm ls --depth=0` でインストールが正常に完了している事（peer dependency の警告がないか確認）

**注意**: もし `npm outdated` の実行時点で上記テーブルより新しいバージョンがリリースされていた場合は、最新安定版に合わせてバージョンを調整する。

#### 1-4. npm install が失敗した場合のトラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| peer dependency 衝突エラー | `@heroui/react@2.8.10` が更新後のパッケージと互換性のない peer dependency を要求している | `npm install --legacy-peer-deps` で一時的にpeer dependency チェックを無視してインストールする。ただし、`@heroui/react` の v3 移行が別issueで予定されているため、これは許容される |
| ERESOLVE unable to resolve dependency tree | 複数パッケージ間の依存関係衝突 | 上記と同様に `--legacy-peer-deps` で対応する |
| ネットワークエラー | npm registry への接続失敗 | `npm cache clean --force` 後にリトライする |

### Step 2: tsconfig.json の修正（TypeScript 6.0 対応）

TypeScript 6.0 の破壊的変更に対応するため、`tsconfig.json` を修正する。

#### 修正箇所（差分）

**削除する行:**

```json
"esModuleInterop": true,
```

**追加する行（`compilerOptions` の末尾付近に追加）:**

```json
"types": ["node"]
```

#### 修正後の tsconfig.json 全体

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "strictNullChecks": true,
    "target": "ES2017",
    "types": ["node"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**変更のサマリー:**

1. `"esModuleInterop": true` を削除 — TS 6.0 で常に有効のため冗長
2. `"types": ["node"]` を追加 — TS 6.0 で `types` のデフォルトが空配列に変更されたため、`@types/node` を明示的に指定

### Step 3: MSW の mockServiceWorker.js 確認

MSW のバージョン更新（2.12.13 → 2.12.14）に伴い、`public/mockServiceWorker.js` の再生成が必要か確認する。

```bash
npx msw init public/ --save
```

- 差分が発生した場合はそのままコミット対象にする
- 差分が発生しなければ対応不要

### Step 4: フォーマットの実行

Biome 2.4.9 へのバージョンアップに伴い、フォーマットルールが変更されている可能性がある。

```bash
npm run format
```

- 差分が発生した場合は `git diff` で内容を確認し、フォーマットの変更のみである事を確認する
- ビジネスロジックに影響のある変更が含まれていない事を確認する

### Step 5: リントの実行

```bash
npm run lint
```

- エラーが発生した場合は内容を確認し修正する
- Biome 2.4.9 で新しいリントルールが追加されている可能性があるため、新規エラーの場合はルールの内容を理解した上で修正する
- 修正後は Step 4 のフォーマットから再実行する

### Step 6: ビルドの実行

```bash
npm run build
```

#### 想定されるエラーと対応方針

| エラー | 原因 | 対応 |
|---|---|---|
| diagnostic 5011: `rootDir` の不一致 | TS 6.0 で `rootDir` のデフォルトが変更された | `tsconfig.json` に `"rootDir": "."` を追加する |
| `Cannot find name 'process'` 等 | `types` の設定が不足している | `tsconfig.json` の `types` 配列に不足している型を追加する |
| 非推奨オプションの警告 | TS 6.0 で非推奨になったオプション | 警告内容に従いオプションを修正する |
| `@storybook/addon-vitest` の import エラー | Storybook パッケージ更新に伴う API 変更 | `vitest.config.mts` の import パスを確認し、必要に応じて修正する |

エラーを修正した場合は **Step 4（フォーマット）から再実行する**。

### Step 7: テストの実行

```bash
npm run test
```

- 全テストがパスする事を確認する
- テスト環境固有のエラー（`vitest.setup.mts` や `vitest.config.mts` 関連）が発生した場合は、エラー内容に応じて設定ファイルを修正する
- 修正した場合は **Step 4（フォーマット）から再実行する**

### Step 8: 動作確認（Chrome DevTools MCP 使用）

#### 8-1. 開発サーバーでの表示確認

Chrome DevTools MCP を使用して `http://localhost:2222` にアクセスし、以下を確認する。

- ページが正常に表示される事
- コンソールにエラーが出力されていない事
- 画像が正常に読み込まれている事
- ページ遷移（日本語版 → 英語版、ホーム → アップロード等）が正常に動作する事

#### 8-2. Storybook での表示確認

Chrome DevTools MCP を使用して `http://localhost:6006/` にアクセスし、以下を確認する。

- Storybook が正常に起動している事
- 複数のストーリーを選択し、正常にレンダリングされる事を確認する

## 変更対象ファイル一覧

| ファイル | 変更内容 | 必須/条件付き |
|---|---|---|
| `package.json` | 依存パッケージのバージョン更新 | 必須 |
| `package-lock.json` | npm install による自動更新 | 必須 |
| `tsconfig.json` | TypeScript 6.0 対応（`esModuleInterop` 削除、`types` 追加） | 必須 |
| `public/mockServiceWorker.js` | MSW のバージョンアップに伴う自動再生成 | 条件付き（差分がある場合のみ） |
| その他ソースファイル | Biome のフォーマッター更新に伴う自動フォーマット | 条件付き（差分がある場合のみ） |

## リスクと注意事項

### TypeScript 6.0 メジャーアップデートのリスク

- TypeScript 6.0 は TypeScript 7.0（Go製）への移行準備リリースであり、多数の非推奨化と破壊的変更を含む
- `types` フィールドのデフォルト変更は広範囲に影響する可能性があるため、ビルドとテストで確認が必須
- `rootDir` のデフォルト変更は `noEmit: true` のプロジェクトでは通常影響しないが、diagnostic が出る可能性がある
- 本プロジェクトで使用していない機能の廃止・非推奨は影響しない事を確認済み

### chromatic 16.0.0 メジャーアップデートのリスク

- Node.js 18 のサポート廃止のみの破壊的変更で、本プロジェクト（Node 24）には影響なし
- CI/CD 環境（Vercel、GitHub Actions等）の Node.js バージョンが 18 以上である事を前提とする

### Next.js 16.2.1 セキュリティ修正

- 今回の更新にはセキュリティ修正が5件含まれている（CVE-2026-27977〜27980, CVE-2026-29057）
- `maxPostponedStateSize` の尊重、画像ディスクキャッシュ、クロスサイトWebSocket接続のブロック、Server Action のクロスサイト送信制限、`http-proxy` のリクエストスマグリング修正

### MSW バージョンアップの注意

- MSW の更新時に `public/mockServiceWorker.js` が再生成される場合がある
- `npx msw init public/ --save` を実行して確認する事

### フォーマッターの差分

- Biome の更新により自動フォーマットの結果が変わる場合がある。`npm run format` で適用される差分はコードの動作に影響しない

### 絶対にやってはいけない事

- `@heroui/react` のバージョンを変更する事（Issue で明示的に除外されている）
- ビジネスロジックを変更する事（パッケージ更新とそれに伴う設定ファイルの修正のみが対象）
- テストを書き換えてパスさせる事（テスト失敗の原因は設定やパッケージの不整合にある）

## ロールバック手順

何らかの理由で更新を元に戻す必要がある場合:

```bash
git checkout -- package.json package-lock.json tsconfig.json
npm install
```

`public/mockServiceWorker.js` やフォーマット変更されたソースファイルがある場合は、対象ファイルを明示的に列挙して復元する:

```bash
git checkout -- package.json package-lock.json tsconfig.json public/mockServiceWorker.js
npm install
```

フォーマッターによる差分がある場合は、`git diff --name-only` で対象を確認した上で、本タスクで変更したファイルのみを個別に `git checkout` する:

```bash
# 例: フォーマット差分がある場合
git checkout -- src/path/to/formatted-file1.ts src/path/to/formatted-file2.tsx
```

**注意**: `git checkout -- .` や `git checkout -- $(git diff --name-only)` のような一括復元コマンドは、本タスクと無関係な未コミット変更まで破棄してしまうため使用しない。

## 参考情報

- [TypeScript 6.0 公式アナウンス](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [TypeScript 5.x to 6.0 Migration Guide](https://gist.github.com/privatenumber/3d2e80da28f84ee30b77d53e1693378f)
- [Next.js 16.2 リリースブログ](https://nextjs.org/blog/next-16-2)
- [chromatic-cli GitHub Releases](https://github.com/chromaui/chromatic-cli/releases)
