import { Footer } from '@/components';
import { MarkdownContentsWrapper } from '@/components/MarkdownContentsWrapper/MarkdownContentsWrapper';
import type { Meta, StoryObj } from '@storybook/react';
import { TermsOrPrivacyTemplate } from './';

const privacyPolicyJa = `
# プライバシーポリシー

nekochans（以下，「運営チーム」といいます。）は，本ウェブサイト上で提供するサービス（以下,「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。

## 1. 個人情報の定義

「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。

## 2. 個人情報の取得方法

本サービスでは登録およびご利用に際して以下の情報を取得し，運営チームはそれらを個人情報として取り扱います。

- GitHub アカウントに関する情報
- メールアドレス

## 3. 個人情報を取得・利用する目的

運営チームが個人情報を取得・利用する目的は，以下のとおりです。

1. 本サービスの提供・運営のため
1. ユーザーからのお問い合わせに回答するため
1. 利用規約に違反したユーザーや，不正・不当な目的でサービスを利用しようとするユーザーの特定をし，ご利用をお断りするため
1. ユーザーにご自身の登録情報の閲覧や変更，削除，ご利用状況の閲覧を行っていただくため
1. 本サービス全体の統計情報としてデータを解析するため
1. 上記の利用目的に付随する目的

## 4. 個人情報を取得・利用する目的

運営チームは，利用目的が変更前と関連性を有すると合理的に認められる場合に限り，個人情報の利用目的を変更するものとします。
利用目的の変更を行った場合には，変更後の目的について，運営チーム所定の方法により，ユーザーに通知し，または本ウェブサイト上に公表するものとします。

## 5. 個人情報の第三者提供

1. 運営チームは，次に掲げる場合を除いて，あらかじめユーザーの同意を得ることなく，第三者に個人情報を提供することはありません。ただし，個人情報保護法その他の法令で認められる場合を除きます。

   1. 人の生命，身体または財産の保護のために必要がある場合であって，本人の同意を得ることが困難であるとき
   1. 公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって，本人の同意を得ることが困難であるとき
   1. 国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって，本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
   1. 予め次の事項を告知あるいは公表し，かつ運営チームが個人情報保護委員会に届出をしたとき
      1. 利用目的に第三者への提供を含むこと
      1. 第三者に提供されるデータの項目
      1. 第三者への提供の手段または方法
      1. 本人の求めに応じて個人情報の第三者への提供を停止すること
      1. 本人の求めを受け付ける方法

1. 前項の定めにかかわらず，次に掲げる場合には，当該情報の提供先は第三者に該当しないものとします。
   1. 運営チームが利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合
   1. 合併その他の事由による事業の承継に伴って個人情報が提供される場合

## 6. Cookie 及び LocalStorage の利用について

本サービスではログイン状態の確認，ユーザー利便性の向上，統計データの取得のため，Cookie 及び LocalStorage を利用しています。Cookie 及び Localstorage の設定を変更し，機能を無効にすることができます。但し，その結果，本サービスの全部または一部の機能がご利用いただけなくなることがあります。

## 7. アクセス解析ツールについて

本サービスでは，Google によるアクセス解析ツール「Google Analytics」を利用しています。この Google Analytics はトラフィックデータの収集のために Cookie を使用しています。このトラフィックデータは匿名で収集されており，個人を特定するものではありません。Google Analytics から提供される Cookie の使用に関する説明，Cookie によって収集される情報について詳しくお知りになりたい方は，Google Analytics のプライバシーポリシーをご確認ください。
この機能は Cookie を無効にすることで収集を拒否することが出来ますので，お使いのブラウザの設定をご確認ください。

## 8. プライバシーポリシーの変更

本ポリシーの内容は，法令その他本ポリシーに別段の定めのある事項を除いて，ユーザーに通知することなく，変更することができるものとします。
運営チームが別途定める場合を除いて，変更後のプライバシーポリシーは，本ウェブサイトに掲載したときから効力を生じるものとします。

## 9. お問い合わせ窓口

本ポリシーに関するお問い合わせは，下記の窓口までお願いいたします。

[お問い合わせフォーム](https://docs.google.com/forms/d/e/1FAIpQLSf0-A1ysrWQFCDuOZY8f2uH5KhUCB5yqi7TlLEsgl95Q9WKtw/viewform)

2021 年 2 月 22 日 制定
`;

const privacyPolicyEn = `
# Privacy Policy

nekochans (hereinafter referred to as the "Management Team") (hereinafter referred to as the "Management Team") handles the personal information of users in the services provided on this website (hereinafter referred to as the "Service"). The following privacy policy (hereinafter referred to as the "Privacy Policy") applies to the handling of users' personal information in the services provided on this website (hereinafter referred to as the "Services"). The following privacy policy (hereinafter referred to as the "Policy") is set forth below.

## 1. Definition of Personal Information

Personal information" refers to "personal information" as defined in the Act on the Protection of Personal Information, and includes information about living individuals that can be used to identify specific individuals by name, date of birth, address, telephone number, contact information, and other descriptions, as well as data related to appearance, fingerprints, voiceprints, and health insurance card insurer numbers. Personal information refers to information that can identify a specific individual by itself, such as name, date of birth, address, telephone number, contact information, or any other description.

## 2. Method of obtaining personal information

The following information will be acquired during registration and use of the service, and will be treated as personal information by the management team.

- Information about your GitHub account
- Your email address

## 3. Purpose of collecting and using personal information

The purpose of collecting and using personal information by the Management Team is as follows: 1.

1. To provide and operate the Service
1. To respond to inquiries from users
1. To identify users who violate the Terms of Use or who attempt to use the Service for illegal or improper purposes, and to refuse their use of the Service
1. to allow users to view, change, or delete their own registration information, or to view the status of their use of the Service
1. To analyze data as statistical information for the Service as a whole
1. for purposes incidental to the above purposes of use
`;

const termsOfUseJa = `
# 利用規約

この利用規約（以下，「本規約」といいます。）は，nekochans（以下，「運営チーム」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。ご利用の皆さま（以下，「ユーザー」といいます。）は、本サービスをご利用頂くにあたり、本規約の全ての条項について同意頂く必要があります。本サービスをご利用頂いた場合、本規約の内容を理解し、かつ、本規約の全ての条項について同意したものとみなします。

## 第 1 条（適用）

本規約は，ユーザーと運営チームとの間の本サービスの利用に関わる一切の関係に適用されるものとします。
運営チームが当ウェブサイトに掲載するプライバシーポリシーは，本規約の一部を構成するものとします。

## 第 2 条（利用登録）

登録希望者が運営チームの定める方法によって利用登録を申請し，運営チームがこれを承認することによって，利用登録が完了するものとします。
運営チームは，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。

1. 利用登録の申請に際して虚偽の事項を届け出た場合
1. 本規約に違反したことがある者からの申請である場合
1. 反社会的勢力等（暴力団，暴力団員，右翼団体，反社会的勢力，その他これに準ずる者を意味します。）である，または資金提供その他を通じて反社会的勢力等の維持，運営もしくは経営に協力もしくは関与する等反社会的勢力との何らかの交流もしくは関与を行っているもしくは運営チームが判断した場合
1. その他，運営チームが利用登録を相当でないと判断した場合

## 第 3 条（アカウント登録の管理）

ユーザーは，[GitHub](https://github.com) アカウントを含む，本サービスの利用に際して当サイトに登録した情報については，ユーザー自身の責任において，登録，変更，及び管理するものとします。GitHub に登録しているユーザーの GitHub アカウントによって本サービスが利用された場合には，その GitHub アカウントを保有するユーザーによって本サービスが利用されたものとみなされます。
ユーザーの GitHub アカウントの不正使用によって生じた損害に関する責任はユーザーが負うものとし，運営チームは一切の責任を負いません。

## 第 4 条（GitHub OAuth Apps の許可権限）

運営チームは，本サービスへのログインを行うための情報取得手段，GitHub アカウントのアクセストークンの取得手段として，本サービスによる GitHub 情報の参照権限をユーザーに要求します。本サービスは GitHub アカウント情報の読み取り権限をユーザーから許可を取得します。
これによって知り得た情報は別の目的への利用及び第三者への開示などは行わないものとします。

## 第 5 条（退会）

ユーザーは，運営チームの定める方法で運営チームに通知することにより，本サービスから退会し，自己のユーザーとしての登録を抹消できます。

## 第 6 条（禁止事項）

ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。

1. 法令または公序良俗に違反する行為
1. 犯罪行為に関連する行為
1. 運営チームのサーバーまたはネットワークの機能を破壊したり，妨害したりする行為
1. 運営チームのサービスの運営を妨害するおそれのある行為
1. 他のユーザーに関する個人情報等を収集または蓄積する行為
1. 他のユーザーに成りすます行為
1. 運営チームのサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為
1. その他，運営チームが不適切と判断する行為

## 第 7 条（本サービスの提供の停止等）

運営チームは，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。

1. 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
1. 地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合
1. コンピュータまたは通信回線等が事故により停止した場合
1. その他，運営チームが本サービスの提供が困難と判断した場合

運営チームは，本サービスの提供の停止または中断により，ユーザーまたは第三者が被ったいかなる不利益または損害について，理由を問わず一切の責任を負わないものとします。

2021 年 2 月 22 日 制定

- 2022 年 7 月 14 日 一部改訂
`;

const termsOfUseEn = `
# Terms of Use

These Terms of Use (hereinafter referred to as the "Terms of Use") This Terms of Use Agreement (hereinafter referred to as the "Agreement") applies to the services provided by nekochans (hereinafter referred to as the "Management Team") (hereinafter referred to as the "Management Team") provides on this website (hereinafter referred to as the "Service"). The "Terms and Conditions of Use" (the "Terms and Conditions") set forth the terms and conditions of use of the services provided by nekochans (the "Management Team") on this website (the "Services"). The terms and conditions for the use of the Service are set forth below. Users (hereinafter referred to as "Users") are required to agree to all of the terms and conditions of this Agreement when using the Service. By using the Service, you are deemed to have understood and agreed to all of the terms and conditions of this Agreement.

## Article 1 (Application)

These Terms of Use shall apply to all relationships related to the use of the Service between the user and the Management Team.
The privacy policy posted by the Management Team on the Website shall constitute a part of these Terms.

## Article 2 (Registration for Use)

Registration for use shall be completed when the applicant applies for registration for use in accordance with the method prescribed by the Management Team and when the Management Team approves the application.
The Operator may not approve the application for registration if it determines that the applicant has any of the following reasons, and shall not be obliged to disclose any reasons for such denial. 1.

1. The applicant has provided false information when applying for registration.
1. If the application is from a person who has violated these Terms of Use
1. the application is from a person who is an antisocial force, etc. (meaning a crime syndicate, a member of a crime syndicate, a right-wing organization, an antisocial force, or any other person equivalent thereto) 1. if the Operator Team determines that the applicant is an anti-social force, etc. (which means a crime syndicate, organized crime syndicate, right-wing group, anti-social force, or other equivalent), or is involved in any interaction or involvement with anti-social forces, such as cooperation or involvement in the maintenance, operation or management of anti-social forces, etc. through funding or otherwise
1. any other case in which the Management Team determines that the registration for use is inappropriate.

## Article 3 (Management of Account Registration)

User shall be responsible for registering, changing, and managing the information registered on the Site when using the Service, including [GitHub](https://github.com) account. If you use the Services through your GitHub account, you are deemed to have used the Services by the user who owns that GitHub account.
You shall be responsible for any damages caused by unauthorized use of your GitHub account, and the Management Team shall not be liable for any such damages.
`;

const meta: Meta<typeof TermsOrPrivacyTemplate> = {
  component: TermsOrPrivacyTemplate,
};

export default meta;

type Story = StoryObj<typeof TermsOrPrivacyTemplate>;

const languageJa = 'ja';

const languageEn = 'en';

const PrivacyPolicyJapanese = () => {
  return (
    <MarkdownContentsWrapper
      type="privacy"
      language={languageJa}
      markdown={privacyPolicyJa}
    />
  );
};

const PrivacyPolicyEnglish = () => {
  return (
    <MarkdownContentsWrapper
      type="privacy"
      language={languageEn}
      markdown={privacyPolicyEn}
    />
  );
};

const TermsOfUseJapanese = () => {
  return (
    <MarkdownContentsWrapper
      type="terms"
      language={languageJa}
      markdown={termsOfUseJa}
    />
  );
};

const TermsOfUseEnglish = () => {
  return (
    <MarkdownContentsWrapper
      type="terms"
      language={languageEn}
      markdown={termsOfUseEn}
    />
  );
};

export const ViewPrivacyPolicyInJapanese: Story = {
  args: {
    language: languageJa,
    currentUrlPath: '/privacy',
    children: <PrivacyPolicyJapanese />,
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

export const ViewPrivacyPolicyInEnglish: Story = {
  args: {
    language: languageEn,
    currentUrlPath: '/en/privacy',
    children: <PrivacyPolicyEnglish />,
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

export const ViewTermsOfUseInJapanese: Story = {
  args: {
    language: languageJa,
    currentUrlPath: '/terms',
    children: <TermsOfUseJapanese />,
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

export const ViewTermsOfUseInEnglish: Story = {
  args: {
    language: languageEn,
    currentUrlPath: '/en/terms',
    children: <TermsOfUseEnglish />,
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
