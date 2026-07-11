import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";

describe("Integration Tests - API", () => {
  it("should return 402 Payment Required when payment header is missing", async () => {
    const res = await request(app)
      .post("/scan")
      .send({ target_type: "asp", target_id: "mock-established-001" });
    
    expect(res.status).toBe(402);
    expect(res.body.message).toBe("Payment Required");
  });

  it("should scan established ASP successfully when payment is provided", async () => {
    const res = await request(app)
      .post("/scan")
      .set("x-payment-stub", "true")
      .send({ target_type: "asp", target_id: "mock-established-001" });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.status).toBe("AMAN");
  });

  it("should scan red flag skill successfully and return BAHAYA", async () => {
    const res = await request(app)
      .post("/scan")
      .set("x-payment-stub", "true")
      .send({ target_type: "skill", target_id: "mock-redflag-001" });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.status).toBe("BAHAYA");
  });
});
