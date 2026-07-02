// Offline-tolerant write helper.
// On network failure it queues the intent in memory and retries on reconnect.

type Intent = () => Promise<void>;

const queue: Intent[] = [];
let retrying = false;

async function drainQueue() {
  if (retrying) return;
  retrying = true;
  while (queue.length > 0) {
    const fn = queue[0];
    try {
      await fn();
      queue.shift();
    } catch {
      break;
    }
  }
  retrying = false;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => void drainQueue());
}

export type WriteResult =
  | { ok: true }
  | { ok: false; offline: boolean; message: string };

export async function safeWrite(fn: Intent): Promise<WriteResult> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    queue.push(fn);
    return { ok: false, offline: true, message: "offline" };
  }
  try {
    await fn();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isNetwork =
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("network") ||
      msg.includes("ERR_INTERNET_DISCONNECTED");
    if (isNetwork) {
      queue.push(fn);
      return { ok: false, offline: true, message: "offline" };
    }
    return { ok: false, offline: false, message: msg };
  }
}
