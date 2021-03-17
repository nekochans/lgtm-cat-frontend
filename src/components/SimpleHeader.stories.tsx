import React from 'react';
import SimpleHeader from './SimpleHeader';

export default {
  title: 'src/components/SimpleHeader.tsx',
  component: SimpleHeader,
  includeStories: ['showSimpleHeader'],
};

const props = {
  topLink: (
    <a className="navbar-item" href="https://policies.google.com">
      <p className="is-size-4 has-text-black">LGTMeow</p>
    </a>
  ),
};

export const showSimpleHeader = (): JSX.Element => (
  <SimpleHeader topLink={props.topLink} />
);
