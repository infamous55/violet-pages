import { Redis } from "@upstash/redis";
import { env } from "~/env/server.mjs";

const redis = new Redis({
  url: env.UPSTASH_REDIS_URL,
  token: env.UPSTASH_REDIS_TOKEN,
});

export default redis;
