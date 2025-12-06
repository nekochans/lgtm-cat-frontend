// 絶対厳守：編集前に必ずAI実装ルールを読む

import Link from "next/link";
import type { JSX } from "react";
import type { Language } from "@/features/language";
import { createPrivacyPolicyLinksFromLanguages } from "@/features/privacy-policy";
import {
  cautionText,
  noteList,
  privacyPolicyAgreementText,
} from "../upload-i18n";

type Props = {
  readonly language: Language;
};

/**
 * 注意事項セクション
 * Figmaデザイン（node-id: 271:6850）に基づく
 */
export function UploadNotes({ language }: Props): JSX.Element {
  const notes = noteList(language);
  const privacyPolicy = createPrivacyPolicyLinksFromLanguages(language);
  const agreementText = privacyPolicyAgreementText(language);

  return (
    <div className="flex flex-col items-center justify-center gap-5 text-text-br">
      <p className="font-bold text-xl leading-7">{cautionText(language)}</p>
      <ul className="list-disc pl-6 font-normal text-base leading-6">
        {notes.map((note, index) => (
          <li key={`note-${index}-${note.slice(0, 10)}`}>{note}</li>
        ))}
      </ul>
      <p className="max-w-[476px] text-center font-normal text-base leading-6">
        {agreementText.prefix}
        <Link
          className="text-cyan-500 hover:underline"
          href={privacyPolicy.link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {agreementText.linkText}
        </Link>
        {agreementText.suffix}
      </p>
    </div>
  );
}
