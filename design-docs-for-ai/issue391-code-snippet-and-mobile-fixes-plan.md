# Issue #391: コードブロックのコピーボタン表示とモバイルビューのデザイン崩れ修正 - 詳細実装計画書

## 概要

### 目的

既に実装されているMCPドキュメントページに対して、以下の2つの問題を修正する:

1. **コードブロックにコピーアイコンが表示されない問題の修正**
2. **モバイルビューでのデザイン崩れ修正** - 「GitHub Actionsで LGTM画像を自動コメントする」セクションタイトルの短縮

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/391

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: HeroUI v2.8.7 (Snippet コンポーネント)
- **シンタックスハイライト**: prism-react-renderer

---

## 実装前の確認事項

実装を開始する前に、以下の点を確認すること:

1. **開発サーバーの起動**: `npm run dev` を実行し、`http://localhost:2222` でサーバーが起動していること
2. **現在の問題の再現確認**: `http://localhost:2222/docs/mcp` にアクセスし、コピーボタンが表示されないことを目視確認
3. **モバイル表示の確認**: Chrome DevTools のデバイスエミュレーションで iPhone 14 Pro Max (430px) を選択し、レイアウト崩れを確認

---

## 現状分析

### 問題1: コードブロックにコピーアイコンが表示されない

**スクリーンショット確認結果**: 1枚目と2枚目のスクリーンショットでコードブロックの右上に表示されるはずのコピーボタンが見えない。

**現在のコード** (`src/features/docs/components/code-snippet.tsx` 171-192行目):

```typescript
return (
  <Snippet
    className="w-full max-w-full"
    classNames={{
      base: "bg-orange-50 border border-orange-200 overflow-hidden",
      pre: "font-mono whitespace-pre text-sm",
      copyButton: "text-orange-600 hover:text-orange-800",
      content: "overflow-x-auto max-w-full",
    }}
    codeString={code}
    hideSymbol
    variant="flat"
  >
    {isPrismReady ? (
      <HighlightedCode code={code} language={prismLanguage} />
    ) : (
      code
    )}
  </Snippet>
);
```

**原因分析（DOM調査による事実確認済み）**:

Chrome DevTools MCP で実際のDOM構造とスタイルを調査した結果、以下が判明:

1. **コピーボタンは存在している**:
   - `buttonExists: true`
   - `buttonDisplay: "flex"`
   - `buttonVisibility: "visible"`
   - `buttonOpacity: "1"`
   - `buttonWidth: "32px"`

2. **ボタンの位置が親要素の範囲外に押し出されている**:
   - 親要素（base）の幅: 468px（left: 16 ~ right: 484）
   - preの幅: 859px（親要素の約1.8倍！）
   - ボタンの位置: left: 896px ~ right: 928px（親要素の右端484pxより外側）
   - `buttonInsideParent: false` - ボタンは完全に親要素の範囲外

3. **根本原因**:
   - HeroUI Snippetの`base`は`inline-flex items-center justify-between`でレイアウトされている
   - `copyButton`は`position: absolute`**ではなく**、`position: relative`のflex子要素
   - `pre`に`whitespace-pre`があるため内容が折り返さず水平方向に拡大
   - `pre`に`min-w-0`がないためflex子要素として縮小できない
   - その結果、`pre`が親要素をはみ出してボタンを押し出し、`overflow-hidden`でクリップされて見えなくなっている

**HeroUI Snippet の内部構造（実際のDOM調査結果）**:

```
<div class="base inline-flex items-center justify-between ...">
  <pre class="pre whitespace-pre ...">
    {children}
  </pre>
  <button class="copyButton relative z-10 ...">
    <!-- コピーアイコン -->
  </button>
</div>
```

**重要**: コピーボタンは`position: absolute`**ではなく**、`base`のflex子要素として配置されている。

**解決策**:

`pre`がflex子要素として縮小できるようにし、`copyButton`が縮小されないようにする:

1. `pre`に`min-w-0`を追加 - flex子要素として縮小可能にする
2. `pre`に`overflow-x-auto`を追加 - 横スクロールを有効にする
3. `copyButton`に`shrink-0`を追加 - ボタンが縮小されないようにする
4. `overflow-hidden`は維持 - コンテンツのはみ出しを防止するため必要
5. `content`スロットは維持 - 将来の複数行対応のため（レビュー指摘対応）

### 問題2: モバイルビューでのデザイン崩れ

**スクリーンショット確認結果**: 3枚目のスクリーンショット（iPhone 14 Pro Max, 430px幅）で「Auto-comment LGTM Images with GitHub Actions」セクションタイトルが長すぎてレイアウトが崩れている。

**現在の文言** (`src/features/docs/functions/mcp-text.ts`):

- 日本語: `"GitHub Actionsで LGTM画像を自動コメントする"` (28文字)
- 英語: `"Auto-comment LGTM Images with GitHub Actions"` (45文字)

**解決策**:

セクションタイトルを以下のように短縮する:

- 日本語: `"GitHub Actions連携"` (14文字)
- 英語: `"GitHub Actions Integration"` (26文字)

**短縮理由**:

- 「LGTM画像を自動コメントする」という詳細は、セクション内の説明文で十分に伝わる
- 「連携」「Integration」はより簡潔で、モバイルでも1行に収まりやすい

---

## 修正対象ファイル一覧

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/docs/components/code-snippet.tsx` | `pre`に`min-w-0`追加、`copyButton`に`shrink-0`追加、コピーボタンの可視性確保 |
| `src/features/docs/functions/mcp-text.ts` | GitHub Actionsセクションタイトルの短縮 |
| `src/features/docs/__tests__/functions/mcp-text.test.ts` | テストの期待値更新（タイトル変更に伴う）|

---

## 変更内容

### 1. src/features/docs/components/code-snippet.tsx の修正

**ファイルパス**: `src/features/docs/components/code-snippet.tsx`

#### 1-1. plaintext の場合 (行148-165付近)

**変更前**:

```typescript
if (language === "plaintext") {
  return (
    <Snippet
      className="w-full max-w-full"
      classNames={{
        base: "bg-orange-50 border border-orange-200 overflow-hidden",
        pre: "font-mono text-orange-900 whitespace-pre text-sm",
        copyButton: "text-orange-600 hover:text-orange-800",
        content: "overflow-x-auto max-w-full",
      }}
      hideSymbol
      variant="flat"
    >
      {code}
    </Snippet>
  );
}
```

**変更後**:

```typescript
if (language === "plaintext") {
  return (
    <Snippet
      className="w-full max-w-full"
      classNames={{
        base: "bg-orange-50 border border-orange-200 overflow-hidden",
        pre: "font-mono text-orange-900 whitespace-pre text-sm min-w-0 overflow-x-auto",
        copyButton: "text-orange-600 hover:text-orange-800 shrink-0",
        content: "overflow-x-auto max-w-full min-w-0",
      }}
      hideSymbol
      variant="flat"
    >
      {code}
    </Snippet>
  );
}
```

**変更ポイント**:

1. `base`の`overflow-hidden`は維持（コンテンツのはみ出し防止に必要）
2. `pre`に`min-w-0`を追加（flex子要素として縮小可能にする）
3. `pre`に`overflow-x-auto`を追加（横スクロールを有効にする）
4. `copyButton`に`shrink-0`を追加（ボタンが縮小されないようにする）
5. `content`スロットに`min-w-0`を追加（将来の複数行対応のため維持しつつ縮小可能に）

#### 1-2. シンタックスハイライト付きの場合 (行171-192)

**変更前**:

```typescript
return (
  <Snippet
    className="w-full max-w-full"
    classNames={{
      base: "bg-orange-50 border border-orange-200 overflow-hidden",
      pre: "font-mono whitespace-pre text-sm",
      copyButton: "text-orange-600 hover:text-orange-800",
      content: "overflow-x-auto max-w-full",
    }}
    codeString={code}
    hideSymbol
    variant="flat"
  >
    {isPrismReady ? (
      <HighlightedCode code={code} language={prismLanguage} />
    ) : (
      code
    )}
  </Snippet>
);
```

**変更後**:

```typescript
return (
  <Snippet
    className="w-full max-w-full"
    classNames={{
      base: "bg-orange-50 border border-orange-200 overflow-hidden",
      pre: "font-mono whitespace-pre text-sm min-w-0 overflow-x-auto",
      copyButton: "text-orange-600 hover:text-orange-800 shrink-0",
      content: "overflow-x-auto max-w-full min-w-0",
    }}
    codeString={code}
    hideSymbol
    variant="flat"
  >
    {isPrismReady ? (
      <HighlightedCode code={code} language={prismLanguage} />
    ) : (
      code
    )}
  </Snippet>
);
```

**変更ポイント**:

1. `base`の`overflow-hidden`は維持
2. `pre`に`min-w-0`を追加（flex子要素として縮小可能にする）
3. `pre`に`overflow-x-auto`を追加（横スクロールを有効にする）
4. `copyButton`に`shrink-0`を追加（ボタンが縮小されないようにする）
5. `content`スロットに`min-w-0`を追加

---

### 2. src/features/docs/functions/mcp-text.ts の修正

**ファイルパス**: `src/features/docs/functions/mcp-text.ts`

#### 2-1. 日本語版 (行173行目付近)

**変更前**:

```typescript
githubActions: {
  title: "GitHub Actionsで LGTM画像を自動コメントする",
```

**変更後**:

```typescript
githubActions: {
  title: "GitHub Actions連携",
```

#### 2-2. 英語版 (行287行目付近)

**変更前**:

```typescript
githubActions: {
  title: "Auto-comment LGTM Images with GitHub Actions",
```

**変更後**:

```typescript
githubActions: {
  title: "GitHub Actions Integration",
```

---

### 3. src/features/docs/__tests__/functions/mcp-text.test.ts の修正

**ファイルパス**: `src/features/docs/__tests__/functions/mcp-text.test.ts`

**重要**: セクションタイトルをテストで完全一致検証しているため、テストの期待値も更新が必要。

#### 3-1. テストテーブルの更新 (行16-19付近)

**変更前**:

```typescript
it.each`
  language | expectedOverviewTitle    | expectedAvailableToolsTitle | expectedClientConfigTitle      | expectedGithubActionsTitle
  ${"ja"}  | ${"LGTMeow MCPサーバー"} | ${"利用可能ツール"}         | ${"MCPクライアントの設定方法"} | ${"GitHub Actionsで LGTM画像を自動コメントする"}
  ${"en"}  | ${"LGTMeow MCP Server"}  | ${"Available Tools"}        | ${"MCP Client Configuration"}  | ${"Auto-comment LGTM Images with GitHub Actions"}
`(
```

**変更後**:

```typescript
it.each`
  language | expectedOverviewTitle    | expectedAvailableToolsTitle | expectedClientConfigTitle      | expectedGithubActionsTitle
  ${"ja"}  | ${"LGTMeow MCPサーバー"} | ${"利用可能ツール"}         | ${"MCPクライアントの設定方法"} | ${"GitHub Actions連携"}
  ${"en"}  | ${"LGTMeow MCP Server"}  | ${"Available Tools"}        | ${"MCP Client Configuration"}  | ${"GitHub Actions Integration"}
`(
```

---

## 実装順序

以下の順序で実装を進めること:

### Phase 1: code-snippet.tsx の修正

1. `src/features/docs/components/code-snippet.tsx` を修正
   - plaintext ブロック: `pre`に`min-w-0 overflow-x-auto`追加、`copyButton`に`shrink-0`追加、`content`に`min-w-0`追加
   - シンタックスハイライトブロック: 同様の修正

### Phase 2: mcp-text.ts とテストファイルの修正

2. `src/features/docs/functions/mcp-text.ts` を修正
   - 日本語版: `"GitHub Actions連携"`
   - 英語版: `"GitHub Actions Integration"`

3. `src/features/docs/__tests__/functions/mcp-text.test.ts` を修正
   - テストテーブルの期待値を新しいタイトルに更新

### Phase 3: 品質管理

4. `npm run format` を実行
5. `npm run lint` を実行
6. `npm run test` を実行
7. Chrome DevTools MCP で `http://localhost:2222/docs/mcp` の表示確認
   - コピーボタンが表示されていること
   - コピーボタンが正常に動作すること
   - コードブロックがはみ出さないこと
8. Chrome DevTools MCP で `http://localhost:2222/en/docs/mcp` の英語版表示確認
9. モバイルビュー (iPhone 14 Pro Max, 430px) で確認
   - GitHub Actionsセクションタイトルが1行に収まること
   - レイアウト崩れがないこと
10. Chrome DevTools MCP で `http://localhost:6006/` のStorybook表示確認

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

Chrome DevTools MCP を使って以下のURLにアクセスし確認:

#### デスクトップ表示 (`http://localhost:2222/docs/mcp`)

- [ ] コピーボタンがコードブロックの右上に表示される
- [ ] コピーボタンをクリックするとコードがクリップボードにコピーされる
- [ ] コードブロックの横スクロールが正常に動作する
- [ ] コードがコンテナからはみ出さない

#### 英語版 (`http://localhost:2222/en/docs/mcp`)

- [ ] 日本語版と同様の確認項目
- [ ] セクションタイトルが「GitHub Actions Integration」と表示される

#### モバイル表示 (iPhone 14 Pro Max, 430px)

- [ ] 「GitHub Actions連携」セクションタイトルが1行に収まる
- [ ] レイアウト崩れがない
- [ ] コピーボタンが表示される
- [ ] コードブロックの横スクロールが動作する

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし確認:

- [ ] DocsMcpPage コンポーネントが正常に表示される
- [ ] コピーボタンが表示される

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **既存のテストファイルの削除禁止**
3. **テストの期待値以外の部分を変更することは禁止** (テストロジックの変更は不要、期待値のみ更新)

---

## 成功基準

以下を全て満たすこと:

### 機能要件

- [ ] コピーボタンがコードブロックの右上に表示される
- [ ] コピーボタンが正常に動作する（クリックでコードがクリップボードにコピーされる）
- [ ] コードブロックの横スクロールが維持される
- [ ] GitHub Actionsセクションタイトルがモバイルで1行に収まる

### 品質要件

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

### 表示確認

- [ ] デスクトップ表示で正常動作
- [ ] モバイル表示で正常動作
- [ ] Storybookで正常表示

---

## トラブルシューティング

### コピーボタンがまだ表示されない場合

1. `pre`に`min-w-0`が正しく設定されているか確認
2. `copyButton`に`shrink-0`が正しく設定されているか確認
3. ブラウザの開発者ツールでコピーボタン要素を検索し、位置を確認

**ブラウザ開発者ツールでの詳細確認手順**:

1. Chrome DevTools を開く (F12 または Cmd+Option+I)
2. Elements パネルで Snippet コンポーネントを探す
3. `<button>` 要素（コピーボタン）を選択
4. Computed タブで以下を確認:
   - `display` が `none` でないこと
   - `visibility` が `hidden` でないこと
   - `opacity` が `0` でないこと
   - `flex-shrink` が `0` であること（縮小されない）
5. ボタンの位置（getBoundingClientRect）が親要素の範囲内にあることを確認
6. `pre`要素の`min-width`が`0`または`0px`であることを確認

### 横スクロールが動作しない場合

1. `pre` に `overflow-x-auto` が設定されているか確認
2. `whitespace-pre` が設定されているか確認
3. 親要素の幅制限が正しく設定されているか確認

### モバイルでまだレイアウトが崩れる場合

1. セクションタイトルの文字数を確認
2. フォントサイズやパディングの影響を確認
3. 必要に応じてタイトルをさらに短縮

---

## 実装チェックリスト

実装時に使用するチェックリスト。完了したらチェックを入れる:

### Phase 1: code-snippet.tsx の修正

- [ ] plaintext ブロックの `classNames` を修正
  - [ ] `pre` に `min-w-0` を追加（flex子要素として縮小可能にする）
  - [ ] `pre` に `overflow-x-auto` を追加（横スクロールを有効にする）
  - [ ] `copyButton` に `shrink-0` を追加（ボタンが縮小されないようにする）
  - [ ] `content` に `min-w-0` を追加
- [ ] シンタックスハイライトブロックの `classNames` を修正
  - [ ] `pre` に `min-w-0` を追加
  - [ ] `pre` に `overflow-x-auto` を追加
  - [ ] `copyButton` に `shrink-0` を追加
  - [ ] `content` に `min-w-0` を追加

### Phase 2: mcp-text.ts とテストファイルの修正

- [ ] `mcp-text.ts` の日本語版タイトルを `"GitHub Actions連携"` に変更
- [ ] `mcp-text.ts` の英語版タイトルを `"GitHub Actions Integration"` に変更
- [ ] `mcp-text.test.ts` のテストテーブルの期待値を更新
  - [ ] 日本語版: `${"GitHub Actions連携"}`
  - [ ] 英語版: `${"GitHub Actions Integration"}`

### Phase 3: 品質管理

- [ ] `npm run format` を実行して完了
- [ ] `npm run lint` がエラー0で完了
- [ ] `npm run test` が全テストパス
- [ ] Chrome DevTools MCP でデスクトップ表示確認完了
- [ ] Chrome DevTools MCP で英語版表示確認完了
- [ ] Chrome DevTools MCP でモバイル表示確認完了
- [ ] Chrome DevTools MCP でStorybook表示確認完了

### 最終確認

- [ ] コピーボタンが表示される
- [ ] コピー機能が動作する
- [ ] 横スクロールが動作する
- [ ] モバイルでレイアウト崩れがない
- [ ] 不要な変更が含まれていない

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0 | 2026-01-18 | 初版作成 |
| 1.1 | 2026-01-18 | レビュー1回目: テストファイル修正の追加、禁止事項の明確化 |
| 1.2 | 2026-01-18 | レビュー2回目: 代替案の追加、HeroUI Snippet内部構造の説明追加 |
| 1.3 | 2026-01-18 | レビュー3回目: 実装前確認事項追加、行番号修正、トラブルシューティング詳細化 |
| 2.0 | 2026-01-18 | レビュー反映: DOM調査に基づく原因分析の全面修正。copyButtonはabsoluteではなくflex子要素であることを確認。preの縮小制御(min-w-0)とcopyButtonの縮小防止(shrink-0)による解決策に変更。contentスロットは将来の複数行対応のため維持。 |
