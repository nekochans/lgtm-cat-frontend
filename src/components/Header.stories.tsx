import React from 'react';
import Header from './Header';

export default {
  title: 'src/components/Header.tsx',
  component: Header,
  includeStories: ['showHeader'],
};

const props = {
  topLink: (
    <a className="navbar-item" href="https://policies.google.com">
      <p className="is-size-4 has-text-black">LGTMeow</p>
    </a>
  ),
};

export const showHeader = (): JSX.Element => <Header topLink={props.topLink} />;
