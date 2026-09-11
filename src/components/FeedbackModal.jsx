import React, { useState } from "react";
import { Star, MessageSquare, Check, Send } from "lucide-react";
import { trackEvent } from "../services/analytics";

export default function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    trackEvent("feedback_submitted", { rating, feedback });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFeedback("");
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ maxWidth: "460px" }}>
        <div className="modal-header">
          <h2 className="heading-font">Product Experience Feedback</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {isSubmitted ? (
          <div className="feedback-success text-center py-6">
            <div className="success-icon mb-3">🎉</div>
            <h3 className="heading-font text-emerald mb-2">Thank you for your feedback!</h3>
            <p className="text-dim text-sm">Your response helps improve the Cross-Border Student Payment Hub dApp.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group text-center mb-4">
              <label className="form-label text-center mb-2">How was your dApp experience?</label>
              <div className="star-rating-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={28}
                      className={(hoverRating || rating) >= star ? "star-filled" : "star-empty"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label"><MessageSquare size={14} /> Additional Feedback / Suggestions</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Share your thoughts on speed, wallet signing, UI design, or student request flow..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Send size={16} /> Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
