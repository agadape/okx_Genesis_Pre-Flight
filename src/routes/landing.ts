import { Request, Response } from "express";

export function landingHandler(req: Request, res: Response) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pre-Flight | Trust & Safety for OKX.AI</title>
      <style>
        body { 
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background-color: #02040a; 
            color: #fff; 
            margin: 0; 
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 60px 20px;
            flex: 1;
        }
        h1 { 
            font-size: 3.5rem; 
            font-weight: 900; 
            margin-bottom: 10px;
            background: linear-gradient(90deg, #00ff9d, #00b8ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        h2 {
            font-size: 1.5rem;
            color: #8b949e;
            font-weight: 400;
            margin-top: 0;
            margin-bottom: 40px;
        }
        .card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(0, 255, 157, 0.2);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }
        p { line-height: 1.6; color: #c9d1d9; font-size: 1.1rem; }
        .links {
            display: flex;
            gap: 20px;
            margin-top: 40px;
        }
        a {
            display: inline-block;
            padding: 12px 24px;
            background-color: #00ff9d;
            color: #000;
            text-decoration: none;
            font-weight: 700;
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        a:hover { background-color: #00cc7d; transform: translateY(-2px); }
        .secondary-link {
            background-color: transparent;
            color: #00ff9d;
            border: 1px solid #00ff9d;
        }
        .secondary-link:hover {
            background-color: rgba(0, 255, 157, 0.1);
        }
        .disclaimer {
            margin-top: auto;
            text-align: center;
            padding: 20px;
            font-size: 0.85rem;
            color: #555;
            background: #000;
            border-top: 1px solid #111;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Pre-Flight Scanner</h1>
        <h2>The Zero-Trust Immune System for OKX.AI</h2>
        
        <div class="card">
            <p><strong>Trust is the prerequisite for AI mass adoption.</strong></p>
            <p>Pre-Flight is an A2MCP endpoint that automatically scans unknown Agent Service Providers (ASPs) for malicious payloads, permission abuse, and bait-and-switch pricing traps.</p>
            <p>Powered by a live on-chain Mystery Shopper and monetized directly via the <strong>x402 protocol</strong> on XLayer Mainnet.</p>
        </div>

        <div class="links">
            <a href="/leaderboard">🏆 View Live Leaderboard</a>
            <a href="/reports/8f18b739-cefd-4b44-a3b4-3609a966b58f" class="secondary-link">📄 Example Report</a>
        </div>
      </div>

      <div class="disclaimer">
        ⚠️ DISCLAIMER: Pre-Flight provides heuristic risk signals based on automated on-chain behavior analysis. It is NOT an official smart contract audit. Always do your own research before connecting your wallet to unknown agents.
      </div>
    </body>
    </html>
    `;
    res.send(html);
}
