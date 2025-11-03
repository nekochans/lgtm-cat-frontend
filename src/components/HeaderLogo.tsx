import Link from "next/link";
import type { JSX } from "react";
import { Text } from "react-aria-components";
import { LgtmCatIcon } from "@/components/LgtmCatIcon";
import type { Language } from "@/features/language";
import { createIncludeLanguageAppPath } from "@/features/url";

export type Props = {
  language: Language;
};

export function HeaderLogo({ language }: Props): JSX.Element {
  const homeToLink = createIncludeLanguageAppPath("home", language);

  return (
    <Link
      className="flex h-10 w-[218px] items-center justify-center gap-0.5 bg-orange-500"
      href={homeToLink}
      prefetch={false}
    >
      {/* eslint-disable-next-line react/prefer-shorthand-boolean */}
      <LgtmCatIcon aria-hidden={true} className="shrink-0" />
      <h1 className="font-bold text-4xl text-orange-50 no-underline">
        <Text>LGTMeow</Text>
      </h1>
    </Link>
  );
}
