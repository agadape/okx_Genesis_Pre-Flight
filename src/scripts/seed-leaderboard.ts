import { saveScanResult } from "../lib/storage.js";
import { ScanResult } from "../engine/types.js";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

export async function seed() {
    console.log("Seeding leaderboard with initial dummy data...");

    const dummyScans: Omit<ScanResult, "scan_id" | "timestamp">[] = [
        {
            target_type: "external",
            target_id: "[SAMPLE] https://example.com/manifest.json",
            status: "AMAN",
            score: 95,
            data_source: "live",
            signals_available: 8,
            signals_total: 8,
            reasons: ["Manifest valid", "HTTPS enforced", "No dangerous prompts detected"]
        },
        {
            target_type: "asp",
            target_id: "[SAMPLE] defi-portfolio-analyzer-5100",
            status: "WASPADA",
            score: 65,
            data_source: "mocked",
            signals_available: 5,
            signals_total: 8,
            reasons: ["Marketplace rating below 3.0", "Endpoint response time high"]
        },
        {
            target_type: "skill",
            target_id: "[SAMPLE] fast-swap-pro-99",
            status: "BAHAYA",
            score: 10,
            data_source: "mocked",
            signals_available: 7,
            signals_total: 7,
            reasons: ["Private key request detected in source code (Instant Fail)", "Excessive permissions requested"]
        }
    ];

    for (const scan of dummyScans) {
        const scan_id = uuidv4();
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString();
        
        const finalScan: ScanResult = {
            ...scan,
            scan_id,
            timestamp,
        };

        if (finalScan.status === "BAHAYA") {
            finalScan.report_url = `https://okx-genesis-pre-flight.vercel.app/reports/${scan_id}`;
        }

        await saveScanResult(finalScan);
        console.log(`Seeded: ${scan.target_type} (${scan.target_id}) -> ${scan.status} [${scan_id}]`);
    }

    console.log("Seeding complete! Check your Upstash Redis console.");
}

// If run directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
    seed().catch(console.error);
}
