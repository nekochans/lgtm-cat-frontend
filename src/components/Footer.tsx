import React, { ReactNode } from 'react';

type Props = {
  termsLink: ReactNode;
  privacyLink: ReactNode;
};

const Footer: React.FC<Props> = ({ termsLink, privacyLink }: Props) => (
  <footer className="footer">
    <div className="container">
      <nav className="level">
        <div className="level-left">
          <div className="level-item breadcrumb">
            <ul>
              <li>{termsLink}</li>
              <li>{privacyLink}</li>
            </ul>
          </div>
        </div>
        <div className="level-right">
          <div className="content has-text-centered">
            <p>Copyright (c) nekochans</p>
          </div>
        </div>
      </nav>
    </div>
  </footer>
);

export default Footer;
