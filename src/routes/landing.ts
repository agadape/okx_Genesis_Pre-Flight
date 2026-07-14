import { Request, Response } from "express";

export function landingHandler(req: Request, res: Response) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pre-Flight | Zero-Trust for OKX.AI</title>
      <style>
        :root {
            --bg-base: #050505;
            --bg-card: rgba(255, 255, 255, 0.02);
            --border-card: rgba(255, 255, 255, 0.05);
            --text-main: #fafafa;
            --text-muted: #a1a1aa;
            --accent: #00ff9d;
            --accent-glow: rgba(0, 255, 157, 0.15);
        }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            background-color: var(--bg-base); 
            color: var(--text-main); 
            margin: 0; 
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            overflow-x: hidden;
        }
        /* Subtle glowing background orb */
        .glow-bg {
            position: fixed;
            top: -20%;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 600px;
            background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
            z-index: -1;
            pointer-events: none;
            filter: blur(80px);
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 80px 24px;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            background: rgba(0, 255, 157, 0.05);
            border: 1px solid rgba(0, 255, 157, 0.2);
            border-radius: 100px;
            color: var(--accent);
            font-size: 0.85rem;
            font-weight: 500;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
        }
        h1 { 
            font-size: 4rem; 
            font-weight: 700; 
            letter-spacing: -0.04em;
            margin-bottom: 16px;
            line-height: 1.1;
            background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        h2 {
            font-size: 1.25rem;
            color: var(--text-muted);
            font-weight: 400;
            max-width: 600px;
            margin: 0 auto 48px auto;
            line-height: 1.6;
        }
        /* Bento Box Grid */
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            width: 100%;
            margin-bottom: 48px;
        }
        .card {
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-card);
            border-radius: 16px;
            padding: 32px 24px;
            text-align: left;
            transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .card:hover {
            border-color: rgba(0, 255, 157, 0.3);
            transform: translateY(-2px);
        }
        .card-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .card-desc {
            font-size: 0.95rem;
            color: var(--text-muted);
            line-height: 1.6;
        }
        .span-2 { grid-column: span 2; }
        .span-3 { grid-column: span 3; }
        
        .actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            margin-top: 10px;
        }
        .btn {
            padding: 12px 28px;
            font-size: 0.95rem;
            font-weight: 500;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .btn-primary {
            background: var(--text-main);
            color: var(--bg-base);
            border: 1px solid transparent;
        }
        .btn-primary:hover {
            background: #e4e4e7;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }
        .btn-secondary {
            background: transparent;
            color: var(--text-main);
            border: 1px solid var(--border-card);
        }
        .btn-secondary:hover {
            border-color: var(--text-muted);
            background: rgba(255, 255, 255, 0.05);
        }
        
        .footer {
            margin-top: auto;
            text-align: center;
            padding: 32px 24px;
            font-size: 0.85rem;
            color: var(--text-muted);
            border-top: 1px solid var(--border-card);
        }
        .footer span { color: var(--accent); }

        @media (max-width: 768px) {
            .bento-grid { grid-template-columns: 1fr; }
            .span-2, .span-3 { grid-column: span 1; }
            h1 { font-size: 3rem; }
        }
      </style>
    </head>
    <body>
      <div class="glow-bg"></div>
      
      <div class="container">
        <div class="badge">ASP IDENTITY: #5549</div>
        <h1>Zero-Trust<br>for OKX.AI Agents</h1>
        <h2>The ultimate immune system shielding users from manifest spoofing, bait-and-switch pricing, and malicious payloads.</h2>
        
        <div class="bento-grid">
            <div class="card span-2">
                <div class="card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Live Mystery Shopper
                </div>
                <div class="card-desc">
                    Before a user connects, Pre-Flight deploys an on-chain simulated request. We force the target agent to reveal its true payload and actual pricing, stopping bait-and-switch traps instantly.
                </div>
            </div>
            
            <div class="card">
                <div class="card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    EIP-712 Secured
                </div>
                <div class="card-desc">
                    Every security scan is cryptographically signed using viem, issuing an undeniable attestation report.
                </div>
            </div>

            <div class="card span-3" style="display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; background: rgba(0, 255, 157, 0.02); border-color: rgba(0, 255, 157, 0.1);">
                <div>
                    <div class="card-title" style="color: var(--accent);">Monetized via x402 Protocol</div>
                    <div class="card-desc">Natively integrated on XLayer Mainnet. Pay-per-scan API (0.05 USDT) settled seamlessly on-chain.</div>
                </div>
                <div class="actions" style="margin: 0;">
                    <a href="/leaderboard" class="btn btn-primary">View Leaderboard</a>
                    <a href="/reports/8f18b739-cefd-4b44-a3b4-3609a966b58f" class="btn btn-secondary">Sample Report</a>
                </div>
            </div>
        </div>
      </div>

      <div class="footer">
        Automated Heuristic Security Analysis • <span>Not an official smart contract audit</span>
      </div>
    </body>
    </html>
    `;
    res.send(html);
}
