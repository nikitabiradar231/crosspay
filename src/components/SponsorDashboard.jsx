import React from "react";
import { HeartHandshake, Send, Clock, CheckCircle2, Wallet, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { convertXlmToFiat } from "../services/exchange";

export default function SponsorDashboard({
  profile,
  walletAddress,
  balance,
  isLoadingBalance,
  requests = [],
  onPayRequestClick,
  onOpenDirectPayment,
  onOpenOnboarding,
  rates,
}) {
  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const paidRequests = requests.filter((r) => r.status === "Paid");

  const totalSentXlm = paidRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const fiat = convertXlmToFiat(totalSentXlm, rates);

  return (
    <div className="dashboard-container">
      {/* Sponsor Profile Banner */}
      <div className="glass-card profile-banner">
        <div className="profile-info">
          <div className="avatar-box sponsor-avatar">
            <HeartHandshake size={32} />
          </div>
          <div>
            <div className="role-tag sponsor-tag">Sponsor / Parent Dashboard</div>
            <h2 className="heading-font">{profile?.name || "Student Supporter"}</h2>
            <p className="subtext">
              {profile?.relationship || "Parent"} • {profile?.homeCountry || "Sponsor Region"}
            </p>
          </div>
        </div>

        <div className="banner-actions">
          <button className="btn-secondary" onClick={onOpenOnboarding}>
            Switch Profile
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Sponsor XLM Balance</span>
            <Wallet size={18} className="text-purple" />
          </div>
          <div className="metric-value heading-font">
            {isLoadingBalance ? "..." : `${balance} XLM`}
          </div>
          <div className="metric-subtext">
            ≈ ${convertXlmToFiat(balance, rates).usdValue} USD | ₹{convertXlmToFiat(balance, rates).inrValue} INR
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Total Sent to Students</span>
            <ArrowUpRight size={18} className="text-purple" />
          </div>
          <div className="metric-value heading-font text-purple">
            {totalSentXlm.toFixed(2)} XLM
          </div>
          <div className="metric-subtext">
            ≈ ${fiat.usdValue} USD ({paidRequests.length} Payments)
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Pending Student Requests</span>
            <Clock size={18} className="text-amber" />
          </div>
          <div className="metric-value heading-font text-amber">
            {pendingRequests.length}
          </div>
          <div className="metric-subtext">Ready for sponsor review & payout</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="dashboard-action-bar">
        <h3 className="heading-font">Student Requests Inbox</h3>
        <button className="btn-primary" onClick={onOpenDirectPayment}>
          <Send size={18} /> Send Direct XLM Payment
        </button>
      </div>

      {/* Pending Requests Inbox Cards */}
      <div className="pending-inbox-grid">
        {pendingRequests.length === 0 ? (
          <div className="glass-card empty-state text-center py-8" style={{ gridColumn: "1 / -1" }}>
            <CheckCircle2 size={36} className="text-emerald mb-2" />
            <p>All student payment requests have been settled!</p>
          </div>
        ) : (
          pendingRequests.map((req) => {
            const reqFiat = convertXlmToFiat(req.amount, rates);
            return (
              <div key={req.id} className="glass-card request-card">
                <div className="req-card-header">
                  <div>
                    <span className="badge badge-testnet mb-1">{req.purpose}</span>
                    <h4 className="heading-font">{req.studentName}</h4>
                    <p className="text-dim text-xs">{req.university}</p>
                  </div>
                  <div className="text-right">
                    <div className="req-amount mono-font text-cyan">{req.amount} XLM</div>
                    <div className="text-dim text-xs">≈ ${reqFiat.usdValue} USD</div>
                  </div>
                </div>

                {req.message && (
                  <p className="req-message">
                    "{req.message}"
                  </p>
                )}

                <div className="req-card-footer">
                  <div className="text-dim text-xs">
                    Requested: {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                  <button className="btn-primary btn-sm" onClick={() => onPayRequestClick(req)}>
                    <Zap size={14} /> Pay Request
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
