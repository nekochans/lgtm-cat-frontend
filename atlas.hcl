# atlas.hcl
# Drizzle スキーマを external_schema で読み込み、
# 環境（local / dev）ごとに Turso DB へ適用する設定。
#
# 注意: env "prod" は本 Issue では意図的に配置しない。
# 単一の TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を `env "dev"` と `env "prod"` で共有すると、
# 実際に読み込まれている環境変数の値（stg / prod）と env 名が乖離し、
# `--env prod` を指定したつもりで stg に接続したり、その逆が起こる migration リスクがある。
# 本番 DB を直接操作する必要が出る #479 以降で、`TURSO_PROD_DATABASE_URL` /
# `TURSO_PROD_AUTH_TOKEN` のような専用変数とともに `env "prod"` を導入する。

variable "turso_database_url" {
  type    = string
  default = getenv("TURSO_DATABASE_URL")
}

variable "turso_auth_token" {
  type    = string
  default = getenv("TURSO_AUTH_TOKEN")
}

# Drizzle スキーマを SQL DDL に変換するデータソース
data "external_schema" "drizzle" {
  program = [
    "npx",
    "drizzle-kit",
    "export",
    "--config=drizzle.config.ts",
  ]
}

# ローカル開発用: 接続先 DB は持たない（url なし）。
# external_schema 単体の検証は `atlas schema inspect --env local --url env://src` で行う。
# `atlas schema inspect --env local`（引数なし）は url が無いため失敗する点に注意。
env "local" {
  src = data.external_schema.drizzle.url
  dev = "sqlite://dev?mode=memory"
  migration {
    dir = "file://migrations"
  }
}

# Turso 開発用 DB（stg-lgtm-cat-auth）に適用するための env
env "dev" {
  src = data.external_schema.drizzle.url
  url = "${var.turso_database_url}?authToken=${var.turso_auth_token}"
  dev = "sqlite://dev?mode=memory"
  # Turso が内部で作成する Litestream replication 用テーブルは
  # アプリケーションのスキーマ管理対象外なので diff/inspect から除外する。
  # 参照: https://atlasgo.io/guides/sqlite/turso
  exclude = ["_litestream*"]
  migration {
    dir = "file://migrations"
  }
}
