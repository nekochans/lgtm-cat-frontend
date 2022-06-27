import type { VFC } from 'react';

const CatImageUploadDescription: VFC = () => (
  <div className="content">
    <h1>猫ちゃん画像をアップロード</h1>
    <p>
      猫ちゃん画像をアップロードしてLGTM画像を作れます🐱
      利用出来る画像には以下の制約があります。
    </p>
    <ol>
      <li>拡張子が png, jpg, jpeg の画像のみアップロード出来ます。</li>
      <li>猫が写っていない画像はアップロード出来ません。</li>
      <li>人の顔がはっきり写っている画像はアップロード出来ません。</li>
      <li>猫のイラスト等は正確に判定出来ない事があります。</li>
    </ol>
  </div>
);

export default CatImageUploadDescription;
