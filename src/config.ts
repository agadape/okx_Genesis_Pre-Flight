import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  OKX_API_KEY: z.string().min(1).default("sandbox-key"),
  OKX_SECRET_KEY: z.string().min(1).default("sandbox-secret"),
  OKX_PASSPHRASE: z.string().min(1).default("sandbox-passphrase"),
  WALLET_ADDRESS: z.string().default("0x0000000000000000000000000000000000000000"),
  PORT: z.coerce.number().default(3000),
  SCAN_PRICE_USDT: z.string().default("0.05"),
  PREFLIGHT_AGENT_ID: z.string().default("5549"),
});

export const config = envSchema.parse(process.env);
