// 絶対厳守：編集前に必ずAI実装ルールを読む

import Image from "next/image";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import {
  getBasicFeatureFullDescription,
  getGitHubAppTexts,
  installScreenshotHeight,
  installScreenshotPath,
  installScreenshotWidth,
  sampleLgtmScreenshotHeight,
  sampleLgtmScreenshotPath,
  sampleLgtmScreenshotWidth,
} from "@/features/docs/functions/github-app-text";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

interface SectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * GitHub Appページの各セクションを表示するコンポーネント
 */
function Section({ title, children }: SectionProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="shrink-0 font-bold text-orange-500 text-xl leading-7">
          {title}
        </h2>
        <div className="h-px flex-1 bg-orange-300" />
      </div>
      <div className="flex flex-col gap-2 text-base text-orange-900 leading-6">
        {children}
      </div>
    </div>
  );
}

export function DocsGitHubAppPage({ language, currentUrlPath }: Props) {
  const texts = getGitHubAppTexts(language);
  const basicFeatureDescription = getBasicFeatureFullDescription(language);

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-4 py-8 sm:gap-7 sm:px-10 sm:py-[60px]">
        {/* セクション1: LGTMeow GitHub App (概要) */}
        <Section title={texts.overview.title}>
          <p>
            {texts.overview.beforeLink}
            <a
              className="text-cyan-500 hover:underline"
              href={texts.overview.linkUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {texts.overview.linkText}
            </a>
            {texts.overview.afterLink}
          </p>
        </Section>

        {/* セクション2: インストール */}
        <Section title={texts.install.title}>
          <p>
            {texts.install.beforeLink}
            <a
              className="text-cyan-500 hover:underline"
              href={texts.install.linkUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {texts.install.linkText}
            </a>
            {texts.install.afterLink}
          </p>
          <div className="mt-4 flex justify-center">
            <Image
              alt={texts.install.screenshotAlt}
              className="rounded-lg border border-orange-200"
              height={installScreenshotHeight}
              loading="lazy"
              src={installScreenshotPath}
              width={installScreenshotWidth}
            />
          </div>
        </Section>

        {/* セクション3: 基本機能 LGTM画像の自動投稿 */}
        <Section title={texts.basicFeature.title}>
          <p>{texts.basicFeature.intro}</p>
          <p>
            {basicFeatureDescription.beforeApprove}
            <code className="rounded bg-orange-100 px-1.5 py-0.5 font-mono text-orange-800 text-sm">
              {basicFeatureDescription.approveText}
            </code>
            {basicFeatureDescription.afterApprove}
          </p>
          <div className="mt-4 flex justify-center">
            <Image
              alt={texts.basicFeature.screenshotAlt}
              className="rounded-lg border border-orange-200"
              height={sampleLgtmScreenshotHeight}
              loading="lazy"
              src={sampleLgtmScreenshotPath}
              width={sampleLgtmScreenshotWidth}
            />
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}
