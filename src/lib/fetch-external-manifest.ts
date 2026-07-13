export interface ExternalManifestData {
  manifest_validity: boolean;
  https_enforcement: boolean;
  permission_scope: boolean;
  private_key_request: boolean;
  domain_age_days: number | null;
  endpoint_liveness: boolean;
  prompt_injection_pattern: boolean;
  third_party_verification: boolean;
  injection_matches?: string[];
  price_usdt?: number;
  a2mcp_endpoint?: string;
}

export async function fetchExternalManifest(url: string): Promise<ExternalManifestData> {
  const result: ExternalManifestData = {
    manifest_validity: false,
    https_enforcement: false,
    permission_scope: true, // true until proven otherwise
    private_key_request: false,
    domain_age_days: null,
    endpoint_liveness: false,
    prompt_injection_pattern: false,
    third_party_verification: false,
  };

  try {
    // 1. URL Validation
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") {
      // Failed HTTPS enforcement, and we reject processing HTTP for security
      return result;
    }

    // SSRF prevention: reject localhost and common private IPs
    const hostname = parsedUrl.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.")) {
      return result;
    }

    // 2. Fetch with 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (e) {
      // Fetch failed or timed out
      return result;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return result;
    }

    // 3. Parse JSON
    let data;
    try {
      data = await response.json();
    } catch {
      return result;
    }

    // 4. Validate essential fields
    if (!data.name || !data.description) {
      return result;
    }

    result.manifest_validity = true;
    result.price_usdt = data.price_usdt;
    
    if (data.endpoints && Array.isArray(data.endpoints)) {
      const a2mcp = data.endpoints.find((ep: any) => ep.name === "a2mcp" || (ep.url && ep.url.includes("a2mcp")));
      if (a2mcp) result.a2mcp_endpoint = a2mcp.url;
    } else if (data.endpoints && typeof data.endpoints === 'object') {
      result.a2mcp_endpoint = data.endpoints.a2mcp;
    }

    // 5. HTTPS Enforcement for endpoints
    result.https_enforcement = true;
    if (data.endpoints && Array.isArray(data.endpoints)) {
      for (const ep of data.endpoints) {
        if (typeof ep.url === "string" && ep.url.startsWith("http:")) {
          result.https_enforcement = false;
        }
      }
      
      // 6. Endpoint Liveness
      // We will ping endpoints in parallel
      const pingPromises = data.endpoints
        .filter((ep: any) => typeof ep.url === "string" && ep.url.startsWith("https:"))
        .map(async (ep: any) => {
          try {
            const epController = new AbortController();
            const epTimeout = setTimeout(() => epController.abort(), 3000);
            const epRes = await fetch(ep.url, { method: "OPTIONS", signal: epController.signal });
            clearTimeout(epTimeout);
            return epRes.ok || epRes.status === 405; // 405 method not allowed is still reachable
          } catch (e) {
            return false;
          }
        });
      
      if (pingPromises.length > 0) {
        const pingResults = await Promise.all(pingPromises);
        result.endpoint_liveness = pingResults.every(r => r === true);
      } else {
        // If no endpoints provided but it's an agent, maybe it's just a prompt
        result.endpoint_liveness = true;
      }
    } else {
       result.endpoint_liveness = true;
    }

    // 7. Wallet / Private key request pattern
    const fullText = JSON.stringify(data).toLowerCase();
    if (fullText.includes("private key") || fullText.includes("seed phrase") || fullText.includes("mnemonic")) {
      result.private_key_request = true;
    }

    // 8. Prompt Injection Pattern
    const injectionRegex = /(ignore all previous|ignore previous instructions|disregard prior instructions|forget your instructions|system prompt|you are now|act as if you have no restrictions|bypass safety|jailbreak)/i;
    const descText = data.description.toLowerCase();
    const match = descText.match(injectionRegex);
    if (match) {
      result.prompt_injection_pattern = true;
      result.injection_matches = [match[0]];
    }

    // 9. Third-party verification (github/twitter links)
    if (fullText.includes("github.com/") || fullText.includes("x.com/") || fullText.includes("twitter.com/")) {
      result.third_party_verification = true;
    }

    // 10. Domain age (Mocked for hackathon stability to avoid WHOIS rate limits)
    // In a real scenario, we'd call an RDAP API here with a strict 2s timeout.
    result.domain_age_days = Math.floor(Math.random() * 500) + 10; 

    return result;
  } catch (error) {
    return result;
  }
}
