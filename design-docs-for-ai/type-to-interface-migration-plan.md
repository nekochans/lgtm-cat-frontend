# type から interface への移行実装計画

## 概要

ultracite v6.5.1 において `useConsistentTypeDefinitions` のデフォルト設定が `interface` に変更されたことに伴い、プロジェクト全体の型定義を `type` から `interface` へ移行する。

**関連 Issue**: [#410 - 新デザイン 依存packageを最新安定版に更新する](https://github.com/nekochans/lgtm-cat-frontend/issues/410)

**現在の Linter 警告数**: 69件

## 背景

ultracite@6.5.0 で「Use interface as consistent type definition」が導入され、v6.5.1 で継承されている。

- リリースノート: https://github.com/haydenbleasel/ultracite/releases/tag/ultracite%406.5.0
- ローカル確認: `node_modules/ultracite/config/core/biome.jsonc`

```json
"useConsistentTypeDefinitions": {
  "level": "error",
  "options": {
    "style": "interface"
  }
}
```

**補足**: 本タスクは Issue #410 (依存パッケージ更新) のスコープ内で発生した Linter 警告への対応として実施する。

### 現行ガイドラインとの整合性について

現在の `docs/project-coding-guidelines.md` では「原則として `type` を使用」と記載されている。これは ultracite v6.5.0 以前のデフォルト設定に基づいたガイドラインであった。

ultracite v6.5.0 で Biome のデフォルト設定が `interface` 優先に変更されたため、本移行計画の Phase 1 でガイドラインを更新し、Linter 設定と一致させる。

**注意**: 現行ガイドラインには「Linter (Ultracite/Biome) の推奨に準拠」と記載されているが、これは ultracite v6.5.0 以前の設定を指していた。本移行完了後は、ガイドラインと Linter 設定が整合する。

## 前提条件

- 本計画は ultracite v6.5.1 以降を使用するプロジェクトを対象とする
- TypeScript 5.x 以降を使用している
- Next.js 15.x (App Router) を使用している

## 移行方針

### interface に変換すべき型 (変換対象)

以下のパターンは `interface` に変換する:

1. **単純なオブジェクト型** (Props, Config等)
2. **API レスポンス型** (単純なオブジェクト構造のもの)
3. **Window 拡張型** (intersection を extends に変換)

### type のまま維持すべき型 (変換対象外)

以下のパターンは `type` のまま維持する。

**構文上 interface に変換できないパターン:**

1. **Union 型** (`|` を使用)
2. **Template Literal 型** (`` `${string}` `` 形式)
3. **Branded Types** (`& { readonly __brand: ... }`)
4. **Mapped Types** (`{ [key in ...]: ... }`)
5. **Indexed Access 型** (`(typeof xxx)[number]`)
6. **z.infer 型** (Zod スキーマからの推論)
7. **Conditional 型** (`T extends ... ? ... : ...`)
8. **Union Literal 型** (`"a" | "b" | "c"`)

**運用方針として type を維持するパターン:**

9. **Function 型** (`() => ...`) - interface の call signature でも表現可能だが、可読性と一貫性のため type を使用
10. **Pick/Omit を使用した intersection 型** - intersection を extends に変換する場合、Pick/Omit との組み合わせでは型の意味が変わる可能性があるため type を維持
11. **Storybook Story 型** (`StoryObj<typeof meta>`) - ライブラリの型定義に依存するため変更しない

---

## Linter 警告対象ファイル一覧 (69件)

`npm run lint` の出力に基づく修正対象ファイルの一覧。各ファイル:行番号 を記載。

### src/app/ (6件)

```
src/app/(default)/api/lgtm-images/types.ts:7:24
src/app/(default)/en/page.tsx:41:24
src/app/(default)/error.tsx:8:24
src/app/(default)/page.tsx:41:24
src/app/global-error.tsx:10:24
src/app/layout.tsx:14:24
```

### src/components/ (17件)

```
src/components/error-page-content.tsx:10:24
src/components/footer.tsx:11:2
src/components/header-desktop.tsx:33:24
src/components/header-logo.tsx:10:24
src/components/header-mobile.tsx:42:24
src/components/header-mobile.tsx:55:24
src/components/header-mobile.tsx:95:31
src/components/header-mobile.tsx:181:36
src/components/header.tsx:11:24
src/components/heroui/providers.tsx:11:1
src/components/icons/cat-nyan-icon.tsx:5:24
src/components/icons/copy-icon.tsx:6:6
src/components/icons/github-icon.tsx:6:7
src/components/icons/heart-icon.tsx:5:24
src/components/icons/upload-cloud-icon.tsx:6:24
src/components/lgtm-cat-icon.tsx:5:24
src/components/link-button.tsx:9:4
src/components/login-button.tsx:9:2
src/components/markdown-content.tsx:6:24
src/components/page-layout.tsx:10:24
```

### src/features/ (38件)

```
src/features/__tests__/language/might-extract-language-from-app-path.test.ts:11:20
src/features/__tests__/language/remove-language-from-app-path.test.ts:8:20
src/features/__tests__/open-graph-locale/convert-language-to-open-graph-locale.test.ts:11:20
src/features/__tests__/url/is-include-language-app-path.test.ts:7:20
src/features/docs/components/docs-how-to-use-page.tsx:8:24
src/features/docs/components/docs-mcp-page.tsx:8:24
src/features/errors/components/error-layout.tsx:10:24
src/features/errors/components/error-page.tsx:16:24
src/features/errors/components/maintenance-page.tsx:11:24
src/features/errors/components/not-found-page.tsx:10:24
src/features/errors/error-i18n.ts:7:15
src/features/external-transmission-policy/components/external-transmission-policy-page.tsx:10:24
src/features/link-attribute.ts:5:16
src/features/main/components/home-action-buttons.tsx:40:56
src/features/main/components/home-page.tsx:12:24
src/features/main/components/lgtm-image.tsx:18:24
src/features/main/components/lgtm-images.tsx:7:24
src/features/main/components/service-description.tsx:7:24
src/features/main/components/upload-page.tsx:9:24
src/features/main/functions/__tests__/is-lgtm-image-url.test.ts:8:3
src/features/main/functions/fetch-lgtm-images.ts:46:30
src/features/main/service-description-text.ts:7:7
src/features/main/types/lgtm-image.ts:18:46
src/features/meta-tag.ts:156:55
src/features/oidc/errors/issue-client-credentials-access-token-error.ts:1:1
src/features/privacy/components/privacy-page.tsx:10:24
src/features/terms/components/terms-page.tsx:10:24
src/features/upload/components/upload-drop-area.tsx:22:24
src/features/upload/components/upload-error-message.tsx:6:24
src/features/upload/components/upload-form.tsx:39:42
src/features/upload/components/upload-form.tsx:76:12
src/features/upload/components/upload-notes.tsx:14:24
src/features/upload/components/upload-preview.tsx:16:24
src/features/upload/components/upload-progress.tsx:12:24
src/features/upload/components/upload-success.tsx:28:24
src/features/upload/functions/upload-i18n.ts:260:22
src/features/upload/types/storage.ts:10:2
src/features/upload/types/storage.ts:29:24
```

### src/lib/ (2件)

```
src/lib/cloudflare/r2/presigned-url.ts:31:15
src/lib/cognito/oidc.ts:15:5
```

### src/scripts/ (1件)

```
src/scripts/copy-agents-markdown.ts:17:13
```

### src/utils/ (2件)

```
src/utils/sentry/might-set-request-id-to-sentry-from-error.ts:12:2
src/utils/with-callbacks.ts:25:53
```

---

## 変換対象外のパターン (参考)

以下のパターンは Linter 警告が出ても `type` のまま維持する:

| パターン | 例 | 理由 |
|---------|-----|------|
| Union 型 | `type A = B \| C` | 構文上不可 |
| Template Literal 型 | `` type Id = `${string}` `` | 構文上不可 |
| Branded Types | `type X = string & { __brand }` | 構文上不可 |
| Mapped Types | `type X = { [K in Y]: Z }` | 構文上不可 |
| Indexed Access 型 | `type X = (typeof arr)[number]` | 構文上不可 |
| z.infer 型 | `type X = z.infer<typeof schema>` | 構文上不可 |
| Conditional 型 | `type X = T extends A ? B : C` | 構文上不可 |
| Union Literal 型 | `type X = "a" \| "b"` | 構文上不可 |
| Function 型 | `type F = () => void` | 運用方針 |
| Pick/Omit intersection | `type X = Omit<A> & B` | 運用方針 |
| StoryObj 型 | `type Story = StoryObj<...>` | 運用方針 |

---

## 変換例

### 単純なオブジェクト型の変換

```typescript
// Before
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
};

// After
interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}
```

### Intersection型の変換 (Window拡張)

**注意**: 既存の型/インターフェースを拡張する intersection 型のみ interface に変換可能。
Pick/Omit を使用した intersection は変換不可。

```typescript
// Before (変換可能なケース)
type WindowWithDataLayer = Window & {
  dataLayer?: Record<string, unknown>[];
};

// After
interface WindowWithDataLayer extends Window {
  dataLayer?: Record<string, unknown>[];
}

// 変換不可のケース (Pick/Omit使用)
type Props = Pick<SVGProps<SVGSVGElement>, "className"> & {
  readonly width?: number;
};
// → これは type のまま維持
```

### 変換しない例 (Union型)

```typescript
// 変換しない - Union型はtypeのまま維持
type UploadValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly error: UploadValidationErrorType };
```

### 変換しない例 (Function型)

```typescript
// 変換しない - Function型はtypeのまま維持
type GeneratePresignedPutUrl = (
  contentType: string
) => Promise<PresignedPutUrlResult>;
```

---

## 実装手順

### Phase 1: ドキュメント更新

`docs/project-coding-guidelines.md` の「型定義の原則」セクションを以下のように更新:

#### 変更前 (現行ガイドライン)

```markdown
### Type の使用

原則として **`type`** を使用してください。
```

#### 変更後 (新ガイドライン)

```markdown
### Interface の使用

原則として **`interface`** を使用してください。オブジェクト型の定義には `interface` を使用します。

\`\`\`typescript
// 推奨: interface を使用
interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface Config {
  readonly apiKey: string;
  readonly timeout: number;
}
\`\`\`

### Type を使用すべきケース

以下のパターンでは `type` を使用してください。これらは TypeScript の構文上 `interface` では表現できません:

1. **Union 型**: `type Result = Success | Failure`
2. **Template Literal 型**: `type Id = \`user-${string}\``
3. **Branded Types**: `type UserId = string & { readonly __brand: "userId" }`
4. **Function 型**: `type Handler = (event: Event) => void`
5. **Mapped Types**: `type Keys = { [K in keyof T]: boolean }`
6. **Indexed Access 型**: `type Item = (typeof items)[number]`
7. **z.infer 型**: `type Schema = z.infer<typeof schema>`
8. **Conditional 型**: `type Extract<T> = T extends X ? Y : Z`
9. **Pick/Omit 等のユーティリティ型との組み合わせ**: `type Props = Omit<Base, "id"> & Extra`

\`\`\`typescript
// Union 型 - type を使用
type UploadResult =
  | { readonly success: true; readonly url: string }
  | { readonly success: false; readonly error: string };

// Function 型 - type を使用
type FetchData = (id: string) => Promise<Data>;

// Branded Type - type を使用
type UserId = string & { readonly __brand: "userId" };
\`\`\`
```

### Phase 2: ソースファイル変換

以下の順序で変換を実施 (依存関係を考慮した順序):

1. **src/components/** - 共通Component層 (他の層から依存される) - 17件
2. **src/features/** - ドメイン層 - 38件
3. **src/lib/** - 外部ライブラリ層 - 2件
4. **src/utils/** - ユーティリティ層 - 2件
5. **src/app/** - App Router層 - 6件
6. **src/scripts/** - スクリプト層 - 1件

**注意**: `src/constants/` は今回の警告対象に含まれていないため、変換不要。

#### 各ファイルの変換手順

1. ファイルを開く
2. `type XXX = {` のパターンを探す
3. 変換対象か判定 (Union/Function/Branded/Mapped等は変換しない)
4. 変換対象の場合:
   - `type` を `interface` に変更
   - `=` を削除
   - 末尾の `;` を削除 (interfaceは不要)
   - `export type` は `export interface` に変更

### Phase 3: Storybook ファイル

- `.stories.tsx` ファイルの `Story` 型は **変換対象外** (`StoryObj<typeof meta>` 形式のため)
- 各 stories ファイルに他の型定義 (Props等) があれば個別に判断

### Phase 4: テストファイル

テストファイル内の型定義を個別に確認し、変換可否を判断する。

**対象テストファイル (Linter 警告あり: 5件)**:

| ファイル | 型名 | 判断 |
|---------|------|------|
| `src/features/__tests__/language/might-extract-language-from-app-path.test.ts` | `TestCase` | 変換対象 (単純オブジェクト型) |
| `src/features/__tests__/language/remove-language-from-app-path.test.ts` | `TestCase` | 変換対象 (単純オブジェクト型) |
| `src/features/__tests__/open-graph-locale/convert-language-to-open-graph-locale.test.ts` | `TestCase` | 変換対象 (単純オブジェクト型) |
| `src/features/__tests__/url/is-include-language-app-path.test.ts` | `TestCase` | 変換対象 (単純オブジェクト型) |
| `src/features/main/functions/__tests__/is-lgtm-image-url.test.ts` | `TestCase` | 変換対象 (単純オブジェクト型) |

**判断基準**:
- テスト用の `TestCase` 型は単純なオブジェクト型のため変換対象
- Union 型 (例: `TestActionState`) が含まれる場合は変換対象外

---

## 品質管理手順

変換完了後、以下の順序で品質管理を実施:

1. `npm run format` を実行してコードをフォーマット
2. `npm run lint` を実行して Linter 警告を確認
   - **目標**: `useConsistentTypeDefinitions` 警告が 0件 (変換対象外パターンは警告が出ないはず)
   - **注意**: 変換対象外パターン (Function 型等) に対する警告が残る場合は、Q4/Q5 を参照
3. `npm run test` を実行して全テストがパスすることを確認
4. `npm run build` を実行してビルドエラーがないことを確認
5. Chrome DevTools MCP で `http://localhost:2222` にアクセスして表示確認
6. Chrome DevTools MCP で `http://localhost:6006/` にアクセスして Storybook 表示確認

---

## 変換対象ファイル数の集計

| カテゴリ | Linter 警告数 | 変換対象 (推定) | 変換対象外 (推定) |
|---------|--------------|----------------|------------------|
| src/app/ | 6件 | 約5件 | 約1件 |
| src/components/ | 17件 | 約14件 | 約3件 |
| src/features/ | 38件 | 約30件 | 約8件 |
| src/lib/ | 2件 | 約1件 | 約1件 |
| src/scripts/ | 1件 | 約1件 | 0件 |
| src/utils/ | 2件 | 約2件 | 0件 |
| **合計** | **69件** | **約53件** | **約16件** |

### 集計の算出根拠

- **Linter 警告数 69件**: `npm run lint` の出力から取得
- **変換対象外 (約16件)**: 以下のパターンを含む型を手動で除外
  - Function 型 (例: `GeneratePresignedPutUrl`, `UploadToStorageFunc`)
  - Pick/Omit との intersection 型
  - その他構文上 interface に変換できないパターン
- **変換対象 (約53件)**: 警告数から変換対象外を差し引いた推定値

**備考**: 上記は事前調査に基づく推定値。実際の変換対象数は実装時に各型を確認して確定する。複数警告があるファイル (例: `header-mobile.tsx` に4件) も含まれる。

---

## 注意事項

1. **readonly 修飾子の維持**: 変換時も `readonly` 修飾子は維持すること
2. **export の維持**: `export type` は `export interface` に変換
3. **コメントの維持**: JSDoc コメント等は維持すること
4. **ファイル先頭コメントの維持**: `// 絶対厳守：編集前に必ずAI実装ルールを読む` は維持すること
5. **変換判断に迷う場合**: Union や Function が含まれる場合は `type` のまま維持
6. **import type の維持**: `import type { Props }` は変換後も同じ構文で動作する (変更不要)
7. **Biome の警告について**: 変換対象外のパターン (Union, Function等) に対する警告は Biome が自動判断し、警告を出さない場合がある。ただし全てのケースで正確に判断されるとは限らないため、手動確認を推奨
8. **interface の宣言マージリスク**: interface は同名で複数回宣言すると自動的にマージされる (declaration merging)。変換前に同名の interface が存在しないことを確認すること。本プロジェクトでは Props 等のローカルスコープ型が大半のため、影響は軽微と想定されるが、グローバル型の場合は注意が必要

---

## トラブルシューティング

### Q1: 変換後に型エラーが発生する

A: 以下を確認:
- intersection型 (`&`) を使用していないか確認。使用している場合は `extends` に変換するか、`type` のまま維持
- generics パラメータが正しく設定されているか確認

### Q2: Linter 警告が残る

A: 以下のパターンは変換対象外のため警告が残る場合がある:
- Union型、Function型、Branded Types等は `type` のまま維持が正しい
- Biome の設定で個別にルールを調整することは推奨しない

### Q3: export interface と export type の違い

A:
- `export type Props = {...}` → `export interface Props {...}`
- import 側: `import type { Props }` は両方で使用可能

### Q4: 変換対象外なのに Linter 警告が出る

A: Biome は全ての変換対象外パターンを正確に検出できるとは限らない。以下の対応を取る:
- 警告が出ているファイルを開き、該当の型定義を確認
- Union 型、Function 型、Branded Types 等の変換対象外パターンに該当する場合は `type` のまま維持
- 本設計書の「変換対象外のパターン」セクションを参照して判断
- 最終的に変換対象外パターンの警告が残っても、それは期待どおりの動作である

### Q5: 変換完了後も警告が残っている

A: 以下のケースでは警告が残ることがある:
- Function 型 (例: `GeneratePresignedPutUrl`)
- Pick/Omit を使用した intersection 型
- その他の変換対象外パターン

これらは意図的に `type` のまま維持しているため、警告が残っても問題ない。品質管理の「警告0件」目標は、変換対象外パターンを除いた警告が0件であることを意味する。

---

## 実装チェックリスト

### 準備フェーズ
- [ ] `npm run lint` で現在の警告数を確認 (69件であること)

### Phase 1: ドキュメント更新
- [ ] `docs/project-coding-guidelines.md` の「型定義の原則」セクションを更新

### Phase 2: ソースファイル変換
- [ ] src/components/ の変換完了
- [ ] src/features/ の変換完了
- [ ] src/lib/ の変換完了
- [ ] src/utils/ の変換完了
- [ ] src/app/ の変換完了
- [ ] src/scripts/ の変換完了

### Phase 3-4: その他
- [ ] Storybook ファイルの確認完了
- [ ] テストファイルの確認完了

### 品質管理
- [ ] `npm run format` 実行完了
- [ ] `npm run lint` 実行完了 (`useConsistentTypeDefinitions` 警告が 0件、または変換対象外のみ)
- [ ] `npm run test` 実行完了 (全テストパス)
- [ ] `npm run build` 実行完了 (ビルドエラーなし)
- [ ] localhost:2222 表示確認完了
- [ ] localhost:6006 Storybook 表示確認完了

---

## 参考資料

- [TypeScript Handbook - Interfaces vs Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [Biome useConsistentTypeDefinitions](https://biomejs.dev/linter/rules/use-consistent-type-definitions/)
- ultracite v6.5.1: `node_modules/ultracite/config/core/biome.jsonc`

---

## 更新履歴

| 日付 | バージョン | 内容 |
|------|----------|------|
| 2026-01-01 | 1.0 | 初版作成 |
| 2026-01-01 | 1.1 | oidc types 追加、実装手順詳細化、チェックリスト追加 |
| 2026-01-01 | 1.2 | I18nUrlList を変換対象外へ修正 (Mapped Type)、注意事項追加 |
| 2026-01-01 | 1.3 | レビュー反映: Issue #410 参照追加、ultracite リリースノート出典追加、Function 型の運用判断明記、interface 宣言マージリスク追記、Linter 出力に基づくファイル一覧へ簡素化 |
| 2026-01-01 | 1.4 | 第1回レビュー反映: 現行ガイドラインとの整合性説明追加、集計の算出根拠明確化、テストファイル判断表追加、チェックリスト簡素化 |
| 2026-01-01 | 1.5 | 第2回レビュー反映: Phase 2 から src/constants/ 削除、警告件数を各層に追記、トラブルシューティング Q4/Q5 追加、品質管理手順の警告目標を明確化 |
| 2026-01-01 | 1.6 | 第3回レビュー反映: 集計表の数値を修正 (合計69件と整合)、算出根拠の例を簡潔化、備考に複数警告ファイルの説明追加 |
