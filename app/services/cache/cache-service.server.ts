import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";

import { featureConfig } from "~/config/features.server";

const initCacheService = () => {
  if (featureConfig.cache.enabled) {
    if (featureConfig.cache.provider === "redis") {
      return createStorage({
        driver: redisDriver({
          url: process.env.REDIS_URL!,
        }),
      });
    }
  }
  return null;
};

const cacheService = initCacheService();

export { cacheService };
