# src/components/ ディレクトリルール

`src/components/` は、複数の機能で共通利用する React Component を配置するディレクトリです。

## 基本ルール

- 共通利用する React Component のみ配置します
- 特定の機能でしか使わないコンポーネントは `src/features/<機能名>/components/` に配置してください
- Storybook ファイル（`.stories.tsx`）はソースファイルと同じディレクトリに配置します
- テストファイルは `__tests__/<コンポーネント名>/<コンポーネント名>.test.tsx` の形式で配置します

## 依存関係

`src/components/` は以下のレイヤーに依存可能です:

- `src/types/` — 型定義
- `src/lib/` — 外部ライブラリ依存の処理
- `src/functions/` — ビジネスロジック
- `src/constants/` — 定数
- `src/utils/` — 汎用関数
- `src/actions/` — **`types/` 配下の型定義ファイルのみ** に依存可能（実装ファイルへの直接依存は禁止）

**`src/features/` への依存は禁止です。**

## サブディレクトリ構成

| ディレクトリ | 内容                                     |
| ------------ | ---------------------------------------- |
| `cats/`      | 猫のマスコットキャラクターコンポーネント |
| `heroui/`    | HeroUI プロバイダー設定                  |
| `icons/`     | アイコンコンポーネント                   |
