import type { VFC } from 'react';

type Props = {
  message: string;
};

const CatImageUploadError: VFC<Props> = ({ message }: Props) => (
  <article className="message is-danger">
    <div className="message-header">
      <p>エラーが発生しました。</p>
    </div>
    <div className="message-body">{message}</div>
  </article>
);

export default CatImageUploadError;
