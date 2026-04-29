---
name: figma-import
description: Figma Dev Mode MCP サーバーからデザインを取り込むときに使用する。アセット参照のルール、アイコンパッケージ追加禁止、プレースホルダー禁止などの注意事項を定義する。
---

# Figma デザイン取り込みガイド

Figma Dev Mode MCP サーバーは、画像や SVG アセットを提供するアセットエンドポイントを提供する。

## 重要な注意事項

### ローカルホストソースをそのまま使う

Figma Dev Mode MCP サーバーが画像または SVG のローカルホストソースを返す場合、**その画像または SVG ソースを直接使用すること**。別の保存場所にコピーしたり、別のパスに変換したりしてはならない。

### アイコンパッケージを追加しない

**新しいアイコンパッケージをインポート / 追加してはならない**。すべてのアセットは Figma ペイロードに含まれている必要がある。

例：

- ❌ `npm install lucide-react` のような新規アイコンパッケージの追加
- ✅ Figma から提供される SVG をそのまま使う

### プレースホルダーを使わない

ローカルホストソースが提供されている場合、**プレースホルダーを使用または作成してはならない**。

例：

- ❌ `<div className="bg-gray-200">画像</div>` のようなプレースホルダー
- ✅ Figma が返した実際のローカルホストソースを `<img src="...">` で利用

## 利用するMCP

- `figma-desktop` MCP（`.mcp.json` で定義済み）
  - `mcp__figma-desktop__get_design_context` でデザインを取得
  - `mcp__figma-desktop__get_screenshot` でスクリーンショットを取得
  - `mcp__figma-desktop__get_metadata` でメタデータを取得
