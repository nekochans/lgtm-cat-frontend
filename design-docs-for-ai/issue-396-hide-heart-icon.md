# Issue #396: LGTM画像内のハートアイコンを一時的に隠す - 実装計画

## 概要

LgtmImageコンポーネントのハートアイコン (お気に入りボタン) を一時的に非表示にする機能を実装する。
これはログイン機能およびお気に入り機能実装までの一時的な対応であり、実装後は `hideHeartIcon` Propsおよび関連するTODOコメントを削除する。

## 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/396

## Done の定義

- [ ] お気に入り機能がまだ実装されていないのでハートアイコンが一時的に非表示になっている事

---

## 変更対象サマリー

- **LgtmImageコンポーネント階層**: 4ファイル
- **Storybook**: 2ファイル
- **合計**: 6ファイル

---

## ハートアイコンの現在の位置

実装前にハートアイコンの位置を確認しておくこと:

- **デスクトップ (768px以上)**: 各LGTM画像にマウスホバーすると、画像右上にコピーアイコンとハートアイコンが表示される
- **モバイル (768px未満)**: 各LGTM画像の右上に常にコピーアイコンとハートアイコンが表示されている

---

## コンポーネント階層構造

```
LatestLgtmImages / RandomLgtmImages (Server Components)
    └── LgtmImages
          └── LgtmImage (ハートアイコンを非表示にする対象)
```

Propsは上位から下位へ伝播させる:
1. `LatestLgtmImages` / `RandomLgtmImages` で `hideHeartIcon={true}` を設定
2. `LgtmImages` で受け取り、各 `LgtmImage` に渡す
3. `LgtmImage` で `hideHeartIcon` が `true` の場合にハートアイコンを非表示

---

## 対象ファイル一覧

### LgtmImageコンポーネント階層 (Props追加 + 非表示ロジック)

| ファイルパス | 変更内容 |
|-------------|---------|
| `src/features/main/components/lgtm-image.tsx` | Props型に `hideHeartIcon` を追加、ハートアイコンを条件付きで非表示 |
| `src/features/main/components/lgtm-images.tsx` | Props型に `hideHeartIcon` を追加、各LgtmImageに渡す |
| `src/features/main/components/latest-lgtm-images.tsx` | LgtmImagesに `hideHeartIcon={true}` を追加 |
| `src/features/main/components/random-lgtm-images.tsx` | LgtmImagesに `hideHeartIcon={true}` を追加 |

### Storybook (Storyを追加)

| ファイルパス | 変更内容 |
|-------------|---------|
| `src/features/main/components/lgtm-image.stories.tsx` | `hideHeartIcon: true` のStoryを追加 |
| `src/features/main/components/lgtm-images.stories.tsx` | `hideHeartIcon: true` のStoryを追加 |

---

## 実装詳細

### 1. src/features/main/components/lgtm-image.tsx の修正

#### 1.1 Props型の修正 (13-16行目)

**現在のコード:**
```typescript
type Props = {
  readonly id: LgtmImageType["id"];
  readonly imageUrl: LgtmImageType["imageUrl"];
};
```

**修正後のコード:**
```typescript
type Props = {
  // TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon Propsを削除する
  readonly hideHeartIcon?: boolean;
  readonly id: LgtmImageType["id"];
  readonly imageUrl: LgtmImageType["imageUrl"];
};
```

**注意**: `hideHeartIcon` はアルファベット順に従い、`id` の前に配置する。

#### 1.2 関数シグネチャの修正 (18行目)

**現在のコード:**
```typescript
export function LgtmImage({ id, imageUrl }: Props): JSX.Element {
```

**修正後のコード:**
```typescript
export function LgtmImage({ hideHeartIcon, id, imageUrl }: Props): JSX.Element {
```

#### 1.3 ハートアイコンボタン表示ロジックの修正 (108-127行目)

**現在のコード:**
```typescript
        <Button
          aria-label="Add to favorites"
          className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
          isIconOnly
          onPress={handleToggleFavorite}
          onPressEnd={handleFavoritePressEnd}
          onPressStart={handleFavoritePressStart}
          radius="sm"
          size="sm"
        >
          <HeartIcon
            color={
              isFavorite === true || isFavoriteActive === true
                ? "favorite"
                : "default"
            }
            height={20}
            width={20}
          />
        </Button>
```

**修正後のコード:**
```typescript
        {/* TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon による条件分岐を削除する */}
        {!hideHeartIcon && (
          <Button
            aria-label="Add to favorites"
            className="min-w-0 bg-white/80 p-2 backdrop-blur-sm hover:bg-white/90"
            isIconOnly
            onPress={handleToggleFavorite}
            onPressEnd={handleFavoritePressEnd}
            onPressStart={handleFavoritePressStart}
            radius="sm"
            size="sm"
          >
            <HeartIcon
              color={
                isFavorite === true || isFavoriteActive === true
                  ? "favorite"
                  : "default"
              }
              height={20}
              width={20}
            />
          </Button>
        )}
```

---

### 2. src/features/main/components/lgtm-images.tsx の修正

#### 2.1 Props型の修正 (6-8行目)

**現在のコード:**
```typescript
type Props = {
  readonly images: readonly LgtmImageType[];
};
```

**修正後のコード:**
```typescript
type Props = {
  // TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon Propsを削除する
  readonly hideHeartIcon?: boolean;
  readonly images: readonly LgtmImageType[];
};
```

#### 2.2 関数シグネチャの修正 (10行目)

**現在のコード:**
```typescript
export function LgtmImages({ images }: Props): JSX.Element {
```

**修正後のコード:**
```typescript
export function LgtmImages({ hideHeartIcon, images }: Props): JSX.Element {
```

#### 2.3 LgtmImageへのProps追加 (13-14行目)

**現在のコード:**
```typescript
      {images.map((image) => (
        <LgtmImage key={image.id} {...image} />
      ))}
```

**修正後のコード:**
```typescript
      {images.map((image) => (
        <LgtmImage hideHeartIcon={hideHeartIcon} key={image.id} {...image} />
      ))}
```

**注意**: Propsはアルファベット順で並べる (`hideHeartIcon` -> `key` -> `...image`の順)。

---

### 3. src/features/main/components/latest-lgtm-images.tsx の修正

#### 3.1 LgtmImagesへのProps追加 (26行目)

**現在のコード:**
```typescript
  return <LgtmImages images={lgtmImages} />;
```

**修正後のコード:**
```typescript
  // TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon を削除する
  return <LgtmImages hideHeartIcon={true} images={lgtmImages} />;
```

---

### 4. src/features/main/components/random-lgtm-images.tsx の修正

#### 4.1 LgtmImagesへのProps追加 (25行目)

**現在のコード:**
```typescript
  return <LgtmImages images={lgtmImages} />;
```

**修正後のコード:**
```typescript
  // TODO: ログイン機能、お気に入り機能実装後は hideHeartIcon を削除する
  return <LgtmImages hideHeartIcon={true} images={lgtmImages} />;
```

---

### 5. Storybookファイルの修正

#### 5.1 src/features/main/components/lgtm-image.stories.tsx (42行目の後に追加)

**追加するコード:**
```typescript
// TODO: ログイン機能、お気に入り機能実装後はこのStoryを削除する
export const HiddenHeartIcon: Story = {
  args: {
    hideHeartIcon: true,
    id: createLgtmImageId(Number(firstImage.id)),
    imageUrl: createLgtmImageUrl(firstImage.url),
  },
};
```

#### 5.2 src/features/main/components/lgtm-images.stories.tsx (42行目の後に追加)

**追加するコード:**
```typescript
// TODO: ログイン機能、お気に入り機能実装後はこのStoryを削除する
export const HiddenHeartIcon: Story = {
  args: {
    hideHeartIcon: true,
    images: mockImages,
  },
};
```

---

## 推奨される実装順序

1. **LgtmImageコンポーネント** (最下層から)
   1. `src/features/main/components/lgtm-image.tsx` - ハートアイコンを条件付きで非表示にする
   2. `src/features/main/components/lgtm-images.tsx` - Propsを受け取り各LgtmImageに渡す
   3. `src/features/main/components/latest-lgtm-images.tsx` - hideHeartIcon={true}を設定
   4. `src/features/main/components/random-lgtm-images.tsx` - hideHeartIcon={true}を設定

2. **Storybookファイル** (順不同)
   - `src/features/main/components/lgtm-image.stories.tsx`
   - `src/features/main/components/lgtm-images.stories.tsx`

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

全てのテストがパスすることを確認する。

### 4. ビルド確認

```bash
npm run build
```

ビルドが正常に完了することを確認する。型エラーがないことを確認する。

### 5. 開発サーバーでの表示確認

Chrome DevTools MCPを使用して `http://localhost:2222` にアクセスし、以下を確認する:

**デスクトップ表示 (幅768px以上):**

- [ ] トップページ (`/`) でLGTM画像にホバーした際、コピーアイコンのみ表示されハートアイコンが非表示になっていること
- [ ] 英語版トップページ (`/en`) でも同様にハートアイコンが非表示になっていること
- [ ] コピーアイコンは正常に表示され、クリックすると「Copied!」が表示されること
- [ ] 画像クリックによるコピー機能は正常に動作すること

**モバイル表示 (幅768px未満):**

- [ ] トップページ (`/`) で各LGTM画像の右上にコピーアイコンのみ表示されハートアイコンが非表示になっていること
- [ ] 英語版トップページ (`/en`) でも同様にハートアイコンが非表示になっていること
- [ ] コピーアイコンは正常に表示され、タップすると「Copied!」が表示されること

### 6. Storybookでの表示確認

Chrome DevTools MCPを使用して `http://localhost:6006/` にアクセスし、以下を確認する:

**確認項目:**
- [ ] `Lgtm Image > Hidden Heart Icon` でハートアイコンが非表示になっていること
- [ ] `Lgtm Image > Hidden Heart Icon` でコピーアイコンは表示されていること
- [ ] `Lgtm Images > Hidden Heart Icon` で全ての画像のハートアイコンが非表示になっていること
- [ ] 既存のStory (`Lgtm Image > Default` など) では引き続きハートアイコンが表示されていること (hideHeartIconがfalseまたは未指定の場合)

---

## 注意事項

1. **TODOコメントの記載**: 全ての変更箇所に「ログイン機能、お気に入り機能実装後は削除する」旨のTODOコメントを追加すること
2. **オプショナルProps**: `hideHeartIcon` はオプショナル (`?`) として定義し、既存の動作に影響を与えないようにする
3. **Propsの順序**: Biome/Ultraciteの規約に従い、Propsはアルファベット順で並べる (hideHeartIcon -> id -> imageUrl)
4. **importの追加不要**: 新たなimportは不要。既存のコードのみで実装可能
5. **hideHeartIcon={true}の書き方**: `hideHeartIcon` ではなく `hideHeartIcon={true}` と明示的に書くこと (ショートハンド形式は警告が出る可能性がある)
6. **ファイル先頭コメント**: 各ファイルの先頭には既に `// 絶対厳守：編集前に必ずAI実装ルールを読む` が存在するため、追加は不要
7. **フォーマッタによる自動調整**: `npm run format` 実行後、Propsの順序やimport文の順序が自動調整される場合がある。本ドキュメントのコードサンプルはあくまで参考であり、最終的な順序はフォーマッタの出力に従うこと
8. **hideHeartIconがundefinedの場合**: オプショナルPropsのため、未指定の場合は `undefined` となり、`!hideHeartIcon` は `true` となるためハートアイコンは表示される。これにより既存動作は維持される
9. **お気に入り関連のstate/ハンドラーは削除しない**: `lgtm-image.tsx`内の以下のコードは今回削除しないこと。これらはお気に入り機能実装時に使用するため残しておく:
   - state変数: `isFavorite`, `isFavoriteActive`
   - ハンドラー関数: `handleToggleFavorite`, `handleFavoritePressStart`, `handleFavoritePressEnd`
   - これらは`hideHeartIcon`が`true`の場合でも、未使用の状態でそのまま残しておく

---

## 実装後の確認チェックリスト

- [ ] `npm run format` が正常終了すること
- [ ] `npm run lint` でエラーが出ないこと
- [ ] `npm run test` で全てのテストがパスすること
- [ ] `npm run build` が正常終了すること (型エラーなし)
- [ ] `http://localhost:2222` でトップページ (日本語/英語) のLGTM画像でハートアイコンが非表示になっていること
- [ ] `http://localhost:6006/` で追加したStoryが正しく表示されること
- [ ] 全ての変更箇所にTODOコメントが記載されていること

---

## ログイン機能・お気に入り機能実装後の削除対象

ログイン機能およびお気に入り機能実装時に削除すべき箇所の一覧:

1. **Props定義**: 各コンポーネントの `hideHeartIcon?: boolean` プロパティおよびTODOコメント
   - `src/features/main/components/lgtm-image.tsx`
   - `src/features/main/components/lgtm-images.tsx`

2. **関数シグネチャ**: 各コンポーネントの `hideHeartIcon` パラメータ
   - `src/features/main/components/lgtm-image.tsx`
   - `src/features/main/components/lgtm-images.tsx`

3. **条件分岐**: `!hideHeartIcon &&` の条件分岐およびTODOコメント
   - `src/features/main/components/lgtm-image.tsx`

4. **呼び出し側**: `hideHeartIcon={true}` の指定およびTODOコメント
   - `src/features/main/components/latest-lgtm-images.tsx`
   - `src/features/main/components/random-lgtm-images.tsx`

5. **Storybook**: `HiddenHeartIcon` のStoryおよびTODOコメント
   - `src/features/main/components/lgtm-image.stories.tsx`
   - `src/features/main/components/lgtm-images.stories.tsx`
