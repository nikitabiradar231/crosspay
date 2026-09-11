import React from "react";
import { Orbit, GraduationCap, Activity, Star, Wallet, LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import ExchangeRateTicker from "./ExchangeRateTicker";

export default function Navbar({
  isFreighterInstalled,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  currentProfile,
  onOpenOnboarding,
  onOpenAnalytics,
  onOpenFeedback,
  rates,
  isFallbackRates,
  onRefreshRates,
  activeTab,
  onTabChange,
}) {
  return (
    <header className="navbar-header">
      {/* Top Banner Ticker */}
      <ExchangeRateTicker
        rates={rates}
        isFallback={isFallbackRates}
        onRefresh={onRefreshRates}
      />

      {/* Main Nav Container */}
      <div className="navbar-main">
        {/* Brand Logo & Title */}
        <div className="brand-group" onClick={() => onTabChange("landing")}>
          <div className="brand-logo">
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="heading-font text-gradient brand-title">
                Cross-Border Student Payment Hub
              </h1>
              <span className="badge badge-testnet">
                <span className="pulse-dot"></span> Testnet
              </span>
            </div>
            <p className="brand-subtitle">
              Level 4 Green Belt Stellar dApp • Soroban Enabled
            </p>
          </div>
        </div>

        {/* Navigation Tabs (if wallet connected) */}
        {walletAddress && (
          <div className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === "landing" ? "active" : ""}`}
              onClick={() => onTabChange("landing")}
            >
              Overview
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => onTabChange("dashboard")}
            >
              {currentProfile?.role === "sponsor" ? "Sponsor Dashboard" : "Student Dashboard"}
            </button>
            <button
              className={`nav-tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => onTabChange("history")}
            >
              Transaction History
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Profile Badge */}
          {walletAddress && currentProfile && (
            <button className="profile-chip-btn" onClick={onOpenOnboarding} title="Switch Profile / Role">
              <span className="chip-icon">
                {currentProfile.role === "student" ? "🎓" : "🤝"}
              </span>
              <span className="chip-name font-medium">{currentProfile.name}</span>
              <ChevronDown size={14} />
            </button>
          )}

          {/* Telemetry & Monitoring */}
          <button className="icon-action-btn" onClick={onOpenAnalytics} title="Analytics & System Monitoring">
            <Activity size={18} />
          </button>

          {/* Feedback */}
          <button className="icon-action-btn" onClick={onOpenFeedback} title="Provide Feedback">
            <Star size={18} />
          </button>

          {/* Wallet Button */}
          {!walletAddress ? (
            <button className="btn-primary btn-sm" onClick={onConnectWallet}>
              <Wallet size={16} /> Connect Wallet
            </button>
          ) : (
            <div className="wallet-pill-group">
              <span className="wallet-addr mono-font">
                {walletAddress.substring(0, 4)}...{walletAddress.slice(-4)}
              </span>
              <button className="disconnect-icon-btn" onClick={onDisconnectWallet} title="Disconnect Wallet">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
