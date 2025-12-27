# Issue #397: Headerのログインボタンを一時的に隠す - 実装計画

## 概要

Headerコンポーネントのログインボタンを一時的に非表示にする機能を実装する。
これはログイン機能実装までの一時的な対応であり、実装後は `hideLoginButton` Propsおよび関連するTODOコメントを削除する。

## 関連Issue

https://github.com/nekochans/lgtm-cat-frontend/issues/397

## Done の定義

- [ ] Headerのログインボタンが一時的に非表示状態になっている事

---

## 変更対象サマリー

- **Headerコンポーネント**: 3ファイル
- **Header呼び出し元**: 6ファイル
- **Storybook**: 3ファイル
- **合計**: 12ファイル

---

## ログインボタンの現在の位置

実装前にログインボタンの位置を確認しておくこと:

- **デスクトップ (768px以上)**: Headerの右端、言語切替ボタンの右隣に「ログイン」ボタン (GithubアイコンとGithubでログインテキスト付き) が表示されている
- **モバイル (768px未満)**: ハンバーガーメニューを開いた際、Drawerの一番上に「ログイン」ボタン (GithubアイコンとGithubでログインテキスト付き) が表示されている

---

## 対象ファイル一覧

### Headerコンポーネント (Props追加 + 非表示ロジック)

| ファイルパス | 変更内容 |
|-------------|---------|
| `src/components/header.tsx` | Props型に `hideLoginButton` を追加、子コンポーネントに渡す |
| `src/components/header-mobile.tsx` | Props型に `hideLoginButton` を追加、ログインボタンを条件付きで非表示 |
| `src/components/header-desktop.tsx` | Props型に `hideLoginButton` を追加、ログインボタンを条件付きで非表示 |

### Header呼び出し元 (hideLoginButton: true を渡す)

| ファイルパス | 変更内容 |
|-------------|---------|
| `src/components/page-layout.tsx` | Headerに `hideLoginButton={true}` を追加 |
| `src/features/main/components/home-page-container.tsx` | Headerに `hideLoginButton={true}` を追加 |
| `src/features/errors/components/error-layout.tsx` | Headerに `hideLoginButton={true}` を追加 |
| `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx` | Headerに `hideLoginButton={true}` を追加 |
| `src/features/privacy/components/privacy-page-container.tsx` | Headerに `hideLoginButton={true}` を追加 |
| `src/features/terms/components/terms-page-container.tsx` | Headerに `hideLoginButton={true}` を追加 |

### Storybook (Storyを追加)

| ファイルパス | 変更内容 |
|-------------|---------|
| `src/components/header.stories.tsx` | `hideLoginButton: true` のStoryを追加 |
| `src/components/header-desktop.stories.tsx` | `hideLoginButton: true` のStoryを追加 |
| `src/components/header-mobile.stories.tsx` | `hideLoginButton: true` のStoryを追加 |

---

## 実装詳細

### 1. src/components/header-desktop.tsx の修正

#### 1.1 Props型の修正 (33-37行目)

**現在のコード:**
```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};
```

**修正後のコード:**
```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  // TODO: ログイン機能実装後は hideLoginButton Propsを削除する
  readonly hideLoginButton?: boolean;
  readonly isLoggedIn: boolean;
};
```

**注意**: `hideLoginButton` はアルファベット順に従い、`currentUrlPath` と `isLoggedIn` の間に配置する。

#### 1.2 関数シグネチャの修正 (39-43行目)

**現在のコード:**
```typescript
export function HeaderDesktop({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
```

**修正後のコード:**
```typescript
export function HeaderDesktop({
  language,
  currentUrlPath,
  hideLoginButton,
  isLoggedIn,
}: Props): JSX.Element {
```

#### 1.3 ログインボタン表示ロジックの修正 (215-217行目付近)

**現在のコード:**
```typescript
            ) : (
              <LoginButton language={language} />
            )}
```

**修正後のコード:**
```typescript
            ) : (
              // TODO: ログイン機能実装後は hideLoginButton による条件分岐を削除する
              !hideLoginButton && <LoginButton language={language} />
            )}
```

---

### 2. src/components/header-mobile.tsx の修正

#### 2.1 Props型の修正 (40-44行目)

**現在のコード:**
```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};
```

**修正後のコード:**
```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  // TODO: ログイン機能実装後は hideLoginButton Propsを削除する
  readonly hideLoginButton?: boolean;
  readonly isLoggedIn: boolean;
};
```

#### 2.2 UnloggedInMenuProps型の修正 (89-94行目)

**現在のコード:**
```typescript
type UnloggedInMenuProps = {
  readonly language: Language;
  readonly removedLanguagePath: string;
  readonly menuType: MenuType;
  readonly onCloseMenus: () => void;
};
```

**修正後のコード:**
```typescript
type UnloggedInMenuProps = {
  readonly language: Language;
  readonly removedLanguagePath: string;
  readonly menuType: MenuType;
  readonly onCloseMenus: () => void;
  // TODO: ログイン機能実装後は hideLoginButton Propsを削除する
  readonly hideLoginButton?: boolean;
};
```

**注意**: UnloggedInMenuPropsではアルファベット順を厳密に適用せず、既存のプロパティの後に追加する形でも許容される。ただし、formatコマンドで自動整列される可能性があるため、最終的な順序はフォーマッタに従う。

#### 2.3 UnloggedInMenu関数シグネチャの修正 (96-101行目)

**現在のコード:**
```typescript
function UnloggedInMenu({
  language,
  removedLanguagePath,
  menuType,
  onCloseMenus,
}: UnloggedInMenuProps): JSX.Element {
```

**修正後のコード:**
```typescript
function UnloggedInMenu({
  language,
  removedLanguagePath,
  menuType,
  onCloseMenus,
  hideLoginButton,
}: UnloggedInMenuProps): JSX.Element {
```

#### 2.4 UnloggedInMenu内のログインボタン表示ロジックの修正 (102-112行目)

**現在のコード:**
```typescript
  return (
    <>
      <Button
        as={Link}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-7 py-2 font-bold text-text-br text-xl"
        href={createIncludeLanguageAppPath("login", language)}
        onClick={onCloseMenus}
      >
        <GithubIcon color="default" height={20} width={20} />
        {loginText(language)}
      </Button>
```

**修正後のコード:**
```typescript
  return (
    <>
      {/* TODO: ログイン機能実装後は hideLoginButton による条件分岐を削除する */}
      {!hideLoginButton && (
        <Button
          as={Link}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-button-secondary-base px-7 py-2 font-bold text-text-br text-xl"
          href={createIncludeLanguageAppPath("login", language)}
          onClick={onCloseMenus}
        >
          <GithubIcon color="default" height={20} width={20} />
          {loginText(language)}
        </Button>
      )}
```

#### 2.5 HeaderMobile関数シグネチャの修正 (215-219行目)

**現在のコード:**
```typescript
export function HeaderMobile({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
```

**修正後のコード:**
```typescript
export function HeaderMobile({
  language,
  currentUrlPath,
  hideLoginButton,
  isLoggedIn,
}: Props): JSX.Element {
```

#### 2.6 UnloggedInMenuへのProps追加 (304-311行目)

**現在のコード:**
```typescript
                {!isLoggedIn && (
                  <UnloggedInMenu
                    language={language}
                    menuType={menuType}
                    onCloseMenus={handleCloseMenus}
                    removedLanguagePath={removedLanguagePath}
                  />
                )}
```

**修正後のコード:**
```typescript
                {!isLoggedIn && (
                  <UnloggedInMenu
                    hideLoginButton={hideLoginButton}
                    language={language}
                    menuType={menuType}
                    onCloseMenus={handleCloseMenus}
                    removedLanguagePath={removedLanguagePath}
                  />
                )}
```

---

### 3. src/components/header.tsx の修正

#### 3.1 Props型の修正 (10-14行目)

**現在のコード:**
```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  readonly isLoggedIn: boolean;
};
```

**修正後のコード:**
```typescript
type Props = {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
  // TODO: ログイン機能実装後は hideLoginButton Propsを削除する
  readonly hideLoginButton?: boolean;
  readonly isLoggedIn: boolean;
};
```

#### 3.2 関数シグネチャの修正 (16-20行目)

**現在のコード:**
```typescript
export function Header({
  language,
  currentUrlPath,
  isLoggedIn,
}: Props): JSX.Element {
```

**修正後のコード:**
```typescript
export function Header({
  language,
  currentUrlPath,
  hideLoginButton,
  isLoggedIn,
}: Props): JSX.Element {
```

#### 3.3 HeaderMobileへのProps追加 (25-29行目)

**現在のコード:**
```typescript
        <HeaderMobile
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
```

**修正後のコード:**
```typescript
        <HeaderMobile
          currentUrlPath={currentUrlPath}
          hideLoginButton={hideLoginButton}
          isLoggedIn={isLoggedIn}
          language={language}
        />
```

#### 3.4 HeaderDesktopへのProps追加 (33-37行目)

**現在のコード:**
```typescript
        <HeaderDesktop
          currentUrlPath={currentUrlPath}
          isLoggedIn={isLoggedIn}
          language={language}
        />
```

**修正後のコード:**
```typescript
        <HeaderDesktop
          currentUrlPath={currentUrlPath}
          hideLoginButton={hideLoginButton}
          isLoggedIn={isLoggedIn}
          language={language}
        />
```

---

### 4. Header呼び出し元ファイルの修正

全ての呼び出し元で `hideLoginButton={true}` を追加する。

#### 4.1 src/components/page-layout.tsx (28-32行目)

**現在のコード:**
```typescript
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={isLoggedIn}
        language={language}
      />
```

**修正後のコード:**
```typescript
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={isLoggedIn}
        language={language}
      />
```

#### 4.2 src/features/main/components/home-page-container.tsx (24-28行目)

**現在のコード:**
```typescript
    <Header
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
    />
```

**修正後のコード:**
```typescript
    {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
    <Header
      currentUrlPath={currentUrlPath}
      hideLoginButton={true}
      isLoggedIn={false}
      language={language}
    />
```

#### 4.3 src/features/errors/components/error-layout.tsx (18-22行目)

**現在のコード:**
```typescript
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
```

**修正後のコード:**
```typescript
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={false}
        language={language}
      />
```

#### 4.4 src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx (22-26行目)

**現在のコード:**
```typescript
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
```

**修正後のコード:**
```typescript
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={false}
        language={language}
      />
```

#### 4.5 src/features/privacy/components/privacy-page-container.tsx (22-26行目)

**現在のコード:**
```typescript
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
```

**修正後のコード:**
```typescript
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={false}
        language={language}
      />
```

#### 4.6 src/features/terms/components/terms-page-container.tsx (22-26行目)

**現在のコード:**
```typescript
      <Header
        currentUrlPath={currentUrlPath}
        isLoggedIn={false}
        language={language}
      />
```

**修正後のコード:**
```typescript
      {/* TODO: ログイン機能実装後は hideLoginButton を削除する */}
      <Header
        currentUrlPath={currentUrlPath}
        hideLoginButton={true}
        isLoggedIn={false}
        language={language}
      />
```

---

### 5. Storybookファイルの修正

**注意**: Storybookのargsオブジェクト内のプロパティ順序もフォーマッタで自動調整される可能性がある。`npm run format` 実行後の順序に従うこと。

#### 5.1 src/components/header.stories.tsx (43行目以降に追加)

**追加するコード:**
```typescript
// TODO: ログイン機能実装後はこのStoryを削除する
export const HiddenLoginButtonInJapanese: Story = {
  args: {
    currentUrlPath: "/",
    hideLoginButton: true,
    isLoggedIn: false,
    language: "ja",
  },
};
```

#### 5.2 src/components/header-desktop.stories.tsx (43行目以降に追加)

**追加するコード:**
```typescript
// TODO: ログイン機能実装後はこのStoryを削除する
export const HiddenLoginButtonDesktopInJapanese: Story = {
  args: {
    currentUrlPath: "/",
    hideLoginButton: true,
    isLoggedIn: false,
    language: "ja",
  },
};
```

#### 5.3 src/components/header-mobile.stories.tsx (48行目以降に追加)

**追加するコード:**
```typescript
// TODO: ログイン機能実装後はこのStoryを削除する
export const HiddenLoginButtonMobileInJapanese: Story = {
  args: {
    currentUrlPath: "/",
    hideLoginButton: true,
    isLoggedIn: false,
    language: "ja",
  },
};
```

---

## 推奨される実装順序

1. **Headerコンポーネント群** (依存関係の順)
   1. `src/components/header-desktop.tsx` - ログインボタンが最もシンプルに実装されている
   2. `src/components/header-mobile.tsx` - UnloggedInMenuを経由するため少し複雑
   3. `src/components/header.tsx` - 親コンポーネントとして子に渡すだけ

2. **Header呼び出し元** (順不同、並列作業可能)
   - `src/components/page-layout.tsx`
   - `src/features/main/components/home-page-container.tsx`
   - `src/features/errors/components/error-layout.tsx`
   - `src/features/external-transmission-policy/components/external-transmission-policy-page-container.tsx`
   - `src/features/privacy/components/privacy-page-container.tsx`
   - `src/features/terms/components/terms-page-container.tsx`

3. **Storybookファイル** (順不同)
   - `src/components/header.stories.tsx`
   - `src/components/header-desktop.stories.tsx`
   - `src/components/header-mobile.stories.tsx`

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

ログインボタンの位置: Header右端 (言語切替ボタンの右隣)

- [ ] トップページ (`/`) でログインボタンが非表示になっていること
- [ ] 英語版トップページ (`/en`) でログインボタンが非表示になっていること
- [ ] アップロードページ (`/upload`) でログインボタンが非表示になっていること
- [ ] 利用規約ページでログインボタンが非表示になっていること
- [ ] プライバシーポリシーページでログインボタンが非表示になっていること
- [ ] 外部送信ポリシーページでログインボタンが非表示になっていること
- [ ] 存在しないページ (例: `/not-found-test`) にアクセスしてエラーページでもログインボタンが非表示であること
- [ ] その他のナビゲーション要素 (アップロード、使い方、利用規約等) は正常に表示されること
- [ ] 言語切り替え (日本語/English) が正常に動作すること

**モバイル表示 (幅768px未満):**

ハンバーガーメニューを開く手順: Header右端のメニューアイコン (三本線) をクリックすると右からDrawerがスライドインする

- [ ] トップページ (`/`) でハンバーガーメニューを開いてログインボタンが非表示になっていること
- [ ] 英語版トップページ (`/en`) でハンバーガーメニューを開いてログインボタンが非表示になっていること
- [ ] その他のナビゲーション要素 (HOME、アップロード、使い方) は正常に表示されること
- [ ] 言語切り替えメニュー (地球儀アイコン) が正常に動作すること
- [ ] 存在しないページ (例: `/not-found-test`) にアクセスしてエラーページでもログインボタンが非表示であること

### 6. Storybookでの表示確認

Chrome DevTools MCPを使用して `http://localhost:6006/` にアクセスし、以下を確認する:

**確認項目:**
- [ ] `Header > Hidden Login Button In Japanese` でログインボタンが非表示になっていること
- [ ] `Header Desktop > Hidden Login Button Desktop In Japanese` でログインボタンが非表示になっていること
- [ ] `Header Mobile > Hidden Login Button Mobile In Japanese` でハンバーガーメニューを開いてログインボタンが非表示になっていること
- [ ] 既存のStory (`Header In Japanese` など) では引き続きログインボタンが表示されていること (hideLoginButtonがfalseまたは未指定の場合)

---

## 注意事項

1. **TODOコメントの記載**: 全ての変更箇所に「ログイン機能実装後は削除する」旨のTODOコメントを追加すること
2. **オプショナルProps**: `hideLoginButton` はオプショナル (`?`) として定義し、既存の動作に影響を与えないようにする
3. **Propsの順序**: Biome/Ultraciteの規約に従い、Propsはアルファベット順で並べる (currentUrlPath -> hideLoginButton -> isLoggedIn -> language)
4. **importの追加不要**: 新たなimportは不要。既存のコードのみで実装可能
5. **hideLoginButton={true}の書き方**: `hideLoginButton` ではなく `hideLoginButton={true}` と明示的に書くこと (ショートハンド形式は警告が出る可能性がある)
6. **ファイル先頭コメント**: 各ファイルの先頭には既に `// 絶対厳守：編集前に必ずAI実装ルールを読む` が存在するため、追加は不要
7. **フォーマッタによる自動調整**: `npm run format` 実行後、Propsの順序やimport文の順序が自動調整される場合がある。本ドキュメントのコードサンプルはあくまで参考であり、最終的な順序はフォーマッタの出力に従うこと
8. **hideLoginButtonがundefinedの場合**: オプショナルPropsのため、未指定の場合は `undefined` となり、`!hideLoginButton` は `true` となるためログインボタンは表示される。これにより既存動作は維持される

---

## 実装後の確認チェックリスト

- [ ] `npm run format` が正常終了すること
- [ ] `npm run lint` でエラーが出ないこと
- [ ] `npm run test` で全てのテストがパスすること
- [ ] `npm run build` が正常終了すること (型エラーなし)
- [ ] `http://localhost:2222` で全てのページでログインボタンが非表示になっていること
- [ ] `http://localhost:6006/` で追加したStoryが正しく表示されること
- [ ] 全ての変更箇所にTODOコメントが記載されていること

---

## ログイン機能実装後の削除対象

ログイン機能実装時に削除すべき箇所の一覧:

1. **Props定義**: 各コンポーネントの `hideLoginButton?: boolean` プロパティおよびTODOコメント
2. **関数シグネチャ**: 各コンポーネントの `hideLoginButton` パラメータ
3. **条件分岐**: `!hideLoginButton &&` の条件分岐およびTODOコメント
4. **呼び出し側**: `hideLoginButton={true}` の指定およびTODOコメント
5. **Storybook**: `HiddenLoginButton*` のStoryおよびTODOコメント
