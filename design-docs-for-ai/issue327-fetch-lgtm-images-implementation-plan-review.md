# Issue #327 実装計画レビュー

## 総評
- 仕様の方向性（LGTM画像取得 API をラップしエラー時に詳細を持つ例外を投げる方針自体）は理解しやすいですが、既存コードとの整合性が取れていない部分が複数あります。
- 特に型定義まわりの前提が現状の `src/features/main/types/lgtmImage.ts` と食い違っており、そのまま実装すると import エラーや不要な branded 変換の記述で手戻りが発生します。

## 指摘事項
1. **型定義の前提が現状と一致していない（致命的）**  
   - 設計書では `LgtmImageId`/`LgtmImageUrl` の branded type と `createLgtmImageId`・`createLgtmImageUrl` の存在を前提にしており、各実装・テストでもこれらを import しています（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:29-59, 220-305, 476-556, 770-804`）。  
   - しかし実際の `src/features/main/types/lgtmImage.ts` にはこれらの型・関数が存在せず、`LgtmImage` は `id: number` と ``imageUrl: `https://${string}` `` だけです（`src/features/main/types/lgtmImage.ts:1-8`）。  
   - このままコード化すると存在しないシンボルを import しようとして TypeScript がビルドすらできません。型定義をここまで変更する予定があるのか、もしくは設計書側を現状の定義に合わせて簡素化するのかを明確化してください。

2. **`isLgtmImageUrl` のドメイン判定が脆弱（重大）**  
   - 実装案は単純に `url.includes("lgtmeow.com")` を使っており、URL のホスト名を正しく検証していません（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:169-183`）。  
   - 例えば `https://example.com/lgtmeow.com/image.webp` や `https://lgtmeow.com.evil.org/foo.webp` でも `https://` で始まり `.webp` で終わり `lgtmeow.com` を含むため true になってしまいます。  
   - `new URL(url)` でホストを解析し、`hostname === "lgtmeow.com"` もしくはサブドメイン許容なら `hostname.endsWith(".lgtmeow.com") || hostname === "lgtmeow.com"` のように厳密に判定する必要があります。

3. **HTTP 200 かつ不正レスポンス時のテスト欠如（重大）**  
   - 重点仕様として「200でもレスポンス形式が不正ならエラーにする」と明記されています（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:127-134`）。  
   - しかし `fetch-lgtm-images-in-random.test.ts` と `fetch-lgtm-images-in-recently-created.test.ts` は成功ケースと 401/500 のみで、スキーマ不正を再現するテストがありません（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:763-822, 854-913`）。  
   - 型ガードと zod のバリデーションを最重要とするなら、モックレスポンスから `url` や `id` を壊したケースを追加し、`FetchLgtmImagesError("Invalid API response format")` を確認するテストを必須にすべきです。

4. **`readonly` 利用方針が実現できていない（注意）**  
   - 「全ての型定義で `readonly` を使用する」と書かれていますが（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:1091-1101`）、実際の `ApiLgtmImageResponse` は `z.object(... )` から `z.infer` するだけなので `readonly` 化されません（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:68-85`）。  
   - `.readonly()` を zod スキーマに適用するか、別途型定義で `ReadonlyArray` を使う等の具体策を盛り込まないと規約を満たせません。

5. **共通ロジックの重複（改善提案）**  
   - ランダム/最近作成の両ファイルで `apiLgtmImageResponseSchema`、型ガード、`FetchLgtmImagesError`、`convertToLgtmImages` を丸ごと複製しています（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:215-404` と `476-655`）。  
   - 将来仕様変更が入ると二重修正になり不具合の温床になるため、共通ヘルパー（例: `buildFetchLgtmImages(fetchUrlFactory)`）や shared モジュールに切り出す案を検討してください。

以上の点を解消すれば、実装着手時の手戻りを大幅に減らせると考えます。修正版の計画を確認できれば再レビューします。

---

## 再レビュー（2025-11-15 18:10）

### 改善点
- `lgtmImage.ts` に Branded Type を追加する手順が明記され、実装スニペットも追記されました（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:29-63, 140-200`）。
- `isLgtmImageUrl` は `new URL` による厳密なホスト名判定へ修正され、懸念していた `includes` ベースの脆弱性が解消されています（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:212-259`）。
- 2 種類の fetch 関数を 1 ファイルに統合し、zod スキーマ／型ガード／エラークラス／変換関数を 1 箇所で定義する構成になりました（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:320-640`）。
- HTTP 200 でレスポンスが不正なケースを網羅するテストがランダム／最近作成の両方に追加され、zod バリデーションが落ちることを確認できるようになりました（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:832-910, 1006-1084`）。
- zod スキーマを `.readonly()` でラップし、`readonly` の方針とも整合しました（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:68-85, 324-339`）。

### 追加で修正をお願いしたい点
1. **テストケースの件数表記が最新内容と一致していない（軽微）**  
   - 品質管理セクションでは fetch 系テストを「3件のテストケース」と記載していますが、実際のコード例では 6 ケース（成功 + 401 + 500 + 3 つの 200/不正レスポンス）が存在します（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:817-878, 888-913, 1178-1182`）。  
   - ドキュメントの数値を更新しないと、実装者が期待すべきテストカバレッジを誤解する恐れがあります。

2. **describe のテキストが旧ファイル名のまま（軽微）**  
   - fetch テストの `describe` 文言が `fetch-lgtm-images-in-random.ts` / `fetch-lgtm-images-in-recently-created.ts` を指しており、実際に作成するファイル `fetch-lgtm-images.ts` と食い違っています（`design-docs-for-ai/issue327-fetch-lgtm-images-implementation-plan.md:798, 979`）。  
   - テスト実行ログ上も誤ったパスが表示されるため、ファイル統合後の名称に合わせて修正しておくと混乱を避けられます。

上記 2 点を直せば、今回確認した範囲での懸念は解消されます。
