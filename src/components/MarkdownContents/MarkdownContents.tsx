import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './MarkdownContents.module.css';

export type Props = {
  markdown: string;
};

export const MarkdownContents: FC<Props> = ({ markdown }) => (
  <div className={`markdown ${styles.wrapper}`}>
    <ReactMarkdown>{markdown}</ReactMarkdown>
  </div>
);
