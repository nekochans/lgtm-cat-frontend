import {
  LibraryBooks,
  MarkdownContents,
  MarkdownPageTitle,
  ResponsiveLayout,
} from '@/components';
import {
  createPrivacyPolicyLinksFromLanguages,
  createTermsOfUseLinksFromLanguages,
  i18nUrlList,
  languages,
  metaTagList,
  type Language,
} from '@/features';
import { useSwitchLanguage } from '@/hooks';
import { DefaultLayout } from '@/layouts';
import { assertNever } from '@/utils';
import type { FC } from 'react';
import styles from './TermsOrPrivacyTemplate.module.css';

export type TemplateType = 'terms' | 'privacy';

type Props = {
  type: TemplateType;
  language: Language;
  jaMarkdown: string;
  enMarkdown: string;
};

const createTitle = (type: TemplateType, language: Language): string => {
  switch (type) {
    case 'privacy':
      return createPrivacyPolicyLinksFromLanguages(language).text;
    case 'terms':
      return createTermsOfUseLinksFromLanguages(language).text;
    default:
      return assertNever(type);
  }
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

  const currentUrlPath =
    type === 'terms'
      ? createTermsOfUseLinksFromLanguages(language).link
      : createPrivacyPolicyLinksFromLanguages(language).link;

  return (
    <DefaultLayout
      metaTag={metaTag}
      canonicalLink={canonicalLink}
      alternateUrls={alternateUrls}
    >
      <div onClick={onClickOutSideMenu} aria-hidden="true">
        <ResponsiveLayout
          language={language}
          isLanguageMenuDisplayed={isLanguageMenuDisplayed}
          onClickLanguageButton={onClickLanguageButton}
          currentUrlPath={currentUrlPath}
        >
          <div className={styles.wrapper}>
            <MarkdownPageTitle text={createTitle(type, language)} />
            <LibraryBooks />
            <div className={styles['children-wrapper']}>
              <MarkdownContents markdown={termsMarkdown} />
            </div>
          </div>
        </ResponsiveLayout>
      </div>
    </DefaultLayout>
  );
};
