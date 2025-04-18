// --- Mapping NIFTY 50 symbols to company names ---
export const symbolToNameMap: Record<string, string> = {
  ADANIENT: "Adani Enterprises Ltd.",
  ADANIPORTS: "Adani Ports and SEZ Ltd.",
  APOLLOHOSP: "Apollo Hospitals Enterprise Ltd.",
  ASIANPAINT: "Asian Paints Ltd.",
  AXISBANK: "Axis Bank Ltd.",
  "BAJAJ-AUTO": "Bajaj Auto Ltd.",
  BAJAJFINSV: "Bajaj Finserv Ltd.",
  BAJFINANCE: "Bajaj Finance Ltd.",
  BEL: "Bharat Electronics Ltd.",
  BHARTIARTL: "Bharti Airtel Ltd.",
  BPCL: "Bharat Petroleum Corporation Ltd.",
  BRITANNIA: "Britannia Industries Ltd.",
  CIPLA: "Cipla Ltd.",
  COALINDIA: "Coal India Ltd.",
  DRREDDY: "Dr. Reddy's Laboratories Ltd.",
  EICHERMOT: "Eicher Motors Ltd.",
  GRASIM: "Grasim Industries Ltd.",
  HCLTECH: "HCL Technologies Ltd.",
  HDFCBANK: "HDFC Bank Ltd.",
  HDFCLIFE: "HDFC Life Insurance Company Ltd.",
  HEROMOTOCO: "Hero MotoCorp Ltd.",
  HINDALCO: "Hindalco Industries Ltd.",
  HINDUNILVR: "Hindustan Unilever Ltd.",
  ICICIBANK: "ICICI Bank Ltd.",
  INDUSINDBK: "IndusInd Bank Ltd.",
  INFY: "Infosys Ltd.",
  ITC: "ITC Ltd.",
  JSWSTEEL: "JSW Steel Ltd.",
  KOTAKBANK: "Kotak Mahindra Bank Ltd.",
  LT: "Larsen & Toubro Ltd.",
  "M&M": "Mahindra & Mahindra Ltd.",
  MARUTI: "Maruti Suzuki India Ltd.",
  NESTLEIND: "Nestle India Ltd.",
  NTPC: "NTPC Ltd.",
  ONGC: "Oil and Natural Gas Corporation Ltd.",
  POWERGRID: "Power Grid Corporation of India Ltd.",
  RELIANCE: "Reliance Industries Ltd.",
  SBILIFE: "SBI Life Insurance Company Ltd.",
  SBIN: "State Bank of India",
  SHRIRAMFIN: "Shriram Finance Ltd.",
  SUNPHARMA: "Sun Pharmaceutical Industries Ltd.",
  TATACONSUM: "Tata Consumer Products Ltd.",
  TATAMOTORS: "Tata Motors Ltd.",
  TATASTEEL: "Tata Steel Ltd.",
  TCS: "Tata Consultancy Services Ltd.",
  TECHM: "Tech Mahindra Ltd.",
  TITAN: "Titan Company Ltd.",
  TRENT: "Trent Ltd.",
  ULTRACEMCO: "UltraTech Cement Ltd.",
  WIPRO: "Wipro Ltd."
};



// --- Single function to fetch and transform backend data ---
export async function fetchStocksData(): Promise<Array<{ symbol: string; name: string; price: number; change: number; changePercent: number }>> {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/market_prices");

  const rawData: Record<string, { price: number; change: number }> = await response.json();

  return Object.entries(rawData).map(([symbol, data]) => {
    const name = symbolToNameMap[symbol] || "Unknown Company";
    const changePercent = Number(((data.change / (data.price - data.change)) * 100).toFixed(2));
    return {
      symbol,
      name,
      price: data.price,
      change: data.change,
      changePercent,
    };
  });
}

// --- Get single stock ---
export async function getStockData(symbol: string) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL+ `/market_price/${symbol}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch data for symbol: ${symbol}`);
    }

    const rawData = await response.json();

    const name = symbolToNameMap[symbol] || "Unknown Company";
    const { price, change } = rawData || {};
    if (price === undefined || change === undefined) {
      throw new Error(`Incomplete data for symbol: ${symbol}`);
    }

    const changePercent = Number(((change / (price - change)) * 100).toFixed(2));

    return {
      symbol,
      name,
      price,
      change,
      changePercent,
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
}


// --- Fetch stock price history ---
export async function fetchStockPriceHistory(symbol: string, startDate: string, endDate: string) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/time_series_price?company=${symbol}&from_date=${startDate}&to_date=${endDate}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price history for symbol: ${symbol}`);
    }

    const rawData = await response.json();
    return rawData;
  } catch (error) {
    console.error("Error fetching stock price history:", error);
    throw error;
  }
}