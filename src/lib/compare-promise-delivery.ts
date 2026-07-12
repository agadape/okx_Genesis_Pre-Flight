import { PurchaseResult } from "./wallet-test-purchase.js";

export interface LiveVerification {
    attempted: boolean;
    cost_incurred: string;
    promise_kept: boolean;
    findings: string[];
}

export function comparePromiseAndDelivery(
    purchase: PurchaseResult,
    advertisedPrice: number
): LiveVerification {
    const findings: string[] = [];
    let promise_kept = true;

    if (!purchase.success) {
        promise_kept = false;
        findings.push(`Test purchase failed: ${purchase.errorReason || "Unknown error"}`);
    } else {
        // 1. Response Time Check
        if (purchase.responseTimeMs > 10000) {
            promise_kept = false;
            findings.push(`Response time was unusually slow (${Math.round(purchase.responseTimeMs / 1000)}s), exceeding 10s SLA threshold.`);
        } else {
            findings.push(`Response time: ${purchase.responseTimeMs}ms (Excellent)`);
        }

        // 2. Format / Schema Check
        if (!purchase.responseBody) {
            promise_kept = false;
            findings.push("Response body was empty.");
        } else if (typeof purchase.responseBody !== 'object') {
            promise_kept = false;
            findings.push("Response was not valid JSON or object structure.");
        } else if (purchase.responseBody.error || purchase.responseBody.status === "error") {
            promise_kept = false;
            findings.push("Endpoint returned an error status in the payload.");
        }

        // 3. Price Check
        if (purchase.costIncurred > advertisedPrice) {
            promise_kept = false;
            findings.push(`Bait-and-switch detected: Advertised price was ${advertisedPrice} USDT, but actual cost was ${purchase.costIncurred} USDT.`);
        }
        
        // 4. Processing Check
        if (promise_kept && purchase.responseBody) {
             findings.push("Service responded successfully and kept its core promises.");
        }
    }

    return {
        attempted: true,
        cost_incurred: `${purchase.costIncurred} USDT`,
        promise_kept,
        findings
    };
}
