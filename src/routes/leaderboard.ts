import { Request, Response } from "express";
import { getRecentScans } from "../lib/storage.js";
import { seed } from "../scripts/seed-leaderboard.js";

export async function leaderboardHandler(req: Request, res: Response) {
  try {
    let scans = await getRecentScans(50);

    // Auto-seed if empty (mitigation for Vercel Serverless cold start storage inconsistency during demo)
    if (scans.length === 0) {
      console.log("[leaderboard] Storage empty, auto-seeding data for demo stability...");
      try {
        await seed();
        scans = await getRecentScans(50);
      } catch (e) {
        console.error("Auto-seed failed:", e);
      }
    }

    const rows = scans.map(scan => {
      const isDanger = scan.status === "BAHAYA";
      const statusColor = isDanger ? "#ff4444" : (scan.status === "WASPADA" ? "#ffbb33" : "#00C851");
      const dateStr = scan.timestamp ? new Date(scan.timestamp).toLocaleString() : "-";
      
      return `
        <tr>
          <td class="truncate" title="${scan.target_id}">${scan.target_id}</td>
          <td><span class="badge type-badge">${scan.target_type.toUpperCase()}</span></td>
          <td><span class="badge" style="background-color: ${statusColor}; color: white;">${scan.status}</span></td>
          <td style="font-weight: bold; color: ${statusColor}">${scan.score}</td>
          <td>${dateStr}</td>
          <td>
            ${scan.report_url ? `<a href="/reports/${scan.scan_id}" class="report-link">View Report</a>` : `<span style="color:#aaa;">No Report</span>`}
          </td>
        </tr>
      `;
    }).join("");

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="refresh" content="30">
      <title>Pre-Flight Scanner Leaderboard</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 30px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
        th { background-color: #f9f9f9; font-weight: bold; }
        tr:hover { background-color: #f5f5f5; }
        .truncate { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; vertical-align: bottom; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
        .type-badge { background-color: #e0e0e0; color: #333; }
        .report-link { color: #1DA1F2; text-decoration: none; font-weight: bold; }
        .report-link:hover { text-decoration: underline; }
        .empty-state { text-align: center; padding: 50px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Live Scan History</h1>
        <p class="subtitle">Real-time log of AI agents and skills audited by the Pre-Flight Scanner. (Auto-refreshes every 30s)</p>
        
        ${scans.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Target</th>
              <th>Type</th>
              <th>Status</th>
              <th>Score</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        ` : `
        <div class="empty-state">
          <h3>No Scans Yet</h3>
          <p>The system hasn't scanned any agents recently.</p>
        </div>
        `}
      </div>
    </body>
    </html>
    `;

    res.send(html);
  } catch (e) {
    console.error("Error generating leaderboard:", e);
    res.status(500).send("Internal Server Error generating leaderboard");
  }
}
