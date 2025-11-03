"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { type JSX, useEffect } from "react";
import { httpStatusCode } from "@/constants/httpStatusCode";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

function GlobalError({ error }: Props): JSX.Element {
  useEffect(() => {
    Sentry.captureException(error);
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
