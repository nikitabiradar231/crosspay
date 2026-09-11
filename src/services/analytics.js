// Telemetry & Product Analytics Logger for Level 4 Compliance

const ANALYTICS_KEY = "stellar_student_analytics_events";

/**
 * Logged Analytics Event Schema:
 * { id, eventName, category, properties, timestamp }
 */

export function getAnalyticsEvents() {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function trackEvent(eventName, properties = {}) {
  const event = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    eventName,
    category: getCategoryForEvent(eventName),
    properties: {
      ...properties,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Node",
      network: "Stellar Testnet",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getAnalyticsEvents();
    const updated = [event, ...existing].slice(0, 100); // Keep last 100 events
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Analytics tracking error:", err);
  }

  // Also dispatch window custom event for real-time UI subscribers
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("analytics_event_logged", { detail: event }));
  }

  return event;
}

function getCategoryForEvent(name) {
  if (name.includes("wallet")) return "Wallet";
  if (name.includes("onboarding") || name.includes("profile")) return "User Lifecycle";
  if (name.includes("request")) return "Payment Request";
  if (name.includes("payment") || name.includes("tx")) return "Transaction";
  if (name.includes("feedback")) return "Feedback";
  return "Navigation";
}

export function clearAnalyticsEvents() {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
  } catch (e) {}
}
