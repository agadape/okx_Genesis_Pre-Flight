import { ScanResult } from "../engine/types.js";
import { v4 as uuidv4 } from "uuid";
import { saveScanResult } from "../lib/storage.js";
import { FEATURES } from "../config/feature-flags.js";
import { signPreFlightAttestation } from "../lib/sign-attestation.js";

export interface PreFlightResponse {
  status: "success";
  data: ScanResult;
}

export async function buildResponse(result: ScanResult): Promise<PreFlightResponse> {
  const scan_id = uuidv4();
  const timestamp = new Date().toISOString();
  
  const finalResult: ScanResult = {
    ...result,
    scan_id,
    timestamp
  };

  if (FEATURES.ATTESTATION_ENABLED && finalResult.live_verification?.attempted) {
    try {
      finalResult.attestation = await signPreFlightAttestation(
        finalResult.target_type,
        finalResult.target_id,
        finalResult.status,
        finalResult.score,
        finalResult.live_verification,
        timestamp
      );
    } catch (e: any) {
      console.error("Failed to sign attestation:", e);
      // Fail gracefully
    }
  }

  if (finalResult.status === "BAHAYA" || finalResult.attestation) {
    finalResult.report_url = `https://okx-genesis-pre-flight.vercel.app/reports/${scan_id}`;
  }

  // Save to Upstash Redis asynchronously
  await saveScanResult(finalResult);

  return {
    status: "success",
    data: finalResult,
  };
}
