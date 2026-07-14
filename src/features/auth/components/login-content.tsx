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
import type { LoginAction } from "@/actions/auth/types/login-action";
import { IconButton } from "@/components/icon-button";
import { loginPageTexts } from "@/features/auth/functions/auth-i18n";
import type { Language } from "@/types/language";

interface Props {
  readonly hasError: boolean;
  readonly language: Language;
  readonly loginAction: LoginAction;
}

export function LoginContent({
  hasError,
  language,
  loginAction,
}: Props): JSX.Element {
  const texts = loginPageTexts(language);
  // React StrictMode（開発時）の二重実行と、cacheComponents の Activity 復帰による
  // effect 再実行で OAuth フローが多重起動しないようにガードする
  const hasStartedRef = useRef(false);
  // Server Action の呼び出し自体が失敗した場合（ネットワーク断等）のクライアント状態。
  // OAuth コールバック起点の失敗（?error= クエリ）とは別系統。
  const [hasClientError, setHasClientError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 成功時（GitHub への redirect()）も Action Promise は NEXT_REDIRECT で reject される。
  // unstable_rethrow で内部エラーを transition へ再送出し、Next.js のルーターに
  // 遷移として処理させる。catch に残るのは Server Action 呼び出し自体の失敗のみ。
  const startLogin = useCallback(() => {
    startTransition(async () => {
      try {
        await loginAction(language);
      } catch (error) {
        unstable_rethrow(error);
        setHasClientError(true);
      }
    });
  }, [language, loginAction]);

  useEffect(() => {
    if (hasError || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    startLogin();
  }, [hasError, startLogin]);

  if (hasError || hasClientError) {
    return (
      <div className="flex w-full flex-col items-center gap-7 px-7 py-10 md:py-[60px]">
        <p className="text-center text-base text-orange-900 md:text-xl">
          {texts.failedMessage}
        </p>
        <IconButton
          displayText={texts.retryButtonText}
          isLoading={isPending}
          onPress={startLogin}
          showGithubIcon={true}
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
        {texts.redirectingMessage}
      </p>
    </div>
  );
}
