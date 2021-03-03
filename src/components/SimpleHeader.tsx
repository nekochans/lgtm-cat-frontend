import React from 'react';
import { urlList } from '../constants/url';

const SimpleHeader: React.FC = () => (
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
          />
        </div>
      </div>
    </nav>
  </header>
);

export default SimpleHeader;
