import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="level-left">
      <div className="level-item breadcrumb">
        <ul>
          <li>
            <Link href="/terms">利用規約</Link>
          </li>
          <li>
            <Link href="/privacy">プライバシーポリシー</Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="content has-text-centered">
      <p>Copyright (c) nekochans</p>
    </div>
  </footer>
);

export default Footer;
