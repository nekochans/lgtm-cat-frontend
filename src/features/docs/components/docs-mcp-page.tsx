// 絶対厳守：編集前に必ずAI実装ルールを読む

import Image from "next/image";
import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import { CodeSnippet } from "@/features/docs/components/code-snippet";
import {
  getMcpTexts,
  type McpConfigPattern,
  type McpGitHubActionsExample,
  type McpToolInfo,
} from "@/features/docs/functions/mcp-text";
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
 * MCPページの各セクションを表示するコンポーネント
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

interface SubSectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * MCPページのサブセクションを表示するコンポーネント
 */
function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold text-lg text-orange-800">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

interface ToolSectionProps {
  readonly tool: McpToolInfo;
  readonly language: Language;
}

/**
 * ツール情報を表示するコンポーネント
 */
function ToolSection({ tool, language }: ToolSectionProps) {
  const responseFormatLabel =
    language === "ja" ? "レスポンス形式:" : "Response Format:";
  const responseExampleLabel =
    language === "ja" ? "レスポンス例:" : "Response Example:";

  return (
    <SubSection title={tool.name}>
      <p>{tool.description}</p>
      <p className="text-orange-700 text-sm">
        <span className="font-medium">{responseFormatLabel}</span>{" "}
        {tool.responseFormat}
      </p>
      <p className="font-medium text-orange-700 text-sm">
        {responseExampleLabel}
      </p>
      <CodeSnippet code={tool.responseExample} />
    </SubSection>
  );
}

interface ConfigPatternSectionProps {
  readonly pattern: McpConfigPattern;
  readonly index: number;
}

/**
 * 設定パターンを表示するコンポーネント
 */
function ConfigPatternSection({ pattern, index }: ConfigPatternSectionProps) {
  return (
    <SubSection title={`${index + 1}. ${pattern.title}`}>
      {pattern.description && <p>{pattern.description}</p>}
      <CodeSnippet code={pattern.code} />
      {pattern.note && (
        <p className="text-orange-700 text-sm">{pattern.note}</p>
      )}
    </SubSection>
  );
}

interface GitHubActionsExampleSectionProps {
  readonly example: McpGitHubActionsExample;
  readonly language: Language;
}

/**
 * GitHub Actions の例を表示するコンポーネント
 */
function GitHubActionsExampleSection({
  example,
  language,
}: GitHubActionsExampleSectionProps) {
  const folderStructureLabel =
    language === "ja" ? "フォルダ構成" : "Folder Structure";
  const workflowLabel =
    language === "ja"
      ? "GitHub Actions ワークフロー"
      : "GitHub Actions Workflow";
  const outputImageLabel =
    language === "ja" ? "出力イメージ" : "Output Example";

  return (
    <SubSection title={example.title}>
      <p>{example.description}</p>

      {/* フォルダ構成 */}
      <p className="mt-2 font-medium text-orange-800">{folderStructureLabel}</p>
      {example.folderNote && (
        <p className="text-orange-700 text-sm">{example.folderNote}</p>
      )}
      <CodeSnippet code={example.folderStructure} />

      {/* MCP設定ファイル (Claude Code の場合のみ) */}
      {example.mcpConfigCode && example.mcpConfigDescription && (
        <>
          <p className="mt-2 font-medium text-orange-800">
            {example.mcpConfigDescription}
          </p>
          <CodeSnippet code={example.mcpConfigCode} />
        </>
      )}

      {/* ワークフローファイル */}
      <p className="mt-2 font-medium text-orange-800">{workflowLabel}</p>
      <CodeSnippet code={example.workflowCode} />

      {/* 出力イメージ */}
      <p className="mt-4 font-medium text-orange-800">{outputImageLabel}</p>
      <p>{example.outputDescription}</p>
      <div className="mt-2 flex justify-center">
        <Image
          alt={example.screenshotAlt}
          className="rounded-lg border border-orange-200"
          height={example.screenshotHeight}
          loading="lazy"
          src={example.screenshotPath}
          width={example.screenshotWidth}
        />
      </div>
    </SubSection>
  );
}

export function DocsMcpPage({ language, currentUrlPath }: Props) {
  const texts = getMcpTexts(language);
  const useCasesLabel = language === "ja" ? "使用例:" : "Use cases:";

  return (
    <PageLayout
      currentUrlPath={currentUrlPath}
      isLoggedIn={false}
      language={language}
      mainClassName="flex w-full flex-1 flex-col items-center bg-background"
    >
      <div className="flex w-full max-w-[1020px] flex-col items-center gap-5 px-4 py-8 sm:gap-7 sm:px-10 sm:py-[60px]">
        {/* セクション1: LGTMeow MCPサーバー (概要) */}
        <Section title={texts.overview.title}>
          <p>{texts.overview.intro}</p>
          <p className="font-medium">{useCasesLabel}</p>
          <ul className="list-disc pl-6">
            {texts.overview.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </Section>

        {/* セクション2: 利用可能ツール */}
        <Section title={texts.availableTools.title}>
          {texts.availableTools.tools.map((tool) => (
            <ToolSection key={tool.name} language={language} tool={tool} />
          ))}
        </Section>

        {/* セクション3: MCPクライアントの設定方法 */}
        <Section title={texts.clientConfig.title}>
          <p>{texts.clientConfig.intro.main}</p>
          <div className="flex flex-col gap-1 rounded-lg bg-orange-50 p-4">
            <p className="font-medium text-orange-800">
              【{texts.clientConfig.intro.authTitle}】
            </p>
            <p className="text-orange-700 text-sm">
              {texts.clientConfig.intro.authDescription}
            </p>
            <p className="mt-2 font-medium text-orange-800">
              【{texts.clientConfig.intro.serverUrlTitle}】
            </p>
            <CodeSnippet
              code={texts.clientConfig.intro.serverUrl}
              variant="inline"
            />
          </div>
          <p className="mt-2">{texts.clientConfig.patternsIntro}</p>
          {texts.clientConfig.patterns.map((pattern, index) => (
            <ConfigPatternSection
              index={index}
              key={pattern.title}
              pattern={pattern}
            />
          ))}
        </Section>

        {/* セクション4: GitHub Actionsで LGTM画像を自動コメントする */}
        <Section title={texts.githubActions.title}>
          {texts.githubActions.examples.map((example) => (
            <GitHubActionsExampleSection
              example={example}
              key={example.title}
              language={language}
            />
          ))}
        </Section>
      </div>
    </PageLayout>
  );
}
