import React from 'react';
import ReactMarkdown from 'react-markdown';

type Props = {
  markdown: string;
};

const MarkdownContents: React.FC<Props> = ({ markdown }: Props) => (
  <div className="container" style={{ display: 'block' }}>
    <div className="content mb-6 mx-3">
      <ReactMarkdown source={markdown} />
    </div>
  </div>
);

export default MarkdownContents;
