import React, { ReactNode } from 'react';

type Props = {
  title: string;
  message: string;
  topLink: ReactNode;
};

const Error: React.FC<Props> = ({ title, message, topLink }: Props) => (
  <main>
    <div className="container has-text-centered">
      <h1 className="title">{title}</h1>
      <h2 className="subtitle">{message}</h2>
      {topLink}
    </div>
  </main>
);

export default Error;
