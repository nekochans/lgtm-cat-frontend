// 絶対厳守：編集前に必ずAI実装ルールを読む

/**
 * prismjs 言語コンポーネントの型定義
 *
 * prismjs の言語コンポーネント（prism-yaml 等）は、
 * グローバルな Prism オブジェクトに言語定義を追加する副作用のみを持ち、
 * 何もエクスポートしない。そのため、空のモジュール宣言で型エラーを解消する。
 *
 * @see https://prismjs.com/
 * @see https://github.com/PrismJS/prism/tree/master/components
 */
declare module "prismjs/components/prism-yaml";
