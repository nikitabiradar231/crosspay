import React, { useState } from "react";
import { History, ExternalLink, ArrowUpRight, Search, Filter, CheckCircle2, Clock, XCircle } from "lucide-react";
import { STELLAR_EXPERT_TESTNET_URL } from "../services/stellar";
import { convertXlmToFiat } from "../services/exchange";

export default function TransactionHistory({ transactions = [], rates }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      !searchTerm ||
      (tx.recipient && tx.recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.purpose && tx.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.hash && tx.hash.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "SUCCESSFUL" && (tx.success !== false)) ||
      (statusFilter === "PENDING" && tx.status === "Pending") ||
      (statusFilter === "FAILED" && tx.success === false);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-card history-card">
      <div className="history-header">
        <div className="flex items-center gap-2">
          <History size={20} className="text-purple" />
          <h3 className="heading-font text-lg font-bold">Transaction History</h3>
        </div>

        {/* Filter Controls */}
        <div className="history-filters">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search address, purpose, hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state text-center py-6 text-muted">
          No transactions found matching criteria.
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((tx, idx) => {
            const isSuccess = tx.success !== false;
            const fiat = convertXlmToFiat(tx.amount, rates);

            return (
              <div key={tx.hash || idx} className="history-item">
                <div className="history-item-main">
                  <div className={`status-icon-box ${isSuccess ? "success" : "failed"}`}>
                    {isSuccess ? <ArrowUpRight size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{tx.purpose || "XLM Payment"}</span>
                      {isSuccess ? (
                        <span className="badge badge-success"><CheckCircle2 size={10} /> Successful</span>
                      ) : (
                        <span className="badge badge-warning">Failed</span>
                      )}
                    </div>
                    <div className="text-dim text-xs mono-font mt-1">
                      To: {tx.recipient ? `${tx.recipient.substring(0, 8)}...${tx.recipient.slice(-6)}` : "Testnet Account"}
                    </div>
                  </div>
                </div>

                <div className="history-item-meta">
                  <div className="text-right">
                    <div className="mono-font font-bold">{tx.amount} XLM</div>
                    <div className="text-dim text-xs">≈ ${fiat.usdValue} USD</div>
                  </div>

                  <div className="text-dim text-xs ml-3">
                    {tx.timestamp || new Date().toLocaleTimeString()}
                  </div>

                  {tx.hash && (
                    <a
                      href={`${STELLAR_EXPERT_TESTNET_URL}/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="explorer-link btn-secondary btn-sm"
                    >
                      Explorer <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
