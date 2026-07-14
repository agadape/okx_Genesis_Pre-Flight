import { createWalletClient, http, hashMessage, toHex, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xLayer } from "viem/chains";
import "dotenv/config";
import { AttestationTypes, domain, AttestationPayload } from "./attestation-schema.js";
import { config } from "../config.js";

// SHA-256 equivalent in viem is usually keccak256 for EVM, but we can just use viem's hash functions.
// We will use keccak256 of the stringified JSON.
import { keccak256 } from "viem";

export async function signPreFlightAttestation(
    targetType: string,
    targetId: string,
    status: string,
    score: number,
    liveVerification: any,
    timestampStr: string
) {
    const pk = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
    if (!pk) {
        throw new Error("WALLET_PRIVATE_KEY is missing in env");
    }

    const account = privateKeyToAccount(pk.startsWith("0x") ? pk : `0x${pk}`);
    const walletClient = createWalletClient({
        account,
        chain: xLayer,
        transport: http(),
    });

    const evidenceString = JSON.stringify(liveVerification);
    const evidenceHash = keccak256(stringToHex(evidenceString));
    
    // timestamp from ISO to unix
    const ts = BigInt(Math.floor(new Date(timestampStr).getTime() / 1000));

    const message: AttestationPayload = {
        scanner_agent_id: config.PREFLIGHT_AGENT_ID,
        target_type: targetType,
        target_id: targetId,
        status,
        score: BigInt(score),
        live_verification_attempted: !!liveVerification?.attempted,
        evidence_hash: evidenceHash,
        timestamp: ts,
    };

    const signature = await walletClient.signTypedData({
        account,
        domain,
        types: AttestationTypes,
        primaryType: "PreFlightAttestation",
        message,
    });

    return {
        signer_address: account.address,
        signer_agent_id: config.PREFLIGHT_AGENT_ID,
        signature,
        verify_instructions: "Recover address from this signature using EIP-712 (ethers.verifyTypedData or viem verifyTypedData) and match with signer_address.",
        payload: {
            ...message,
            score: message.score.toString(),
            timestamp: message.timestamp.toString()
        } // return payload so we can save and verify it later
    };
}
