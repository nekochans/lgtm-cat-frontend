import Link from "next/link";
import type { CSSProperties, JSX } from "react";
import { Text } from "react-aria-components";
import type { IncludeLanguageAppPath, Url } from "@/features/url";

type Props = {
  linkText: string;
  linkUrl: Url | IncludeLanguageAppPath;
  className?: string;
  style?: CSSProperties;
};

export function LinkButton({
  linkText,
  linkUrl,
  className,
  style,
}: Props): JSX.Element {
  return (
    <Link
      className={`flex w-full max-w-screen-md items-center justify-center gap-2.5 rounded-lg bg-orange-600 px-6 py-3.5 transition-colors duration-200 hover:bg-orange-700 ${className ?? ""}
      `}
      href={linkUrl}
      prefetch={false}
      style={style}
    >
      <Text className="font-bold font-inter text-lg text-white">
        {linkText}
      </Text>
    </Link>
  );
}
