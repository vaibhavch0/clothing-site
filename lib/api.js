// fetch wrapper for client components: never throws, always returns { ok, status, data }.
// Covers network failures and non-JSON error pages (e.g. Vercel 413/504) so buttons never get stuck.
export async function api(url, { method = "GET", body } = {}) {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {
        error:
          res.status === 413
            ? "That upload is too large. Use fewer or smaller photos."
            : `Server error (${res.status}). Please try again in a moment.`,
      };
    }
    return { ok: res.ok, status: res.status, data: data || {} };
  } catch {
    return { ok: false, status: 0, data: { error: "Network error. Check your connection and try again." } };
  }
}
