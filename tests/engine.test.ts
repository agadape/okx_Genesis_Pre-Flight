import { describe, it, expect } from "vitest";
import { processASP } from "../src/engine/score-asp.js";
import { processSkill } from "../src/engine/score-skill.js";

describe("Scoring Engine - ASP", () => {
  it("should score an established ASP as AMAN", () => {
    const mockData = {
      source: "mocked" as const,
      signals: {
        marketplace_rating: 4.7,
        sold_count: 245,
        review_count: 38,
        endpoint_liveness: true,
        endpoint_response_ms: 320,
        description_length: 295,
        price_usdt: 0.10,
        identity_verified: true,
        account_age_days: 142
      },
      raw: {}
    };

    const result = processASP("test-1", mockData);
    expect(result.status).toBe("AMAN");
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.signals_available).toBe(6); // description_length and price_usdt do not exactly match rubric param IDs
  });

  it("should return DATA_BELUM_CUKUP for newcomer with < 3 signals", () => {
    const mockData = {
      source: "mocked" as const,
      signals: {
        endpoint_liveness: true,
        identity_verified: false
      },
      raw: {}
    };

    const result = processASP("test-2", mockData);
    expect(result.status).toBe("DATA_BELUM_CUKUP");
    expect(result.reasons[0]).toMatch(/Insufficient data/);
  });
});

describe("Scoring Engine - Skill", () => {
  it("should trigger instant fail for private key requests", () => {
    const mockData = {
      source: "mocked" as const,
      signals: {
        permission_scope: "excessive",
        private_key_request: true,
        official_source: false
      },
      raw: {}
    };

    const result = processSkill("test-3", mockData);
    expect(result.status).toBe("BAHAYA");
    expect(result.score).toBe(0);
    expect(result.reasons[0]).toMatch(/private key/i);
  });
});
