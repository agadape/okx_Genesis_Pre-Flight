import { Request, Response } from "express";
import { getScanById } from "../lib/storage.js";
import { verifyTypedData } from "viem";
import { AttestationTypes, domain } from "../lib/attestation-schema.js";

export async function verifyAttestationHandler(req: Request, res: Response) {
    const { scan_id } = req.params;

    try {
        const scan = await getScanById(scan_id);

        if (!scan) {
            return res.status(404).send("Scan not found");
        }

        if (!scan.attestation) {
            return res.status(400).send("No attestation signature found for this scan.");
        }

        // Verify the signature
        const isValid = await verifyTypedData({
            address: scan.attestation.signer_address,
            domain,
            types: AttestationTypes,
            primaryType: "PreFlightAttestation",
            message: scan.attestation.payload,
            signature: scan.attestation.signature,
        });

        const statusColor = isValid ? "#00C851" : "#ff4444";
        const statusText = isValid ? "VALID" : "INVALID / TAMPERED";

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>EIP-712 Attestation Verification</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .status-box { padding: 15px; border-radius: 8px; font-weight: bold; font-size: 1.2em; text-align: center; margin-bottom: 20px; color: white; background-color: ${statusColor}; }
            .section { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 6px; }
            pre { white-space: pre-wrap; word-break: break-all; background: #eee; padding: 10px; border-radius: 4px; font-size: 0.9em; }
            .label { font-weight: bold; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Off-Chain Attestation Verification</h1>
            
            <div class="status-box">
              SIGNATURE STATUS: ${statusText}
            </div>

            <div class="section">
              <p><span class="label">Scanner Agent ID:</span> ${scan.attestation.signer_agent_id}</p>
              <p><span class="label">Signer Address:</span> <code>${scan.attestation.signer_address}</code></p>
              <p><span class="label">Target:</span> ${scan.target_type.toUpperCase()} - ${scan.target_id}</p>
              <p><span class="label">Resulting Score:</span> ${scan.score} / 100 (${scan.status})</p>
            </div>

            <div class="section">
              <p class="label">Signature (EIP-712):</p>
              <pre>${scan.attestation.signature}</pre>
            </div>

            <div class="section">
              <p class="label">Signed Payload:</p>
              <pre>${JSON.stringify(scan.attestation.payload, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2)}</pre>
            </div>
            
            <p style="text-align:center; margin-top: 30px; font-size: 0.8em; color: #888;">
              This verification is performed locally in the browser/server using standard cryptography. <br/>
              It requires zero gas and does not depend on OKX.AI smart contracts.
            </p>
          </div>
        </body>
        </html>
        `;

        res.send(html);
    } catch (e) {
        console.error("Verification error:", e);
        res.status(500).send("Internal error while verifying signature.");
    }
}
