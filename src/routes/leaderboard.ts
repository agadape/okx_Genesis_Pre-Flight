import { Request, Response } from "express";
import { getRecentScans } from "../lib/storage.js";

export async function leaderboardHandler(req: Request, res: Response) {
  try {
    let scans = await getRecentScans(50);

    const rows = scans.map(scan => {
      const isDanger = scan.status === "CRITICAL";
      const isWarning = scan.status === "WARNING";
      
      let statusStyle = "bg-green-500/10 text-green-400 border-green-500/30";
      let statusIcon = "shield-check";
      if (isDanger) {
        statusStyle = "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse";
        statusIcon = "shield-alert";
      } else if (isWarning) {
        statusStyle = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        statusIcon = "alert-triangle";
      }

      const dateStr = scan.timestamp ? new Date(scan.timestamp).toLocaleString() : "-";
      
      return `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors group">
          <td class="py-4 px-4 font-mono text-sm text-zinc-300">
            <div class="flex items-center gap-2">
              <i data-lucide="terminal-square" class="w-4 h-4 text-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity"></i>
              <span class="truncate max-w-[200px]" title="${scan.target_id}">${scan.target_id}</span>
            </div>
          </td>
          <td class="py-4 px-4">
            <span class="px-2 py-1 text-xs font-medium tracking-wider text-zinc-400 bg-white/5 border border-white/10 rounded-md uppercase">${scan.target_type}</span>
          </td>
          <td class="py-4 px-4">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusStyle} text-xs font-bold uppercase tracking-widest">
              <i data-lucide="${statusIcon}" class="w-3.5 h-3.5"></i>
              ${scan.status}
            </div>
          </td>
          <td class="py-4 px-4 font-mono font-bold text-lg text-white">
            ${scan.score}
          </td>
          <td class="py-4 px-4 text-sm text-zinc-500 font-mono">
            ${dateStr}
          </td>
          <td class="py-4 px-4 text-right">
            ${scan.report_url ? `
              <a href="/reports/${scan.scan_id}" class="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#ff6600]/10 text-[#ff6600] border border-[#ff6600]/30 hover:bg-[#ff6600]/20 transition-colors text-xs font-bold uppercase tracking-wider">
                <i data-lucide="file-search" class="w-3.5 h-3.5"></i>
                Inspect
              </a>
            ` : `<span class="text-zinc-600 text-xs uppercase font-bold">No Report</span>`}
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
      <title>Pre-Flight | Live Intel</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/lucide@latest"></script>
      <style>
        body { background-color: #050505; color: #fafafa; }
        .grid-bg {
          background-image: linear-gradient(to right, rgba(255,102,0, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,102,0, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .typewriter {
          overflow: hidden;
          border-right: .15em solid #ff6600;
          white-space: nowrap;
          margin: 0 auto;
          letter-spacing: .05em;
          animation: typing 2.5s steps(40, end), blink-caret .75s step-end infinite;
        }
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: #ff6600; } }
      </style>
    </head>
    <body class="grid-bg font-sans min-h-screen p-4 sm:p-8 flex flex-col">
      
      <!-- Ambient Glow -->
      <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[100px] pointer-events-none rounded-full"></div>

      <div class="relative z-10 max-w-6xl w-full mx-auto flex-grow flex flex-col">
        
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <a href="/" class="inline-flex items-center gap-2 text-zinc-500 hover:text-[#ff6600] transition-colors text-sm font-bold uppercase tracking-widest mb-4">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to HQ
            </a>
            <div class="font-mono text-[#ff6600] text-lg sm:text-xl font-bold inline-block typewriter">
              root@pre-flight:~$ tail -f /var/log/scan-results.log
            </div>
            <p class="text-zinc-500 text-sm mt-2 font-mono">Live telemetry from the OKX.AI immune system. Auto-refreshing every 30s.</p>
          </div>
          
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            System Active
          </div>
        </div>

        <!-- Glassmorphic Table Container -->
        <div class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex-grow">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/10 bg-white/5">
                  <th class="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <i data-lucide="target" class="w-3.5 h-3.5"></i> Target Entity
                  </th>
                  <th class="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Class</th>
                  <th class="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Security Status</th>
                  <th class="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Heuristic Score</th>
                  <th class="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
                  <th class="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody>
                ${scans.length > 0 ? rows : `
                  <tr>
                    <td colspan="6" class="py-12 text-center text-zinc-600 font-mono">
                      <div class="flex flex-col items-center gap-3">
                        <i data-lucide="ghost" class="w-8 h-8 opacity-50"></i>
                        No scanning activity detected yet...
                      </div>
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
      
      <script>
        lucide.createIcons();
      </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (e) {
    console.error("Error generating leaderboard:", e);
    res.status(500).send("Internal Server Error generating leaderboard");
  }
}
