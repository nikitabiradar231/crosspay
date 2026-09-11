import React, { useState, useEffect } from "react";
import { GraduationCap, HeartHandshake, User, Globe, Building2, Check } from "lucide-react";

export default function OnboardingModal({ isOpen, onClose, onSaveProfile, currentProfile }) {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [university, setUniversity] = useState("");
  const [destCountry, setDestCountry] = useState("");
  const [relationship, setRelationship] = useState("Parent");

  useEffect(() => {
    if (currentProfile) {
      setRole(currentProfile.role || "student");
      setName(currentProfile.name || "");
      setCountry(currentProfile.homeCountry || "");
      setUniversity(currentProfile.university || "");
      setDestCountry(currentProfile.destCountry || "");
      setRelationship(currentProfile.relationship || "Parent");
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const profile = {
      id: currentProfile?.id || `usr-${Date.now()}`,
      role,
      name: name.trim() || (role === "student" ? "International Student" : "Sponsor Parent"),
      homeCountry: country.trim() || "Not Specified",
      ...(role === "student"
        ? { university: university.trim() || "Institution Not Specified", destCountry: destCountry.trim() || "Not Specified" }
        : { relationship }),
    };
    onSaveProfile(profile);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content" style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <h2 className="heading-font">User Onboarding Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
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
              placeholder="e.g. Your Name"
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
