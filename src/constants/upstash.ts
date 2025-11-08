// 絶対厳守：編集前に必ずAI実装ルールを読む
export function upstashRedisRestUrl(): string {
  if (process.env.UPSTASH_REDIS_REST_URL != null) {
    return process.env.UPSTASH_REDIS_REST_URL;
  }

  throw new Error("UPSTASH_REDIS_REST_URL is not defined");
}
export function upstashRedisRestToken(): string {
  if (process.env.UPSTASH_REDIS_REST_TOKEN != null) {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  }

  throw new Error("UPSTASH_REDIS_REST_TOKEN is not defined");
}
