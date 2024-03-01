import type { FC, ReactNode } from 'react';
import { Header, type Props as HeaderProps } from '../../Header';
import styles from './ResponsiveLayout.module.css';

export type Props = HeaderProps & { children: ReactNode };

export const ResponsiveLayout: FC<Props> = ({
  language,
  isLanguageMenuDisplayed,
  onClickLanguageButton,
  currentUrlPath,
  children,
}) => (
  <div className={styles.wrapper}>
    <Header
      language={language}
      isLanguageMenuDisplayed={isLanguageMenuDisplayed}
      onClickLanguageButton={onClickLanguageButton}
      currentUrlPath={currentUrlPath}
    />
    <div className={styles['contents-wrapper']}>{children}</div>
  </div>
);
