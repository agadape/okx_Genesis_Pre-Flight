import { ScanResult } from "../engine/types.js";

export interface PreFlightResponse {
  status: "success";
  data: ScanResult;
}

export function buildResponse(result: ScanResult): PreFlightResponse {
  return {
    status: "success",
    data: {
      ...result,
      timestamp: new Date().toISOString(),
    },
  };
}
