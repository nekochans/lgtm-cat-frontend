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
  title: 'Error',
  message:
    'エラーが発生しました。お手数ですが、時間がたってから再度お試し下さい。',
  topLink: (
    <a href="https://policies.google.com" style={style}>
      TOPページへ
    </a>
  ),
};

export const showError = (): JSX.Element => (
  <Error title={props.title} message={props.message} topLink={props.topLink} />
);
