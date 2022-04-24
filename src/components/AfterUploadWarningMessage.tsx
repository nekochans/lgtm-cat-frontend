import React from 'react';

const AfterUploadWarningMessage: React.FC = () => (
  <article className="message is-warning">
    <div className="message-header">
      <p>注意 🐱！</p>
    </div>
    <div className="message-body">
      <p>
        このモーダルを閉じてしまった場合はトップページの「新着の猫ちゃんを表示」を押下して探してみてください。
      </p>
    </div>
  </article>
);

export default AfterUploadWarningMessage;
