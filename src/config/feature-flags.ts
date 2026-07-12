export const FEATURES = {
  // Enables the Mystery Shopper live purchasing logic
  // Set to true only when wallet test-purchase is fully configured
  MYSTERY_SHOPPER_ENABLED: true,
  
  // On-chain attestation was researched and determined to be NO-GO
  // due to OKX.AI Reputation Registry requiring a task-id (jobId).
  // See docs/research-spike-k-findings.md
  ONCHAIN_ATTESTATION_ENABLED: false, 
};
