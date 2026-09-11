import React from "react";
import { Globe, ShieldCheck, Zap, ArrowRight, Wallet, GraduationCap, HeartHandshake, CheckCircle2 } from "lucide-react";

export default function LandingPage({ onGetStarted, onConnectWallet, isWalletConnected }) {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="badge badge-testnet mb-4" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
          <span className="pulse-dot"></span> Powered by Stellar Testnet & Soroban Smart Contracts
        </div>

        <h1 className="hero-title heading-font text-gradient">
          Cross-Border Student Payment Hub
        </h1>

        <p className="hero-subtitle">
          Empowering international students to receive tuition, living allowance, and emergency funds directly from sponsors worldwide with 3-second settlement and near-zero fees.
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
            Explore Demo Profiles
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-grid">
        <div className="glass-card feature-card">
          <div className="feature-icon text-cyan">
            <Zap size={28} />
          </div>
          <h3 className="heading-font">Instant Settlement</h3>
          <p>
            Transactions confirm in 3–5 seconds on the Stellar network. No multi-day banking delays or wire holds.
          </p>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon text-purple">
            <Globe size={28} />
          </div>
          <h3 className="heading-font">Low Transaction Costs</h3>
          <p>
            Pay fees as low as $0.00001 per payment. Save up to 98% compared to traditional cross-border wire transfers.
          </p>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon text-emerald">
            <ShieldCheck size={28} />
          </div>
          <h3 className="heading-font">Transparent & On-Chain</h3>
          <p>
            Every transaction and payment request is verified on Stellar Testnet and logged via Soroban smart contract records.
          </p>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon text-indigo">
            <GraduationCap size={28} />
          </div>
          <h3 className="heading-font">Purpose-Driven Requests</h3>
          <p>
            Tag payments clearly for Tuition, Accommodation, Books, Travel, or Living Expenses with direct sponsor visibility.
          </p>
        </div>
      </section>

      {/* How it Works / Roles */}
      <section className="how-it-works glass-card">
        <h2 className="heading-font text-center mb-6">Designed for Students & Sponsors</h2>
        <div className="roles-split">
          <div className="role-box">
            <div className="role-header">
              <GraduationCap size={24} className="text-purple" />
              <h3>For International Students</h3>
            </div>
            <ul>
              <li><CheckCircle2 size={16} className="text-emerald" /> Select university & target destination</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> Generate structured payment requests</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> Receive XLM instantly in your connected wallet</li>
            </ul>
          </div>

          <div className="role-divider"></div>

          <div className="role-box">
            <div className="role-header">
              <HeartHandshake size={24} className="text-cyan" />
              <h3>For Parents & Sponsors</h3>
            </div>
            <ul>
              <li><CheckCircle2 size={16} className="text-emerald" /> Review pending requests with clear purpose notes</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> See real-time exchange rates & transaction cost breakdown</li>
              <li><CheckCircle2 size={16} className="text-emerald" /> Sign securely via Freighter with instant hash proof</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
