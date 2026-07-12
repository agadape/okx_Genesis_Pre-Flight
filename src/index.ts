import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@okxweb3/x402-express";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { config } from "./config.js";
import { handleScan } from "./engine/types.js";
import { healthHandler } from "./health.js";
import { leaderboardHandler } from "./routes/leaderboard.js";
import { reportHandler } from "./routes/reports.js";
import { verifyAttestationHandler } from "./routes/verify.js";

const app = express();
app.use(express.json());

// Initialize OKX Facilitator Client for x402
const facilitatorClient = new OKXFacilitatorClient({
  apiKey: config.OKX_API_KEY,
  secretKey: config.OKX_SECRET_KEY,
  passphrase: config.OKX_PASSPHRASE,
});

// Configure Resource Server with EVM payment scheme for XLayer (eip155:196)
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:196", new ExactEvmScheme());

// Apply payment middleware gate
const paymentGate = paymentMiddleware(
  {
    "POST /scan": {
      accepts: {
        scheme: "exact",
        price: config.SCAN_PRICE_USDT,
        network: "eip155:196",
        payTo: config.WALLET_ADDRESS,
      },
      description: "Pre-Flight Trust & Safety scan of an ASP or Skill",
    },
  },
  resourceServer
);

app.get("/health", healthHandler);
app.get("/leaderboard", leaderboardHandler);
app.get("/reports/:scan_id", reportHandler);
app.get("/verify/:scan_id", verifyAttestationHandler);

// Agent Metadata for ERC-8004 Registration
app.get("/metadata.json", (req, res) => {
  res.json({
    name: "Pre-Flight",
    description: "Trust & Safety scanner for ASPs and Skills on OKX AI. Evaluates risk based on marketplace rating, liveness, and code transparency.",
    image: "https://cryptologos.cc/logos/okb-okb-logo.png", // fallback image
    capabilities: ["security-scanning", "risk-assessment"],
    endpoints: {
      a2mcp: "https://okx-genesis-pre-flight.vercel.app/scan",
      mcp: null,
      a2a: null
    },
    protocols: ["A2MCP", "x402"]
  });
});

// The /scan route is now fully protected by the x402 payment gate!
app.post("/scan", paymentGate, handleScan);

if (process.env.NODE_ENV !== "test") {
  app.listen(config.PORT, () => {
    console.log(`Pre-Flight scanner running on port ${config.PORT}`);
    console.log(`Live Scan price: ${config.SCAN_PRICE_USDT} USDT (x402/XLayer)`);
  });
}

export default app;
