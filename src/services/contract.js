import { SOROBAN_CONTRACT_ADDRESS } from "./stellar";

const STORAGE_KEY = "stellar_student_payment_requests";
const PROFILE_KEY = "stellar_student_user_profile";

/**
 * Loads user profile from localStorage.
 */
export function getUserProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("Error reading stored user profile:", err);
    return null;
  }
}

/**
 * Saves user profile to localStorage.
 */
export function saveUserProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Error saving user profile:", err);
  }
}

/**
 * Loads payment requests from localStorage. Returns empty array if none exist.
 */
export function getPaymentRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Error reading stored requests:", err);
  }
  return [];
}

/**
 * Saves payment request list to localStorage.
 */
export function savePaymentRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error("Error saving requests:", err);
  }
}

/**
 * Creates a new payment request and persists it.
 */
export function createPaymentRequest({
  studentName,
  studentWallet,
  sponsorWallet,
  university,
  amount,
  purpose,
  message,
}) {
  const requests = getPaymentRequests();
  const newReq = {
    id: `req-${Date.now()}`,
    studentName: studentName || "Student",
    studentWallet,
    sponsorWallet: sponsorWallet || "",
    university: university || "International Institution",
    amount: String(amount),
    purpose: purpose || "General Expenses",
    message: message || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
    txHash: null,
    contractAddress: SOROBAN_CONTRACT_ADDRESS || null,
  };

  const updated = [newReq, ...requests];
  savePaymentRequests(updated);
  return newReq;
}

/**
 * Marks a payment request as Paid with its real Stellar transaction hash.
 */
export function markRequestPaid(requestId, txHash) {
  const requests = getPaymentRequests();
  const updated = requests.map((req) => {
    if (req.id === requestId) {
      return { ...req, status: "Paid", txHash };
    }
    return req;
  });
  savePaymentRequests(updated);
  return updated;
}
