// 絶対厳守：編集前に必ずAI実装ルールを読む

import Image from "next/image";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import {
  getHowToUseTexts,
  howToUseScreenshotPath,
} from "@/features/docs/functions/how-to-use-text";
import type { Language } from "@/features/language";
import type { IncludeLanguageAppPath } from "@/features/url";
import { appBaseUrl } from "@/features/url";

// トップレベルに正規表現を定義
const MARKDOWN_LINK_SPLIT_REGEX = /(\[[^\]]+\]\([^)]+\))/g;
const MARKDOWN_LINK_MATCH_REGEX = /\[([^\]]+)\]\(([^)]+)\)/;
const BACKTICK_CODE_SPLIT_REGEX = /(`[^`]+`)/g;
const BACKTICK_CODE_MATCH_REGEX = /`([^`]+)`/;

interface Props {
  readonly language: Language;
  readonly currentUrlPath: IncludeLanguageAppPath;
}

interface SectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * 使い方ページの各セクションを表示するコンポーネント
 *
 * @param title - セクションのタイトル
 * @param children - セクションの内容
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

interface TextWithLinksProps {
  readonly text: string;
  readonly baseUrl: string;
}

/**
 * URLが内部リンクかどうかを判定する
 * @param url - 判定対象のURL
 * @param baseUrl - アプリケーションのベースURL
 * @returns 内部リンクの場合true
 */
function isInternalUrl(url: string, baseUrl: string): boolean {
  // 相対パスは内部リンク
  if (!(url.startsWith("http://") || url.startsWith("https://"))) {
    return true;
  }
  // appBaseUrl() のドメインと一致する場合は内部リンク
  return url.startsWith(baseUrl);
}

/**
 * マークダウン形式のリンクとコードをパースしてReact要素に変換するコンポーネント
 *
 * 注意事項:
 * - このコンポーネントは <p> タグを返すため、<li> 内で使用する場合は
 *   スタイリングに影響がないことを確認すること
 * - 現在のマークダウンパーサーはシンプルな [text](url) 形式のみをサポート
 * - ネストした括弧やエスケープ文字を含むURLは非対応
 */
function TextWithLinks({ text, baseUrl }: TextWithLinksProps) {
  // マークダウン形式のリンク [text](url) をパースして変換
  const parts = text.split(MARKDOWN_LINK_SPLIT_REGEX);

  return (
    <p>
      {parts.map((part) => {
        const linkMatch = part.match(MARKDOWN_LINK_MATCH_REGEX);
        if (linkMatch) {
          const [, linkText, linkUrl] = linkMatch;
          // 内部リンクは同じタブで開く、外部リンクは新しいタブで開く
          const isInternal = isInternalUrl(linkUrl, baseUrl);
          return (
            <a
              className="text-cyan-500 hover:underline"
              href={linkUrl}
              key={`link-${linkUrl}`}
              {...(!isInternal && {
                rel: "noopener noreferrer",
                target: "_blank",
              })}
            >
              {linkText}
            </a>
          );
        }
        // バッククォートで囲まれたテキストをコードとして表示
        const codeParts = part.split(BACKTICK_CODE_SPLIT_REGEX);
        // 空文字列や空白のみの場合はそのまま返す
        if (codeParts.length === 1 && codeParts[0] === part) {
          return <span key={`text-${part.slice(0, 30)}`}>{part}</span>;
        }
        return (
          <span key={`text-group-${part.slice(0, 30)}`}>
            {codeParts.map((codePart) => {
              const codeMatch = codePart.match(BACKTICK_CODE_MATCH_REGEX);
              if (codeMatch) {
                return (
                  <code
                    className="rounded bg-orange-100 px-1 py-0.5 font-mono text-orange-800"
                    key={`code-${codeMatch[1]}`}
                  >
                    {codeMatch[1]}
                  </code>
                );
              }
              return codePart;
            })}
          </span>
        );
      })}
    </p>
  );
}

export function DocsHowToUsePage({ language, currentUrlPath }: Props) {
  const texts = getHowToUseTexts(language);
  const baseUrl = appBaseUrl();

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-4 py-8 sm:gap-7 sm:px-10 sm:py-[60px]">
        {/* セクション1: LGTMとは? */}
        <Section title={texts.whatIsLgtm.title}>
          {texts.whatIsLgtm.content.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Section>

        {/* セクション2: LGTMeowとは */}
        <Section title={texts.whatIsLgtmeow.title}>
          {texts.whatIsLgtmeow.content.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Section>

        {/* セクション3: LGTM画像を選んでコピーする */}
        <Section title={texts.copyByClicking.title}>
          <TextWithLinks baseUrl={baseUrl} text={texts.copyByClicking.intro} />
          <p>{texts.copyByClicking.buttonDescription[0]}</p>
          <ul className="list-disc pl-6">
            <li>
              <TextWithLinks
                baseUrl={baseUrl}
                text={texts.copyByClicking.buttonDescription[1]}
              />
            </li>
            <li>
              <TextWithLinks
                baseUrl={baseUrl}
                text={texts.copyByClicking.buttonDescription[2]}
              />
            </li>
          </ul>
          <p className="mt-4">{texts.copyByClicking.screenshotDescription}</p>
          <div className="flex justify-center">
            <Image
              alt={
                language === "ja"
                  ? "GitHubでのLGTM画像表示例"
                  : "Example of LGTM image displayed on GitHub"
              }
              className="rounded-lg border border-orange-200"
              height={409}
              src={howToUseScreenshotPath}
              width={635}
            />
          </div>
        </Section>

        {/* セクション4: LGTM画像をランダムでコピーする */}
        <Section title={texts.copyRandom.title}>
          <TextWithLinks baseUrl={baseUrl} text={texts.copyRandom.content} />
        </Section>

        {/* セクション5: 猫画像をアップロードしてLGTM画像を作成する */}
        <Section title={texts.uploadCatPhoto.title}>
          {texts.uploadCatPhoto.content.map((line) => (
            <TextWithLinks baseUrl={baseUrl} key={line} text={line} />
          ))}
        </Section>

        {/* セクション6: お問い合わせ */}
        <Section title={texts.contact.title}>
          <p>{texts.contact.intro}</p>
          <p>{texts.contact.methodsIntro}</p>
          <ol className="list-decimal pl-6">
            <li>
              <span className="font-medium">{texts.contact.issueLabel}</span>
              <p className="mt-1">
                <a
                  className="text-cyan-500 hover:underline"
                  href={texts.contact.issueUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {texts.contact.issueLinkText}
                </a>
              </p>
            </li>
            <li>
              <span className="font-medium">{texts.contact.formLabel}</span>
              <p className="mt-1">
                <a
                  className="text-cyan-500 hover:underline"
                  href={texts.contact.formUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {texts.contact.formLinkText}
                </a>
              </p>
            </li>
          </ol>
        </Section>
      </div>
    </PageLayout>
  );
}
