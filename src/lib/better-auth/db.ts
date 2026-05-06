import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
// biome-ignore lint/performance/noNamespaceImport: Drizzle の schema オプションはモジュール全体を namespace として受け取る公式 API のため、named import に置き換えると型推論が効かなくなる。
import * as schema from "./schema";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoDatabaseUrl) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

if (!tursoAuthToken) {
  throw new Error("TURSO_AUTH_TOKEN is not defined");
}

const client = createClient({
  url: tursoDatabaseUrl,
  authToken: tursoAuthToken,
});

export const authDb = drizzle(client, { schema });
