// Real-time exchange rate service with fallback handling for Stellar XLM

let cachedRates = {
  USD: 0.115, // Default fallback 1 XLM ≈ $0.115
  INR: 9.60,  // Default fallback 1 XLM ≈ ₹9.60
  lastUpdated: Date.now(),
};

/**
 * Fetches current XLM exchange rates against USD and INR.
 * Uses CoinGecko public API with graceful fallback to cached/static rates.
 * @returns {Promise<{ USD: number, INR: number, isFallback: boolean, lastUpdated: string }>}
 */
export async function getXlmExchangeRates() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,inr",
      { cache: "no-cache" }
    );

    if (!response.ok) {
      throw new Error(`Exchange API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.stellar && data.stellar.usd && data.stellar.inr) {
      cachedRates = {
        USD: data.stellar.usd,
        INR: data.stellar.inr,
        lastUpdated: Date.now(),
      };
      return {
        USD: data.stellar.usd,
        INR: data.stellar.inr,
        isFallback: false,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    }
    throw new Error("Invalid response format from Exchange Rate API.");
  } catch (err) {
    console.warn("Exchange rate fetch failed, using fallback rates:", err.message);
    return {
      USD: cachedRates.USD,
      INR: cachedRates.INR,
      isFallback: true,
      lastUpdated: new Date(cachedRates.lastUpdated).toLocaleTimeString(),
    };
  }
}

/**
 * Converts an XLM amount into estimated fiat values (USD & INR).
 * @param {number|string} amountXlm
 * @param {{ USD: number, INR: number }} rates
 * @returns {{ usdValue: string, inrValue: string }}
 */
export function convertXlmToFiat(amountXlm, rates = cachedRates) {
  const num = parseFloat(amountXlm) || 0;
  return {
    usdValue: (num * rates.USD).toFixed(2),
    inrValue: (num * rates.INR).toFixed(2),
  };
}
