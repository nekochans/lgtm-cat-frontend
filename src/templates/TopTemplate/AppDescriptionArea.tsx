import type { Language } from '@/features';
import { assertNever } from '@/utils';
import type { FC } from 'react';
import styles from './AppDescriptionArea.module.css';

const jaUpperSectionText = '猫のLGTM画像を共有出来るサービスです。';

const jaLowerSectionText =
  '画像をクリックするとGitHub Markdownがコピーされます。';

const enUpperSectionText = 'Cat LGTM Image Service.';

const enLowerSectionText = 'Click on the image to copy the GitHub Markdown.';

export type Props = {
  language: Language;
};

const JaAppDescriptionArea: FC = () => (
  <div>
    <div className={`${styles.text} ${styles['ja-text']}`}>
      {jaUpperSectionText}
    </div>
    <div className={`${styles.text} ${styles['ja-text']}`}>
      {jaLowerSectionText}
    </div>
  </div>
);

const EnAppDescriptionArea: FC = () => (
  <div>
    <div className={`${styles.text} ${styles['en-text']}`}>
      {enUpperSectionText}
    </div>
    <div className={`${styles.text} ${styles['en-text']}`}>
      {enLowerSectionText}
    </div>
  </div>
);

export const AppDescriptionArea: FC<Props> = ({ language }) => {
  switch (language) {
    case 'ja':
      return <JaAppDescriptionArea />;
    case 'en':
      return <EnAppDescriptionArea />;
    default:
      return assertNever(language);
  }
};
