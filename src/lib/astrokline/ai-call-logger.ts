/**
 * Structured logging and D1 persistence for AI model calls.
 *
 * Logs every Gemini / CF Workers AI call with model, section, latency,
 * success/failure, and whether fallback was used.
 *
 * Production: writes to D1 `ai_call_log` table + console.log.
 * Local dev: console.log only.
 */

export interface AiCallLogEntry {
  section: string;
  model: string;
  latencyMs: number;
  success: boolean;
  fallbackUsed: boolean;
  error?: string;
  tokenCount?: number;
}

/**
 * Emit a structured log line for an AI call.
 */
export function logAiCall(entry: AiCallLogEntry): void {
  const line = {
    type: 'ai_call',
    ts: new Date().toISOString(),
    ...entry,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(line));
}

/**
 * Get D1 binding (same pattern as ai-insight route).
 */
async function getD1(): Promise<any | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext() as { env: { DB?: any } };
    return env?.DB ?? null;
  } catch {
    return null;
  }
}

let _logTableReady = false;

/**
 * Ensure ai_call_log table exists (idempotent).
 */
async function ensureLogTable(db: any): Promise<void> {
  if (_logTableReady) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_call_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        model TEXT NOT NULL,
        latency_ms INTEGER NOT NULL,
        success INTEGER NOT NULL DEFAULT 0,
        fallback_used INTEGER NOT NULL DEFAULT 0,
        error TEXT,
        token_count INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `).run();
    _logTableReady = true;
  } catch {
    // Table unavailable — skip silently
  }
}

/**
 * Persist an AI call log entry to D1 (non-blocking).
 */
export async function persistAiCallLog(entry: AiCallLogEntry): Promise<void> {
  // Always emit structured console log
  logAiCall(entry);

  // Persist to D1 in production
  const db = await getD1();
  if (!db) return;

  try {
    await ensureLogTable(db);
    await db.prepare(`
      INSERT INTO ai_call_log (section, model, latency_ms, success, fallback_used, error, token_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entry.section,
      entry.model,
      entry.latencyMs,
      entry.success ? 1 : 0,
      entry.fallbackUsed ? 1 : 0,
      entry.error ?? null,
      entry.tokenCount ?? null,
    ).run();
  } catch {
    // Non-critical — don't fail the request
  }
}
