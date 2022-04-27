import React from 'react';

const CatImageUploadSuccessMessage: React.FC = () => (
  <article className="message is-success">
    <div className="message-header">
      <p>アップロードに成功しました🐱！</p>
    </div>
    <div className="message-body">
      <p>LGTM画像を作成しているので少々お待ち下さい。</p>
      <p>
        「Markdownソースをコピー」ボタンか以下の画像をクリックするとMarkdownソースがコピーされます。
      </p>
    </div>
  </article>
);

export default CatImageUploadSuccessMessage;
