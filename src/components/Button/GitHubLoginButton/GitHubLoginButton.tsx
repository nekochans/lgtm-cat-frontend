import type { FC } from 'react';
import { FaGithub } from 'react-icons/fa';
import styles from './GitHubLoginButton.module.css';

export const GitHubLoginButton: FC = () => (
  <button className={`button-base ${styles.button}`}>
    <FaGithub className={styles['fa-github']} />
    <div className="button-text">Login</div>
  </button>
);
