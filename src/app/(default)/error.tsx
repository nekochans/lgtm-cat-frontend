// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX } from "react";
import { ErrorPageContainer } from "@/features/errors/components/error-page-container";

type Props = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function ErrorPage({ error, reset }: Props): JSX.Element {
  return <ErrorPageContainer error={error} reset={reset} />;
}
