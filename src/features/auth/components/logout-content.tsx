"use client";

import { unstable_rethrow } from "next/navigation";
import {
  type JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { LogoutAction } from "@/actions/auth/types/logout-action";
import { IconButton } from "@/components/icon-button";
import { logoutPageTexts } from "@/features/auth/functions/auth-i18n";
import type { Language } from "@/types/language";

interface Props {
  readonly language: Language;
  readonly logoutAction: LogoutAction;
}

export function LogoutContent({ language, logoutAction }: Props): JSX.Element {
  const texts = logoutPageTexts(language);
  // React StrictMode（開発時）の二重実行と、cacheComponents の Activity 復帰による
  // effect 再実行でログアウト処理が多重起動しないようにガードする
  const hasStartedRef = useRef(false);
  // 想定外の signOut 失敗はクライアント状態で保持する。URL 遷移を伴わないため、
  // エラー表示にサーバー再描画（ガードの再実行）を経由しない。
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 成功時の redirect() も Action Promise は NEXT_REDIRECT で reject される。
  // unstable_rethrow で内部エラーを transition へ再送出し、Next.js のルーターに
  // 遷移として処理させる。catch に残るのは実際の失敗のみ。
  const runLogout = useCallback(() => {
    startTransition(async () => {
      try {
        await logoutAction(language);
      } catch (error) {
        unstable_rethrow(error);
        setHasError(true);
      }
    });
  }, [language, logoutAction]);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    runLogout();
  }, [runLogout]);

  if (hasError) {
    return (
      <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:py-[60px]">
        <p className="text-center text-base text-orange-900 md:text-xl">
          {texts.failedMessage}
        </p>
        <IconButton
          displayText={texts.retryButtonText}
          isLoading={isPending}
          onPress={runLogout}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:py-[60px]">
      <p
        className="text-center text-base text-orange-900 md:text-xl"
        role="status"
      >
        {texts.loggingOutMessage}
      </p>
    </div>
  );
}
