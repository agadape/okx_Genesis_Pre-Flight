/**
 * Data Fetch Layer — attempts to retrieve live data from OKX AI marketplace,
 * falls back to mock profiles when live data is unavailable or insufficient.
 *
 * Key design principle: Always mark data_source as "live" or "mocked" for transparency.
 * The build plan explicitly requires this for credibility during OKX review.
 */

import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TargetType, DataSource } from "../engine/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MOCKS_DIR = resolve(__dirname, "../../mocks");

export interface FetchedData {
  source: DataSource;
  raw: Record<string, unknown>;
  signals: Record<string, unknown>;
}

/**
 * Main entry point: fetch data for a scan target.
 * 1. Try live data from OKX marketplace
 * 2. If live data insufficient, fall back to best-matching mock profile
 */
export async function fetchTargetData(
  targetType: TargetType,
  targetId: string
): Promise<FetchedData> {
  // 1. Try live data fetch
  try {
    const liveData = await fetchLiveData(targetType, targetId);
    if (liveData && hasMinimalSignals(liveData, targetType)) {
      return {
        source: "live",
        raw: liveData,
        signals: liveData,
      };
    }
  } catch (err) {
    console.warn(`[Pre-Flight] Live data fetch failed for ${targetId}:`, (err as Error).message);
  }

  // 2. Fallback: check if targetId matches a known mock profile
  const mockData = await loadMockProfile(targetType, targetId);
  return {
    source: "mocked",
    raw: mockData,
    signals: mockData,
  };
}

/**
 * Attempt to fetch live data from OKX AI marketplace.
 * Currently fetches from the public agent page at okx.ai/agents/{id}.
 *
 * NOTE: In the genesis phase of the OKX AI ecosystem, live data may be sparse.
 * This function will evolve as OKX exposes more structured APIs for agent metadata.
 */
async function fetchLiveData(
  targetType: TargetType,
  targetId: string
): Promise<Record<string, unknown> | null> {
  // For ASP targets, try to fetch from the marketplace
  if (targetType === "asp") {
    try {
      const url = `https://okx.ai/agents/${encodeURIComponent(targetId)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Pre-Flight/1.0 Trust-Scanner",
        },
      });
      clearTimeout(timeout);

      if (response.ok) {
        // In a production version, we'd parse the HTML/API response
        // For the genesis hackathon, we extract what we can
        const text = await response.text();
        return parseAgentPage(text, targetId);
      }
    } catch {
      // Silently fall through to mock
    }
  }

  return null;
}

/**
 * Parse an OKX AI agent page for relevant signals.
 * This is a best-effort heuristic parser — the OKX marketplace may not
 * expose structured data in a consistent way during the genesis phase.
 */
function parseAgentPage(html: string, targetId: string): Record<string, unknown> | null {
  const data: Record<string, unknown> = {};

  // Try to extract rating
  const ratingMatch = html.match(/rating["\s:]+(\d+\.?\d*)/i);
  if (ratingMatch) data.marketplace_rating = parseFloat(ratingMatch[1]);

  // Try to extract sold count
  const soldMatch = html.match(/sold["\s:]+(\d+)/i);
  if (soldMatch) data.sold_count = parseInt(soldMatch[1], 10);

  // Try to extract review count
  const reviewMatch = html.match(/review["\s:]+(\d+)/i);
  if (reviewMatch) data.review_count = parseInt(reviewMatch[1], 10);

  // Try to extract description
  const descMatch = html.match(/description["\s:]+["']([^"']+)["']/i);
  if (descMatch) {
    data.description = descMatch[1];
    data.description_length = descMatch[1].length;
  }

  // If we extracted at least something, return it
  if (Object.keys(data).length > 0) {
    data.target_id = targetId;
    return data;
  }

  return null;
}

/**
 * Check if we have enough signals from live data to avoid needing a mock fallback.
 */
function hasMinimalSignals(data: Record<string, unknown>, targetType: TargetType): boolean {
  const aspSignals = ["marketplace_rating", "sold_count", "review_count", "description"];
  const skillSignals = ["permission_scope", "official_source", "description"];

  const expectedSignals = targetType === "asp" ? aspSignals : skillSignals;
  const available = expectedSignals.filter(
    (key) => data[key] !== undefined && data[key] !== null
  );

  // Need at least 2 live signals to consider the data usable
  return available.length >= 2;
}

/**
 * Load a mock profile that best matches the target.
 * Uses mock ID matching or falls back to a default archetype.
 */
async function loadMockProfile(
  targetType: TargetType,
  targetId: string
): Promise<Record<string, unknown>> {
  // Direct mock ID matching
  const mockFiles: Record<string, string> = {
    "mock-established-001": "established.json",
    "mock-newcomer-001": "genesis-newcomer.json",
    "mock-redflag-001": "red-flag-compound.json",
  };

  const matchedFile = mockFiles[targetId];
  if (matchedFile) {
    try {
      const filePath = resolve(MOCKS_DIR, matchedFile);
      const content = await readFile(filePath, "utf-8");
      const mock = JSON.parse(content);
      return mock.data || mock;
    } catch {
      // Fall through to default
    }
  }

  // Default mock based on target type
  const defaultFile = targetType === "asp" ? "genesis-newcomer.json" : "red-flag-compound.json";
  try {
    const filePath = resolve(MOCKS_DIR, defaultFile);
    const content = await readFile(filePath, "utf-8");
    const mock = JSON.parse(content);
    return mock.data || mock;
  } catch {
    // Absolute fallback: return minimal data that will trigger DATA_BELUM_CUKUP
    return {
      target_id: targetId,
      target_type: targetType,
    };
  }
}
