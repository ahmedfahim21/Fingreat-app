from datetime import datetime
import pandas as pd
import os
import requests
from company_financials import generate_financial_report
from templates import KG_NODES_MAPPING
from llm_calls import query_gemini
import json

nifty_50_companies = ['HDFCBANK', 'RELIANCE', 'ICICIBANK', 'INFY', 'ITC', 'BHARTIARTL', 'TCS', 'LT', 'AXISBANK', 'SBIN', 'M&M', 'KOTAKBANK', 'HINDUNILVR', 'BAJFINANCE', 'NTPC', 'SUNPHARMA', 'TATAMOTORS', 'HCLTECH', 'MARUTI', 'TRENT', 'POWERGRID', 'TITAN', 'ASIANPAINT', 'TATASTEEL', 'BAJAJ-AUTO', 'ULTRACEMCO', 'COALINDIA', 'ONGC', 'HINDALCO', 'BAJAJFINSV', 'ADANIPORTS', 'GRASIM', 'BEL', 'SHRIRAMFIN', 'TECHM', 'JSWSTEEL', 'NESTLEIND', 'INDUSINDBK', 'CIPLA', 'SBILIFE', 'DRREDDY', 'TATACONSUM', 'HDFCLIFE', 'WIPRO', 'ADANIENT', 'HEROMOTOCO', 'BRITANNIA', 'APOLLOHOSP', 'BPCL', 'EICHERMOT']

def get_stock_price_range_tool(company_name: str, start_date: str, end_date: str, data_folder: str = "./stock_price"):
    """
    Fetches stock price details (Open, High, Low, Close, Volume) for a given company over a date range.
    
    Parameters:
    - company_name (str): The company name as per the nifty_50_companies list.
    - start_date (str): The start date in format 'YYYY-MM-DD'.
    - end_date (str): The end date in format 'YYYY-MM-DD'.
    - data_folder (str): Path to the folder containing CSV files.

    Returns:
    - DataFrame: Stock price details (Date, Open, High, Low, Close, Volume) or None if not found.
    """
    
    # Get the symbol for the company
    company_name = company_name.upper()
    if company_name not in nifty_50_companies:
        print(f"Error: Symbol not found for {company_name}.")
        return None

    # Construct the file path
    csv_file = os.path.join(data_folder, f"{company_name}.csv")

    # Check if the file exists
    if not os.path.exists(csv_file):
        print(f"Error: Data file {csv_file} not found.")
        return None

    # Read the CSV file
    try:
        df = pd.read_csv(csv_file)
        # Ensure date column is properly formatted
        df['Date'] = pd.to_datetime(df['Date']).dt.date
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    except Exception as e:
        print(f"Error processing {csv_file}: {e}")
        return None
    
    # Filter for the date range
    stock_data = df[(df['Date'] >= start_date) & (df['Date'] <= end_date)]
    
    if stock_data.empty:
        print(f"No data found for {company_name} between {start_date} and {end_date}.")
        return None

    # Sort by date, ascending
    stock_data = stock_data.sort_values(by='Date')
    
    # Return the DataFrame with selected columns
    return stock_data[["Date", "Open", "High", "Low", "Close", "Volume"]]

def get_company_financials_tool(company): 
    return generate_financial_report(company)

def get_company_background_information_tool(company):
    def load_knowledge_graph(filepath):
        kg = {}
        with open(filepath, 'r') as file:
            for line in file:
                entity1, relation, entity2 = line.strip().strip('()').split(', ')
                if entity1 not in kg:
                    kg[entity1] = []
                kg[entity1].append((relation, entity2))
        return kg
    
    kg_filepath = 'final_kg.txt'
    kg = load_knowledge_graph(kg_filepath)
    all_relations = kg[KG_NODES_MAPPING[company]]
    prompt = "We are talking about the company {company}. Here are the relations: {relations}. Please provide a summary of the company. Respond as a string".format(company=company, relations=all_relations)
    result = query_gemini(prompt)
    return result

def view_upstox_account_balance_tool():
    access_token = os.getenv("UPSTOX_ACCESS_TOKEN")
    url = 'https://api.upstox.com/v2/user/get-funds-and-margin?segment=SEC'

    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return data["data"]["equity"]["available_margin"]
    return 100

def place_upstox_order_tool(instrument_token, order_type, quantity, price, transaction_type):
    access_token = os.getenv("UPSTOX_ACCESS_TOKEN")
    url = 'https://api.upstox.com/v2/order/place'

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }

    price_to_buy_sell = 0
    if order_type == "LIMIT":
        price_to_buy_sell = price
    elif order_type == "MARKET":
        price_to_buy_sell = 0

    order_data = {
        "quantity": quantity,
        "product": "D",  # 'D' for Delivery
        "validity": "DAY",
        "price": price_to_buy_sell,
        "tag": "major_project_application_order",
        "instrument_token": instrument_token,
        "order_type": order_type,
        "transaction_type": transaction_type,
        "disclosed_quantity": 0,
        "trigger_price": 0,
        "is_amo": False
    }

    response = requests.post(url, headers=headers, data=json.dumps(order_data))
    if response.status_code == 200:
        data = response.json()
        return data["data"]["order_id"]
    else:
        print(f"Error placing order: {response.status_code} - {response.text}")
        return None

def get_current_market_price_tool(instrument_token):
    access_token = os.getenv("UPSTOX_ACCESS_TOKEN")

    url = 'https://api.upstox.com/v2/market-quote/ltp?instrument_key={instrument_token}'.format(instrument_token=instrument_token)
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return data["data"][list(data["data"].keys())[0]]["last_price"]
    else:
        print(f"Error fetching market price: {response.status_code} - {response.text}")
        return None

# print(get_stock_price_range_tool("TCS", "2021-03-30", "2023-04-04")
# print(get_company_financials_tool("HDFCBANK"))
# print(get_company_background_information_tool("TCS"))
# print(view_upstox_account_balance_tool())
# print(place_upstox_order("NSE_EQ|INE669E01016", "LIMIT", 1, 5, "BUY"))
# print(get_current_market_price("NSE_EQ|INE669E01016"))