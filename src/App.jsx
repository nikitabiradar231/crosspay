import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import StudentDashboard from "./components/StudentDashboard";
import SponsorDashboard from "./components/SponsorDashboard";
import WalletCard from "./components/WalletCard";
import TransactionStatus from "./components/TransactionStatus";
import TransactionHistory from "./components/TransactionHistory";
import OnboardingModal from "./components/OnboardingModal";
import PaymentRequestModal from "./components/PaymentRequestModal";
import PaymentConfirmationModal from "./components/PaymentConfirmationModal";
import FeedbackModal from "./components/FeedbackModal";
import AnalyticsModal from "./components/AnalyticsModal";

import {
  isFreighterAvailable,
  connectFreighterWallet,
  signTxWithFreighter,
} from "./services/freighter";

import {
  getXlmBalance,
  sendXlmPayment,
  fundAccountWithFriendbot,
  getEstimatedNetworkFee,
  fetchAccountTransactions,
} from "./services/stellar";

import {
  getPaymentRequests,
  createPaymentRequest,
  markRequestPaid,
  getUserProfile,
  saveUserProfile,
} from "./services/contract";

import { getXlmExchangeRates } from "./services/exchange";
import { trackEvent } from "./services/analytics";
import { logAppError, initGlobalErrorMonitoring } from "./services/monitoring";

export default function App() {
  // Navigation & View tab
  const [activeTab, setActiveTab] = useState("landing");

  // Wallet State
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [isAccountFunded, setIsAccountFunded] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [connectError, setConnectError] = useState("");

  // Exchange Rates State
  const [rates, setRates] = useState({ USD: 0.115, INR: 9.6 });
  const [isFallbackRates, setIsFallbackRates] = useState(false);

  // User Profile & Real Data
  const [currentProfile, setCurrentProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);

  // Modals & Confirmation
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [pendingTxDetails, setPendingTxDetails] = useState(null);
  const [estimatedFee, setEstimatedFee] = useState("0.0000100");

  // Execution & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [txResult, setTxResult] = useState(null);

  // Mount logic: check freighter, load profile, exchange rates & requests
  useEffect(() => {
    async function init() {
      initGlobalErrorMonitoring();
      trackEvent("page_visit", { page: "home" });

      const installed = await isFreighterAvailable();
      setIsFreighterInstalled(installed);

      const profile = getUserProfile();
      if (profile) {
        setCurrentProfile(profile);
      }

      fetchRates();
      loadRequests();
    }
    init();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await getXlmExchangeRates();
      setRates({ USD: res.USD, INR: res.INR });
      setIsFallbackRates(res.isFallback);
    } catch (err) {
      logAppError(err, "ExchangeRateFetch");
    }
  };

  const loadRequests = () => {
    const data = getPaymentRequests();
    setRequests(data);
  };

  const fetchBalanceAndHistory = async (pubKey) => {
    if (!pubKey) return;
    setIsLoadingBalance(true);
    try {
      const res = await getXlmBalance(pubKey);
      setBalance(res.balance);
      setIsAccountFunded(res.exists);

      // Fetch real account transactions directly from Stellar Horizon
      const realHistory = await fetchAccountTransactions(pubKey);
      setHistory(realHistory);
    } catch (err) {
      logAppError(err, "FetchBalanceAndHistory");
      console.error("Balance/History fetch error:", err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Connect Wallet Handler
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setConnectError("");
    setTxResult(null);

    try {
      const pubKey = await connectFreighterWallet();
      setWalletAddress(pubKey);
      trackEvent("wallet_connected", { address: pubKey });

      await fetchBalanceAndHistory(pubKey);

      if (!currentProfile) {
        setIsOnboardingOpen(true);
      } else {
        setActiveTab("dashboard");
      }
    } catch (err) {
      logAppError(err, "WalletConnection");
      setConnectError(err.message || "Failed to connect Freighter Wallet.");
      trackEvent("wallet_connect_failed", { error: err.message });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    trackEvent("wallet_disconnected", { address: walletAddress });
    setWalletAddress("");
    setBalance("0.0000");
    setIsAccountFunded(true);
    setTxResult(null);
    setConnectError("");
    setActiveTab("landing");
  };

  const handleFundFriendbot = async () => {
    if (!walletAddress) return;
    setIsFunding(true);
    setTxResult(null);

    try {
      await fundAccountWithFriendbot(walletAddress);
      await fetchBalanceAndHistory(walletAddress);
      trackEvent("friendbot_funded", { address: walletAddress });
      setTxResult({
        success: true,
        amount: "10000",
        recipient: walletAddress,
        hash: "Friendbot Testnet Faucet Activation",
        error: null,
      });
    } catch (err) {
      logAppError(err, "FriendbotFunding");
      setTxResult({
        success: false,
        error: err.message || "Friendbot funding failed.",
        rawError: err,
      });
    } finally {
      setIsFunding(false);
    }
  };

  // Student Creates Payment Request
  const handleCreateRequest = (requestData) => {
    try {
      const newReq = createPaymentRequest({
        ...requestData,
        studentWallet: walletAddress || requestData.studentWallet,
      });
      trackEvent("payment_request_created", { id: newReq.id, purpose: newReq.purpose, amount: newReq.amount });
      loadRequests();
      setTxResult({
        success: true,
        amount: newReq.amount,
        recipient: newReq.purpose,
        hash: "Payment Request Registered",
        message: "Payment request successfully created and saved!",
      });
    } catch (err) {
      logAppError(err, "CreatePaymentRequest");
    }
  };

  // Sponsor clicks "Pay Request" -> Pre-flight fee breakdown popup
  const handleInitiatePayRequest = async (requestItem) => {
    try {
      const feeInfo = await getEstimatedNetworkFee();
      setEstimatedFee(feeInfo.feeXlm);
      setPendingTxDetails({
        requestId: requestItem.id,
        studentName: requestItem.studentName,
        recipientAddress: requestItem.studentWallet,
        amount: requestItem.amount,
        purpose: requestItem.purpose,
      });
      setIsConfirmModalOpen(true);
    } catch (err) {
      logAppError(err, "InitiatePayRequest");
    }
  };

  // Sponsor clicks "Send Direct Payment"
  const handleOpenDirectPayment = async () => {
    try {
      const feeInfo = await getEstimatedNetworkFee();
      setEstimatedFee(feeInfo.feeXlm);
      setPendingTxDetails({
        requestId: null,
        studentName: "Direct Student Payout",
        recipientAddress: "",
        amount: "10",
        purpose: "Direct Student Support",
      });
      setIsConfirmModalOpen(true);
    } catch (err) {
      logAppError(err, "OpenDirectPayment");
    }
  };

  // Execute Payment via Stellar Horizon & Freighter Wallet Signature
  const handleExecutePayment = async (details) => {
    if (!walletAddress) {
      setConnectError("Please connect your Freighter wallet to execute payments.");
      setIsConfirmModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    setTxResult(null);
    setStatusMessage("Building payment transaction...");

    trackEvent("payment_initiated", { recipient: details.recipientAddress, amount: details.amount });

    try {
      const result = await sendXlmPayment({
        senderAddress: walletAddress,
        recipientAddress: details.recipientAddress,
        amount: details.amount,
        purpose: details.purpose,
        signWithFreighter: async (unsignedXdr, accountToSign) => {
          setStatusMessage("Awaiting signature in Freighter extension...");
          return await signTxWithFreighter(unsignedXdr, accountToSign || walletAddress);
        },
      });

      trackEvent("payment_successful", { hash: result.hash, amount: details.amount });

      if (details.requestId) {
        markRequestPaid(details.requestId, result.hash);
        loadRequests();
      }

      const successResult = {
        success: true,
        amount: details.amount.toString(),
        recipient: details.recipientAddress,
        hash: result.hash,
        ledger: result.ledger,
        error: null,
      };

      setTxResult(successResult);
      setIsConfirmModalOpen(false);

      // Re-fetch balance & real payments from Horizon
      await fetchBalanceAndHistory(walletAddress);
    } catch (err) {
      console.error("Payment execution failed:", err);
      logAppError(err, "PaymentExecution");
      trackEvent("payment_failed", { error: err.message });

      setTxResult({
        success: false,
        amount: details.amount.toString(),
        recipient: details.recipientAddress,
        error: err.message || "Transaction failed to process on Stellar Testnet.",
        rawError: err,
      });
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  const handleSaveProfile = (profile) => {
    setCurrentProfile(profile);
    saveUserProfile(profile);
    trackEvent("onboarding_completed", { role: profile.role, name: profile.name });
    if (walletAddress) {
      setActiveTab("dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Nav */}
      <Navbar
        isFreighterInstalled={isFreighterInstalled}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        currentProfile={currentProfile}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        rates={rates}
        isFallbackRates={isFallbackRates}
        onRefreshRates={fetchRates}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "32px 16px" }}>
        
        {/* Status / Transaction Feedback Banner */}
        <TransactionStatus
          result={txResult}
          onDismiss={() => setTxResult(null)}
        />

        {/* View Switcher */}
        {activeTab === "landing" && (
          <LandingPage
            onGetStarted={() => {
              if (!walletAddress) {
                handleConnectWallet();
              } else {
                setActiveTab("dashboard");
              }
            }}
            onConnectWallet={handleConnectWallet}
            isWalletConnected={Boolean(walletAddress)}
          />
        )}

        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Wallet Card */}
            <WalletCard
              address={walletAddress}
              balance={balance}
              isLoadingBalance={isLoadingBalance}
              isAccountFunded={isAccountFunded}
              onRefreshBalance={() => fetchBalanceAndHistory(walletAddress)}
              onDisconnect={handleDisconnectWallet}
              onFundWithFriendbot={handleFundFriendbot}
              isFunding={isFunding}
            />

            {/* Role Dashboard View */}
            {currentProfile?.role === "sponsor" ? (
              <SponsorDashboard
                profile={currentProfile}
                walletAddress={walletAddress}
                balance={balance}
                isLoadingBalance={isLoadingBalance}
                requests={requests}
                onPayRequestClick={handleInitiatePayRequest}
                onOpenDirectPayment={handleOpenDirectPayment}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
                rates={rates}
              />
            ) : (
              <StudentDashboard
                profile={currentProfile}
                walletAddress={walletAddress}
                balance={balance}
                isLoadingBalance={isLoadingBalance}
                onRefreshBalance={() => fetchBalanceAndHistory(walletAddress)}
                requests={requests}
                onRequestPaymentClick={() => setIsRequestModalOpen(true)}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
                rates={rates}
              />
            )}
          </div>
        )}

        {activeTab === "history" && (
          <TransactionHistory
            transactions={history}
            rates={rates}
          />
        )}
      </main>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveProfile={handleSaveProfile}
        currentProfile={currentProfile}
      />

      <PaymentRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmitRequest={handleCreateRequest}
        studentProfile={currentProfile}
        studentWallet={walletAddress}
        rates={rates}
      />

      <PaymentConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirmPayment={handleExecutePayment}
        paymentDetails={pendingTxDetails}
        estimatedFee={estimatedFee}
        rates={rates}
        isSubmitting={isSubmitting}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "24px 0", textAlign: "center", fontSize: "0.8rem", color: "var(--text-dim)", marginTop: "40px" }}>
        Cross-Border Student Payment Hub • Level 4 Green Belt Production MVP • Stellar Testnet & Soroban Smart Contracts
      </footer>
    </div>
  );
}
