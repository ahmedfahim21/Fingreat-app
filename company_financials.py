import json

# Load JSON data
with open('company_financials.json', 'r') as file:
    data = json.load(file)

# Helper function to get either "Revenue" or "Sales"
def get_revenue_or_sales(info):
    return info.get("Revenue") or info.get("Sales")

# Function to extract quarterly information
def extract_quarterly_info(data, company_symbol):
    quarters = ["Dec2024", "Sep2024", "Jun2024", "Mar2024"]
    return [
        f"{quarter}: Revenue - {get_revenue_or_sales(info)} Cr Rupees, Net Profit - {info.get('NetProfit')} Cr Rupees"
        for quarter in quarters
        if (info := data[company_symbol]["quarterlydata"].get(quarter, {}))
    ]

# Function to extract yearly information
def extract_yearly_info(data, company_symbol):
    years = ["Mar2024", "Mar2023"]
    return [
        f"{year}: Revenue - {get_revenue_or_sales(info)} Cr Rupees, Net Profit - {info.get('NetProfit')} Cr Rupees, "
        f"Total Assets - {info.get('TotalAssets')} Cr Rupees, Net Cash Flow - {info.get('NetCashFlow')} Cr Rupees"
        for year in years
        if (info := data[company_symbol]["yearlydata"].get(year, {}))
    ]

# Function to extract cumulative information (adds % sign to all values)
def extract_cumulative_info(data, company_symbol):
    cumulative_data = data[company_symbol]["cumulativedata"]

    def add_percentage(value_dict):
        return {key: f"{value}%" for key, value in value_dict.items()}

    cumulative_info = {
        "Compounded Sales Growth": add_percentage(cumulative_data.get("CompoundedSalesGrowth", {})),
        "Compounded Profit Growth": add_percentage(cumulative_data.get("CompoundedProfitGrowth", {})),
        "Stock Price CAGR": add_percentage(cumulative_data.get("StockPriceCAGR", {})),
        "Return on Equity": add_percentage(cumulative_data.get("ReturnonEquity", {}))
    }

    return [
        f"{key}: {', '.join([f'{k}: {v}' for k, v in value.items()])}"
        for key, value in cumulative_info.items()
    ]

# Function to extract TTM information
def extract_ttm_info(data, company_symbol):
    ttm_data = data[company_symbol]["ttm"].get("TTM", {})
    return f"Total Revenue: {get_revenue_or_sales(ttm_data)} Cr Rupees, Net Profit: {ttm_data.get('NetProfit')} Cr Rupees"

# Function to generate a formatted financial report as a string
def generate_financial_report(company_symbol):
    report = []
    report.append("Quarterly Performance (Last 4 Quarters):")
    report.extend([f"  - {info}" for info in extract_quarterly_info(data, company_symbol)])

    report.append("\nYearly Performance (Last 2 Years):")
    report.extend([f"  - {info}" for info in extract_yearly_info(data, company_symbol)])

    report.append("\nCumulative Performance Over Time:")
    report.extend([f"  - {info}" for info in extract_cumulative_info(data, company_symbol)])

    report.append("\nTrailing Twelve Months (TTM) Performance:")
    report.append(f"  - {extract_ttm_info(data, company_symbol)}")

    return "\n".join(report)

if __name__ == "__main__":
    company_symbol = "HDFCBANK"
    financial_report = generate_financial_report(company_symbol)
    print(financial_report)