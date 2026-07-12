import { Redis } from "@upstash/redis";
import "dotenv/config";
import { BUDGET } from "../config/budget-limits.js";

const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) 
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

const DAILY_BUDGET_KEY = () => `preflight_budget:${new Date().toISOString().split('T')[0]}`;
const IDEMPOTENCY_KEY = (targetId: string) => `preflight_idempotency:${targetId}`;

export interface PurchaseResult {
    success: boolean;
    costIncurred: number;
    responseTimeMs: number;
    responseBody: any;
    errorReason?: string;
    cached?: boolean;
}

export async function executeTestPurchase(targetId: string, endpointUrl: string, expectedPrice: number): Promise<PurchaseResult> {
    // 1. Budget Guard: Per Scan
    if (expectedPrice > BUDGET.MAX_TEST_BUDGET_PER_SCAN) {
        return { success: false, costIncurred: 0, responseTimeMs: 0, responseBody: null, errorReason: `Price exceeds scan budget limit (${BUDGET.MAX_TEST_BUDGET_PER_SCAN} USDT)` };
    }

    // 2. Fallback if redis is missing (skip purchase to be safe)
    if (!redis) {
        return { success: false, costIncurred: 0, responseTimeMs: 0, responseBody: null, errorReason: "Storage not configured for budget tracking" };
    }

    // 3. Idempotency Check (Don't spam purchase the same target repeatedly)
    const cachedResult = await redis.get<PurchaseResult>(IDEMPOTENCY_KEY(targetId));
    if (cachedResult) {
        return { ...cachedResult, cached: true };
    }

    // 4. Budget Guard: Daily Limit
    const dailySpentStr = await redis.get<string>(DAILY_BUDGET_KEY());
    const dailySpent = parseFloat(dailySpentStr || "0");
    if (dailySpent + expectedPrice > BUDGET.MAX_TEST_BUDGET_TOTAL_PER_DAY) {
        return { success: false, costIncurred: 0, responseTimeMs: 0, responseBody: null, errorReason: "Daily budget limit exhausted" };
    }

    // 5. Check Test Wallet Key
    const testWalletKey = process.env.TEST_WALLET_PRIVATE_KEY;
    if (!testWalletKey) {
        return { success: false, costIncurred: 0, responseTimeMs: 0, responseBody: null, errorReason: "Test wallet private key not configured" };
    }

    // 6. Execute actual x402 test purchase (Mocked for safety during Hackathon until viem is fully set up)
    // In a full environment, we would use x402NodeClient.fetch(endpointUrl)
    const startTime = Date.now();
    let responseBody = null;
    let success = false;
    let costIncurred = 0;
    let errorReason = undefined;

    try {
        // Send a dummy request. If it expects x402 payment required (HTTP 402), we simulate payment success
        const res = await fetch(endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "Pre-Flight Trust & Safety Automated Ping" })
        });
        
        const responseTimeMs = Date.now() - startTime;
        
        if (res.status === 402) {
            // Payment required - Simulate successful payment flow
            const mockCost = res.headers.get("x-mock-cost");
            costIncurred = mockCost ? parseFloat(mockCost) : expectedPrice;
            success = true;
            responseBody = { status: "success", data: "Simulated response after payment" };
        } else if (res.ok) {
            // Free endpoint or standard OK
            const mockCost = res.headers.get("x-mock-cost");
            costIncurred = mockCost ? parseFloat(mockCost) : 0;
            success = true;
            try {
                responseBody = await res.json();
            } catch {
                responseBody = await res.text();
            }
        } else {
            success = false;
            errorReason = `Endpoint returned status ${res.status}`;
        }
    } catch (e: any) {
        success = false;
        errorReason = `Fetch failed: ${e.message}`;
    }

    const responseTimeMs = Date.now() - startTime;

    const result: PurchaseResult = {
        success,
        costIncurred,
        responseTimeMs,
        responseBody,
        errorReason
    };

    // 7. Update Daily Budget & Cache Idempotency (cache for 1 hour)
    if (costIncurred > 0) {
        await redis.incrbyfloat(DAILY_BUDGET_KEY(), costIncurred);
        // Expire budget key after 24 hours
        await redis.expire(DAILY_BUDGET_KEY(), 86400); 
    }
    
    // Cache the result for 1 hour (3600s) to prevent spamming
    await redis.setex(IDEMPOTENCY_KEY(targetId), 3600, result);

    return result;
}
