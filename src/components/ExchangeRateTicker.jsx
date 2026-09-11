import React from "react";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

export default function ExchangeRateTicker({ rates, isFallback, onRefresh }) {
  if (!rates) return null;

  return (
    <div className="exchange-ticker-bar">
      <div className="ticker-content">
        <TrendingUp size={16} className="text-cyan" />
        <span className="ticker-title">Live Stellar Exchange Rate:</span>
        <span className="ticker-rate mono-font">1 XLM ≈ ${rates.USD?.toFixed(3)} USD</span>
        <span className="ticker-divider">•</span>
        <span className="ticker-rate mono-font">1 XLM ≈ ₹{rates.INR?.toFixed(2)} INR</span>
        
        {isFallback && (
          <span className="fallback-badge" title="Using cached fallback exchange rates">
            <AlertCircle size={12} /> Offline Fallback
          </span>
        )}
      </div>

      <button className="icon-btn-sm" onClick={onRefresh} title="Refresh rates">
        <RefreshCw size={12} />
      </button>
    </div>
  );
}
