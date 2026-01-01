// 絶対厳守：編集前に必ずAI実装ルールを読む

type ActionState = {
  readonly status: "SUCCESS" | "ERROR";
  readonly [key: string]: unknown;
} | null;

/**
 * ActionStateからSUCCESS状態のみを抽出する条件型
 */
type SuccessState<T extends ActionState> = T extends {
  readonly status: "SUCCESS";
}
  ? T
  : never;

/**
 * ActionStateからERROR状態のみを抽出する条件型
 */
type ErrorState<T extends ActionState> = T extends { readonly status: "ERROR" }
  ? T
  : never;

interface Callbacks<T extends ActionState> {
  readonly onSuccess?: (result: SuccessState<NonNullable<T>>) => void;
  readonly onError?: (result: ErrorState<NonNullable<T>>) => void;
}

/**
 * Server Actionにコールバック機能を追加する高階関数
 * useEffectを使用せずに、Server Actionの結果に応じた処理を実行できる
 *
 * @see https://www.robinwieruch.de/react-server-actions-toast-useactionstate/
 */
export const withCallbacks =
  <Args extends unknown[], T extends ActionState>(
    fn: (...args: Args) => Promise<T>,
    callbacks: Callbacks<T>
  ): ((...args: Args) => Promise<T>) =>
  async (...args: Args): Promise<T> => {
    const result = await fn(...args);

    if (result?.status === "SUCCESS") {
      callbacks.onSuccess?.(result as SuccessState<NonNullable<T>>);
    }
    if (result?.status === "ERROR") {
      callbacks.onError?.(result as ErrorState<NonNullable<T>>);
    }

    return result;
  };
