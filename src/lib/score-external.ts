import { readFileSync } from "fs";
import { join } from "path";
import { ExternalManifestData } from "./fetch-external-manifest.js";
import { ParameterResult, Rubric, ScanResult, mapScoreToStatus } from "../engine/types.js";

const rubricPath = join(process.cwd(), "rules", "external-agent-rubric.json");
const externalRubric: Rubric = JSON.parse(readFileSync(rubricPath, "utf-8"));

export function scoreExternalAgent(targetId: string, data: ExternalManifestData): ScanResult {
  const reasons: string[] = [];
  let totalScore = 0;
  let signalsAvailable = 0;
  let isInstantFail = false;

  const getParam = (id: string) => externalRubric.parameters.find((p) => p.id === id);

  // 1. Manifest Validity
  const pValidity = getParam("manifest_validity")!;
  if (data.manifest_validity) {
    totalScore += (pValidity.pass_score! * pValidity.weight) / 100;
  } else {
    reasons.push("Manifest is invalid, unreachable, or missing required fields.");
  }
  signalsAvailable++;

  // 2. HTTPS Enforcement
  const pHttps = getParam("https_enforcement")!;
  if (data.https_enforcement) {
    totalScore += (pHttps.pass_score! * pHttps.weight) / 100;
  } else {
    reasons.push("One or more endpoints are using insecure HTTP instead of HTTPS.");
  }
  signalsAvailable++;

  // 3. Permission Scope
  const pScope = getParam("permission_scope")!;
  if (data.permission_scope) {
    totalScore += (pScope.pass_score! * pScope.weight) / 100;
  } else {
    reasons.push("Manifest requests potentially excessive or mismatching permissions.");
  }
  signalsAvailable++;

  // 4. Private Key Request (Instant Fail)
  const pKey = getParam("private_key_request")!;
  if (data.private_key_request) {
    isInstantFail = true;
    reasons.push(pKey.fail_reason!);
  }
  signalsAvailable++;

  // 5. Domain Age
  const pAge = getParam("domain_age")!;
  if (data.domain_age_days !== null) {
    signalsAvailable++;
    let ageScore = 0;
    for (const t of pAge.thresholds!) {
      if (data.domain_age_days >= t.min!) {
        ageScore = t.score;
        break;
      }
    }
    totalScore += (ageScore * pAge.weight) / 100;
    if (ageScore < 60) {
      reasons.push(`Domain is relatively new (${data.domain_age_days} days).`);
    }
  }

  // 6. Endpoint Liveness
  const pLive = getParam("endpoint_liveness")!;
  if (data.endpoint_liveness) {
    totalScore += (pLive.pass_score! * pLive.weight) / 100;
  } else {
    reasons.push("One or more declared endpoints are unreachable or timing out.");
  }
  signalsAvailable++;

  // 7. Prompt Injection
  const pInject = getParam("prompt_injection_pattern")!;
  if (data.prompt_injection_pattern) {
    const matchedStr = data.injection_matches ? data.injection_matches.join(", ") : "unknown";
    reasons.push(`Potential prompt injection or safety bypass pattern detected (Keyword matched: "${matchedStr}"). Verify if this is intentional security documentation or an attack payload.`);
  } else {
    totalScore += (pInject.pass_score! * pInject.weight) / 100;
  }
  signalsAvailable++;

  // 8. Third-party Verification
  const pThird = getParam("third_party_verification")!;
  if (data.third_party_verification) {
    totalScore += (pThird.pass_score! * pThird.weight) / 100;
  }
  signalsAvailable++;

  // Final Evaluation
  let status = mapScoreToStatus(totalScore, externalRubric.status_thresholds);

  if (isInstantFail) {
    status = "CRITICAL";
    totalScore = 0;
  }

  if (signalsAvailable < externalRubric.min_signals_required) {
    status = "INSUFFICIENT_DATA";
  }

  return {
    status,
    score: Math.round(totalScore),
    reasons,
    target_type: "external",
    target_id: targetId,
    data_source: "live", // External scans are always live
    signals_available: signalsAvailable,
    signals_total: externalRubric.parameters.length,
  };
}
