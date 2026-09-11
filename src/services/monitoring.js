// Application Error Tracking & System Health Logger

const ERROR_LOGS_KEY = "stellar_student_error_logs";

/**
 * Logged Error Schema:
 * { id, timestamp, message, type, stack, context }
 */

export function getErrorLogs() {
  try {
    const data = localStorage.getItem(ERROR_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function logAppError(error, context = "App") {
  const errItem = {
    id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    message: typeof error === "string" ? error : error?.message || "Unknown Application Error",
    type: error?.name || "RuntimeError",
    stack: error?.stack || null,
    context,
  };

  try {
    const existing = getErrorLogs();
    const updated = [errItem, ...existing].slice(0, 50); // Keep last 50 error entries
    localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to store error log:", e);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app_error_logged", { detail: errItem }));
  }

  return errItem;
}

export function clearErrorLogs() {
  try {
    localStorage.removeItem(ERROR_LOGS_KEY);
  } catch (e) {}
}
