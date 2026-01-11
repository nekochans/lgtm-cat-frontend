// 絶対厳守：編集前に必ずAI実装ルールを読む

// TODO: この対処は一時的なものです。Next.jsおよび依存パッケージ(proxy-from-env等)が
// WHATWG URL APIに移行した後は、このファイルを削除してください。
// 関連Issue: https://github.com/nekochans/lgtm-cat-frontend/issues/425

/**
 * Node.js 24以降で発生するDEP0169警告を抑制する
 *
 * @see https://github.com/nekochans/lgtm-cat-frontend/issues/425
 * @see https://github.com/vercel/next.js/issues/83183
 *
 * 根本原因:
 * - Next.js内部およびproxy-from-env等の依存パッケージがurl.parse()を使用
 * - Node.js 24.7.0以降でDEP0169警告が表示されるようになった
 *
 * この対処は一時的なものであり、Next.jsおよび依存パッケージが
 * WHATWG URL APIに移行した後は削除すること
 */
export function suppressDep0169Warning(): void {
  const originalEmit = process.emit.bind(process);

  process.emit = (
    name: string | symbol,
    warningEvent: unknown,
    ...args: unknown[]
  ) => {
    if (
      name === "warning" &&
      typeof warningEvent === "object" &&
      warningEvent !== null &&
      "name" in warningEvent &&
      "code" in warningEvent &&
      warningEvent.name === "DeprecationWarning" &&
      warningEvent.code === "DEP0169"
    ) {
      return false;
    }
    return originalEmit(name, warningEvent, ...args);
  };
}
