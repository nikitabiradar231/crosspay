import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "../components/LandingPage";
import ExchangeRateTicker from "../components/ExchangeRateTicker";

describe("Frontend Component Tests", () => {
  it("renders LandingPage heading and CTA buttons", () => {
    render(
      <LandingPage
        onGetStarted={vi.fn()}
        onConnectWallet={vi.fn()}
        isWalletConnected={false}
      />
    );

    expect(
      screen.getByText("Cross-Border Student Payment Hub")
    ).toBeInTheDocument();
    expect(screen.getByText("Connect Freighter Wallet")).toBeInTheDocument();
  });

  it("renders ExchangeRateTicker with converted rates", () => {
    const rates = { USD: 0.115, INR: 9.6 };
    render(
      <ExchangeRateTicker
        rates={rates}
        isFallback={false}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText("1 XLM ≈ $0.115 USD")).toBeInTheDocument();
    expect(screen.getByText("1 XLM ≈ ₹9.60 INR")).toBeInTheDocument();
  });
});
