import type { VFC } from 'react';

const AfterUploadInfoMessage: VFC = () => (
  <article className="message is-info">
    <div className="message-header">
      <p>お知らせ 🐱</p>
    </div>
    <div className="message-body">
      <p>
        トップページの「新着の猫ちゃんを表示」からもアップロードした画像を確認できます。
      </p>
    </div>
  </article>
);

export default AfterUploadInfoMessage;
