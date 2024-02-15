import type { FC, MouseEvent } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import styles from './LanguageButton.module.css';

type Props = {
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
};

export const LanguageButton: FC<Props> = ({ onClick }) => (
  // TODO 今はESLintのエラーを無視しているが https://github.com/nekochans/lgtm-cat-ui/issues/279 で修正する
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  <div className={styles.wrapper} onClick={onClick}>
    <p className={styles.text}>Language</p>
    <FaCaretDown className={styles['fa-caret-down']} />
  </div>
);
