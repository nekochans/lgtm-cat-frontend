import React from 'react';

const CatImageUploadSuccessMessage: React.FC = () => (
  <div className="content">
    <article className="message is-success">
      <div className="message-header">
        <p>アップロードに成功しました🐱！</p>
      </div>
      <div className="message-body">
        アップロードされた画像を審査していますので、少々お待ち下さい。
        審査に合格していれば以下のMarkdownソースで生成されたLGTM画像を確認出来ます。
      </div>
    </article>
    <blockquote>
      [![LGTMeow](https://lgtm-images.lgtmeow.com/2021/03/16/22/03b4b6a8-931c-47cf-b2e5-ff8218a67b08.webp)](https://lgtmeow.com)
    </blockquote>
  </div>
);

export default CatImageUploadSuccessMessage;
