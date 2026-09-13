import { describe, it, expect, beforeEach } from "vitest";
import { isValidStellarAddress } from "../services/stellar";
import { convertXlmToFiat } from "../services/exchange";
import { trackEvent, getAnalyticsEvents, clearAnalyticsEvents } from "../services/analytics";
import { logAppError, getErrorLogs, clearErrorLogs } from "../services/monitoring";
import { createPaymentRequest, getPaymentRequests } from "../services/contract";

import { Keypair } from "@stellar/stellar-sdk";

describe("Stellar & Service Unit Tests", () => {
  beforeEach(() => {
    clearAnalyticsEvents();
    clearErrorLogs();
  });

  it("validates valid and invalid Stellar public addresses", () => {
    const validGAddress = Keypair.random().publicKey();
    const invalidAddress = "12345InvalidAddress";

    expect(isValidStellarAddress(validGAddress)).toBe(true);
    expect(isValidStellarAddress(invalidAddress)).toBe(false);
    expect(isValidStellarAddress("")).toBe(false);
    expect(isValidStellarAddress(null)).toBe(false);
  });

  it("converts XLM to USD and INR correctly with given rates", () => {
    const rates = { USD: 0.12, INR: 10.0 };
    const fiat = convertXlmToFiat(100, rates);

    expect(fiat.usdValue).toBe("12.00");
    expect(fiat.inrValue).toBe("1000.00");
  });

  it("tracks analytics events into storage", () => {
    trackEvent("unit_test_event", { testParam: "value123" });

    const events = getAnalyticsEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].eventName).toBe("unit_test_event");
    expect(events[0].properties.testParam).toBe("value123");
  });

  it("logs system errors and retrieves error logs", () => {
    logAppError(new Error("Test Exception"), "UnitTestContext");

    const errors = getErrorLogs();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toBe("Test Exception");
    expect(errors[0].context).toBe("UnitTestContext");
  });

  it("creates and retrieves payment requests", () => {
    const req = createPaymentRequest({
      studentName: "Rahul Sharma",
      studentWallet: "GA5W27BEF72T7TZYA7Z4JBHPUQEKV26B6T2FGBQ544R276WDOOQJ23D6",
      university: "Stanford University",
      amount: "300",
      purpose: "Tuition",
      message: "Test request",
    });

    expect(req.id).toBeDefined();
    expect(req.amount).toBe("300");
    expect(req.status).toBe("Pending");

    const allReqs = getPaymentRequests();
    expect(allReqs.some((r) => r.id === req.id)).toBe(true);
  });
});
