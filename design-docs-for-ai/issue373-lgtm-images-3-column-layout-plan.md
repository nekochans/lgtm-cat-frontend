# Issue #373: LGTM画像を3カラムまで表示するように変更 - 詳細実装計画書

## 概要

### 目的

LGTM画像の表示を3カラムレイアウトに変更し、ファーストビューで全ての画像が見えるようにする。

### 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/373

### 技術スタック

- **フレームワーク**: Next.js 16 App Router
- **React**: v19
- **スタイリング**: Tailwind CSS 4

---

## 現状分析

### 現在のレイアウト構成

| 項目 | 現在の値 | ファイル |
|------|---------|----------|
| コンテナ最大幅 | `max-w-[1020px]` | `home-page.tsx` |
| 個別画像最大幅 | `max-w-[390px]` | `lgtm-image.tsx` |
| 画像の高さ | `h-[220px]` | `lgtm-image.tsx` |
| 画像間のギャップ | `gap-[24px]` | `lgtm-images.tsx` |
| 画像表示レイアウト | `flex flex-wrap` | `lgtm-images.tsx` |
| 表示画像数 | 9枚 | API仕様 |

### 現在の問題点

1. **カラム数が固定されていない**: `flex flex-wrap` により画面幅に応じて自動的にカラム数が変動
2. **3カラム表示に必要な幅が不足**: 390px × 3 + 24px × 2 = 1218px > 1020px (現在のコンテナ幅)
3. **ファーストビューで全画像が見えない可能性**: カラム数が少ないと縦に長くなりスクロールが必要

### 関連ファイル構成

```text
src/features/main/components/
├── lgtm-images.tsx          # 画像グリッドコンテナ (変更対象)
├── lgtm-images.stories.tsx  # Storybook (確認対象)
├── lgtm-image.tsx           # 個別画像コンポーネント (変更なし)
├── lgtm-image.stories.tsx   # Storybook (確認対象)
└── home-page.tsx            # ホームページ (変更対象)
```

---

## 設計方針

### アプローチ

**コンテナ幅拡張 + CSSグリッドレイアウト** を採用する。

### レスポンシブ設計

| ブレイクポイント | 画面幅 | カラム数 | 説明 |
|-----------------|--------|---------|------|
| モバイル | < 768px (md未満) | 1カラム | スマートフォン向け |
| タブレット | 768px - 1024px (md〜lg) | 2カラム | タブレット向け |
| デスクトップ | > 1024px (lg以上) | 3カラム | PC向け |

### サイズ計算

**3カラム表示に必要な最小幅**:
- 画像幅: 390px × 3 = 1170px
- ギャップ: 24px × 2 = 48px
- 合計: 1218px

**home-page.tsx のパディングを考慮**:
- 現在の px-[40px] を維持する場合: 1218px + 80px = 1298px
- `max-w-[1300px]` を採用

---

## 変更内容

### 1. LgtmImages コンポーネントの変更

**ファイルパス**: `src/features/main/components/lgtm-images.tsx`

#### 変更概要

`flex flex-wrap` から CSS Grid に変更し、レスポンシブでカラム数を制御する。

#### 変更前のコード

```tsx
export function LgtmImages({ hideHeartIcon, images }: Props): JSX.Element {
  return (
    <div className="flex w-full flex-wrap content-center items-center justify-center gap-[24px]">
      {images.map((image) => (
        <LgtmImage hideHeartIcon={hideHeartIcon} key={image.id} {...image} />
      ))}
    </div>
  );
}
```

#### 変更後のコード

```tsx
export function LgtmImages({ hideHeartIcon, images }: Props): JSX.Element {
  return (
    <div className="grid w-full grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <LgtmImage hideHeartIcon={hideHeartIcon} key={image.id} {...image} />
      ))}
    </div>
  );
}
```

#### 変更点の詳細

| 変更前 | 変更後 | 理由 |
|--------|--------|------|
| `flex flex-wrap` | `grid` | グリッドレイアウトで明示的にカラム数を制御 |
| `gap-[24px]` | `gap-6` | Tailwindの標準値 (24px = 6 * 4px) |
| - | `grid-cols-1` | モバイルでは1カラム |
| - | `md:grid-cols-2` | タブレットでは2カラム |
| - | `lg:grid-cols-3` | デスクトップでは3カラム |
| `content-center items-center justify-center` | `justify-items-center` | グリッドアイテムの中央揃え |

### 2. HomePage コンポーネントの変更

**ファイルパス**: `src/features/main/components/home-page.tsx`

#### 変更概要

コンテナの最大幅を拡張して、3カラム表示に対応する。

#### 変更前のコード (関連部分)

```tsx
<div className="flex w-full max-w-[1020px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
```

#### 変更後のコード

```tsx
<div className="flex w-full max-w-[1300px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
```

#### 変更点の詳細

| 変更前 | 変更後 | 理由 |
|--------|--------|------|
| `max-w-[1020px]` | `max-w-[1300px]` | 3カラム (1218px) + 左右パディング (80px) + 余裕 |

---

## 修正対象ファイル一覧

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/features/main/components/lgtm-images.tsx` | flexからgridへ変更、レスポンシブカラム設定 |
| `src/features/main/components/home-page.tsx` | max-w-[1020px] → max-w-[1300px] |

---

## 変更しないファイル

以下のファイルは変更不要:

| ファイルパス | 理由 |
|-------------|------|
| `src/features/main/components/lgtm-image.tsx` | 個別画像のサイズは維持 (max-w-[390px], h-[220px]) |
| `src/features/main/components/random-lgtm-images.tsx` | LgtmImages を使用しているだけで変更不要 |
| `src/features/main/components/latest-lgtm-images.tsx` | LgtmImages を使用しているだけで変更不要 |
| `src/features/main/components/lgtm-images.stories.tsx` | Storybook は変更不要 (表示確認のみ) |
| `src/features/main/components/lgtm-image.stories.tsx` | 変更なし |

---

## 実装順序

以下の順序で実装を進めること:

### Step 1: LgtmImages コンポーネントの変更

1. `src/features/main/components/lgtm-images.tsx` を開く
2. `flex flex-wrap content-center items-center justify-center gap-[24px]` を `grid w-full grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3` に変更

### Step 2: HomePage コンポーネントの変更

3. `src/features/main/components/home-page.tsx` を開く
4. `max-w-[1020px]` を `max-w-[1300px]` に変更

### Step 3: 品質管理

5. `npm run format` を実行
6. `npm run lint` を実行
7. `npm run test` を実行
8. 開発サーバーでの表示確認 (Chrome DevTools MCP)
9. Storybookでの表示確認 (Chrome DevTools MCP)

---

## 品質管理手順

実装完了後、**必ず以下の順番** で品質管理を実行すること:

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

#### レスポンシブ確認

| 確認項目 | 確認内容 |
|---------|----------|
| **デスクトップ (1280px以上)** | 3カラムで表示されている |
| **タブレット (768px - 1024px)** | 2カラムで表示されている |
| **モバイル (768px未満)** | 1カラムで表示されている |

#### 表示確認チェックリスト

**注意**: ホームページには `view` プロパティがあり、`"random"` (RandomLgtmImages) または `"latest"` (LatestLgtmImages) が表示される。両方のページでレイアウトが正常に動作することを確認すること。

- [ ] `/` (日本語版ホームページ - random view) で3カラム表示されている
- [ ] `/en` (英語版ホームページ - random view) で3カラム表示されている
- [ ] 9枚の画像が3行3列で表示されている
- [ ] 画像間のギャップが適切に設定されている (24px)
- [ ] 画像のクリック (マークダウンコピー) が正常に動作する
- [ ] コピーアイコンが正常に表示される (ハートアイコンは現在 `hideHeartIcon={true}` で非表示)
- [ ] ファーストビューで全ての画像が見える (デスクトップ表示時)

#### レスポンシブ確認チェックリスト

Chrome DevTools のデバイスツールバーを使用して確認:

- [ ] iPhone SE (375px幅): 1カラムで表示
- [ ] iPad (768px幅): 2カラムで表示
- [ ] Desktop (1280px幅): 3カラムで表示

### 5. Storybookでの表示確認

Chrome DevTools MCP を使って `http://localhost:6006/` にアクセスし、以下を確認:

**注意**: Storybook では title が明示的に設定されていないため、コンポーネント名から自動生成される。サイドバーで `Lgtm Images` または類似の名前を探すこと。

- [ ] Default ストーリーが正常に表示される (9枚の画像)
- [ ] FewImages ストーリーが正常に表示される (3枚で1行)
- [ ] HiddenHeartIcon ストーリーが正常に表示される (ハートアイコンなし)
- [ ] Empty ストーリーが正常に表示される (画像なし、空のグリッド)
- [ ] Storybook のビューポートを変更してレスポンシブ表示を確認
- [ ] グリッドレイアウトがStorybook の `layout: "padded"` 設定と正常に共存している

---

## 禁止事項

1. **依頼内容に関係のない無駄な修正を行う行為は絶対に禁止**
2. **新しいパッケージのインストール禁止**
3. **lgtm-image.tsx の画像サイズ変更禁止** (max-w-[390px], h-[220px] は維持)
4. **APIレスポンスや画像取得ロジックの変更禁止**
5. **テストコードの上書き禁止** - テストが失敗する場合は実装を修正

---

## 成功基準

以下を全て満たすこと:

### レイアウト変更

- [ ] `LgtmImages` コンポーネントが CSS Grid を使用している
- [ ] デスクトップ表示 (lg以上) で3カラム表示になっている
- [ ] タブレット表示 (md〜lg) で2カラム表示になっている
- [ ] モバイル表示 (md未満) で1カラム表示になっている
- [ ] コンテナ幅が `max-w-[1300px]` に拡張されている

### 視覚的確認

- [ ] ファーストビューで9枚の画像が3行3列で見える (デスクトップ)
- [ ] 画像間のギャップが適切 (24px = gap-6)
- [ ] 画像が中央揃えになっている

### 機能確認

- [ ] 画像クリックでマークダウンがコピーされる
- [ ] コピーアイコンクリックでマークダウンがコピーされる
- [ ] "Copied!" メッセージが表示される
- [ ] 全てのアニメーション・トランジションが正常に動作する

### CI/テスト

- [ ] `npm run format` が正常に完了する
- [ ] `npm run lint` がエラー0で完了する
- [ ] `npm run test` が全てパスする

---

## 技術的な補足

### グリッドレイアウトでの画像の動作

**重要**: `LgtmImage` コンポーネントには `flex-none` クラスがありますが、親要素がグリッドレイアウト (`display: grid`) に変更されるため、`flex-none` は影響を与えません。これは既存のコードを変更しないための設計判断です。

**グリッドセル内での画像の動作**:
1. グリッドの各セルは `minmax(0, 1fr)` で定義される (grid-cols-* のデフォルト動作)
2. `LgtmImage` コンポーネントの `w-full max-w-[390px]` により、画像はセル幅いっぱいに広がるが最大390pxに制限される
3. `justify-items-center` により、画像がグリッドセル内で水平方向に中央揃えになる

### gap-6 と gap-[24px] の等価性

Tailwind CSS 4 では:
- `gap-6` = `gap: 1.5rem`
- デフォルトのベースフォントサイズ 16px の場合: 1.5rem = 24px
- したがって `gap-6` と `gap-[24px]` は同等

**注意**: `gap-[24px]` から `gap-6` への変更は視覚的に同一であり、Tailwind の標準ユーティリティを使用することでビルドサイズの最適化に貢献する。

---

## 補足情報

### Tailwind CSS 4 のグリッドユーティリティ

本実装で使用するグリッドユーティリティ:

| クラス | 説明 |
|--------|------|
| `grid` | display: grid を設定 |
| `grid-cols-1` | grid-template-columns: repeat(1, minmax(0, 1fr)) |
| `grid-cols-2` | grid-template-columns: repeat(2, minmax(0, 1fr)) |
| `grid-cols-3` | grid-template-columns: repeat(3, minmax(0, 1fr)) |
| `gap-6` | gap: 1.5rem (24px) |
| `justify-items-center` | justify-items: center |

### Tailwind CSS 4 のブレイクポイント

| プレフィックス | 最小幅 | CSS |
|---------------|--------|-----|
| `sm` | 640px | @media (min-width: 640px) |
| `md` | 768px | @media (min-width: 768px) |
| `lg` | 1024px | @media (min-width: 1024px) |
| `xl` | 1280px | @media (min-width: 1280px) |
| `2xl` | 1536px | @media (min-width: 1536px) |

---

## トラブルシューティング

### 画像が水平方向に中央揃えにならない場合

`justify-items-center` が正しく適用されているか確認すること。グリッドコンテナに `grid` クラスが付与されていないと `justify-items-center` は効かない。

### 3カラム表示にならない場合

1. ブラウザのビューポート幅が 1024px 以上か確認
2. `lg:grid-cols-3` が正しく記述されているか確認
3. 開発者ツールで適用されている CSS を確認

### 画像サイズが崩れる場合

`LgtmImage` コンポーネントの `max-w-[390px]` と `h-[220px]` が維持されているか確認すること。これらの値は変更しないこと。

### Storybook で表示が崩れる場合

Storybook の `layout: "padded"` 設定により、パディングが追加される。これはグリッドレイアウトに影響しないが、表示幅が狭くなる可能性がある。Storybook のビューポートを広げて確認すること。
