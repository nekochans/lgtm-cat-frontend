import ReactMarkdown from 'react-markdown';

import type { VFC } from 'react';

type Props = {
  markdown: string;
};

const MarkdownContents: VFC<Props> = ({ markdown }) => (
  <div className="container" style={{ display: 'block' }}>
    <div className="content mb-6 mx-3">
      <ReactMarkdown source={markdown} />
    </div>
  </div>
);

export default MarkdownContents;
