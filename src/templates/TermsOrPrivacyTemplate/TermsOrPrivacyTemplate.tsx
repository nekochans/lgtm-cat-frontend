import {
  TermsOrPrivacyTemplate as OrgTermsOrPrivacyTemplate,
  useSwitchLanguage,
  type TemplateType,
} from '@nekochans/lgtm-cat-ui';

import { MarkdownContents } from '../../components';
import {
  metaTagList,
  appUrlList,
  languages,
  type Language,
} from '../../features';
import { useSaveSettingLanguage } from '../../hooks';
import { DefaultLayout } from '../../layouts';

import type { FC } from 'react';

type Props = {
  type: TemplateType;
  language: Language;
  jaMarkdown: string;
  enMarkdown: string;
};

// eslint-disable-next-line max-lines-per-function
export const TermsOrPrivacyTemplate: FC<Props> = ({
  type,
  language,
  jaMarkdown,
  enMarkdown,
}) => {
  const { saveSettingLanguage } = useSaveSettingLanguage();

  const {
    isLanguageMenuDisplayed,
    selectedLanguage,
    onClickEn,
    onClickJa,
    onClickLanguageButton,
    onClickOutSideMenu,
  } = useSwitchLanguage(language, saveSettingLanguage);

  const termsMarkdown = selectedLanguage === 'ja' ? jaMarkdown : enMarkdown;

  const metaTag =
    type === 'terms'
      ? metaTagList(language).terms
      : metaTagList(language).privacy;

  const canonicalLink =
    type === 'terms'
      ? (`${appUrlList.terms}/` as const)
      : (`${appUrlList.privacy}/` as const);

  const alternateUrls = languages.map((hreflang) => {
    const link =
      hreflang === 'ja'
        ? canonicalLink
        : (`${canonicalLink}${hreflang}/` as const);

    return { link, hreflang };
  });

  return (
    <DefaultLayout
      metaTag={metaTag}
      canonicalLink={canonicalLink}
      alternateUrls={alternateUrls}
    >
      <OrgTermsOrPrivacyTemplate
        type={type}
        language={selectedLanguage}
        isLanguageMenuDisplayed={isLanguageMenuDisplayed}
        onClickEn={onClickEn}
        onClickJa={onClickJa}
        onClickLanguageButton={onClickLanguageButton}
        onClickOutSideMenu={onClickOutSideMenu}
      >
        <MarkdownContents markdown={termsMarkdown} />
      </OrgTermsOrPrivacyTemplate>
    </DefaultLayout>
  );
};
