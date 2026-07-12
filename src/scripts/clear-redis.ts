import { Redis } from "@upstash/redis";
import "dotenv/config";

async function clear() {
    const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) 
        ? new Redis({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
          })
        : null;
        
    if (!redis) {
        console.error("Redis credentials not found in .env");
        return;
    }

    console.log("Clearing Upstash Redis scans data...");
    
    const SCANS_LIST_KEY = "preflight_scans_list";
    const scanIds = await redis.lrange(SCANS_LIST_KEY, 0, -1);
    
    if (scanIds.length > 0) {
        const keys = scanIds.map(id => `scan:${id}`);
        await redis.del(...keys);
    }
    await redis.del(SCANS_LIST_KEY);
    
    console.log("All scans deleted successfully!");
}

clear().catch(console.error);
