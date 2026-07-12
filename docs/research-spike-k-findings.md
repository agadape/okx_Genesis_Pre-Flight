# Research Spike K Findings: On-Chain Attestation (Reputation Registry)

**Tanggal:** 12 Juli 2026 (H-5)
**Status Akhir:** 🔴 **NO-GO (Batal)**

### Hasil Investigasi
Berdasarkan pengecekan langsung pada dokumentasi resmi *okx-ai skills* (`task-cli-reference.md` dan `identity-reputation.md`), ditemukan fakta-fakta berikut:

1. **Reputation Registry TIDAK Permissionless (Terbuka Bebas):**
   Fungsi untuk mengirim *attestation* atau *rating* ke *blockchain* adalah melalui *command* `agent feedback-submit`. Namun, fungsi ini memiliki parameter wajib: `--task-id <jobId>`.
2. **Ketergantungan pada State Machine "Task":**
   Syarat `--task-id` berarti sebuah agen hanya bisa memberikan *rating* kepada agen lain jika dan hanya jika mereka telah terikat dalam sebuah kontrak tugas resmi (*OKX Task State Machine* yang melibatkan *escrow*, *accept*, *submit*, *complete*).
3. **Ketidakcocokan dengan Arsitektur Pre-Flight:**
   Pre-Flight menggunakan protokol **x402** untuk *test-purchase* (pembayaran instan per-koneksi API). Proses x402 berjalan di luar ekosistem *Task/Job ID*. Karena tidak ada `jobId` resmi yang diterbitkan saat Pre-Flight melakukan *scan*, sistem *blockchain* OKX akan menolak *attestation* (transaksi *revert* karena `jobId` tidak ditemukan/tidak valid).

### Kesimpulan & Tindakan Lanjut
Karena tidak ada *Reputation Registry* yang terbuka untuk pihak ketiga (tanpa `jobId`), maka **Idea K (On-Chain Attestation) resmi dibatalkan**.

Sesuai instruksi pada *Enhancement Plan Phase 3 (Bagian 3d)*, kita akan langsung beralih ke **Fallback Resmi**:
- Tidak akan ada pembuatan fungsi penulisan *on-chain* atau *smart contract call*.
- Pada Idea J, jika `live_verification.attempted: true`, UI di `/reports/:scan_id` akan menampilkan *badge* pengganti: **"Verified via On-Chain Payment"**.
- *Badge* ini akan disertai keterangan/ *disclaimer*: *"Belum ada standar on-chain attestation yang terbuka saat ini — Pre-Flight tetap mencatat bukti transaksi asli sebagai jejak verifikasi."*
