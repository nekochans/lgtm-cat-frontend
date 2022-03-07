import React from 'react';

// TODO このComponentは https://github.com/nekochans/lgtm-cat/issues/15 の開発が終了した時点で削除する
const AfterUploadWarningMessage: React.FC = () => (
  <article className="message is-warning">
    <div className="message-header">
      <p>注意 🐱！</p>
    </div>
    <div className="message-body">
      <p>
        このモーダルを閉じるとMarkdownソースをコピー出来なくなるのでご注意下さい。
      </p>
    </div>
  </article>
);

export default AfterUploadWarningMessage;
