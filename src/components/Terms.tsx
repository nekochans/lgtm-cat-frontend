import React from 'react';
import ReactMarkdown from 'react-markdown';

type Props = {
  terms: string;
};

const Terms: React.FC<Props> = ({ terms }: Props) => (
  <div className="container" style={{ display: 'block' }}>
    <div className="content mb-6">
      <ReactMarkdown source={terms} />
    </div>
  </div>
);

export default Terms;
