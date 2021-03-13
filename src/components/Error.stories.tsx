import React from 'react';
import Error from './Error';

export default {
  title: 'src/components/Error.tsx',
  component: Error,
  includeStories: ['showError'],
};

const style = {
  color: 'royalblue',
};

const props = {
  topLink: (
    <a href="https://policies.google.com" style={style}>
      TOPページへ
    </a>
  ),
};

export const showError = (): JSX.Element => <Error topLink={props.topLink} />;
