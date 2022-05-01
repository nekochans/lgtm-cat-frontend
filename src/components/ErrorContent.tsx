import React, { ReactNode } from 'react';

type Props = {
  title: string;
  message: ReactNode;
  topLink: ReactNode;
};

const ErrorContent: React.FC<Props> = ({ title, message, topLink }: Props) => (
  <main>
    <div className="container has-text-centered">
      <h1 className="title">{title}</h1>
      <h2 className="subtitle">{message}</h2>
      {topLink}
    </div>
  </main>
);

export default ErrorContent;
