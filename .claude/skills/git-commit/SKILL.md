---
name: git-commit
description: Git コミットメッセージを作成するときに使用する。コミットメッセージ規約と issue 番号の付与ルールを定義する。
---

# Git コミットメッセージ作成ガイド

## コミットメッセージのルール

- 対応 issue がある場合は、コミットメッセージに `#<issue番号>` を記載する
- Issue 番号は現在のブランチ名から取得できる
  - 例: `feature/issue7/add-docs` の場合は `7` が Issue 番号

## 実行例

```bash
git commit -m "$(cat <<'EOF'
コミットメッセージの本文 #451
EOF
)"
```
