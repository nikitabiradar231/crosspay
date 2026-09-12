import React from "react";
import { Globe, ShieldCheck, Zap, ArrowRight, Wallet, GraduationCap, HeartHandshake, CheckCircle2 } from "lucide-react";

export default function LandingPage({ onGetStarted, onConnectWallet, isWalletConnected }) {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="badge badge-testnet mb-4" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
          <span className="pulse-dot"></span> Soroban Smart Contract Powered
        </div>

        <h1 className="hero-title heading-font text-gradient">
          Cross-Border Student Payment Hub
        </h1>

        <p className="hero-subtitle">
          Instant, low-cost cross-border education payments powered by Stellar & Soroban.
        </p>

        <div className="hero-cta-group">
          {!isWalletConnected ? (
            <button className="btn-primary" onClick={onConnectWallet}>
              <Wallet size={20} /> Connect Freighter Wallet
            </button>
          ) : (
            <button className="btn-primary" onClick={onGetStarted}>
              Open Dashboard <ArrowRight size={20} />
            </button>
          )}
          <button className="btn-secondary" onClick={onGetStarted}>
            Get Started
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-grid">
        <div className="glass-card feature-card text-center">
          <div className="feature-icon text-cyan" style={{ margin: "0 auto 12px auto" }}>
            <Zap size={28} />
          </div>
          <h3 className="heading-font">3-Second Settlement</h3>
          <p>Instant transfers directly over Stellar Testnet.</p>
        </div>

        <div className="glass-card feature-card text-center">
          <div className="feature-icon text-purple" style={{ margin: "0 auto 12px auto" }}>
            <Globe size={28} />
          </div>
          <h3 className="heading-font">Near-Zero Fees</h3>
          <p>Transaction costs under $0.00001 per payment.</p>
        </div>

        <div className="glass-card feature-card text-center">
          <div className="feature-icon text-emerald" style={{ margin: "0 auto 12px auto" }}>
            <ShieldCheck size={28} />
          </div>
          <h3 className="heading-font">Smart Contract Verified</h3>
          <p>On-chain Soroban state & execution records.</p>
        </div>

        <div className="glass-card feature-card text-center">
          <div className="feature-icon text-indigo" style={{ margin: "0 auto 12px auto" }}>
            <GraduationCap size={28} />
          </div>
          <h3 className="heading-font">Purpose Tagged</h3>
          <p>Direct tracking for tuition, rent, & living expenses.</p>
        </div>
      </section>

      {/* How it Works / Roles */}
      <section className="how-it-works glass-card">
        <h2 className="heading-font text-center mb-6">Built For Students & Sponsors</h2>
        <div className="roles-split">
          <div className="role-box">
            <div className="role-header">
              <GraduationCap size={24} className="text-purple" />
              <h3>Students</h3>
            </div>
            <ul>
              <li><CheckCircle2 size={16} className="text-emerald" /> Create payment requests</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> Tag purpose & details</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> Receive XLM instantly</li>
            </ul>
          </div>

          <div className="role-divider"></div>

          <div className="role-box">
            <div className="role-header">
              <HeartHandshake size={24} className="text-cyan" />
              <h3>Sponsors</h3>
            </div>
            <ul>
              <li><CheckCircle2 size={16} className="text-emerald" /> Review pending inbox</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> Pre-flight fee breakdown</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> 1-Click Freighter approval</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
