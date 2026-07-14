import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ScanResult, Rubric, mapScoreToStatus } from "./types.js";
import { FetchedData } from "../data/fetcher.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUBRIC_PATH = resolve(__dirname, "../../rules/skill-rubric.json");

let rubric: Rubric | null = null;

function loadRubric(): Rubric {
  if (!rubric) {
    const data = readFileSync(RUBRIC_PATH, "utf-8");
    rubric = JSON.parse(data) as Rubric;
  }
  return rubric;
}

export function processSkill(targetId: string, fetchedData: FetchedData): ScanResult {
  const currentRubric = loadRubric();
  const { signals, source } = fetchedData;
  const reasons: string[] = [];

  // Instant fail check
  if (currentRubric.instant_fail_rules && currentRubric.instant_fail_rules.includes("private_key_request")) {
    if (signals["private_key_request"] === true) {
      return {
        status: "CRITICAL",
        score: 0,
        reasons: ["Skill requests private key, seed phrase, or wallet export â€” critical security risk. Immediate BAHAYA status regardless of other signals."],
        target_type: "skill",
        target_id: targetId,
        data_source: source,
        signals_available: Object.keys(signals).length,
        signals_total: currentRubric.parameters.length,
        timestamp: new Date().toISOString(),
      };
    }
  }

  let totalScore = 0;
  let maxPossibleScore = 0;
  let signalsAvailable = 0;

  for (const param of currentRubric.parameters) {
    if (param.type === "instant_fail") continue; // Handled above

    const value = signals[param.id];
    let score = 0;
    let available = false;

    if (value !== undefined && value !== null) {
      available = true;
      signalsAvailable++;
      
      if (param.type === "range" && param.thresholds) {
        const numVal = value as number;
        for (const thresh of param.thresholds) {
          if (thresh.min !== undefined && numVal >= thresh.min) {
            score = thresh.score;
            break;
          }
        }
      } else if (param.type === "range_inverted" && param.thresholds) {
        const numVal = value as number;
        for (const thresh of param.thresholds) {
          if (thresh.max !== undefined && numVal <= thresh.max) {
            score = thresh.score;
            break;
          }
        }
      } else if (param.type === "binary") {
        const boolVal = Boolean(value);
        score = boolVal ? (param.pass_score ?? 100) : (param.fail_score ?? 0);
      } else if (param.type === "categorical" && param.categories) {
        const strVal = value as string;
        score = param.categories[strVal] ?? 0;
      }
      
      totalScore += score * param.weight;
      maxPossibleScore += 100 * param.weight;
      
      if (score < 60) {
        reasons.push(`${param.label} resulted in a low score (${score}/100)`);
      }
    } else {
      reasons.push(`${param.label} data missing`);
    }
  }

  let finalScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  let status = mapScoreToStatus(finalScore, currentRubric.status_thresholds);

  if (signalsAvailable < currentRubric.min_signals_required) {
    status = "INSUFFICIENT_DATA";
    reasons.unshift("Insufficient data to perform a reliable scan");
  }

  return {
    status,
    score: finalScore,
    reasons,
    target_type: "skill",
    target_id: targetId,
    data_source: source,
    signals_available: signalsAvailable,
    signals_total: currentRubric.parameters.length,
    timestamp: new Date().toISOString(),
  };
}
