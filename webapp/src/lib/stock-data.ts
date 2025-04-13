// Mock data for NIFTY 50 stocks
// export const nifty50Stocks = [
//   { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2876.45, change: 23.75, changePercent: 0.83 },
//   { symbol: "TCS", name: "Tata Consultancy Services Ltd.", price: 3542.3, change: -15.2, changePercent: -0.43 },
//   { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1678.9, change: 12.45, changePercent: 0.75 },
//   { symbol: "INFY", name: "Infosys Ltd.", price: 1456.75, change: -8.3, changePercent: -0.57 },
//   { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 987.65, change: 5.4, changePercent: 0.55 },
//   { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", price: 2543.2, change: -12.35, changePercent: -0.48 },
//   { symbol: "SBIN", name: "State Bank of India", price: 654.3, change: 7.85, changePercent: 1.21 },
//   { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", price: 876.45, change: 9.3, changePercent: 1.07 },
//   { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", price: 7654.25, change: -45.7, changePercent: -0.59 },
//   { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd.", price: 1876.3, change: 15.45, changePercent: 0.83 },
//   { symbol: "LT", name: "Larsen & Toubro Ltd.", price: 2765.4, change: 34.25, changePercent: 1.25 },
//   { symbol: "AXISBANK", name: "Axis Bank Ltd.", price: 987.65, change: -5.3, changePercent: -0.53 },
//   { symbol: "ASIANPAINT", name: "Asian Paints Ltd.", price: 3245.75, change: -23.45, changePercent: -0.72 },
//   { symbol: "MARUTI", name: "Maruti Suzuki India Ltd.", price: 10234.5, change: 123.45, changePercent: 1.22 },
//   {
//     symbol: "SUNPHARMA",
//     name: "Sun Pharmaceutical Industries Ltd.",
//     price: 1123.45,
//     change: 15.3,
//     changePercent: 1.38,
//   },
//   { symbol: "ITC", name: "ITC Ltd.", price: 432.1, change: 3.25, changePercent: 0.76 },
//   { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", price: 765.3, change: 12.45, changePercent: 1.65 },
//   { symbol: "TITAN", name: "Titan Company Ltd.", price: 2876.45, change: -15.3, changePercent: -0.53 },
//   { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd.", price: 1654.3, change: -12.35, changePercent: -0.74 },
//   { symbol: "WIPRO", name: "Wipro Ltd.", price: 432.1, change: 5.45, changePercent: 1.28 },
//   { symbol: "HCLTECH", name: "HCL Technologies Ltd.", price: 1234.5, change: -7.65, changePercent: -0.62 },
//   { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd.", price: 8765.4, change: 65.3, changePercent: 0.75 },
//   { symbol: "NTPC", name: "NTPC Ltd.", price: 234.5, change: 3.45, changePercent: 1.49 },
//   {
//     symbol: "POWERGRID",
//     name: "Power Grid Corporation of India Ltd.",
//     price: 321.45,
//     change: 4.3,
//     changePercent: 1.35,
//   },
//   { symbol: "GRASIM", name: "Grasim Industries Ltd.", price: 1987.65, change: -12.35, changePercent: -0.62 },
//   {
//     symbol: "ADANIPORTS",
//     name: "Adani Ports and Special Economic Zone Ltd.",
//     price: 876.45,
//     change: 15.3,
//     changePercent: 1.78,
//   },
//   { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", price: 765.3, change: -5.45, changePercent: -0.71 },
//   { symbol: "TATASTEEL", name: "Tata Steel Ltd.", price: 143.25, change: 2.35, changePercent: 1.67 },
//   { symbol: "TECHM", name: "Tech Mahindra Ltd.", price: 1234.5, change: -8.75, changePercent: -0.7 },
//   { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd.", price: 1432.1, change: 12.35, changePercent: 0.87 },
//   { symbol: "NESTLEIND", name: "Nestle India Ltd.", price: 21345.6, change: -123.45, changePercent: -0.58 },
//   { symbol: "BRITANNIA", name: "Britannia Industries Ltd.", price: 4567.8, change: 34.25, changePercent: 0.76 },
//   { symbol: "HINDALCO", name: "Hindalco Industries Ltd.", price: 543.2, change: 7.65, changePercent: 1.43 },
//   { symbol: "ONGC", name: "Oil and Natural Gas Corporation Ltd.", price: 187.65, change: 2.35, changePercent: 1.27 },
//   { symbol: "M&M", name: "Mahindra & Mahindra Ltd.", price: 1432.1, change: 21.35, changePercent: 1.51 },
//   { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd.", price: 5432.1, change: -32.15, changePercent: -0.59 },
//   { symbol: "EICHERMOT", name: "Eicher Motors Ltd.", price: 3456.7, change: 23.45, changePercent: 0.68 },
//   { symbol: "COALINDIA", name: "Coal India Ltd.", price: 321.45, change: 4.35, changePercent: 1.37 },
//   { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd.", price: 5432.1, change: -43.25, changePercent: -0.79 },
//   { symbol: "CIPLA", name: "Cipla Ltd.", price: 1123.45, change: 12.35, changePercent: 1.11 },
//   { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd.", price: 3456.7, change: -23.45, changePercent: -0.67 },
//   { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd.", price: 5432.1, change: 43.25, changePercent: 0.8 },
//   { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd.", price: 3210.45, change: -21.35, changePercent: -0.66 },
//   { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd.", price: 432.1, change: 5.45, changePercent: 1.28 },
//   { symbol: "UPL", name: "UPL Ltd.", price: 765.3, change: -4.35, changePercent: -0.57 },
//   { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd.", price: 876.45, change: 9.35, changePercent: 1.08 },
//   { symbol: "SHREECEM", name: "Shree Cement Ltd.", price: 25432.1, change: -154.35, changePercent: -0.6 },
//   { symbol: "HDFCLIFE", name: "HDFC Life Insurance Company Ltd.", price: 654.3, change: 7.65, changePercent: 1.18 },
//   { symbol: "SBILIFE", name: "SBI Life Insurance Company Ltd.", price: 1234.5, change: 15.35, changePercent: 1.26 },
//   { symbol: "ADANIGREEN", name: "Adani Green Energy Ltd.", price: 1543.2, change: 23.45, changePercent: 1.54 },
// ]

// --- Mapping NIFTY 50 symbols to company names ---
export const symbolToNameMap: Record<string, string> = {
  "ADANIENT": "Adani Enterprises Ltd.",
  "ADANIPORTS": "Adani Ports and Special Economic Zone Ltd.",
  "ASIANPAINT": "Asian Paints Ltd.",
  "AXISBANK": "Axis Bank Ltd.",
  "BAJAJ-AUTO": "Bajaj Auto Ltd.",
  "BAJFINANCE": "Bajaj Finance Ltd.",
  "BAJAJFINSV": "Bajaj Finserv Ltd.",
  "BHARTIARTL": "Bharti Airtel Ltd.",
  "BPCL": "Bharat Petroleum Corporation Ltd.",
  "BRITANNIA": "Britannia Industries Ltd.",
  "CIPLA": "Cipla Ltd.",
  "COALINDIA": "Coal India Ltd.",
  "DIVISLAB": "Divi's Laboratories Ltd.",
  "DRREDDY": "Dr. Reddy's Laboratories Ltd.",
  "EICHERMOT": "Eicher Motors Ltd.",
  "GRASIM": "Grasim Industries Ltd.",
  "HCLTECH": "HCL Technologies Ltd.",
  "HDFCBANK": "HDFC Bank Ltd.",
  "HDFCLIFE": "HDFC Life Insurance Company Ltd.",
  "HEROMOTOCO": "Hero MotoCorp Ltd.",
  "HINDALCO": "Hindalco Industries Ltd.",
  "HINDUNILVR": "Hindustan Unilever Ltd.",
  "ICICIBANK": "ICICI Bank Ltd.",
  "ITC": "ITC Ltd.",
  "INFY": "Infosys Ltd.",
  "INDUSINDBK": "IndusInd Bank Ltd.",
  "JSWSTEEL": "JSW Steel Ltd.",
  "KOTAKBANK": "Kotak Mahindra Bank Ltd.",
  "LT": "Larsen & Toubro Ltd.",
  "M&M": "Mahindra & Mahindra Ltd.",
  "MARUTI": "Maruti Suzuki India Ltd.",
  "NESTLEIND": "Nestlé India Ltd.",
  "NTPC": "NTPC Ltd.",
  "ONGC": "Oil and Natural Gas Corporation Ltd.",
  "POWERGRID": "Power Grid Corporation of India Ltd.",
  "RELIANCE": "Reliance Industries Ltd.",
  "SBILIFE": "SBI Life Insurance Company Ltd.",
  "SBIN": "State Bank of India",
  "SUNPHARMA": "Sun Pharmaceutical Industries Ltd.",
  "TATACONSUM": "Tata Consumer Products Ltd.",
  "TATAMOTORS": "Tata Motors Ltd.",
  "TATASTEEL": "Tata Steel Ltd.",
  "TCS": "Tata Consultancy Services Ltd.",
  "TECHM": "Tech Mahindra Ltd.",
  "TITAN": "Titan Company Ltd.",
  "UPL": "UPL Ltd.",
  "ULTRACEMCO": "UltraTech Cement Ltd.",
  "WIPRO": "Wipro Ltd.",
  "HINDPETRO": "Hindustan Petroleum Corporation Ltd.",
};

// --- Data transformation function ---
export function transformBackendData(rawData: Record<string, { price: number; change: number }>) {
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

// --- Stock cache ---
export let nifty50Stocks: ReturnType<typeof transformBackendData> = [];

// --- Update from backend ---
export function updateStockDataFromBackend(data: Record<string, { price: number; change: number }>) {
  nifty50Stocks = transformBackendData(data);
}

// --- Get single stock ---
export function getStockData(symbol: string) {
  return nifty50Stocks.find((stock) => stock.symbol === symbol) || null;
}

// --- Fetch from backend and update in-memory stocks ---
export async function fetchAndUpdateStockData(): Promise<void> {
  const response = await fetch("/api/marketprices");
  console.log("Fetching stock data from backend...");
  const rawStockData = await response.json();
  console.log("Fetched stock data from backend:", rawStockData);

  updateStockDataFromBackend(rawStockData);
}

// --- Generate historical price chart (mock) ---
export function generateStockPriceHistory(symbol: string) {
  const stock = getStockData(symbol);
  if (!stock) return [];

  const currentPrice = stock.price;
  const volatility = 0.02;
  const dataPoints = 30;
  const priceHistory = [];

  let lastPrice = currentPrice - Math.random() * currentPrice * 0.1;

  for (let i = 0; i < dataPoints; i++) {
    const change = (Math.random() - 0.48) * volatility * lastPrice;
    lastPrice = lastPrice + change;

    if (i > dataPoints * 0.7) {
      lastPrice = lastPrice + (currentPrice - lastPrice) * 0.1;
    }

    priceHistory.push({
      date: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000),
      price: Number.parseFloat(lastPrice.toFixed(2)),
    });
  }

  priceHistory.push({
    date: new Date(),
    price: currentPrice,
  });

  return priceHistory;
}
