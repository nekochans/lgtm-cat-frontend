import type { FC } from 'react';
import {
  TermsOrPrivacyTemplate as OrgTermsOrPrivacyTemplate,
  useSwitchLanguage,
  type TemplateType,
} from '@nekochans/lgtm-cat-ui';

import { MarkdownContents } from '../../components';
import {
  metaTagList,
  languages,
  i18nUrlList,
  type Language,
} from '../../features';
import { DefaultLayout } from '../../layouts';
import { assertNever } from '../../utils';

type Props = {
  type: TemplateType;
  language: Language;
  jaMarkdown: string;
  enMarkdown: string;
};

const createCanonicalLink = (type: TemplateType, language: Language) => {
  switch (type) {
    case 'terms':
      return language === 'en' ? i18nUrlList.terms?.en : i18nUrlList.terms?.ja;
    case 'privacy':
      return language === 'en'
        ? i18nUrlList.privacy?.en
        : i18nUrlList.privacy?.ja;
    default:
      return assertNever(type);
  }
};

const createAlternateUrls = (type: TemplateType) => {
  switch (type) {
    case 'terms':
      return languages.map((hreflang) => {
        if (hreflang === 'en') {
          return { link: i18nUrlList.terms?.en, hreflang };
        }

        return { link: i18nUrlList.terms?.ja, hreflang };
      });
    case 'privacy':
      return languages.map((hreflang) => {
        if (hreflang === 'en') {
          return { link: i18nUrlList.privacy?.en, hreflang };
        }

        return { link: i18nUrlList.privacy?.ja, hreflang };
      });
    default:
      return assertNever(type);
  }
};

// eslint-disable-next-line max-lines-per-function
export const TermsOrPrivacyTemplate: FC<Props> = ({
  type,
  language,
  jaMarkdown,
  enMarkdown,
}) => {
  const { isLanguageMenuDisplayed, onClickLanguageButton, onClickOutSideMenu } =
    useSwitchLanguage();

  const termsMarkdown = language === 'ja' ? jaMarkdown : enMarkdown;

  const metaTag =
    type === 'terms'
      ? metaTagList(language).terms
      : metaTagList(language).privacy;

  const canonicalLink = createCanonicalLink(type, language);

  const alternateUrls = createAlternateUrls(type);

  return (
    <DefaultLayout
      metaTag={metaTag}
      canonicalLink={canonicalLink}
      alternateUrls={alternateUrls}
    >
      <OrgTermsOrPrivacyTemplate
        type={type}
        language={language}
        isLanguageMenuDisplayed={isLanguageMenuDisplayed}
        onClickLanguageButton={onClickLanguageButton}
        onClickOutSideMenu={onClickOutSideMenu}
      >
        <MarkdownContents markdown={termsMarkdown} />
      </OrgTermsOrPrivacyTemplate>
    </DefaultLayout>
  );
};
