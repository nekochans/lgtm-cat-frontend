import React, { ReactNode } from 'react';

type Props = {
  topLink: ReactNode;
};
const SimpleHeader: React.FC<Props> = ({ topLink }: Props) => (
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
        </div>
      </div>
    </nav>
  </header>
);

export default SimpleHeader;
