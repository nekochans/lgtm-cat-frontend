// 絶対厳守：編集前に必ずAI実装ルールを読む
import { captureRequestError } from "@sentry/nextjs";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // TODO: DEP0169警告抑制は一時的な対処です。Next.jsおよび依存パッケージが
    // WHATWG URL APIに移行した後は、この処理とsrc/lib/node/suppress-dep0169-warning.tsを削除してください。
    const { suppressDep0169Warning } = await import(
      "./lib/node/suppress-dep0169-warning"
    );
    suppressDep0169Warning();
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = captureRequestError;
