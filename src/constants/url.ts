// 絶対厳守：編集前に必ずAI実装ルールを読む

export const appPathList = {
  home: "/",
  upload: "/upload",
  terms: "/terms",
  privacy: "/privacy",
  error: "/error",
  maintenance: "/maintenance",
  "external-transmission-policy": "/external-transmission-policy",
  login: "/login",
  "docs-how-to-use": "/docs/how-to-use",
  "docs-mcp": "/docs/mcp",
  "docs-github-app": "/docs/github-app",
} as const;

export const i18nUrlList = {
  home: {
    ja: "/",
    en: "/en/",
  },
  upload: {
    ja: `${appPathList.upload}/`,
    en: `/en${appPathList.upload}/`,
  },
  terms: {
    ja: `${appPathList.terms}/`,
    en: `/en${appPathList.terms}/`,
  },
  privacy: {
    ja: `${appPathList.privacy}/`,
    en: `/en${appPathList.privacy}/`,
  },
  maintenance: {
    ja: `${appPathList.maintenance}/`,
    en: `/en${appPathList.maintenance}/`,
  },
  "external-transmission-policy": {
    ja: `${appPathList["external-transmission-policy"]}/`,
    en: `/en${appPathList["external-transmission-policy"]}/`,
  },
  login: {
    ja: `${appPathList.login}/`,
    en: `/en${appPathList.login}/`,
  },
  "docs-how-to-use": {
    ja: `${appPathList["docs-how-to-use"]}/`,
    en: `/en${appPathList["docs-how-to-use"]}/`,
  },
  "docs-mcp": {
    ja: `${appPathList["docs-mcp"]}/`,
    en: `/en${appPathList["docs-mcp"]}/`,
  },
  "docs-github-app": {
    ja: `${appPathList["docs-github-app"]}/`,
    en: `/en${appPathList["docs-github-app"]}/`,
  },
} as const;
