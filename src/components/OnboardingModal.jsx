import React, { useState } from "react";
import { GraduationCap, HeartHandshake, User, Globe, Building2, Check, Users } from "lucide-react";
import { SAMPLE_PROFILES } from "../services/contract";

export default function OnboardingModal({ isOpen, onClose, onSaveProfile, currentProfile }) {
  const [role, setRole] = useState(currentProfile?.role || "student");
  const [name, setName] = useState(currentProfile?.name || "");
  const [country, setCountry] = useState(currentProfile?.homeCountry || "India");
  const [university, setUniversity] = useState(currentProfile?.university || "Stanford University");
  const [destCountry, setDestCountry] = useState(currentProfile?.destCountry || "USA");
  const [relationship, setRelationship] = useState(currentProfile?.relationship || "Parent");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const profile = {
      id: `usr-${Date.now()}`,
      role,
      name: name || (role === "student" ? "International Student" : "Sponsor Parent"),
      homeCountry: country,
      ...(role === "student"
        ? { university, destCountry }
        : { relationship }),
    };
    onSaveProfile(profile);
    onClose();
  };

  const handleSelectSample = (sample) => {
    onSaveProfile(sample);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <h2 className="heading-font">Complete User Onboarding</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="sample-switch-box mb-4">
          <div className="sample-title">
            <Users size={16} /> Quick Select Demo Profile (Supports 10+ Users)
          </div>
          <div className="sample-tags">
            {SAMPLE_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`sample-chip ${currentProfile?.name === p.name ? "active" : ""}`}
                onClick={() => handleSelectSample(p)}
              >
                {p.role === "student" ? "🎓" : "🤝"} {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* Role Selection */}
          <div className="form-group mb-4">
            <label className="form-label">Select Your Role</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === "student" ? "selected" : ""}`}
                onClick={() => setRole("student")}
              >
                <GraduationCap size={24} />
                <span>Student</span>
              </button>

              <button
                type="button"
                className={`role-btn ${role === "sponsor" ? "selected" : ""}`}
                onClick={() => setRole("sponsor")}
              >
                <HeartHandshake size={24} />
                <span>Sponsor / Parent</span>
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="form-group mb-3">
            <label className="form-label"><User size={14} /> Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label"><Globe size={14} /> Home Country</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. India, Kenya, Mexico"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          {/* Student Specific */}
          {role === "student" && (
            <>
              <div className="form-group mb-3">
                <label className="form-label"><Building2 size={14} /> University / Institution</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Stanford University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label"><Globe size={14} /> Destination Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. USA, UK, Canada"
                  value={destCountry}
                  onChange={(e) => setDestCountry(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Sponsor Specific */}
          {role === "sponsor" && (
            <div className="form-group mb-4">
              <label className="form-label">Relationship to Student</label>
              <select
                className="form-input"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
                <option value="Relative">Relative</option>
                <option value="Sponsor NGO">Sponsor NGO / Foundation</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              <Check size={18} /> Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
