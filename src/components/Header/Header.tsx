import Link from 'next/link';
import { useState, type FC, type MouseEvent } from 'react';
import { FaBars } from 'react-icons/fa';
import Modal from 'react-modal';
import { GlobalMenu } from '../GlobalMenu';
import styles from './Header.module.css';
import { LanguageButton } from './LanguageButton';
import { LanguageMenu, type Props as LanguageMenuProps } from './LanguageMenu';

export type Props = LanguageMenuProps & {
  isLanguageMenuDisplayed: boolean;
  onClickLanguageButton: (event: MouseEvent<HTMLDivElement>) => void;
};

const modalStyle = {
  // stylelint-disable-next-line
  overlay: {
    background: 'rgba(54, 46, 43, 0.7)',
  },
  content: {
    top: '0',
    left: '0',
    width: '365px',
    height: '100vh',
  },
};

export const Header: FC<Props> = ({
  language,
  isLanguageMenuDisplayed,
  onClickLanguageButton,
  currentUrlPath,
}) => {
  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);

  const openMenu = () => {
    setIsMenuOpened(true);
  };

  const closeMenu = () => {
    setIsMenuOpened(false);
  };

  return (
    <>
      <Modal
        isOpen={isMenuOpened}
        ariaHideApp={false}
        style={modalStyle}
        onRequestClose={closeMenu}
      >
        <GlobalMenu language={language} onClickCloseButton={closeMenu} />
      </Modal>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <FaBars className={styles['fa-bars']} onClick={openMenu} />
          <Link href="/" prefetch={false}>
            <span className={styles.title} data-gtm-click="header-app-title">
              LGTMeow
            </span>
          </Link>
          <LanguageButton onClick={onClickLanguageButton} />
          {isLanguageMenuDisplayed ? (
            <LanguageMenu language={language} currentUrlPath={currentUrlPath} />
          ) : (
            ''
          )}
        </div>
      </div>
    </>
  );
};
