import React from 'react';

const AfterUploadWarningMessage: React.FC = () => (
  <article className="message is-warning">
    <div className="message-header">
      <p>注意 🐱！</p>
    </div>
    <div className="message-body">
      <p>
        トップページの「新着の猫ちゃんを表示」からもアップロードした画像を確認できます。
      </p>
    </div>
  </article>
);

export default AfterUploadWarningMessage;
