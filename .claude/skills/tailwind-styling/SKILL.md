---
name: tailwind-styling
description: Tailwind CSS v4 でスタイリングするときに使用する。本プロジェクトで利用している v4 の構文ルール、Breaking Changes、新機能、Theme Configuration などをまとめている。
---

# Tailwind CSS v4 スタイリングガイド

このプロジェクトでは **Tailwind CSS v4** を利用している。CSS のスタイリングを行う前に、必ず本ガイド（および参照先のドキュメント）に目を通すこと。

## v4 で押さえるべき主要ポイント

### CSS-first configuration

設定は JavaScript ではなく **CSS の `@theme` ディレクティブ** で行う。

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --color-avocado-500: oklch(0.84 0.18 117.33);
}
```

### CSS インポート構文

`@tailwind base; @tailwind components; @tailwind utilities;` は **廃止**。代わりに：

```css
@import "tailwindcss";
```

### よくある Breaking Changes

| 旧（v3）             | 新（v4）                                 |
| -------------------- | ---------------------------------------- |
| `bg-opacity-50`      | `bg-black/50`                            |
| `text-opacity-50`    | `text-black/50`                          |
| `shadow-sm`          | `shadow-xs`                              |
| `shadow`             | `shadow-sm`                              |
| `rounded-sm`         | `rounded-xs`                             |
| `rounded`            | `rounded-sm`                             |
| `blur-sm`            | `blur-xs`                                |
| `outline-none`       | `outline-hidden`（旧挙動を維持する場合） |
| `bg-[--brand-color]` | `bg-(--brand-color)`                     |

### デフォルトスタイルの変更

- ボーダー色のデフォルト：`gray-200` → `currentColor`
- `ring` 幅のデフォルト：3px → 1px
- プレースホルダー色：`gray-400` → `current color at 50% opacity`
- `hover` スタイル：`@media (hover: hover)` のデバイスのみ適用

## 詳細リファレンス

新機能（Container Query / 3D transforms / Gradient enhancements / Shadow enhancements 等）、Theme Configuration、Custom Extensions、Advanced Configuration の詳細は以下を参照：

- `references/tailwind-css-v4-coding-guidelines.md`

実装時に該当する箇所を確認すること。
