import React from 'react';
import MarkdownContents from './MarkdownContents';

export default {
  title: 'src/components/MarkdownContents.tsx',
  component: MarkdownContents,
  includeStories: ['showMarkdownContentsWithProps'],
};

const props = {
  markdown: `
  # 🐱ねこの種類🐱
  - 🐈 マンチカン
  - 😺 スコティッシュ・フォールド
  - 😻 チンチラシルバー
  - 🐈‍⬛ ロシアンブルー
  `,
};

export const showMarkdownContentsWithProps = (): JSX.Element => (
  <MarkdownContents markdown={props.markdown} />
);
