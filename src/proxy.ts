// 絶対厳守：編集前に必ずAI実装ルールを読む
import { type NextRequest, NextResponse } from "next/server";
import { httpStatusCode } from "@/constants/http-status-code";
import {
  isLanguage,
  mightExtractLanguageFromAppPath,
  removeLanguageFromAppPath,
} from "@/features/language";
import { isIncludeLanguageAppPath } from "@/features/url";
import { isBanCountry } from "@/lib/vercel/edge-functions/country";
import { isInMaintenance } from "@/lib/vercel/edge-functions/maintenance";
import { appBaseUrlHeaderName } from "@/lib/vercel/edge-functions/url";

export const config = {
  matcher: [
    "/",
    "/en",
    "/ja",
    "/upload",
    "/en/upload",
    "/ja/upload",
    "/terms",
    "/en/terms",
    "/ja/terms",
    "/privacy",
    "/en/privacy",
    "/ja/privacy",
    "/maintenance",
    "/en/maintenance",
    "/ja/maintenance",
  ],
};

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const isBanCountryResult = await isBanCountry(request);
  if (isBanCountryResult) {
    return NextResponse.json(
      { message: "Not available from your region." },
      { status: httpStatusCode.forbidden }
    );
  }

  if (!isIncludeLanguageAppPath(nextUrl.pathname)) {
    return NextResponse.json(
      { message: "An unexpected error has occurred." },
      { status: httpStatusCode.internalServerError }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(appBaseUrlHeaderName, nextUrl.origin);

  const language = mightExtractLanguageFromAppPath(nextUrl.pathname);
  const isInMaintenanceMode = await isInMaintenance();
  if (isInMaintenanceMode) {
    nextUrl.pathname = "/maintenance";
    if (isLanguage(language) && language !== "ja") {
      nextUrl.pathname = `${language}/maintenance`;
    }

    return NextResponse.rewrite(nextUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (language === "ja") {
    const removedLanguagePath = removeLanguageFromAppPath(nextUrl.pathname);
    if (nextUrl.pathname !== "/ja") {
      return NextResponse.redirect(new URL(removedLanguagePath, request.url), {
        status: httpStatusCode.found,
        statusText: "Found",
        headers: requestHeaders,
      });
    }

    return NextResponse.redirect(new URL("/", request.url), {
      status: httpStatusCode.found,
      statusText: "Found",
      headers: requestHeaders,
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
