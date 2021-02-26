import React from 'react';
import ReactMarkdown from 'react-markdown';

type Props = {
  terms: string;
};

const Terms: React.FC<Props> = ({ terms }: Props) => (
  <div className="content">
    <ReactMarkdown escapeHtml source={terms} />
  </div>
);

export default Terms;
