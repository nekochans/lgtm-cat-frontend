import type { FC } from 'react';
import styles from './MarkdownPageTitle.module.css';

export type Props = {
  text: string;
};

export const MarkdownPageTitle: FC<Props> = ({ text }) => (
  <h1 className={styles.title}>{text}</h1>
);
