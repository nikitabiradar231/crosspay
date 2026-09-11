import React, { useState } from "react";
import { Send, GraduationCap, DollarSign, Tag, MessageSquare, Wallet } from "lucide-react";
import { convertXlmToFiat } from "../services/exchange";

export default function PaymentRequestModal({
  isOpen,
  onClose,
  onSubmitRequest,
  studentProfile,
  studentWallet,
  rates,
}) {
  const [amount, setAmount] = useState("500");
  const [purpose, setPurpose] = useState("Tuition");
  const [message, setMessage] = useState("");
  const [sponsorWallet, setSponsorWallet] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRequest({
      studentName: studentProfile?.name || "Student",
      studentWallet,
      university: studentProfile?.university || "International University",
      amount,
      purpose,
      message,
      sponsorWallet,
    });
    onClose();
  };

  const fiat = convertXlmToFiat(amount, rates);

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <h2 className="heading-font">Create Student Payment Request</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="form-group mb-3">
            <label className="form-label">
              <span><DollarSign size={14} /> Amount in XLM</span>
              <span className="text-cyan">≈ ${fiat.usdValue} USD | ₹{fiat.inrValue} INR</span>
            </label>
            <input
              type="number"
              step="0.0001"
              min="0.1"
              className="form-input mono-font"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Purpose Field */}
          <div className="form-group mb-3">
            <label className="form-label"><Tag size={14} /> Purpose</label>
            <select
              className="form-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="Tuition">Tuition Fee</option>
              <option value="Accommodation">Accommodation / Rent</option>
              <option value="Food">Food & Groceries</option>
              <option value="Travel">Travel & Visa Expenses</option>
              <option value="Living expenses">Living Allowance</option>
              <option value="Emergency">Emergency Fund</option>
              <option value="Other">Other Expenses</option>
            </select>
          </div>

          {/* Optional Message */}
          <div className="form-group mb-3">
            <label className="form-label"><MessageSquare size={14} /> Message / Note (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Fall Semester tuition installment due next week"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Optional Sponsor Address */}
          <div className="form-group mb-4">
            <label className="form-label"><Wallet size={14} /> Sponsor Wallet Address (Optional)</label>
            <input
              type="text"
              className="form-input mono-font text-xs"
              placeholder="G... (Leave blank for public sponsor inbox)"
              value={sponsorWallet}
              onChange={(e) => setSponsorWallet(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Send size={16} /> Submit Payment Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
