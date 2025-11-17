export const upstashRedisRestUrl = (): string => {
  if (process.env.UPSTASH_REDIS_REST_URL != null) {
    return process.env.UPSTASH_REDIS_REST_URL;
  }

  throw new Error("UPSTASH_REDIS_REST_URL is not defined");
};
export const upstashRedisRestToken = (): string => {
  if (process.env.UPSTASH_REDIS_REST_TOKEN != null) {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  }

  throw new Error("UPSTASH_REDIS_REST_TOKEN is not defined");
};
