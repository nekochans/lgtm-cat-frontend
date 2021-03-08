import React from 'react';
import { urlList } from '../constants/url';

const Header: React.FC = () => (
  <header>
    <nav className="navbar navbar-padding">
      <div className="container" style={{ display: 'block' }}>
        <div className="navbar-brand">
          <a className="navbar-item" href={urlList.top}>
            <p className="is-size-4 has-text-black">LGTMeow</p>
          </a>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              marginLeft: 'auto',
            }}
          >
            <button
              className="button is-outlined"
              style={{ margin: '0.5rem 0.75rem' }}
              type="submit"
            >
              ランダム
            </button>
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
