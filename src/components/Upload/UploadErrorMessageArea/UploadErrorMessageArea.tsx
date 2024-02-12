import type { FC } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import styles from './UploadErrorMessageArea.module.css';

type Props = {
  messages: string[];
};

export const UploadErrorMessageArea: FC<Props> = ({ messages }) => (
  <div className={styles.wrapper}>
    <FaExclamationTriangle className={styles.icon} />
    <span className={styles['message-text']}>
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </span>
  </div>
);
