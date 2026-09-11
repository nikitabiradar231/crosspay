import React from "react";
import { GraduationCap, PlusCircle, ArrowDownLeft, Clock, CheckCircle2, Wallet, RefreshCw, Send } from "lucide-react";
import { convertXlmToFiat } from "../services/exchange";

export default function StudentDashboard({
  profile,
  walletAddress,
  balance,
  isLoadingBalance,
  onRefreshBalance,
  requests = [],
  onRequestPaymentClick,
  onOpenOnboarding,
  rates,
}) {
  const studentRequests = requests.filter(
    (r) => !r.studentWallet || r.studentWallet.toLowerCase() === walletAddress.toLowerCase() || r.studentName === profile?.name
  );

  const pendingRequests = studentRequests.filter((r) => r.status === "Pending");
  const paidRequests = studentRequests.filter((r) => r.status === "Paid");

  const totalReceivedXlm = paidRequests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const fiat = convertXlmToFiat(totalReceivedXlm, rates);

  return (
    <div className="dashboard-container">
      {/* Student Profile Banner */}
      <div className="glass-card profile-banner">
        <div className="profile-info">
          <div className="avatar-box student-avatar">
            <GraduationCap size={32} />
          </div>
          <div>
            <div className="role-tag">Student Dashboard</div>
            <h2 className="heading-font">{profile?.name || "International Student"}</h2>
            <p className="subtext">
              {profile?.university || "University"} • {profile?.homeCountry || "Home"} ➔ {profile?.destCountry || "Destination"}
            </p>
          </div>
        </div>

        <button className="btn-secondary" onClick={onOpenOnboarding}>
          Edit Profile / Switch Demo
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Available Balance</span>
            <Wallet size={18} className="text-cyan" />
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
            <span>Total Received</span>
            <ArrowDownLeft size={18} className="text-emerald" />
          </div>
          <div className="metric-value heading-font text-emerald">
            {totalReceivedXlm.toFixed(2)} XLM
          </div>
          <div className="metric-subtext">
            ≈ ${fiat.usdValue} USD ({paidRequests.length} Payments)
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span>Pending Requests</span>
            <Clock size={18} className="text-amber" />
          </div>
          <div className="metric-value heading-font text-amber">
            {pendingRequests.length}
          </div>
          <div className="metric-subtext">Awaiting sponsor payout</div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="dashboard-action-bar">
        <h3 className="heading-font">Payment Requests</h3>
        <button className="btn-primary" onClick={onRequestPaymentClick}>
          <PlusCircle size={18} /> Request New Payment
        </button>
      </div>

      {/* Student Request Tracker List */}
      <div className="glass-card requests-list-card">
        {studentRequests.length === 0 ? (
          <div className="empty-state text-center py-8">
            <Send size={36} className="text-muted mb-2" />
            <p>No payment requests created yet.</p>
            <button className="btn-secondary mt-3" onClick={onRequestPaymentClick}>
              Create Tuition / Living Request
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Amount (XLM)</th>
                  <th>Fiat Value</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentRequests.map((req) => {
                  const reqFiat = convertXlmToFiat(req.amount, rates);
                  return (
                    <tr key={req.id}>
                      <td>
                        <div className="req-purpose font-semibold">{req.purpose}</div>
                        <div className="text-dim text-xs">{req.message || req.university}</div>
                      </td>
                      <td className="mono-font font-bold">{req.amount} XLM</td>
                      <td className="text-muted text-sm">${reqFiat.usdValue} / ₹{reqFiat.inrValue}</td>
                      <td>
                        {req.status === "Paid" ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="text-dim text-xs">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {req.txHash && (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${req.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="explorer-link"
                          >
                            Explorer ↗
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
