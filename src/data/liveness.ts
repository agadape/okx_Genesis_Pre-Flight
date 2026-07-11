/**
 * Endpoint liveness checker — pings a URL to verify reachability and measure response time.
 * Used by the ASP rubric to assess endpoint_liveness parameter.
 */

export interface LivenessResult {
  reachable: boolean;
  responseTimeMs: number | null;
  statusCode: number | null;
}

/**
 * Check if an endpoint is reachable via HTTP HEAD request.
 * Times out after 5 seconds (endpoints slower than this are penalized in scoring).
 */
export async function checkEndpointLiveness(url: string): Promise<LivenessResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    const responseTimeMs = Date.now() - start;
    clearTimeout(timeout);

    return {
      reachable: response.status < 500,
      responseTimeMs,
      statusCode: response.status,
    };
  } catch {
    clearTimeout(timeout);
    return { reachable: false, responseTimeMs: null, statusCode: null };
  }
}
