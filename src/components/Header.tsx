import { useState } from 'react';

import RandomCatFetchButtonContainer from '../containers/RandomCatFetchButtonContainer';
import RecentlyCatFetchButtonContainer from '../containers/RecentlyCatFetchButtonContainer';

import ServiceDescription from './ServiceDescription';

// TODO 以下の制御コメントは https://github.com/nekochans/lgtm-cat-frontend/issues/166#issuecomment-1120215152 で TypeScript 4.5 にアップグレードしたタイミングで修正する
// eslint-disable-next-line no-duplicate-imports
import type { VFC, ReactNode } from 'react';

type Props = {
  topLink: ReactNode;
  uploadLink: ReactNode;
};

const Header: VFC<Props> = ({ topLink, uploadLink }) => {
  const [menuIsOpened, setMenuIsOpened] = useState(false);

  const handleClickMenu = () => {
    setMenuIsOpened(!menuIsOpened);
  };

  return (
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
            />
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
            <button
              type="button"
              onClick={handleClickMenu}
              role="button"
              className={`navbar-burger burger ${
                menuIsOpened ? 'is-active' : ''
              }`}
              aria-label="menu"
              aria-expanded="false"
              data-target="navbar-burger-menu"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>

          <div
            id="navbar-burger-menu"
            className={`navbar-menu ${menuIsOpened ? 'is-active' : ''}`}
          >
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  {uploadLink}
                  <RandomCatFetchButtonContainer />
                  <RecentlyCatFetchButtonContainer />
                </div>
              </div>
            </div>
          </div>
          <ServiceDescription />
        </div>
      </nav>
    </header>
  );
};

export default Header;
