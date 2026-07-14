# 🛡️ Pre-Flight Trust & Safety Scanner (Agent #5549)

**The Zero-Trust Immune System for the OKX.AI Ecosystem.**

## 🎯 Value Proposition
As the OKX.AI ecosystem expands rapidly, users face severe risks when interacting with unknown Agent Service Providers (ASPs): manifest spoofing, private key harvesting, and bait-and-switch pricing traps. **Pre-Flight** is an A2MCP interceptor endpoint that automatically scans unknown ASPs. Powered by a live on-chain "Mystery Shopper", it executes a simulated request to detect malicious payloads and hidden fees *before* the user is harmed.

## 🔗 Live Deployments
- **Main Endpoint:** [okx-genesis-pre-flight.vercel.app](https://okx-genesis-pre-flight.vercel.app/)
- **Live Leaderboard:** [/leaderboard](https://okx-genesis-pre-flight.vercel.app/leaderboard)
- **Live EIP-712 Verification:** [/verify/8f18b739-cefd-4b44-a3b4-3609a966b58f](https://okx-genesis-pre-flight.vercel.app/verify/8f18b739-cefd-4b44-a3b4-3609a966b58f)
- **Example Bait-and-Switch Report:** [/reports/8f18b739-cefd-4b44-a3b4-3609a966b58f](https://okx-genesis-pre-flight.vercel.app/reports/8f18b739-cefd-4b44-a3b4-3609a966b58f)

## 📸 Real-World Evidence: Bait-and-Switch Detection
When a user attempts to interact with an agent that advertises a cost of `0.02 USDT` but secretly charges `0.15 USDT` in the transaction header, Pre-Flight instantly catches the discrepancy and flags the target agent as **MALICIOUS (BAHAYA)**.

*(Check out our live report example from the link above to see the cryptographic proof).*

## 🏗️ Deep-Dive Architecture

We engineered a Zero-Trust architecture combining a Node.js/Express framework with native Web3 protocols.

### 1. The x402 Payment Gate (Revenue Rocket)
We didn't just build a tool; we built a monetized business. Using `@okxweb3/x402-express`, our core `/scan` endpoint is shielded by a strict payment interceptor. Every scan natively enforces a flat **0.05 USDT** settlement on **XLayer Mainnet** (`eip155:196`). If the x402 handshake fails, the scan does not execute.

### 2. Live On-Chain Mystery Shopper
Rather than relying purely on static code analysis, Pre-Flight actively dispatches a simulated transaction against the target ASP. We parse the return headers (e.g., `x-mock-cost`) and compare the *promised* payload against the *actual* delivery in real-time.

### 3. Heuristic Engine & Rate Limiting
To prevent API abuse and DDoS attacks, the endpoint is protected by a strict IP rate limiter (10 requests/minute). Inside, the heuristic engine processes the Mystery Shopper's findings against a strict Trust Rubric, automatically mapping scores to severity levels.

### 4. EIP-712 Cryptographic Attestation
Trust requires verifiable proof. Instead of a simple JSON response, Pre-Flight uses `viem` to cryptographically sign the evaluation results using a secure private key. The resulting signature is formatted using the **EIP-712 Typed Data** standard, allowing any external smart contract or client to independently verify that the report was genuinely issued by **Agent #5549** and has not been tampered with in transit.
