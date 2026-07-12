import { Redis } from "@upstash/redis";
import { ScanResult } from "../engine/types.js";
import { config } from "../config.js";

// Initialize Redis client. If environment variables are missing, it will be null (useful for local dev testing without KV)
const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) 
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

const SCANS_LIST_KEY = "preflight_scans_list";

export async function saveScanResult(scan: ScanResult): Promise<void> {
    if (!redis) {
        console.warn("[storage] Redis not configured, skipping save (scan_id:", scan.scan_id, ")");
        return;
    }
    
    try {
        // Save the detailed scan by ID
        await redis.set(`scan:${scan.scan_id}`, scan);
        
        // Add to a list (newest first) for the leaderboard
        await redis.lpush(SCANS_LIST_KEY, scan.scan_id);
        
        // Keep only the last 100 scans to avoid memory bloat
        await redis.ltrim(SCANS_LIST_KEY, 0, 99);
    } catch (e) {
        console.error("[storage] Failed to save scan to Redis:", e);
    }
}

export async function getScanResult(scan_id: string): Promise<ScanResult | null> {
    if (!redis) return null;
    try {
        return await redis.get<ScanResult>(`scan:${scan_id}`);
    } catch (e) {
        console.error("[storage] Failed to get scan from Redis:", e);
        return null;
    }
}

export async function getRecentScans(limit: number = 50): Promise<ScanResult[]> {
    if (!redis) return [];
    
    try {
        const scanIds = await redis.lrange(SCANS_LIST_KEY, 0, limit - 1);
        if (!scanIds || scanIds.length === 0) return [];
        
        // Fetch all scans using mget
        const keys = scanIds.map(id => `scan:${id}`);
        const results = await redis.mget<ScanResult[]>(...keys);
        
        // Filter out nulls in case a scan expired but ID is in list
        return results.filter(r => r !== null) as ScanResult[];
    } catch (e) {
        console.error("[storage] Failed to get recent scans from Redis:", e);
        return [];
    }
}
