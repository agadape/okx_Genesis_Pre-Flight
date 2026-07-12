import { Request, Response } from "express";
import { getScanResult } from "../lib/storage.js";

export async function reportHandler(req: Request, res: Response) {
  try {
    const { scan_id } = req.params;
    const scan = await getScanResult(scan_id);

    if (!scan) {
      res.status(404).send(`
        <html>
          <head><title>Report Not Found</title><style>body{font-family:sans-serif;text-align:center;padding:50px;}</style></head>
          <body><h2>Scan ID not found.</h2><p>The report may have expired or never existed.</p></body>
        </html>
      `);
      return;
    }

    const isDanger = scan.status === "BAHAYA";
    const statusColor = isDanger ? "#ff4444" : (scan.status === "WASPADA" ? "#ffbb33" : "#00C851");
    
    // Format timestamp
    const dateStr = scan.timestamp ? new Date(scan.timestamp).toLocaleString() : "Unknown";

    const shareText = encodeURIComponent(`🚨 Security Alert: AI Agent / Skill [${scan.target_id}] has been flagged as ${scan.status} with score ${scan.score}/100! Check the full audit report: `);
    const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=https://okx-genesis-pre-flight.vercel.app/reports/${scan_id}`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trust & Safety Report - ${scan.scan_id}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .status-badge { background-color: ${statusColor}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 1.2em; }
        .score { font-size: 3em; font-weight: bold; color: ${statusColor}; margin: 10px 0; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .detail-item { background: #f9f9f9; padding: 15px; border-radius: 6px; }
        .reasons { background: #fff0f0; border-left: 4px solid #ff4444; padding: 15px; margin-bottom: 20px; }
        .reasons h3 { margin-top: 0; color: #cc0000; }
        ul { margin: 0; padding-left: 20px; }
        li { margin-bottom: 10px; }
        .disclaimer { font-size: 0.85em; color: #666; font-style: italic; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; }
        .share-btn { display: inline-block; background-color: #1DA1F2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        .share-btn:hover { background-color: #1a91da; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>Security Audit Report</h1>
            <p>ID: <code>${scan.scan_id}</code></p>
            ${scan.live_verification?.attempted ? `<div style="display:inline-block; margin-top:5px; padding:4px 8px; background:#e8f5e9; color:#2e7d32; border:1px solid #4caf50; border-radius:4px; font-size:0.85em; font-weight:bold;">✅ Verified via On-Chain Payment</div>` : ''}
          </div>
          <div class="status-badge">${scan.status}</div>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <strong>Target:</strong><br>
            <span style="word-break: break-all;">${scan.target_id}</span>
          </div>
          <div class="detail-item">
            <strong>Target Type:</strong><br>
            ${scan.target_type.toUpperCase()}
          </div>
          <div class="detail-item">
            <strong>Timestamp:</strong><br>
            ${dateStr}
          </div>
          <div class="detail-item">
            <strong>Data Source:</strong><br>
            ${scan.data_source.toUpperCase()}
          </div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <div>Trust Score</div>
          <div class="score">${scan.score} <span style="font-size: 0.3em; color: #666;">/ 100</span></div>
          <p>Based on ${scan.signals_available} out of ${scan.signals_total} possible risk signals.</p>
        </div>

        ${scan.reasons.length > 0 ? `
        <div class="reasons">
          <h3>Risk Factors Detected:</h3>
          <ul>
            ${scan.reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        ` : `
        <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px;">
          <h3>No Critical Risk Factors Detected</h3>
          <p>This agent passed all baseline automated checks.</p>
        </div>
        `}

        <div style="text-align: center;">
          <a href="${shareUrl}" target="_blank" class="share-btn">🐦 Share Alert on X (Twitter)</a>
        </div>

        <div class="disclaimer">
          <strong>Disclaimer:</strong> This report is generated by the Pre-Flight Trust & Safety scanner using automated heuristic analysis. It is NOT an official OKX audit, nor a guarantee of absolute safety. Users are strongly advised to perform their own due diligence before interacting with or granting permissions to any AI agent, ASP, or Skill.
        </div>
      </div>
    </body>
    </html>
    `;

    res.send(html);
  } catch (e) {
    console.error("Error generating report:", e);
    res.status(500).send("Internal Server Error generating report");
  }
}
