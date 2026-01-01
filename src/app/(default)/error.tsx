// 絶対厳守：編集前に必ずAI実装ルールを読む
"use client";

import type { JSX } from "react";
import { ErrorPage } from "@/features/errors/components/error-page";

interface Props {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props): JSX.Element {
  return <ErrorPage error={error} reset={reset} />;
}
