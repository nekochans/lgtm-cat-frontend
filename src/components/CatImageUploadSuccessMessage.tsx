import React from 'react';

// TODO 以下の課題でAPIの返り値からMarkdownソースを生成する形に変更
// https://github.com/nekochans/lgtm-cat-frontend/issues/76
// TODO blockquote をクリックしたらクリップボードにソースをコピーするように変更
const CatImageUploadSuccessMessage: React.FC = () => (
  <article className="message is-success">
    <div className="message-header">
      <p>アップロードに成功しました🐱！</p>
    </div>
    <div className="message-body">
      アップロードされた画像を審査していますので、少々お待ち下さい。
      審査に合格していれば以下のMarkdownソースで生成されたLGTM画像を確認出来ます。
      以下の画像をクリックするとMarkdownソースがコピーされます。
    </div>
  </article>
);

export default CatImageUploadSuccessMessage;
