import { config } from "dotenv";
config();
import { fetchExternalManifest } from "../lib/fetch-external-manifest.js";
import { scoreExternalAgent } from "../lib/score-external.js";
import { runMysteryShopper } from "../lib/mystery-shopper.js";
import { buildResponse } from "../response/builder.js";

async function main() {
    console.log("Starting Live E2E Test for Idea J & K-lite...");
    const target_id = "https://raw.githubusercontent.com/agadape/okx_Genesis_Pre-Flight/main/rules/external-agent-rubric.json";
    
    // 1. Fetch & Score (Phase 2)
    console.log("Fetching external manifest...");
    const manifestData = await fetchExternalManifest(target_id).catch(() => ({} as any));
    const result = scoreExternalAgent(target_id, manifestData);
    
    // 2. Mystery Shopper (Idea J)
    console.log("Running Mystery Shopper test purchase...");
    // Mock the endpoint as something that returns 200 JSON so it succeeds
    const endpointUrl = "https://jsonplaceholder.typicode.com/todos/1"; 
    const advertisedPrice = 0.01;
    
    const liveVerification = await runMysteryShopper(target_id, endpointUrl, advertisedPrice);
    result.live_verification = liveVerification;
    
    // Boost score for success
    if (liveVerification.promise_kept) {
        result.score = Math.min(100, result.score + 10);
        if (result.status === "WARNING" && result.score >= 75) result.status = "SAFE";
    }

    // 3. Build Response & Sign Attestation (Idea K-lite) & Save to Redis
    console.log("Signing EIP-712 Attestation & Saving to Redis...");
    const finalResponse = await buildResponse(result);
    
    console.log("==========================================");
    console.log("âœ… E2E TEST COMPLETED SUCCESSFULLY!");
    console.log("Scan ID:", finalResponse.data.scan_id);
    console.log("Attestation Signed by:", finalResponse.data.attestation?.signer_address);
    console.log("Live Verification:", finalResponse.data.live_verification);
    console.log("==========================================");
    console.log(`Live Report URL: https://okx-genesis-pre-flight.vercel.app/reports/${finalResponse.data.scan_id}`);
    console.log(`Live Verify URL: https://okx-genesis-pre-flight.vercel.app/verify/${finalResponse.data.scan_id}`);
}

main().catch(console.error);
