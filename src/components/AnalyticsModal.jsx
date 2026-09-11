import React, { useState, useEffect } from "react";
import { Activity, AlertTriangle, RefreshCw, Trash2, ShieldCheck, Terminal } from "lucide-react";
import { getAnalyticsEvents, clearAnalyticsEvents } from "../services/analytics";
import { getErrorLogs, clearErrorLogs } from "../services/monitoring";

export default function AnalyticsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState([]);

  const loadData = () => {
    setEvents(getAnalyticsEvents());
    setErrors(getErrorLogs());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (activeTab === "events") {
      clearAnalyticsEvents();
    } else {
      clearErrorLogs();
    }
    loadData();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Activity size={20} className="text-cyan" />
            <h2 className="heading-font">Product Telemetry & System Monitoring</h2>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Sub-tabs */}
        <div className="tab-buttons mb-4">
          <button
            className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            <Activity size={14} /> Tracked Product Events ({events.length})
          </button>

          <button
            className={`tab-btn ${activeTab === "errors" ? "active text-amber" : ""}`}
            onClick={() => setActiveTab("errors")}
          >
            <AlertTriangle size={14} /> System Error Logs ({errors.length})
          </button>
        </div>

        <div className="analytics-body">
          {activeTab === "events" ? (
            events.length === 0 ? (
              <div className="empty-state text-center py-6 text-muted">
                No telemetry events logged yet. Perform wallet interactions to populate.
              </div>
            ) : (
              <div className="log-list">
                {events.map((evt) => (
                  <div key={evt.id} className="log-item">
                    <div className="log-header">
                      <span className="badge badge-testnet">{evt.category}</span>
                      <span className="log-name font-semibold">{evt.eventName}</span>
                      <span className="log-time text-dim text-xs ml-auto">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="log-props mono-font text-xs">
                      {JSON.stringify(evt.properties, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )
          ) : errors.length === 0 ? (
            <div className="empty-state text-center py-6 text-emerald">
              <ShieldCheck size={32} className="mb-2" />
              <p>System operational. No runtime errors or RPC failures recorded!</p>
            </div>
          ) : (
            <div className="log-list">
              {errors.map((err) => (
                <div key={err.id} className="log-item error-item">
                  <div className="log-header">
                    <span className="badge badge-warning">{err.context}</span>
                    <span className="log-name font-semibold text-danger">{err.message}</span>
                    <span className="log-time text-dim text-xs ml-auto">
                      {new Date(err.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {err.stack && (
                    <pre className="log-props mono-font text-xs text-danger">
                      {err.stack}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions mt-4">
          <button className="btn-secondary btn-sm" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-outline-danger btn-sm" onClick={handleClear}>
            <Trash2 size={14} /> Clear Logs
          </button>
          <button className="btn-primary btn-sm ml-auto" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
