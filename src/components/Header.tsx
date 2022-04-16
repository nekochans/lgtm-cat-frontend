import React, { ReactNode } from 'react';

import RandomButtonContainer from '../containers/RandomButton';
import RecentlyCatFetchButtonContainer from '../containers/RecentlyCatFetchButtonContainer';

import ServiceDescription from './ServiceDescription';

type Props = {
  topLink: ReactNode;
  uploadLink: ReactNode;
};

const Header: React.FC<Props> = ({ topLink, uploadLink }: Props) => {
  const [menuIsOpened, setMenuIsOpened] = React.useState(false);

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
                  <RandomButtonContainer />
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
