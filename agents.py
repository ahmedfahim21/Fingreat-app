# Type of Agents
# 1. Stock Price Agent - get_stock_price_range_tool - Read past stock data for a company and answer questions accordingly
# 2. Financial Report Agent - get_company_financials_tool - Read past financial data for a company and answer questions accordingly
# 3. Company Background Agent - get_company_background_information_tool - Read past company background information and answer questions accordingly
# 4. Upstox Trading Agent - view_upstox_account_balance_tool, place_upstox_order_tool, get_current_market_price_tool - Make Trades on the Upstox platform on behalf of the user

from llm_calls import query_gemini
import sys
from datetime import datetime, timedelta
import json
import os

from tools import (
    get_stock_price_range_tool,
    get_company_financials_tool,
    get_company_background_information_tool,
    view_upstox_account_balance_tool,
    place_upstox_order_tool,
    get_current_market_price_tool
)

from templates import INSTRUMENT_KEYS
from fingreat import to_json

TOOL_DESCRIPTIONS = {
    "get_stock_price_range_tool": {
        "description": "Fetches historical stock price data (OHLCV) for a given Nifty 50 company between a start and end date.",
        "parameters": {
            "company_name": "Name of the company.",
            "start_date": "Start date in format 'YYYY-MM-DD'.",
            "end_date": "End date in format 'YYYY-MM-DD'."
        },
        "returns": "DataFrame containing columns: Date, Open, High, Low, Close, and Volume."
    },
    "get_company_financials_tool": {
        "description": "Retrieves a structured financial report for a given company.",
        "parameters": {
            "company": "Name of the company."
        },
        "returns": (
            "A multi-section textual financial report as a string. "
            "Includes:\n"
            "- Quarterly Performance (Last 4 Quarters)\n"
            "- Yearly Performance (Last 2 Years)\n"
            "- Cumulative Performance Over Time\n"
            "- Trailing Twelve Months (TTM) Performance"
        )
    },
    "get_company_background_information_tool": {
        "description": "Generates a company summary using a knowledge graph of financial entities and relationships.",
        "parameters": {
            "company": "Name of the company."
        },
        "returns": "A summary of all the background information of the company."
    },
    "view_upstox_account_balance_tool": {
        "description": "Returns the available funds for buying stocks/equity from the Upstox trading account.",
        "parameters": {},
        "returns": "A float or integer representing the available fund balance."
    },
    "place_upstox_order_tool": {
        "description": "Places an equity order (BUY/SELL) on Upstox for a given instrument.",
        "parameters": {
            "instrument_token": "Unique instrument key (e.g., 'NSE_EQ|INE669E01016').",
            "order_type": "Either 'LIMIT' or 'MARKET'.",
            "quantity": "Number of shares to trade.",
            "price": "Price to buy/sell share at (0 for MARKET orders).",
            "transaction_type": "Either 'BUY' or 'SELL'."
        },
        "returns": "Order ID string if successful, otherwise None."
    },
    "get_current_market_price_tool": {
        "description": "Fetches the current Last Traded Price (LTP) for a given instrument on Upstox.",
        "parameters": {
            "instrument_token": "Unique instrument key (e.g., 'NSE_EQ|INE669E01016')."
        },
        "returns": "A float representing the current market price of the instrument."
    }
}

# ----------------------------------------------
# Constants and Prompt Templates
# ----------------------------------------------

STOCK_ANALYSIS_SYSTEM_PROMPT = """You are a financial analyst AI. You are provided with the OHLC (Open, High, Low, Close) stock data for {company} from {start_date} to {end_date} and are supposed to answer questions based on what the user asks.
Use trends, volatility, and movement in prices and carefully answer the questions.

Here is the OHLC data:

{ohlc_data}

Be very consice and to the point. Do not add any extra information. Answer in a paragraph. All data is in INR.
"""

FINANCIALS_SYSTEM_PROMPT = """You are a financial expert AI. Based on the financial report for {company}, answer user queries thoughtfully. Provide numerical insight and commentary from the report where needed.

Here is the financial report:

{financial_report}

Be very consice and to the point. Do not add any extra information. Answer in a paragraph. All data is in INR.
"""

BACKGROUND_SYSTEM_PROMPT = """You are a knowledge-based assistant specializing in company backgrounds. Use the summary data for {company} to answer user queries regarding the company's history, management, sectors, etc.

Here is the company background:

{company_background}

Be very consice and to the point. Do not add any extra information. Answer in a paragraph.
"""

TRADING_SYSTEM_PROMPT = f"""You are a trading assistant with access to live account data and trading tools via Upstox. 

You have access to 3 functions which you can invoke:
- view_upstox_account_balance_tool - {TOOL_DESCRIPTIONS["view_upstox_account_balance_tool"]}
- place_upstox_order_tool - {TOOL_DESCRIPTIONS["place_upstox_order_tool"]}
- get_current_market_price_tool - {TOOL_DESCRIPTIONS["get_current_market_price_tool"]}

Respond in this JSON format:
{{
    "function": "<function_name>",
    "arguments": {{
        "key1": "value1",
        "key2": "value2"
    }},
    "response": "<response_to_user>"
}}

Here is a company to instrument map if you need it: {INSTRUMENT_KEYS}

Please only reply with the JSON response. Do not add any extra information or explanation. If you need to ask the user for more information, do so in the response field.
IMPORTANT: Please make sure to confirm the transaction with the user before executing any trading functions.

"""

# ----------------------------------------------
# Global Per-Agent Conversation Store (Per User)
# ----------------------------------------------

user_conversations = {
    "stock_agent": {},
    "financial_agent": {},
    "background_agent": {},
    "trading_agent": {}
}

# ----------------------------------------------
# Agent 1: Stock Price Agent
# ----------------------------------------------

MIN_DATE = "2003-01-01"
MAX_DATE = "2025-04-14"
last_stock_data_context = {}  # Stores last data context per user

def check_if_data_required(query, company_name, existing_start=None, existing_end=None):
    existing_range_str = (
        f"We already have stock price data for {company_name} from {existing_start} to {existing_end}."
        if existing_start and existing_end else
        "We do not have any existing stock data."
    )

    system_prompt = f"""
    You are a helpful financial assistant, helping analyze the company {company_name}.

    The user has asked the following query:
    "{query}"

    {existing_range_str}

    Based on this, do we need to fetch **new stock price data** to better answer the query?

    If yes, respond:
    YES

    If the current data is enough or the query doesn't require stock data, respond:
    NO
    """.strip()

    response = query_gemini(query, system_prompt=system_prompt).strip()
    return response.upper().startswith("YES")


def infer_date_range_from_query(query):
    system_prompt = f"""
    You are an intelligent assistant helping extract date ranges for stock price analysis.
    Given a user query, infer a suitable `start_date` and `end_date` for analysis based on user intent.

    Constraints:
    - Available stock data is from {MIN_DATE} to {MAX_DATE}.
    - Use full YYYY-MM-DD format.
    - If no range is specified, default to last 30 days from {MAX_DATE}.
    - Output only in the format:
    START_DATE: <start>
    END_DATE: <end>
    """.strip()
    
    date_response = query_gemini(query, system_prompt=system_prompt)
    try:
        lines = date_response.strip().splitlines()
        start = next(line for line in lines if line.startswith("START_DATE")).split(":")[1].strip()
        end = next(line for line in lines if line.startswith("END_DATE")).split(":")[1].strip()
        return start, end
    except Exception:
        default_start = (datetime.strptime(MAX_DATE, "%Y-%m-%d") - timedelta(days=30)).strftime("%Y-%m-%d")
        return default_start, MAX_DATE

import re

def extract_dates_from_prompt(prompt):
    """
    Extracts start_date and end_date in YYYY-MM-DD format from the given stock context prompt.
    Returns (start_date, end_date) if found, else (None, None).
    """
    if not prompt:
        return None, None

    # Match date ranges in the format 'from YYYY-MM-DD to YYYY-MM-DD'
    match = re.search(r'from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})', prompt)
    if match:
        start_date, end_date = match.groups()
        return start_date, end_date

    return None, None

def query_stock_price_agent_dynamic(user_id, company_name, query):

    conv = user_conversations["stock_agent"].setdefault(user_id, [])
    conv.append({"user": query})
    existing_context = last_stock_data_context.get(user_id, "")
    existing_start, existing_end = extract_dates_from_prompt(existing_context)  # Your utility to pull from the stored string

    needs_data = check_if_data_required(query, company_name, existing_start, existing_end)


    if needs_data:
        # Fresh stock data fetch
        print("Does need data!!")
        start_date, end_date = infer_date_range_from_query(query)
        df = get_stock_price_range_tool(company_name, start_date, end_date)
        if df.empty:
            conv[-1]["assistant"] = f"No stock data found for {company_name} between {start_date} and {end_date}."
            return conv[-1]["assistant"]

        ohlc_str = df.to_string(index=False)
        last_stock_data_context[user_id] = STOCK_ANALYSIS_SYSTEM_PROMPT.format(
            company=company_name,
            start_date=start_date,
            end_date=end_date,
            ohlc_data=ohlc_str
        )
        # Isolate query to be processed freshly
        conversation_text = f"User: {query}"
        result = query_gemini(system_prompt=last_stock_data_context[user_id], prompts=conversation_text)

    else:
        # Use old context if exists (for follow-ups)
        # print("No data required!!")
        # print("prior context:", last_stock_data_context)
        prior_context = last_stock_data_context.get(user_id, "")
        conversation_text = "\n".join([f"User: {c['user']}\nAssistant: {c.get('assistant', '')}" for c in conv])
        result = query_gemini(system_prompt=prior_context, prompts=conversation_text)

    conv[-1]["assistant"] = result
    # save_conversation_to_file(user_id, "stock_agent", conv)
    return result

# ----------------------------------------------
# Agent 2: Financial Report Agent
# ----------------------------------------------

def query_financial_agent(user_id, company_name, query):
    report = get_company_financials_tool(company=company_name)
    if not report:
        return "No financial data available for this company."

    system_prompt = FINANCIALS_SYSTEM_PROMPT.format(company=company_name, financial_report=report)

    conv = user_conversations["financial_agent"].setdefault(user_id, [])
    conv.append({"user": query})
    conversation_text = "\n".join([f"User: {c['user']}\nAssistant: {c.get('assistant', '')}" for c in conv])

    result = query_gemini(system_prompt=system_prompt, prompts=conversation_text)
    conv[-1]["assistant"] = result
    return result

# ----------------------------------------------
# Agent 3: Company Background Agent
# ----------------------------------------------

def query_background_agent(user_id, company_name, query):
    summary = get_company_background_information_tool(company=company_name)
    if not summary:
        return "No background information available."

    system_prompt = BACKGROUND_SYSTEM_PROMPT.format(company=company_name, company_background=summary)

    conv = user_conversations["background_agent"].setdefault(user_id, [])
    conv.append({"user": query})
    conversation_text = "\n".join([f"User: {c['user']}\nAssistant: {c.get('assistant', '')}" for c in conv])

    result = query_gemini(system_prompt=system_prompt, prompts=conversation_text)
    conv[-1]["assistant"] = result
    return result

# ----------------------------------------------
# Agent 4: Trading Agent (with autonomous reasoning)
# ----------------------------------------------
def query_trading_agent(user_id, query):
    conv = user_conversations["trading_agent"].setdefault(user_id, [])
    conv.append({"user": query})

    system_prompt = TRADING_SYSTEM_PROMPT

    conversation_text = "\n".join([
        f"User: {c['user']}\nAssistant: {c.get('assistant', '')}" for c in conv
    ])

    agent_reply = query_gemini(system_prompt=system_prompt, prompts=conversation_text)
    
    print("Agent Reply:", agent_reply)

    try:
        agent_json = to_json(agent_reply)
    except:
        conv[-1]["assistant"] = agent_reply
        return agent_reply

    function_name = agent_json.get("function")
    response_text = agent_json.get("response", "")

    conv[-1]["assistant"] = response_text

    if function_name:
        tool_args = agent_json.get("arguments", {})

        tool_result = call_trading_tools(function_name, tool_args)

        # Append tool result to conversation
        conv.append({
            "user": f"[Tool result for {function_name}]",
            "assistant": str(tool_result)
        })
    else:
        return response_text


def call_trading_tools(name, args):
    if name == "view_upstox_account_balance_tool":
        return view_upstox_account_balance_tool()
    elif name == "get_current_market_price_tool":
        return get_current_market_price_tool(**args)
    elif name == "place_upstox_order_tool":
        return place_upstox_order_tool(**args)
    else:
        return f"Unknown tool: {name}"



if __name__ == "__main__":

    print("Welcome to the Trading Agent!")
    user_id = "terminal_user"
    company_name = ""
    query = ""

while True:
    query = input("Enter your query: ").strip()
    try:
        response = query_trading_agent(user_id, query)
        print(response)
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)