import React, { ReactNode } from 'react';
import RandomButtonContainer from '../containers/RandomButton';

type Props = {
  topLink: ReactNode;
  uploadLink: ReactNode;
};

const Header: React.FC<Props> = ({ topLink, uploadLink }: Props) => (
  <header>
    <nav className="navbar navbar-padding">
      <div className="container" style={{ display: 'block' }}>
        <div className="navbar-brand">
          {topLink}
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              marginLeft: 'auto',
            }}
          >
            {uploadLink}
            <RandomButtonContainer />
          </div>
        </div>
        <p
          className="is-size-6 header-description-margin has-text-grey"
          style={{
            alignItems: 'center',
            padding: '0 0.75rem',
          }}
        >
          猫のLGTM画像を共有出来るサービスです。画像をクリックするとGitHub
          Markdownがコピーされます。
        </p>
      </div>
    </nav>
  </header>
);

export default Header;
