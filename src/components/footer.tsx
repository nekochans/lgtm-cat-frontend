// 絶対厳守：編集前に必ずAI実装ルールを読む
import Link from "next/link";
import type { JSX } from "react";
import { createExternalTransmissionPolicyLinksFromLanguages } from "@/features/external-transmission-policy";
import type { Language } from "@/features/language";
import { createPrivacyPolicyLinksFromLanguages } from "@/features/privacy-policy";
import { createTermsOfUseLinksFromLanguages } from "@/features/terms-of-use";

export type Props = {
  language: Language;
};

const linkStyle =
  "text-[#43281E] font-inter text-sm font-normal leading-5 hover:underline";

export function Footer({ language }: Props): JSX.Element {
  const terms = createTermsOfUseLinksFromLanguages(language);

  const privacy = createPrivacyPolicyLinksFromLanguages(language);

  const externalTransmissionPolicy =
    createExternalTransmissionPolicyLinksFromLanguages(language);

  return (
    <footer className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-[375px] items-center px-0 py-3 md:hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <Link className={linkStyle} href={terms.link} prefetch={false}>
            <p data-gtm-click="footer-terms-link">{terms.text}</p>
          </Link>
          <Link className={linkStyle} href={privacy.link} prefetch={false}>
            <p data-gtm-click="footer-privacy-link">{privacy.text}</p>
          </Link>
          <Link
            className={linkStyle}
            href={externalTransmissionPolicy.link}
            prefetch={false}
          >
            <p data-gtm-click="footer-external-transmission-policy-link">
              {externalTransmissionPolicy.text}
            </p>
          </Link>
        </div>
      </div>
      <div className="flex h-[60px] items-center justify-center self-stretch border-orange-200 border-t bg-orange-50">
        <p className="font-inter font-medium text-base text-orange-800">
          Copyright (c) nekochans
        </p>
      </div>
    </footer>
  );
}
