# Pre-Flight — Build Plan Lengkap
### Trust & Safety Scanner buat OKX.AI Genesis Hackathon (Software Utility Track)

**Deadline keras**: 17 Juli 2026, 23:59 UTC (Google Form submission)
**Hari ini**: 11 Juli 2026
**Prinsip timeline**: Submit ke OKX buat internal review (Step 2) paling lambat **H-3 (14 Juli)**, karena kalau ASP gak lolos review / gak "Go Live", submission hackathon-nya otomatis invalid — jadi review lag itu risiko #1, bukan development speed.

---

## 1. Definisi Produk (jangan drift dari ini)

**Nama**: Pre-Flight
**Fungsi**: Satu A2MCP endpoint berbayar. Input: ID/URL sebuah ASP atau nama Skill di OKX AI ecosystem. Output: JSON berisi status risiko (`AMAN` / `WASPADA` / `BAHAYA` / `DATA_BELUM_CUKUP`), skor 0–100, dan daftar `reasons` yang spesifik.
**Kenapa ini valid**: Meng-cover 2 celah yang diakui OKX sendiri di dokumentasi mereka — (1) ASP baru live cuma lewat 1x internal review lalu langsung publik tanpa cross-check independen, (2) quote resmi OKX soal Skills: *"Avoid unofficial Skills: these may lead to asset loss. Only use skills reviewed by OKX."*

---

## 2. Scope

### ✅ IN SCOPE (wajib ada buat submit)
- 1 endpoint A2MCP (`POST /scan`) yang nerima `{ "target_type": "asp" | "skill", "target_id": "<id/url>" }`
- Heuristic rule engine (rule-based, BUKAN model ML) sesuai 2 rubric yang udah kita susun (ASP rubric 8 parameter, Skill rubric 7 parameter)
- 3 profil data mock yang realistis (Established / Genesis Newcomer / Red Flag Compound) — dipakai sebagai fallback kalau data live gak kebaca
- Output JSON terstruktur dengan field `reasons` (bukan cuma skor mentah)
- Registrasi identity ASP di OKX AI (ERC-8004 di XLayer)
- x402-compliant payment wrapper (harga kecil, misal 0.05 USDT/scan)
- Listing description + submit ke review internal OKX
- Demo video 90 detik + X post `#OKXAI`
- Google Form submission

### ❌ OUT OF SCOPE (jangan buang waktu ke sini)
- Model machine learning / training apapun — heuristic rule-based only, cukup dan defensible buat 6 hari
- Live scraping ke X/Twitter atau sumber sosial eksternal buat sentiment
- Membangun sistem reputasi/chain sendiri — kita cuma **membaca** data yang OKX AI expose, bukan bikin ledger baru
- Dukungan multi-chain di luar XLayer (identity ASP cukup 1 chain sesuai standar ERC-8004 OKX AI)
- Menangani proses dispute/evaluator (itu domain lain, bukan Pre-Flight)
- UI web mewah — cukup respons JSON + 1 halaman deskripsi ASP di listing OKX, gak perlu frontend dashboard terpisah kecuali ada waktu sisa di H-1/H-2
- Klaim legal/audit resmi ("certified", "guaranteed safe") — selalu framing sebagai *risk signal*, bukan jaminan, buat hindari masalah compliance pas review
- Real-time monitoring/webhook — cukup on-demand scan per call

---

## 3. Arsitektur Teknis

```
User/Agent
   │  (x402 payment + request)
   ▼
[Pre-Flight A2MCP Endpoint]  ← hosted di server kamu (Node/Python)
   │
   ├─► Data Fetch Layer
   │      ├─ Cek publik: halaman agent di okx.ai/agents/{id} (rating, sold, review count)
   │      ├─ Endpoint liveness check (ping x402 endpoint target, cek response time/uptime)
   │      └─ Fallback: mock profile dataset (kalau data live tipis/gak lengkap)
   │
   ├─► Heuristic Rule Engine
   │      ├─ Rubric ASP (8 parameter, weighted)
   │      └─ Rubric Skill (7 parameter, weighted, dengan instant-fail rules)
   │
   └─► Response Builder
          → { status, score, reasons[], target_type, timestamp }
```

**Stack rekomendasi** (biar cepat, sesuai kompetensi kamu):
- Backend: Node.js/TypeScript (paling mulus buat integrasi `onchainos-skills` & x402 SDK yang official-nya JS-first)
- Hosting: platform apapun yang bisa expose HTTPS endpoint publik dengan cepat (Railway/Render/Fly.io/VPS yang udah biasa dipakai) — yang penting **uptime stabil**, karena Pre-Flight sendiri kena penalti kalau endpoint-nya gak reachable pas OKX review
- Storage: gak perlu database berat — JSON/SQLite lokal cukup buat cache hasil scan & 3 mock profile

---

## 4. Step-by-Step Development (Detail Sampai ke Level "Buka Halaman Mana")

### STEP 0 — Akses & Kredensial (lakukan PERTAMA, sebelum coding apapun)

1. Buka **OKX Developer Portal**: `https://web3.okx.com/onchain-os/dev-portal` (kalau redirect ke versi lain, coba juga `https://web3.okx.com/zh-hans/onchainos/dev-portal/project`)
2. Daftar/login, buat project baru, generate:
   - `OKX_API_KEY`
   - `OKX_SECRET_KEY`
   - `OKX_PASSPHRASE`
3. Simpan ke file `.env` LOKAL (jangan pernah commit ke git):
   ```
   OKX_API_KEY="..."
   OKX_SECRET_KEY="..."
   OKX_PASSPHRASE="..."
   ```
4. Tambahin `.env` ke `.gitignore` dari awal, sebelum commit pertama.
5. **Catatan penting**: Ada built-in sandbox API key gratisan buat testing awal (rate-limited, jangan dipakai pas submit final) — cukup buat develop di H-6/H-5, tapi ganti ke API key sendiri sebelum submit review di H-3.

### STEP 1 — Install Tooling OKX AI (H-6, siang)

1. Install `onchainos-skills` (ini toolkit resmi OKX buat semua interaksi agent — identity, payment, security scan reference):
   ```
   npx skills add okx/onchainos-skills
   ```
   Kalau pakai Claude Code, bisa juga:
   ```
   /plugin marketplace add okx/onchainos-skills
   /plugin install onchainos-skills
   ```
2. Skill yang **relevan langsung buat Pre-Flight**, pelajari isinya sebelum mulai bikin rule engine sendiri (biar gak reinvent yang udah ada):
   - `okx-security` → skill referensi resmi OKX buat token risk, DApp phishing, tx pre-execution, signature safety. **Ini bukan pengganti Pre-Flight** (mereka scan token/tx, Pre-Flight scan ASP/Skill di marketplace) — tapi pelajari pola output mereka biar format `reasons` Pre-Flight konsisten gaya dengan ekosistem OKX.
   - `okx-agent-payments-protocol` → dipakai buat nerima pembayaran x402 per scan.
   - `okx-agentic-wallet` → buat setup wallet agent kamu sendiri (Pre-Flight butuh identity + wallet buat nerima bayaran).
   - `okx-audit-log` → opsional, buat expose log transparansi kalau ada waktu lebih.

### STEP 2 — Registrasi Identity Pre-Flight sebagai ASP (H-6, sore)

1. Pakai skill `okx-ai-guide` (via `okx-ai-guide` dari `onchainos-skills`) buat register agent identity:
   - Command intent: "register ASP" / "create agent" — skill ini handle ERC-8004 on-chain agent identity di **XLayer**.
   - Set role = `asp` (bukan `user` atau `evaluator`).
   - Isi metadata: nama (Pre-Flight), deskripsi singkat, avatar (opsional).
2. Simpan `agent_id` hasil registrasi — ini dipakai buat semua request/response ke depannya dan buat listing di okx.ai.
3. Cek identity berhasil kebentuk dengan search agent kamu sendiri via skill yang sama (`search agents` intent).

### STEP 3 — Bangun Heuristic Rule Engine (H-5, full day)

Ini jantung produk. Kerjakan sesuai 2 rubric yang udah difinalkan:

1. Bikin file `rules/asp-rubric.json` dan `rules/skill-rubric.json` — masing-masing parameter, bobot, dan threshold-nya eksplisit (jangan hardcode di logic, biar gampang di-tweak pas testing).
2. Implementasi fungsi `scoreASP(data)` dan `scoreSkill(data)`:
   - Loop semua parameter yang datanya TERSEDIA, kalikan bobot, jumlahkan → skor 0–100.
   - **Instant-fail rule** khusus Skill: kalau terdeteksi indikasi minta private key/wallet export → langsung `BAHAYA`, skip skor lain.
   - **Aturan "data belum cukup"**: kalau sinyal yang berhasil diisi <3 dari total parameter di rubric → paksa status `DATA_BELUM_CUKUP`, JANGAN pernah default ke `AMAN`.
3. Tulis 3 mock profile PERSIS sesuai arketipe kemarin:
   - `established.json` → skor tinggi, status AMAN
   - `genesis-newcomer.json` → data tipis tapi bersih, status DATA_BELUM_CUKUP
   - `red-flag-compound.json` → 2-3 red flag sekaligus, status BAHAYA
4. Data fetch layer: coba fetch data publik dulu (halaman `okx.ai/agents/{id}` buat rating/sold/review), kalau gagal atau data kosong → fallback ke mock profile yang paling mirip polanya. **Selalu tandai di response field `data_source: "live" | "mocked"`** — transparansi ini penting banget buat kredibilitas pas review internal OKX (jangan pura-pura semua data real).

### STEP 4 — Bungkus Jadi A2MCP Endpoint Berbayar (H-4, pagi)

1. Baca dokumentasi x402: `https://web3.okx.com/onchainos/dev-docs/payments/x402-introduction`
2. Pilih settlement method: **synchronous settlement** (tunggu konfirmasi onchain sebelum return hasil) — cocok karena Pre-Flight itu one-off call bernilai kecil, bukan high-frequency.
3. Implementasi via skill `okx-agent-payments-protocol`, scheme `exact` (paling simpel buat pay-per-call flat fee).
4. Set harga: mulai dari nominal kecil (contoh 0.05 USDT/scan) — biar friksi rendah dan gampang numpuk "sold count" (penting karena hackathon ini literally menilai top-performing ASP by usage).
5. Test end-to-end: kirim request dengan payment header (`X-PAYMENT`), pastikan dapat HTTP 402 kalau belum bayar, dan hasil JSON yang benar kalau udah settle.

### STEP 5 — Testing Lokal (H-4, siang–sore)

Checklist wajib sebelum submit:
- [ ] Scan target ASP fiktif "bersih" → hasil AMAN dengan reasons masuk akal
- [ ] Scan target ASP fiktif "red flag" → hasil BAHAYA dengan reasons spesifik (bukan generic)
- [ ] Scan target dengan data minim → DATA_BELUM_CUKUP, BUKAN AMAN
- [ ] Skill dengan indikasi over-permission → WASPADA/BAHAYA sesuai bobot
- [ ] Skill dengan indikasi minta private key → instant BAHAYA
- [ ] Endpoint nolak request tanpa payment valid (HTTP 402 kerja)
- [ ] Response time endpoint stabil di bawah beberapa detik (jangan sampai timeout pas OKX ngetes)
- [ ] Format JSON konsisten, gak pernah return field kosong/null tanpa penjelasan

### STEP 6 — Submit ke OKX AI Listing + Internal Review (H-3, WAJIB selesai hari ini)

1. Buka `https://www.okx.ai/tutorial/asp` buat step listing resmi (ikuti form/field yang diminta: nama, deskripsi, harga, endpoint URL, kategori = **Software Utility**).
2. Tulis deskripsi listing yang jujur soal batasan (heuristic-based, bukan audit resmi, kombinasi data live+mock selama ekosistem masih genesis) — ini justru nunjukin kredibilitas ke reviewer OKX, bukan kelemahan.
3. Submit buat internal review (Step 2 di aturan hackathon).
4. **Dari sini, endpoint HARUS tetap online 24/7** sampai proses review kelar — kalau OKX ngetes dan endpoint down, kemungkinan besar ditolak/delay.

### STEP 7 — Buffer Review & Polish (H-2 s/d H-1)

1. Pantau status review, siap revisi cepat kalau OKX kasih feedback (skope waktu ini sengaja dikosongin buat itu, jangan diisi fitur baru).
2. Kalau udah "Go Live", baru lanjut ke materi promosi.
3. Kalau di H-2 belum ada respons review, follow up lewat channel community resmi OKX AI (cek link "Community" di halaman hackathon) — jangan diem nunggu pasif.

### STEP 8 — Demo Video 90 Detik + X Post (H-1)

Skrip berbasis 3 arketipe (detail skrip menyusul kalau kamu mau, tinggal bilang):
1. (0–15s) Hook: tunjukin masalah — quote asli OKX soal "asset loss" dari Skill gak resmi.
2. (15–45s) Demo live: scan ASP/Skill "red flag" → keluar BAHAYA + reasons spesifik.
3. (45–70s) Demo live: scan yang "bersih tapi baru" → DATA_BELUM_CUKUP (nunjukin sistem jujur, gak asal approve).
4. (70–90s) CTA: harga per scan, link ke listing Pre-Flight di OKX AI.

Post ke X dengan hashtag **#OKXAI**, sertakan video, dan jelasin use case secara singkat (syarat wajib Step 3 hackathon).

### STEP 9 — Final Submission (H0, sebelum 17 Juli 23:59 UTC)

1. Isi Google Form: `https://forms.gle/mddEUagmDbyV37ws8`
2. Sertakan: detail ASP (nama, link listing OKX AI, deskripsi), link post X partisipasi.
3. Screenshot konfirmasi submission buat arsip pribadi.

---

## 4a. Rubric Lengkap (Referensi Wajib buat STEP 3)

Ini rubric yang dimaksud di STEP 3 — dua rule set terpisah karena risk surface ASP dan Skill beda total.

### Rubric 1: ASP Validation (sebelum hire/funding escrow)

| # | Parameter | Sinyal Red Flag | Bobot |
|---|---|---|---|
| 1 | **Identity age** — umur onchain identity (Agentic Wallet) | Identity baru <48 jam DAN langsung nawarin high-value service | Tinggi |
| 2 | **Review-to-sold ratio & clustering** | Rating tinggi tapi review dikit (<5) atau semua review muncul dalam window waktu sempit (indikasi wash-trading) | Tinggi |
| 3 | **Review velocity vs sold count** | Sold count naik cepat tanpa peningkatan review proporsional | Sedang |
| 4 | **Endpoint liveness check** | Ping x402 endpoint real-time — kalau agent gak jawab konsisten, disqualify dari "Aman" | Tinggi |
| 5 | **Payment-mode mismatch** | Task kompleks (butuh negosiasi/scope) tapi ditawarin sebagai instant pay-per-call (skip escrow protection) | Sedang |
| 6 | **Dispute ratio** | (jumlah dispute / total task selesai) tinggi, walau sold count besar | Tinggi |
| 7 | **Price anomaly** | Harga berubah drastis dalam waktu singkat tanpa perubahan scope | Sedang |
| 8 | **Provenance link** | Ada link ke identitas eksternal terverifikasi (GitHub/X) vs full anonim tanpa jejak | Rendah (poin tambahan, bukan wajib) |

### Rubric 2: Skill Validation (sebelum install ke OnchainOS/trading wallet)

Grounding: quote resmi OKX — *"Avoid unofficial Skills: these may lead to asset loss."*

| # | Parameter | Sinyal Red Flag | Bobot |
|---|---|---|---|
| 1 | **Signature status** | Skill belum digitally signed & verified oleh OKX → otomatis minimal "Waspada" | Sangat Tinggi |
| 2 | **Permission scope** | Skill minta akses lebih dari fungsinya (mis. "price alert" tapi minta izin execute trade) | Sangat Tinggi |
| 3 | **Private key / wallet export request** | Skill legit gak pernah butuh export private key mentah → **instant fail**, langsung Bahaya | Instant fail |
| 4 | **Time since publish + update frequency** | Baru dipublish beberapa jam lalu, belum ada riwayat revisi | Sedang |
| 5 | **Prompt-injection pattern scan** | Static scan ke deskripsi/instruksi skill buat kata kunci yang nyuruh bypass safety atau kirim data ke endpoint eksternal gak dikenal | Tinggi |
| 6 | **Install count vs complaint signal** | Rasio komplain (review yang nyebut kerugian/asset loss) dibanding total install | Tinggi |
| 7 | **Chain/DEX scope vs stated purpose** | Skill buat "monitoring" tapi punya akses ke 60+ chain & 500+ DEX (scope kegedean dari kebutuhan) | Sedang |

### Logika Agregasi

```
Skor Risiko (0–100) = weighted sum dari semua parameter yang datanya TERSEDIA
Threshold:
  ≥ 75  → 🟢 AMAN
  40–74 → 🟡 WASPADA
  < 40  → 🔴 BAHAYA
  Sinyal terisi <3 dari checklist → ⚪ DATA_BELUM_CUKUP (default ke sini, JANGAN pernah default ke AMAN)
Instant-fail (khusus Skill, param #3) → langsung 🔴 BAHAYA, skip perhitungan skor lain
```

### Contoh Output JSON (jadi acuan `Response Builder` di Bagian 3)

```json
{
  "target_type": "skill",
  "target_id": "skill_xyz",
  "status": "WASPADA",
  "score": 58,
  "data_source": "live",
  "reasons": [
    "Skill belum di-sign resmi oleh OKX",
    "Meminta akses ke 60+ chain padahal fungsinya cuma price alert",
    "Baru dipublish 6 jam lalu, belum ada riwayat revisi"
  ],
  "timestamp": "2026-07-13T09:00:00Z"
}
```

---

## 5. Kalau Butuh "Manggil OKX" — Panduan Cepat Cari Info

| Butuh apa | Ke mana |
|---|---|
| API key / kredensial developer | `https://web3.okx.com/onchain-os/dev-portal` |
| Dokumentasi teknis Onchain OS lengkap | `https://web3.okx.com/onchainos` |
| Dokumentasi x402 payment | `https://web3.okx.com/onchainos/dev-docs/payments/x402-introduction` |
| Cara register identity ASP (ERC-8004/XLayer) | skill `okx-ai-guide` dari `onchainos-skills` |
| Cara listing ASP + syarat review | `https://www.okx.ai/tutorial/asp` |
| Tutorial umum OKX AI (role User/ASP/Evaluator) | `https://www.okx.ai/tutorial` |
| Source code semua skill resmi (referensi pola coding) | `https://github.com/okx/onchainos-skills` |
| Kalau ada error/butuh bantuan manusia | Link "Community" di halaman hackathon HackQuest — jangan nebak-nebak sendiri kalau ada blocker teknis, tanya di sana lebih cepat daripada stuck |
| Form submission akhir | `https://forms.gle/mddEUagmDbyV37ws8` |

---

## 6. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Internal review OKX lama/gak jelas SLA | Submission invalid kalau belum Go Live pas deadline | Submit paling lambat H-3, follow up aktif di H-2 lewat community channel |
| Data live dari marketplace masih tipis (ekosistem baru) | Hasil scan keliatan "kosong"/gak meyakinkan | Field `data_source` transparan + fallback ke mock profile yang jujur dilabeli |
| Endpoint down pas dicek reviewer | Ditolak/delay review | Pilih hosting dengan uptime terjamin, monitoring sederhana (health check tiap X menit) |
| Sandbox API key kena rate limit pas demo penting | Demo gagal live | Ganti ke API key sendiri sebelum H-3, jangan andalkan sandbox buat submission final |
| Klaim produk kelewat pasti ("100% aman") | Masalah kredibilitas/compliance pas review | Selalu framing sebagai *risk signal*, bukan jaminan/audit resmi |

---

## 7. Definition of Done

- [ ] Endpoint A2MCP live, dibayar via x402, response time stabil
- [ ] Identity ASP terdaftar (ERC-8004/XLayer), role = asp
- [ ] Rule engine cover 8 parameter ASP + 7 parameter Skill, dengan instant-fail & data-belum-cukup logic
- [ ] 3 mock profile jalan dengan hasil sesuai ekspektasi
- [ ] Listing submitted & **Go Live** dikonfirmasi OKX
- [ ] Video demo ≤90 detik selesai
- [ ] X post `#OKXAI` published
- [ ] Google Form submitted sebelum 17 Juli 23:59 UTC

---

*Next possible step: skrip demo 90 detik lengkap kata-per-kata, atau skema JSON request/response final — tinggal bilang mana duluan.*
