import express from "express";
import { config } from "./config.js";
import { handleScan } from "./engine/types.js";
import { healthHandler } from "./health.js";

// Note: x402 payment middleware is intentionally stubbed here during development.
// It will be enabled when the OKX API credentials are provided by the user.

const app = express();
app.use(express.json());

// A stub for payment middleware so we can test the core logic first
const stubPaymentGate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Simulating the x402 402 Payment Required response if a special header is missing
  if (!req.headers["x-payment-stub"]) {
      res.status(402).json({
          message: "Payment Required",
          x402Version: 1,
          accepts: [
            {
              scheme: "exact",
              network: "eip155:196",
              price: config.SCAN_PRICE_USDT,
              payTo: config.WALLET_ADDRESS,
            }
          ]
      });
      return;
  }
  next();
};

app.get("/health", healthHandler);
app.post("/scan", stubPaymentGate, handleScan);

if (process.env.NODE_ENV !== "test") {
  app.listen(config.PORT, () => {
    console.log(`Pre-Flight scanner running on port ${config.PORT}`);
    console.log(`Scan price: ${config.SCAN_PRICE_USDT} USDT (x402/XLayer)`);
  });
}

export default app;
