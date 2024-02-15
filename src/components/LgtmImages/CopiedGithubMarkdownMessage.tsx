import type { FC } from 'react';
import styles from './CopiedGithubMarkdownMessage.module.css';

type Props = {
  position?: 'default' | 'upper';
};

export const CopiedGithubMarkdownMessage: FC<Props> = ({
  position = 'default',
}) => {
  const text = 'Github Markdown Copied!';

  return (
    <>
      {position === 'default' ? (
        <div className={`${styles.base} ${styles.default}`}>{text}</div>
      ) : (
        <div className={`${styles.base} ${styles.upper}`}>{text}</div>
      )}
    </>
  );
};
