import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@okxweb3/x402-express";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server.js";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { config } from "./config.js";
import { handleScan } from "./engine/types.js";
import { healthHandler } from "./health.js";

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

// The /scan route is now fully protected by the x402 payment gate!
app.post("/scan", paymentGate, handleScan);

if (process.env.NODE_ENV !== "test") {
  app.listen(config.PORT, () => {
    console.log(`Pre-Flight scanner running on port ${config.PORT}`);
    console.log(`Live Scan price: ${config.SCAN_PRICE_USDT} USDT (x402/XLayer)`);
  });
}

export default app;
