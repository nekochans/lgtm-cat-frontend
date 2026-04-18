// 絶対厳守：編集前に必ずAI実装ルールを読む

// 注意: 日本語サイトのため日本語を先頭に配置
const openGraphLocales = ["ja_JP", "en_US"] as const;

export type OpenGraphLocale = (typeof openGraphLocales)[number];
