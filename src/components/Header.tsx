import React from 'react';

const Header: React.FC = () => (
  <header>
    <nav className="navbar navbar-padding">
      <div className="container" style={{ display: 'block' }}>
        <div className="navbar-brand">
          {/* TODO hrefを環境に合わせて変更する */}
          <a className="navbar-item" href="http://localhost:3000">
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
      </div>
    </nav>
  </header>
);

export default Header;
