import "dotenv/config";
import { wrapFetchWithPaymentFromConfig, decodePaymentResponseHeader } from "@okxweb3/x402-fetch";
import { ExactEvmScheme, toClientEvmSigner } from "@okxweb3/x402-evm";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xLayer } from "viem/chains"; 

const PRE_FLIGHT_SCAN_URL = "https://okx-genesis-pre-flight.vercel.app/scan";

async function main() {
  const privateKey = process.env.TEST_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "TEST_WALLET_PRIVATE_KEY tidak ditemukan di .env. " +
      "Ini WAJIB wallet pembeli terpisah — jangan pernah reuse private key " +
      "Agent 5146 atau wallet Mystery Shopper untuk ini."
    );
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(formattedKey as `0x${string}`);
  console.log(`[1/5] Wallet pembeli dimuat: ${account.address}`);

  const walletClient = createWalletClient({
    account,
    chain: xLayer,
    transport: http(),
  });
  // toClientEvmSigner expects .address on the root object
  const signer = toClientEvmSigner(Object.assign(walletClient, { address: account.address }));

  // Bungkus fetch native supaya otomatis handle 402 -> sign -> retry
  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      {
        network: "eip155:196", // XLayer mainnet — HARUS SAMA PERSIS dengan config server
        client: new ExactEvmScheme(signer),
      },
    ],
  });

  console.log("[2/5] Mengirim POST /scan dengan target valid (mock-target milik kita sendiri)...");
  console.log("      (Ini akan otomatis: kena 402 -> generate payment payload -> sign -> retry)");

  const response = await fetchWithPayment(PRE_FLIGHT_SCAN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_type: "external",
      target_id: "https://okx-genesis-pre-flight.vercel.app/mock-target-manifest.json",
      verify_live: true,
    }),
  });

  console.log(`[3/5] Response status akhir: ${response.status}`);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Pembayaran atau request gagal. Status: ${response.status}. Body: ${errorBody}\n` +
      `Kemungkinan penyebab: (a) saldo TEST_WALLET_PRIVATE_KEY tidak cukup/salah jaringan, ` +
      `(b) network mismatch (server minta eip155:1952, wallet punya dana di chain lain), ` +
      `(c) endpoint server sedang down.`
    );
  }

  // Bukti bahwa pembayaran BENERAN settle, bukan cuma request lolos
  const paymentResponseHeader = response.headers.get("PAYMENT-RESPONSE");
  if (paymentResponseHeader) {
    const settlement = decodePaymentResponseHeader(paymentResponseHeader);
    console.log("[4/5] BUKTI SETTLEMENT PEMBAYARAN (dari header PAYMENT-RESPONSE):");
    console.log(JSON.stringify(settlement, null, 2));
  } else {
    console.warn(
      "[4/5] PERINGATAN: Tidak ada header PAYMENT-RESPONSE di response. " +
      "Ini janggal untuk request yang katanya berhasil bayar — cek ulang apakah " +
      "middleware payment beneran jalan atau request ini lolos lewat jalur lain."
    );
  }

  const result = await response.json();
  console.log("[5/5] Hasil scan dari server:");
  console.log(JSON.stringify(result, null, 2));

  console.log("\n=== SELESAI ===");
  console.log("Ini BUKTI E2E MURNI: wallet eksternal beneran bayar via x402,");
  console.log("payment gate production beneran nge-settle transaksi, BARU SETELAH ITU");
  console.log("server ngejalanin scan + Mystery Shopper + EIP-712 signing.");
  console.log(`Cek reports-nya di: https://okx-genesis-pre-flight.vercel.app/reports/${result.data?.scan_id}?bypass=verify`);
}

main().catch((err) => {
  console.error("\n=== GAGAL ===");
  console.error(err.message);
  process.exit(1);
});
