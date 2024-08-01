import { Footer } from '@/components';
import { MarkdownContentsWrapper } from '@/components/MarkdownContentsWrapper/MarkdownContentsWrapper';
import type { Meta, StoryObj } from '@storybook/react';
import { ExternalTransmissionTemplate } from './';

const jaMarkdown = `
# 外部送信ポリシー

LGTMeow では、サービス品質の向上やユーザーの皆様に合わせたサービスを提供することを目的として、サービスの一部で第三者が提供するシステムを利用しています。そのため、ユーザの皆様に関する情報を第三者のシステムに送信することがあります。

このページでは、ユーザの皆様に安心してサービスをご利用いただくため、上記のようにユーザーの皆様の端末（ブラウザ・モバイルアプリの別を問わず）から外部送信される情報について、送信先、情報の内容、目的を公開いたします。

## Google アナリティクス

**送信先事業者名**: [Google LLC.](https://about.google/intl/ALL_jp/)

**送信される情報**:

- 端末情報（端末の種類やOSの種類など）
- ユーザー情報（ユーザーIDなど）
- ユーザーのアプリ内の操作に関する情報（セッション情報やユーザーエージェントなど）

**弊社での利用目的**: ユーザーの行動を統計的に分析し、サービスの改善に役立てるため。

**送信先事業者での利用目的**:

- サービスの最適化のため
- サービス利用状況の分析を行うため

## Sentry

**送信先事業者名**: [Sentry.](https://sentry.io/about/)

**送信される情報**:

- 端末情報（デバイスIDやOSの種類など）
- ユーザー情報（ユーザーIDなど）
- クラッシュした際の状況に関する情報

**弊社での利用目的**: アプリケーションでエラーや障害が発生した時に、その内容を記録するため

**送信先事業者での利用目的**:

- エラーレポートと問題解析のため

2024 年 7 月 10 日 制定
`;

const enMarkdown = `
# External Transmission Policy

At LGTMeow, we use systems provided by third parties as part of our services to improve service quality and offer tailored services to our users. Therefore, we may transmit information about our users to third-party systems.

This page provides details about the information transmitted externally from users' devices (whether through browsers or mobile apps), including the destination, content, and purpose of the transmitted information, to ensure that users can use our services with confidence.

## Google Analytics

**Recipient Entity Name**: [Google LLC.](https://about.google/intl/ALL_jp/)

**Information Transmitted**:

- Device information (such as device type and OS type)
- User information (such as user ID)
- Information about user actions within the app (such as session information and user agent)

**Purpose of Use by Our Company**: To statistically analyze user behavior and improve our services.

**Purpose of Use by the Recipient Entity**:

- For service optimization
- To analyze service usage

## Sentry

**Recipient Entity Name**: [Sentry.](https://sentry.io/about/)

**Information Transmitted**:

- Device information (such as device ID and OS type)
- User information (such as user ID)
- Information about the circumstances during a crash

**Purpose of Use by Our Company**: To record details when errors or issues occur in the application.

**Purpose of Use by the Recipient Entity**:

- For error reporting and problem analysis

Established on July 10, 2024
`;

const meta = {
  component: ExternalTransmissionTemplate,
} satisfies Meta<typeof ExternalTransmissionTemplate>;

export default meta;

type Story = StoryObj<typeof ExternalTransmissionTemplate>;

const languageJa = 'ja';

const languageEn = 'en';

const ExternalTransmissionPolicyJapanese = () => {
  return (
    <MarkdownContentsWrapper
      type="externalTransmission"
      language={languageJa}
      markdown={jaMarkdown}
    />
  );
};

const ExternalTransmissionPolicyEnglish = () => {
  return (
    <MarkdownContentsWrapper
      type="externalTransmission"
      language={languageEn}
      markdown={enMarkdown}
    />
  );
};

export const ViewExternalTransmissionPolicyInJapanese: Story = {
  args: {
    language: languageJa,
    currentUrlPath: '/external-transmission-policy',
    children: <ExternalTransmissionPolicyJapanese />,
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    (Story) => (
      <>
        <Story />
        <Footer language={languageJa} />
      </>
    ),
  ],
};

export const ViewExternalTransmissionPolicyInEnglish: Story = {
  args: {
    language: languageEn,
    currentUrlPath: '/en/external-transmission-policy',
    children: <ExternalTransmissionPolicyEnglish />,
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    (Story) => (
      <>
        <Story />
        <Footer language={languageEn} />
      </>
    ),
  ],
};
