import {
  TermsOrPrivacyTemplate as OrgTermsOrPrivacyTemplate,
  useSwitchLanguage,
  type TemplateType,
} from '@nekochans/lgtm-cat-ui';

import { MarkdownContents } from '../../components';
import {
  metaTagList,
  languages,
  type Language,
  i18nUrlList,
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
    type === 'terms' ? i18nUrlList.terms?.ja : i18nUrlList.privacy?.ja;

  const alternateUrls = languages.map((hreflang) => {
    if (hreflang === 'ja') {
      return { link: canonicalLink, hreflang };
    }

    const link =
      type === 'terms' ? i18nUrlList.terms?.en : i18nUrlList.privacy?.en;

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
