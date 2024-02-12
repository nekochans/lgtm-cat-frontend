export const languages = ['en', 'ja'] as const;

export type Language = (typeof languages)[number];
