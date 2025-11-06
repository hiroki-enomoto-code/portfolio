const Redis = require("ioredis");

const config = {
    host: "redis",
    port: 6379
}

const redis = new Redis(config);
redis.set("testKey", "aaa");