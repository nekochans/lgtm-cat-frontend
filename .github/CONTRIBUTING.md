# PR を出す前に確認する事

以下の条件を満たしているか再度チェックしよう 🐱！

- PR のタイトルは分かりやすい事（理想は非エンジニアが見ても何となく分かるように、無理な場合も多いけど・・・）
- README に書いてるセルフチェックが全て完了している事
  - e.g. Lint でのコード整形
  - e.g テストコードの実装
- PR テンプレートに従って必要な情報が記載されている事

# GA での集計について

## 基本方針

[カスタムデータ属性を使って Google Analytics（GA）で集計を行う](https://zenn.dev/keitakn/scraps/1b0bdea51150e7) を参考にカスタムデータ属性 `data-gtm-click` を利用して GA 上でのイベントの確認を行う。

`data-gtm-click` の一覧に関しては以下を参照。

https://github.com/nekochans/lgtm-cat-ui/blob/main/src/types/gtm.ts

## 重要イベントに関して

重要イベントやカスタムデータ属性を使った集計が上手くいかない場合はこちらの方法を使う。

具体的な手法については [Next.js で GTM + GA4 を利用する](https://zenn.dev/keitakn/articles/nextjs-google-tag-manager) を参照。
