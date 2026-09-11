import { SOROBAN_CONTRACT_ADDRESS } from "./stellar";

// Sample test student & sponsor accounts for demonstration & onboarding 10+ users
export const SAMPLE_PROFILES = [
  {
    id: "stu-1",
    role: "student",
    name: "Rahul Sharma",
    university: "Stanford University",
    homeCountry: "India",
    destCountry: "USA",
    wallet: "GCX6...4K9L",
    fullWallet: "GCX67J298H3KFL493029485720194857201948572019485720194K9L",
  },
  {
    id: "stu-2",
    role: "student",
    name: "Aisha Patel",
    university: "University of Toronto",
    homeCountry: "Kenya",
    destCountry: "Canada",
    wallet: "GB2M...89XZ",
    fullWallet: "GB2M98374920485739201948572019485720194857201948572089XZ",
  },
  {
    id: "stu-3",
    role: "student",
    name: "Carlos Gomez",
    university: "Imperial College London",
    homeCountry: "Mexico",
    destCountry: "UK",
    wallet: "GD4K...39AA",
    fullWallet: "GD4K98374920485739201948572019485720194857201948572039AA",
  },
  {
    id: "stu-4",
    role: "student",
    name: "Mei Lin",
    university: "Technical University of Munich",
    homeCountry: "Singapore",
    destCountry: "Germany",
    wallet: "GCT7...12QQ",
    fullWallet: "GCT798374920485739201948572019485720194857201948572012QQ",
  },
  {
    id: "stu-5",
    role: "student",
    name: "David Okafor",
    university: "University of Melbourne",
    homeCountry: "Nigeria",
    destCountry: "Australia",
    wallet: "GA9P...99WW",
    fullWallet: "GA9P98374920485739201948572019485720194857201948572099WW",
  },
  {
    id: "spo-1",
    role: "sponsor",
    name: "Vijay Sharma",
    homeCountry: "India",
    relationship: "Father",
    wallet: "GDF8...77BB",
    fullWallet: "GDF898374920485739201948572019485720194857201948572077BB",
  },
  {
    id: "spo-2",
    role: "sponsor",
    name: "Zahra Patel",
    homeCountry: "Kenya",
    relationship: "Mother",
    wallet: "GHK9...44LL",
    fullWallet: "GHK998374920485739201948572019485720194857201948572044LL",
  },
  {
    id: "spo-3",
    role: "sponsor",
    name: "Global Student Fund Inc.",
    homeCountry: "USA",
    relationship: "Sponsor NGO",
    wallet: "GJJ3...11SS",
    fullWallet: "GJJ398374920485739201948572019485720194857201948572011SS",
  },
  {
    id: "spo-4",
    role: "sponsor",
    name: "Hans Mueller",
    homeCountry: "Germany",
    relationship: "Guardian",
    wallet: "GKL2...55PP",
    fullWallet: "GKL298374920485739201948572019485720194857201948572055PP",
  },
  {
    id: "spo-5",
    role: "sponsor",
    name: "Elena Gomez",
    homeCountry: "Mexico",
    relationship: "Sister",
    wallet: "GMN7...33DD",
    fullWallet: "GMN798374920485739201948572019485720194857201948572033DD",
  },
];

const INITIAL_REQUESTS = [
  {
    id: "req-101",
    studentName: "Rahul Sharma",
    studentWallet: "GCX67J298H3KFL493029485720194857201948572019485720194K9L",
    sponsorWallet: "GDF898374920485739201948572019485720194857201948572077BB",
    university: "Stanford University",
    amount: "500",
    purpose: "Tuition",
    message: "Fall Semester Tuition installment payment",
    status: "Pending",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    txHash: null,
  },
  {
    id: "req-102",
    studentName: "Aisha Patel",
    studentWallet: "GB2M98374920485739201948572019485720194857201948572089XZ",
    sponsorWallet: "GHK998374920485739201948572019485720194857201948572044LL",
    university: "University of Toronto",
    amount: "150",
    purpose: "Accommodation",
    message: "Monthly dormitory rent allowance",
    status: "Pending",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    txHash: null,
  },
  {
    id: "req-103",
    studentName: "Carlos Gomez",
    studentWallet: "GD4K98374920485739201948572019485720194857201948572039AA",
    sponsorWallet: "GMN798374920485739201948572019485720194857201948572033DD",
    university: "Imperial College London",
    amount: "75",
    purpose: "Books",
    message: "Engineering textbooks & lab materials",
    status: "Paid",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    txHash: "a9b8c7d6e5f432109876543210fedcba98765432109876543210abcdef123456",
  },
];

const STORAGE_KEY = "stellar_student_payment_requests";

/**
 * Loads payment requests from localStorage with fallback to default demo requests.
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
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
    university: university || "International University",
    amount: String(amount),
    purpose: purpose || "General Expenses",
    message: message || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
    txHash: null,
    contractAddress: SOROBAN_CONTRACT_ADDRESS,
  };

  const updated = [newReq, ...requests];
  savePaymentRequests(updated);
  return newReq;
}

/**
 * Marks a payment request as Paid with its Stellar transaction hash.
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
