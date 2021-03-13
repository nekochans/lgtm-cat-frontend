import React, { ReactNode } from 'react';

type Props = {
  topLink: ReactNode;
};

const Error: React.FC<Props> = ({ topLink }: Props) => (
  <main>
    <div className="container has-text-centered">
      <h1 className="title">Error</h1>
      <h2 className="subtitle">
        エラーが発生しました。TOPページより再度行なってください。
      </h2>
      {topLink}
    </div>
  </main>
);

export default Error;
