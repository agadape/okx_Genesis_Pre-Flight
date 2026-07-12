import { Request, Response } from "express";

export type TargetType = "asp" | "skill" | "external";

export type RiskStatus = "AMAN" | "WASPADA" | "BAHAYA" | "DATA_BELUM_CUKUP";

export type DataSource = "live" | "mocked";

export interface ScanRequest {
  target_type: TargetType;
  target_id: string;
  verify_live?: boolean;
}

export interface ScanResult {
  status: RiskStatus;
  score: number;
  reasons: string[];
  target_type: TargetType;
  target_id: string;
  data_source: DataSource;
  signals_available: number;
  signals_total: number;
  timestamp?: string;
  scan_id?: string;
  report_url?: string;
  live_verification?: any;
  attestation?: any;
}

export interface ParameterResult {
  id: string;
  label: string;
  score: number;
  weight: number;
  available: boolean;
  reason: string;
}

export interface RubricParameter {
  id: string;
  label: string;
  weight: number;
  type: string;
  thresholds?: Array<{ min?: number; max?: number; score: number }>;
  categories?: Record<string, number>;
  pass_score?: number;
  fail_score?: number;
  fail_status?: string;
  fail_reason?: string;
}

export interface Rubric {
  parameters: RubricParameter[];
  status_thresholds: {
    AMAN: number;
    WASPADA: number;
    BAHAYA: number;
  };
  min_signals_required: number;
  instant_fail_rules?: string[];
}

export function mapScoreToStatus(
  score: number,
  thresholds: Rubric["status_thresholds"]
): RiskStatus {
  if (score >= thresholds.AMAN) return "AMAN";
  if (score >= thresholds.WASPADA) return "WASPADA";
  return "BAHAYA";
}

export async function handleScan(req: Request, res: Response): Promise<void> {
  // Lazy import to avoid circular deps
  const { processASP } = await import("./score-asp.js");
  const { processSkill } = await import("./score-skill.js");
  const { fetchExternalManifest } = await import("../lib/fetch-external-manifest.js");
  const { scoreExternalAgent } = await import("../lib/score-external.js");
  const { fetchTargetData } = await import("../data/fetcher.js");
  const { buildResponse } = await import("../response/builder.js");
  const { FEATURES } = await import("../config/feature-flags.js");
  const { runMysteryShopper } = await import("../lib/mystery-shopper.js");

  try {
    const { target_type, target_id, verify_live } = req.body as ScanRequest;

    if (!target_type || !target_id) {
      res.status(400).json({
        status: "error",
        error: "Missing required fields: target_type and target_id",
      });
      return;
    }

    if (target_type !== "asp" && target_type !== "skill" && target_type !== "external") {
      res.status(400).json({
        status: "error",
        error: 'Invalid target_type. Must be "asp", "skill", or "external"',
      });
      return;
    }

    let result: ScanResult;
    let endpointUrl = "";
    let advertisedPrice = 0.05; // default fallback

    if (target_type === "external") {
      const manifestData = await fetchExternalManifest(target_id);
      result = scoreExternalAgent(target_id, manifestData);
      endpointUrl = manifestData.a2mcp_endpoint || ""; // real endpoint from manifest
      advertisedPrice = manifestData.price_usdt || 0.05;
    } else {
      const fetchedData = await fetchTargetData(target_type, target_id);
      if (target_type === "asp") {
        result = processASP(target_id, fetchedData);
        advertisedPrice = (fetchedData as any).price_usdt || 0.05;
        endpointUrl = "https://mock.okx.ai/asp/" + target_id; // Mock URL for ASP
      } else {
        result = processSkill(target_id, fetchedData);
        advertisedPrice = 0.02; // Skills are usually cheaper
        endpointUrl = "https://mock.okx.ai/skill/" + target_id;
      }
    }

    if (verify_live && FEATURES.MYSTERY_SHOPPER_ENABLED) {
      const liveVerification = await runMysteryShopper(target_id, endpointUrl, advertisedPrice);
      result.live_verification = liveVerification;

      // Adjust score based on findings (2d. Bobot di Scoring)
      if (liveVerification.attempted) {
         if (!liveVerification.promise_kept) {
            // Downgrade status if it failed promises
            const hasBaitAndSwitch = liveVerification.findings.some(f => f.includes("Bait-and-switch"));
            if (hasBaitAndSwitch) {
               result.status = "BAHAYA";
               result.score = Math.min(result.score, 30);
               result.reasons.push("[Live Test] Bait-and-switch pricing detected");
            } else if (result.status === "AMAN") {
               result.status = "WASPADA";
               result.score = Math.min(result.score, 70);
               result.reasons.push("[Live Test] Service failed to keep promises or was slow/broken");
            }
         } else {
            // Boost score slightly for proven live endpoint
            result.score = Math.min(100, result.score + 10);
            if (result.status === "WASPADA" && result.score >= 75) {
               result.status = "AMAN";
            }
         }
      }
    } else if (verify_live) {
      result.live_verification = { attempted: false };
    }

    const response = await buildResponse(result);
    res.json(response);
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal scan error",
    });
  }
}
