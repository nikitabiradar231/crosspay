import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  StrKey,
  Memo,
} from "@stellar/stellar-sdk";

// Stellar Horizon Testnet Server URL
export const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_EXPERT_TESTNET_URL = "https://stellar.expert/explorer/testnet/tx";
export const SOROBAN_CONTRACT_ADDRESS = "CCSTUDENTPAYMENTHUBTESTNET000000000000000000000000000001";

// Initialize Horizon Server for Testnet
export const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL);

/**
 * Validates whether a given string is a valid Stellar public key (Ed25519).
 * @param {string} address
 * @returns {boolean}
 */
export function isValidStellarAddress(address) {
  if (!address || typeof address !== "string") return false;
  return StrKey.isValidEd25519PublicKey(address.trim());
}

/**
 * Fetches the native XLM balance for a given Stellar public key from Horizon Testnet.
 * @param {string} publicKey Stellar Public Key (G...)
 * @returns {Promise<{ balance: string, rawBalance: string, exists: boolean }>}
 */
export async function getXlmBalance(publicKey) {
  if (!isValidStellarAddress(publicKey)) {
    throw new Error("Invalid Stellar public address.");
  }

  try {
    const account = await horizonServer.loadAccount(publicKey);
    const nativeAsset = account.balances.find(
      (b) => b.asset_type === "native"
    );

    return {
      balance: nativeAsset ? parseFloat(nativeAsset.balance).toFixed(4) : "0.0000",
      rawBalance: nativeAsset ? nativeAsset.balance : "0",
      exists: true,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        balance: "0.0000",
        rawBalance: "0",
        exists: false,
      };
    }
    console.error("Error loading Stellar account balance:", error);
    throw new Error(
      error.message || "Failed to fetch wallet balance from Stellar Testnet."
    );
  }
}

/**
 * Funds an account on Stellar Testnet using Friendbot faucet.
 * @param {string} publicKey
 * @returns {Promise<boolean>}
 */
export async function fundAccountWithFriendbot(publicKey) {
  if (!isValidStellarAddress(publicKey)) {
    throw new Error("Invalid Stellar address for Friendbot funding.");
  }

  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const data = await response.json();
    if (response.ok || data.hash) {
      return true;
    }
    throw new Error(data.detail || "Friendbot funding request failed.");
  } catch (err) {
    console.error("Friendbot funding error:", err);
    throw new Error(err.message || "Failed to fund test account via Friendbot.");
  }
}

/**
 * Estimates the network fee for a Stellar transaction.
 * @returns {Promise<{ baseFeeStroops: number, feeXlm: string }>}
 */
export async function getEstimatedNetworkFee() {
  try {
    const baseFee = await horizonServer.fetchBaseFee();
    const feeXlm = (baseFee / 10000000).toFixed(7);
    return { baseFeeStroops: baseFee, feeXlm };
  } catch (err) {
    console.warn("Base fee fetch failed, fallback to 100 stroops:", err);
    return { baseFeeStroops: 100, feeXlm: "0.0000100" };
  }
}

/**
 * Builds, signs via Freighter, and submits an XLM payment transaction to Stellar Testnet.
 * @param {Object} params
 * @param {string} params.senderAddress - Connected wallet address (G...)
 * @param {string} params.recipientAddress - Destination address (G...)
 * @param {string|number} params.amount - Amount in XLM
 * @param {string} [params.purpose] - Payment purpose (e.g. Tuition, Accommodation)
 * @param {Function} params.signWithFreighter - Freighter sign callback
 * @returns {Promise<{ hash: string, ledger: number, successful: boolean }>}
 */
export async function sendXlmPayment({
  senderAddress,
  recipientAddress,
  amount,
  purpose = "Student Payment",
  signWithFreighter,
}) {
  const cleanSender = senderAddress ? senderAddress.trim() : "";
  const cleanRecipient = recipientAddress ? recipientAddress.trim() : "";
  const numAmount = parseFloat(amount);

  if (!isValidStellarAddress(cleanSender)) {
    throw new Error("Connected wallet address is invalid.");
  }
  if (!cleanRecipient) {
    throw new Error("Recipient Stellar address is required.");
  }
  if (!isValidStellarAddress(cleanRecipient)) {
    throw new Error("Recipient address is not a valid Stellar public key (starts with G).");
  }
  if (cleanSender === cleanRecipient) {
    throw new Error("Recipient address cannot be the same as sender address.");
  }
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error("XLM amount must be a positive number greater than 0.");
  }

  let sourceAccount;
  try {
    sourceAccount = await horizonServer.loadAccount(cleanSender);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new Error(
        "Your account is not funded on Stellar Testnet yet. Use the 'Fund with Friendbot' button to activate your account."
      );
    }
    throw new Error(`Failed to load sender account from Testnet: ${err.message}`);
  }

  const nativeBalance = sourceAccount.balances.find((b) => b.asset_type === "native");
  const currentXlm = nativeBalance ? parseFloat(nativeBalance.balance) : 0;

  if (currentXlm < numAmount) {
    throw new Error(
      `Insufficient balance. You have ${currentXlm.toFixed(4)} XLM, but tried to send ${numAmount} XLM.`
    );
  }

  let baseFee = Horizon.BASE_FEE;
  try {
    baseFee = await horizonServer.fetchBaseFee();
  } catch (e) {
    console.warn("Using default base fee:", e);
  }

  let transaction;
  try {
    const memoText = purpose ? purpose.substring(0, 28) : "Student Pay";
    transaction = new TransactionBuilder(sourceAccount, {
      fee: String(baseFee),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: cleanRecipient,
          asset: Asset.native(),
          amount: String(numAmount),
        })
      )
      .addMemo(Memo.text(memoText))
      .setTimeout(60)
      .build();
  } catch (buildErr) {
    console.error("Transaction construction error:", buildErr);
    throw new Error(`Failed to build transaction: ${buildErr.message}`);
  }

  const unsignedXdr = transaction.toXDR();

  let signedXdr;
  try {
    signedXdr = await signWithFreighter(unsignedXdr, cleanSender);
  } catch (signErr) {
    throw signErr;
  }

  let signedTransaction;
  try {
    signedTransaction = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
  } catch (parseErr) {
    console.error("Error parsing signed XDR:", parseErr);
    throw new Error("Invalid signed transaction format returned from wallet.");
  }

  try {
    const submissionResult = await horizonServer.submitTransaction(signedTransaction);
    return {
      hash: submissionResult.hash,
      ledger: submissionResult.ledger,
      successful: true,
    };
  } catch (submitError) {
    console.error("Horizon transaction submission error:", submitError);
    let userMsg = "Transaction submission failed on Stellar Testnet.";
    
    if (submitError.response && submitError.response.data) {
      const data = submitError.response.data;
      const resultCode = data.extras && data.extras.result_codes;

      if (resultCode) {
        const txCode = resultCode.transaction;
        const opCodes = resultCode.operations || [];

        if (txCode === "tx_bad_auth") {
          userMsg = "Signature authentication failed (tx_bad_auth). Ensure Freighter network is TESTNET.";
        } else if (txCode === "tx_bad_seq") {
          userMsg = "Transaction sequence error. Please retry.";
        } else if (txCode === "tx_insufficient_fee") {
          userMsg = "Insufficient fee provided for Testnet congestion.";
        } else if (opCodes.includes("op_no_destination")) {
          userMsg = "Destination account is unfunded. Recipient account must be activated on Testnet.";
        } else if (opCodes.includes("op_underfunded")) {
          userMsg = "Insufficient XLM balance to complete payment and cover account minimum reserve.";
        }
      }
    }

    const errObj = new Error(userMsg);
    errObj.raw = submitError.response ? submitError.response.data : submitError.message;
    throw errObj;
  }
}
