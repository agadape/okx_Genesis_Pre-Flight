import { ScanResult } from "../engine/types.js";
import { v4 as uuidv4 } from "uuid";
import { saveScanResult } from "../lib/storage.js";

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

  if (finalResult.status === "BAHAYA") {
    finalResult.report_url = `https://okx-genesis-pre-flight.vercel.app/reports/${scan_id}`;
  }

  // Save to Upstash Redis asynchronously
  await saveScanResult(finalResult);

  return {
    status: "success",
    data: finalResult,
  };
}
