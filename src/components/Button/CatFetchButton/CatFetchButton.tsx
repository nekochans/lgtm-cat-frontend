import { assertNever } from '@/utils';
import type { FC } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import styles from './CatFetchButton.module.css';

const buttonText = (type: ButtonType) => {
  switch (type) {
    case 'refresh':
      return 'Cats Refresh';
    case 'new':
      return 'New arrival Cats';
    default:
      return assertNever(type);
  }
};

type ButtonType = 'refresh' | 'new';

type Props = {
  type: ButtonType;
  onClick: () => Promise<void>;
};

export const CatFetchButton: FC<Props> = ({ type, onClick }) => (
  <button className={`button-base ${styles.button}`} onClick={onClick}>
    <FaSyncAlt className={styles['fa-sync-alt']} />
    <div className="button-text">{buttonText(type)}</div>
  </button>
);
