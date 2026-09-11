import React from "react";
import { Zap, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { convertXlmToFiat } from "../services/exchange";

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirmPayment,
  paymentDetails,
  estimatedFee = "0.0000100",
  rates,
  isSubmitting,
}) {
  if (!isOpen || !paymentDetails) return null;

  const numAmount = parseFloat(paymentDetails.amount) || 0;
  const numFee = parseFloat(estimatedFee) || 0.00001;
  const totalAmount = (numAmount + numFee).toFixed(7);

  const fiatAmount = convertXlmToFiat(numAmount, rates);
  const fiatTotal = convertXlmToFiat(totalAmount, rates);

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <h2 className="heading-font">Review Transaction Details</h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>

        <div className="confirmation-body">
          {/* Summary Box */}
          <div className="summary-box">
            <div className="summary-label">Payment Amount</div>
            <div className="summary-amount heading-font text-gradient">
              {numAmount} XLM
            </div>
            <div className="summary-fiat text-dim text-xs">
              ≈ ${fiatAmount.usdValue} USD | ₹{fiatAmount.inrValue} INR
            </div>
          </div>

          {/* Breakdown List */}
          <div className="breakdown-list">
            <div className="breakdown-item">
              <span className="text-muted">Recipient Student</span>
              <span className="font-semibold">{paymentDetails.studentName || "Student Wallet"}</span>
            </div>

            <div className="breakdown-item">
              <span className="text-muted">Recipient Address</span>
              <span className="mono-font text-xs text-cyan">
                {paymentDetails.recipientAddress
                  ? `${paymentDetails.recipientAddress.substring(0, 8)}...${paymentDetails.recipientAddress.slice(-6)}`
                  : "Not Specified"}
              </span>
            </div>

            <div className="breakdown-item">
              <span className="text-muted">Payment Purpose</span>
              <span className="badge badge-testnet">{paymentDetails.purpose || "General"}</span>
            </div>

            <div className="breakdown-item">
              <span className="text-muted">Estimated Stellar Network Fee</span>
              <span className="mono-font text-xs">{estimatedFee} XLM</span>
            </div>

            <div className="breakdown-item total-row">
              <span className="font-bold">Total Wallet Deduction</span>
              <span className="mono-font font-bold text-emerald">
                {totalAmount} XLM (≈ ${fiatTotal.usdValue})
              </span>
            </div>
          </div>

          <div className="security-notice mb-4">
            <ShieldCheck size={16} className="text-emerald" />
            <span>Transaction will be signed securely via Freighter Wallet on Stellar Testnet.</span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onConfirmPayment(paymentDetails)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Processing in Freighter..."
              ) : (
                <>
                  <Zap size={16} /> Confirm & Sign Transaction <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
