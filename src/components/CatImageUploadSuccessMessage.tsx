import React from 'react';

const CatImageUploadSuccessMessage: React.FC = () => (
  <article className="message is-success">
    <div className="message-header">
      <p>アップロードに成功しました🐱！</p>
    </div>
    <div className="message-body">
      アップロードされた画像を審査していますので、少々お待ち下さい。
      以下の画像をクリックするとMarkdownソースがコピーされます。
      審査に合格していれば、コピーされたMarkdownソースで生成されたLGTM画像を確認出来ます。
    </div>
  </article>
);

export default CatImageUploadSuccessMessage;
