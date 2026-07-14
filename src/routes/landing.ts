import { Request, Response } from "express";

export function landingHandler(req: Request, res: Response) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pre-Flight | Zero-Trust for OKX.AI</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/lucide@latest"></script>
      <style>
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      </style>
    </head>
    <body class="relative w-full bg-zinc-950 text-white overflow-x-hidden font-sans min-h-screen flex flex-col">
      
      <!-- Background Video -->
      <video autoplay loop muted playsinline class="absolute inset-0 z-0 w-full h-full object-cover opacity-60 pointer-events-none">
        <source src="/bg-video.mp4" type="video/mp4">
      </video>

      <div class="relative z-10 mx-auto w-full max-w-7xl px-4 pt-4 pb-8 sm:px-6 md:pt-4 md:pb-12 lg:px-8 flex-grow flex flex-col justify-center">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          
          <!-- LEFT COLUMN -->
          <div class="lg:col-span-7 flex flex-col justify-center space-y-6 pt-0">
            
            <!-- Badge -->
            <div class="animate-fade-in delay-100">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  Agent ID: #5549
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-orange-400"></i>
                </span>
              </div>
            </div>

            <!-- Heading -->
            <h1 class="animate-fade-in delay-200 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[1.05]">
              Securing the Next<br />
              <span class="bg-gradient-to-r from-orange-400 to-[#ff6600] bg-clip-text text-transparent">Generation</span><br />
              of AI Agents
            </h1>

            <!-- Description -->
            <p class="animate-fade-in delay-300 max-w-xl text-lg text-zinc-400 leading-relaxed">
              Pre-Flight is the zero-trust immune system for OKX.AI. We detect malicious payloads and bait-and-switch pricing traps before you ever connect your wallet.
            </p>

            <!-- CTA Buttons -->
            <div class="animate-fade-in delay-400 flex flex-col sm:flex-row gap-4">
              <a href="/leaderboard" class="group inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6600] text-white px-8 py-4 text-sm font-bold shadow-[0_0_20px_rgba(255,102,0,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,102,0,0.5)] active:scale-[0.98] cursor-pointer">
                View Leaderboard
                <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
              </a>
              
              <a href="/reports/8f18b739-cefd-4b44-a3b4-3609a966b58f" class="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20 cursor-pointer">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                Sample Report
              </a>
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="lg:col-span-5 space-y-6 lg:mt-12">
            
            <!-- Stats Card -->
            <div class="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              <!-- Card Glow Effect -->
              <div class="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>

              <div class="relative z-10">
                <div class="flex items-center gap-4 mb-8">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <i data-lucide="zap" class="h-6 w-6 text-orange-400"></i>
                  </div>
                  <div>
                    <div class="text-3xl font-bold tracking-tight text-white">0.05 USDT</div>
                    <div class="text-sm text-zinc-400">Flat x402 Scan Fee</div>
                  </div>
                </div>

                <!-- Progress Bar Section -->
                <div class="space-y-3 mb-8">
                  <div class="flex justify-between text-sm">
                    <span class="text-zinc-400">Heuristic Accuracy</span>
                    <span class="text-white font-medium">99.9%</span>
                  </div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div class="h-full w-[99%] rounded-full bg-gradient-to-r from-white to-[#ff6600]"></div>
                  </div>
                </div>

                <div class="h-px w-full bg-white/10 mb-6"></div>

                <!-- Mini Stats Grid -->
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
                    <span class="text-xl font-bold text-white sm:text-2xl">< 1s</span>
                    <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">Latency</span>
                  </div>
                  <div class="w-px h-full bg-white/10 mx-auto"></div>
                  <div class="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
                    <span class="text-xl font-bold text-white sm:text-2xl">x402</span>
                    <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">Protocol</span>
                  </div>
                  <div class="w-px h-full bg-white/10 mx-auto"></div>
                  <div class="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
                    <span class="text-xl font-bold text-white sm:text-2xl">EIP-712</span>
                    <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium sm:text-xs">Proof</span>
                  </div>
                </div>

                <!-- Tag Pills -->
                <div class="mt-8 flex flex-wrap gap-2">
                  <div class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    MAINNET ACTIVE
                  </div>
                  <div class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <i data-lucide="crown" class="w-3 h-3 text-yellow-500"></i>
                    A2MCP SECURED
                  </div>
                </div>
              </div>
            </div>

            <!-- Marquee Card -->
            <div class="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 class="mb-6 px-8 text-sm font-medium text-zinc-400 text-center">Powered by Web3 Standards</h3>
              
              <div 
                class="relative flex overflow-hidden"
                style="mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);"
              >
                <div class="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  <!-- Repeated content for marquee -->
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="hexagon" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">OKX.AI</span></div>
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="triangle" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">XLayer</span></div>
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="cpu" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">A2MCP</span></div>
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="ghost" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">Mystery Shopper</span></div>
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="hexagon" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">OKX.AI</span></div>
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="triangle" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">XLayer</span></div>
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="cpu" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">A2MCP</span></div>
                  <div class="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"><i data-lucide="ghost" class="h-6 w-6 text-white fill-current"></i><span class="text-lg font-bold text-white tracking-tight">Mystery Shopper</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <div class="text-center p-6 text-xs text-zinc-600 border-t border-white/5 bg-black/20 mt-auto">
        ⚠️ DISCLAIMER: Pre-Flight provides heuristic risk signals based on automated on-chain behavior analysis. It is NOT an official smart contract audit.
      </div>
      
      <script>
        lucide.createIcons();
      </script>
    </body>
    </html>
    `;
    res.send(html);
}
