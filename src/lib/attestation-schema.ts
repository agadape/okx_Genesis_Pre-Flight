export const AttestationTypes = {
  PreFlightAttestation: [
    { name: "scanner_agent_id", type: "string" },
    { name: "target_type", type: "string" },
    { name: "target_id", type: "string" },
    { name: "status", type: "string" },
    { name: "score", type: "uint256" },
    { name: "live_verification_attempted", type: "bool" },
    { name: "evidence_hash", type: "bytes32" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

export const domain = {
  name: "Pre-Flight",
  version: "1",
  chainId: 196, // X Layer Mainnet
} as const;

export interface AttestationPayload {
  scanner_agent_id: string;
  target_type: string;
  target_id: string;
  status: string;
  score: bigint;
  live_verification_attempted: boolean;
  evidence_hash: `0x${string}`;
  timestamp: bigint;
}
