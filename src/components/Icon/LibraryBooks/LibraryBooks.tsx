import type { FC } from 'react';
import { MdLibraryBooks } from 'react-icons/md';
import styles from './LibraryBooks.module.css';

export const LibraryBooks: FC = () => (
  <MdLibraryBooks className={styles['library-books']} />
);
