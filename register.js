import { createWalletClient, http, publicActions, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import 'dotenv/config';

// Definisikan jaringan XLayer
const xlayer = defineChain({
  id: 196,
  name: 'X Layer Mainnet',
  network: 'xlayer',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.xlayer.tech'] }, public: { http: ['https://rpc.xlayer.tech'] } },
  blockExplorers: { default: { name: 'OKX Explorer', url: 'https://www.okx.com/explorer/xlayer' } },
});

async function main() {
  if (!process.env.PRIVATE_KEY) {
    console.error("ERROR: Tambahkan PRIVATE_KEY=... di file .env kamu!");
    process.exit(1);
  }

  // Bersihkan spasi, kutip, dan pastikan formatnya benar
  let rawPk = process.env.PRIVATE_KEY.trim().replace(/^["']|["']$/g, '');
  const pk = rawPk.startsWith('0x') ? rawPk : `0x${rawPk}`;
  
  if (pk.length !== 66) {
    console.error(`\n❌ ERROR: Private Key yang kamu masukkan panjangnya salah!`);
    console.error(`Seharusnya terdiri dari 64 karakter (ditambah 0x). Panjang saat ini: ${pk.length}`);
    console.error(`Pastikan kamu copy-paste dengan benar tanpa spasi tambahan.`);
    process.exit(1);
  }

  const account = privateKeyToAccount(pk);
  
  const client = createWalletClient({
    account,
    chain: xlayer,
    transport: http()
  }).extend(publicActions);

  const contractAddress = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
  
  // ABI untuk fungsi register menggunakan format JSON untuk menghindari error abitype pada tuple
  const abi = [
    {
      "type": "function",
      "name": "register",
      "stateMutability": "nonpayable",
      "inputs": [
        { "name": "agentURI", "type": "string" },
        { 
          "name": "metadata", 
          "type": "tuple[]",
          "components": [
            { "name": "metadataKey", "type": "string" },
            { "name": "metadataValue", "type": "bytes" }
          ]
        }
      ],
      "outputs": []
    }
  ];

  console.log(`\n🚀 Menginisiasi pendaftaran Agen untuk wallet: ${account.address}`);
  console.log(`📡 Berkomunikasi dengan X Layer Mainnet...`);
  
  try {
    const { request } = await client.simulateContract({
      address: contractAddress,
      abi,
      functionName: 'register',
      args: ['https://okx-genesis-pre-flight.vercel.app/metadata.json', []],
    });

    console.log(`✍️  Menandatangani transaksi...`);
    const hash = await client.writeContract(request);
    
    console.log(`✅ Transaksi terkirim! Hash: https://www.okx.com/explorer/xlayer/tx/${hash}`);
    console.log(`⏳ Menunggu konfirmasi dari blockchain...`);
    
    const receipt = await client.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log(`\n🎉 SELAMAT! Agen Pre-Flight berhasil didaftarkan secara permanen di XLayer!`);
    } else {
      console.log(`\n❌ Transaksi gagal di blockchain.`);
    }
  } catch (error) {
    console.error("\n❌ Terjadi kesalahan saat memanggil kontrak:");
    console.error(error.message || error);
  }
}

main();
