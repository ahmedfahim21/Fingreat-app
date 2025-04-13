from fetch_stock_price_data_utils import get_stock_price_range
from llm_calls import query_gemini


STOCK_ANALYSIS_PROMPT = """
You are a financial analyst AI. Analyze the OHLC (Open, High, Low, Close) stock data for {company} from {start_date} to {end_date} and provide:

1. Short-term outlook (1–2 weeks)
2. Medium-term outlook (1–3 months)
3. Long-term outlook (6+ months)

Use trends, volatility, and movement in prices. Mention specific observations from the data.

Here is the OHLC data:

{ohlc_data}
"""


def query_stock_price_agent(company_name, start_date, end_date):
    # Tool to fetch stock market price on a given range
    df = get_stock_price_range(company_name, start_date, end_date) 

    if df.empty:
        return "No data available for the given range."

    ohlc_str = df.to_string(index=False)

    prompt = STOCK_ANALYSIS_PROMPT.format(
        company=company_name,
        start_date=start_date,
        end_date=end_date,
        ohlc_data=ohlc_str
    )

    return query_gemini(prompt)


query_stock_price_agent("TCS", "2021-03-30", "2023-04-04")