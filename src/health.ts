import { Request, Response } from "express";

export function healthHandler(_req: Request, res: Response): void {
  res.json({
    status: "ok",
    service: "pre-flight",
    version: "1.0.0",
    description: "Trust & Safety Scanner for OKX AI ecosystem",
    timestamp: new Date().toISOString(),
  });
}
