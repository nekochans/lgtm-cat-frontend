# atlas.hcl
# Drizzle スキーマを external_schema で読み込み、各環境の Turso DB へ適用する設定。
#
# 注意: env "staging" / "prod" は本 Issue では意図的に配置しない。
# 単一の TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を複数 env で共有すると、
# 実際に読み込まれている環境変数の値（local / staging / prod のいずれか）と env 名が乖離し、
# `--env staging` を指定したつもりで local や prod に接続する migration リスクがある。
# 後続 Issue (#479) で TURSO_STG_DATABASE_URL / TURSO_STG_AUTH_TOKEN /
# TURSO_PROD_DATABASE_URL / TURSO_PROD_AUTH_TOKEN のような専用変数とともに導入する。

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

# env "local": ローカル開発者の Turso DB（local-lgtm-cat-auth）に接続する。
# .env.local の TURSO_DATABASE_URL / TURSO_AUTH_TOKEN を参照（dotenv-cli 等で読み込ませる）。
# external_schema 単体（接続なし）の検証は
# `atlas schema inspect --env local --url env://src` で `--url env://src` を渡すことで実現できるため、
# 専用の offline 用 env は持たない。
# Turso が内部で作成する Litestream replication 用テーブルは
# アプリケーションのスキーマ管理対象外なので diff/inspect から除外する。
# 参照: https://atlasgo.io/guides/sqlite/turso
env "local" {
  src     = data.external_schema.drizzle.url
  url     = "${var.turso_database_url}?authToken=${var.turso_auth_token}"
  dev     = "sqlite://dev?mode=memory"
  exclude = ["_litestream*"]
  migration {
    dir = "file://migrations"
  }
}
