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
  uploadLink: (
    <a
      className="navbar-item button"
      href="https://github.com/nekochans/lgtm-cat-frontend"
    >
      <p className="has-text-black">猫ちゃん画像をアップロード</p>
    </a>
  ),
};

export const showHeader = (): JSX.Element => (
  <Header topLink={props.topLink} uploadLink={props.uploadLink} />
);
