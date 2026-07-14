import { Request, Response } from "express";
import { getScanResult } from "../lib/storage.js";

export async function reportHandler(req: Request, res: Response) {
  try {
    const { scan_id } = req.params;
    const scan = await getScanResult(scan_id);

    if (!scan) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>404 - Not Found</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen font-mono">
          <div class="text-center">
            <h1 class="text-4xl text-red-500 font-bold mb-4">404: DOSSIER NOT FOUND</h1>
            <p class="text-zinc-500">The requested scan ID does not exist or has been purged.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

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
      <title>Pre-Flight | Dossier ${scan.scan_id.substring(0,8)}</title>
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

      <div class="relative z-10 max-w-4xl w-full mx-auto flex-grow flex flex-col">
        
        <!-- Header Section -->
        <div class="flex flex-col mb-8 gap-2">
          <a href="/leaderboard" class="inline-flex items-center gap-2 text-zinc-500 hover:text-[#ff6600] transition-colors text-sm font-bold uppercase tracking-widest w-fit mb-2">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Live Intel
          </a>
          <div class="font-mono text-[#ff6600] text-lg sm:text-xl font-bold inline-block typewriter">
            root@pre-flight:~$ cat /var/log/dossier.log
          </div>
          <p class="text-zinc-500 text-sm font-mono mt-1">Classified automated security analysis report.</p>
        </div>

        <!-- Glassmorphic Card -->
        <div class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10">
          
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-6 gap-6">
            <div>
              <h1 class="text-2xl font-bold text-white mb-2 tracking-tight">Security Audit Report</h1>
              <div class="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-400">
                <span>ID: <code class="text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded">${scan.scan_id}</code></span>
                ${scan.live_verification?.attempted ? `<span class="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20"><i data-lucide="shield" class="w-3 h-3"></i> EIP-712 Signed</span>` : ''}
                ${scan.attestation ? `<a href="/verify/${scan.scan_id}" class="inline-flex items-center gap-1 text-zinc-300 bg-white/10 hover:bg-white/20 transition-colors px-2 py-0.5 rounded border border-white/20"><i data-lucide="check-circle" class="w-3 h-3"></i> Verify Sig</a>` : ''}
              </div>
            </div>
            
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusStyle} text-sm font-bold uppercase tracking-widest shadow-lg">
              <i data-lucide="${statusIcon}" class="w-4 h-4"></i>
              ${scan.status}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div class="bg-white/5 border border-white/10 rounded-xl p-4">
              <div class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Target Entity</div>
              <div class="font-mono text-zinc-200 truncate" title="${scan.target_id}">${scan.target_id}</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-xl p-4">
              <div class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Entity Class</div>
              <div class="font-mono text-zinc-200 uppercase">${scan.target_type}</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-xl p-4">
              <div class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Timestamp</div>
              <div class="font-mono text-zinc-200">${dateStr}</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-xl p-4">
              <div class="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Data Telemetry</div>
              <div class="font-mono text-zinc-200 uppercase">${scan.data_source}</div>
            </div>
          </div>

          <div class="text-center py-8 border-y border-white/10 mb-8 bg-gradient-to-b from-transparent to-white/[0.02]">
            <div class="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Calculated Heuristic Score</div>
            <div class="text-7xl font-bold font-mono tracking-tighter mb-2" style="color: ${isDanger ? '#ff4444' : (isWarning ? '#ffbb33' : '#00C851')}">
              ${scan.score} <span class="text-2xl text-zinc-600">/100</span>
            </div>
            <p class="text-zinc-500 text-sm font-mono">Analyzed using ${scan.signals_available} of ${scan.signals_total} total risk parameters.</p>
          </div>

          ${scan.live_verification?.findings && scan.live_verification.findings.length > 0 ? `
          <div class="mb-6 bg-green-500/5 border-l-4 border-green-500 p-5 rounded-r-xl">
            <h3 class="flex items-center gap-2 text-green-400 font-bold uppercase tracking-widest text-sm mb-3">
              <i data-lucide="bot" class="w-4 h-4"></i> Mystery Shopper Intelligence
            </h3>
            <ul class="space-y-2 font-mono text-sm text-zinc-300 list-disc list-inside">
              ${scan.live_verification.findings.map((f: any) => `<li>${f}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${scan.reasons.length > 0 ? `
          <div class="mb-6 bg-red-500/5 border-l-4 border-red-500 p-5 rounded-r-xl">
            <h3 class="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-sm mb-3">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i> Detected Risk Factors
            </h3>
            <ul class="space-y-2 font-mono text-sm text-zinc-300 list-disc list-inside">
              ${scan.reasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
          ` : `
          <div class="mb-6 bg-green-500/5 border-l-4 border-green-500 p-5 rounded-r-xl">
            <h3 class="flex items-center gap-2 text-green-400 font-bold uppercase tracking-widest text-sm mb-2">
              <i data-lucide="check-circle" class="w-4 h-4"></i> No Critical Risks Found
            </h3>
            <p class="font-mono text-sm text-zinc-400">This entity passed all baseline automated security checks.</p>
          </div>
          `}

          <div class="mt-8 flex justify-center">
            <a href="${shareUrl}" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ff6600] hover:bg-[#ff8533] text-black font-bold text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(255,102,0,0.4)] transition-all hover:scale-105">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4 fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
              Broadcast Alert
            </a>
          </div>

          <div class="mt-12 pt-6 border-t border-white/10 text-center">
            <p class="text-xs text-zinc-600 font-mono leading-relaxed">
              <strong>DISCLAIMER:</strong> This report is generated by the Pre-Flight Trust & Safety scanner using automated heuristic analysis. It is NOT an official OKX audit. Verify on-chain data independently.
            </p>
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
    console.error("Error generating report:", e);
    res.status(500).send("Internal Server Error generating report");
  }
}
