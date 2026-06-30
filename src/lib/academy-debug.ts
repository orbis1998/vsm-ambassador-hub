type AcademyDebugPayload = {
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  runId?: string;
};

export function logAcademyDebug(payload: AcademyDebugPayload) {
  const entry = {
    sessionId: "a76949",
    runId: payload.runId ?? "pre-fix",
    timestamp: Date.now(),
    ...payload,
  };

  fetch("http://127.0.0.1:7782/ingest/f6a48ffe-47bc-4483-ab2a-84dddc109509", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a76949" },
    body: JSON.stringify(entry),
  }).catch(() => {});

  if (typeof window === "undefined") return;
  try {
    const key = "vsm.academy.debug";
    const prev = JSON.parse(sessionStorage.getItem(key) ?? "[]") as unknown[];
    const next = [...prev, entry].slice(-40);
    sessionStorage.setItem(key, JSON.stringify(next));
    (window as unknown as { __vsmAcademyDebug?: unknown }).__vsmAcademyDebug = entry;
  } catch {
    /* ignore */
  }
}
