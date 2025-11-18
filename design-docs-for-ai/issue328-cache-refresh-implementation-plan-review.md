# Issue #328 実装計画レビュー（cache refresh）

## 総評
計画は概ね実現可能だが、`use cache`/タグ駆動キャッシュを動作させる前提設定が抜けているため、このままではキャッシュ無効化が機能しないリスクがある。以下の修正を入れれば進めてよい。

## 良い点
- 対象コンポーネントの誤認（latestCats → `latest-lgtm-images.tsx`）を早期に是正している。
- `searchParams` を `await` する Next.js 16 の仕様を踏まえている。
- キャッシュタグと Server Action を組み合わせ、ボタン操作で即時リフレッシュする流れは Next.js 16 の推奨パターンに沿っている（`updateTag` は Server Action 専用で即時失効）citeturn6text0turn5text0。

## 懸念・修正ポイント
1. **`cacheComponents` 未設定**  
   `use cache`/`cacheTag`/`updateTag` を有効にするには `next.config.ts` で `cacheComponents: true` を明示する必要がある。現在の設定には含まれていないため、計画に追加必須citeturn4text0turn5text0。
2. **タグ無効化手段の選択肢が狭い**  
   計画では「`revalidateTag` ではなく `updateTag` を使う」方針だが、将来 webhook や Route Handler から無効化したい場合は `revalidateTag` が必要になる。用途に応じた使い分け方針を補足しておくと安全。
3. **キャッシュ有効期限の設計不足**  
   `use cache` のデフォルト再検証は 15 分。トークン有効期限や「更新ボタンでのみ無効化する」要件との整合を詰め、必要なら `cacheLife`（例: profile=`'manual'` や短めの秒数）を併記することを推奨。
4. **強制ヘッダーコメント遵守漏れの恐れ**  
   本プロジェクトは全ての `.ts/.tsx` 先頭に `// 絶対厳守：編集前に必ずAI実装ルールを読む` が必須。新規/既存ファイル（`random-lgtm-images.tsx` など現状未記載）を触る際は必ず追加する旨を計画に明記しておくと安心。
5. **タグ名の一元管理**  
   `cacheTag` と `updateTag` の文字列がずれると無効化されない。`const CACHE_TAG_LGTM_IMAGES = "...";` のように共有定数化を計画に含めるとヒューマンエラーを防止できる。

## 修正提案の優先順位
1. `next.config.ts` に `cacheComponents: true` を追加するタスクを計画へ組み込み。
2. キャッシュ無効化ポリシーに `updateTag` / `revalidateTag` の役割分担を追記（必要に応じて将来拡張できるように）。
3. キャッシュ期限戦略を明文化（デフォルト継続 or `cacheLife` で短縮 / 手動のみ）。
4. コード変更タスクに「必須コメント挿入」「タグ名定数化」を追加。

## 参考にした最新ドキュメント
- Next.js 16.0.3 `use cache` 指示子、`cacheComponents` 必須設定、デフォルト 15 分再検証citeturn4text0
- Next.js 16.0.3 `cacheTag` と `updateTag` の使用条件・目的（updateTag は Server Action 専用）citeturn5text0turn6text0
