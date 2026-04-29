"use client";

import { captureException } from "@sentry/nextjs";
import NextError from "next/error";
import { type JSX, useEffect } from "react";
import { httpStatusCode } from "@/constants/http-status-code";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

function GlobalError({ error }: Props): JSX.Element {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <NextError statusCode={httpStatusCode.internalServerError} />
      </body>
    </html>
  );
}

export default GlobalError;
