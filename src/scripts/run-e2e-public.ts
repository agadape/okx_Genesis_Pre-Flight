import "dotenv/config";
import { Request, Response } from "express";
import { handleScan } from "../engine/types.js";

async function runE2EPublic() {
  console.log("🚀 Running E2E Public Test against Vercel Mock Target...");

  const req = {
    body: {
      target_type: "external",
      target_id: "https://okx-genesis-pre-flight.vercel.app/mock-target-manifest.json",
      verify_live: true
    },
    headers: {}
  } as unknown as Request;

  const res = {
    status: (code: number) => {
      console.log(`[Response Status]: ${code}`);
      return res;
    },
    json: (data: any) => {
      console.log(`[Response JSON]:`);
      console.dir(data, { depth: null });
      if (data.data?.report_url) {
        console.log(`\n✅ REPORT AVAILABLE AT: ${data.data.report_url}`);
      }
    }
  } as unknown as Response;

  await handleScan(req, res);
  process.exit(0);
}

runE2EPublic().catch(console.error);
