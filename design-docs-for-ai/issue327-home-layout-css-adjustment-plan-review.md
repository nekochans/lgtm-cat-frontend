# Issue #327: ホームレイアウトCSS実装計画レビュー（2025-11-16 更新版）

## 総評
- 前回ブロッカーだった子要素サイズ問題は解消。`LgtmImage` に高さ固定・最大幅・flex固定を追加し、`w-full`/`aspect` を除去して複数列化への障害がなくなりました。
- 残タスクは軽微な確認のみ。本文に反映した作業リストを完了すれば実装に進行可。

## 確認事項
1. **子カードサイズ制御の反映を確認**  
   - `h-[220px] max-w-[390px] flex-none` で高さ固定＋幅上限を設定し、`aspect-[4/3]` と `w-full` を削除済み【design-docs-for-ai/issue327-home-layout-css-adjustment-plan.md:294-320】。  
   - 親は `flex flex-wrap ... gap-[24px]` のまま【design-docs-for-ai/issue327-home-layout-css-adjustment-plan.md:220-246】。この組み合わせで複数列が成立する想定。
2. **sizes の更新**  
   - `sizes="(max-width: 768px) 100vw, 390px"` に変更し、配信画像サイズを親の最大幅に合わせたことを確認【design-docs-for-ai/issue327-home-layout-css-adjustment-plan.md:338-355】。
3. **幅上限 390px の妥当性**  
   - Figma例では幅最大330px程度と記載があったため、390px設定が意図通りかデザイナー確認推奨（許容ならこのまま）。

## 追加でやるべきこと（軽微）
- 幅上限 390px がデザイン意図と合致するか確認し、必要なら 330px などに調整して計画へ反映。
- QAチェックリストに沿って複数列表示と高さ220px維持を Storybook/Playwright で実機確認（計画内に既に記載済みだが実行を明記）。
