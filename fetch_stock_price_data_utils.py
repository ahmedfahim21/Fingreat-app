from datetime import datetime
import pandas as pd
import os

nifty_50_companies = ['HDFCBANK', 'RELIANCE', 'ICICIBANK', 'INFY', 'ITC', 'BHARTIARTL', 'TCS', 'LT', 'AXISBANK', 'SBIN', 'M&M', 'KOTAKBANK', 'HINDUNILVR', 'BAJFINANCE', 'NTPC', 'SUNPHARMA', 'TATAMOTORS', 'HCLTECH', 'MARUTI', 'TRENT', 'POWERGRID', 'TITAN', 'ASIANPAINT', 'TATASTEEL', 'BAJAJ-AUTO', 'ULTRACEMCO', 'COALINDIA', 'ONGC', 'HINDALCO', 'BAJAJFINSV', 'ADANIPORTS', 'GRASIM', 'BEL', 'SHRIRAMFIN', 'TECHM', 'JSWSTEEL', 'NESTLEIND', 'INDUSINDBK', 'CIPLA', 'SBILIFE', 'DRREDDY', 'TATACONSUM', 'HDFCLIFE', 'WIPRO', 'ADANIENT', 'HEROMOTOCO', 'BRITANNIA', 'APOLLOHOSP', 'BPCL', 'EICHERMOT']

def get_stock_price(company_name: str, input_date: str, data_folder: str = "./stock_price"):
    """
    Fetches stock price details (Open, High, Low, Close, Volume) for a given company on a specific date.
    
    Parameters:
    
    - company_name (str): The company name as per the JSON mapping.
    - day (str): The day in format 'DD'.
    - month (str): The month in format 'MM'.
    - year (str): The year in format 'YYYY'.
    - data_folder (str): Path to the folder containing CSV files.

    Returns:
    - dict: Stock price details (Open, High, Low, Close, Volume) or None if not found.
    """
    
    date_str = input_date.split(" ")[0] 
    date=date_str
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
    except Exception as e:
        print(f"Error reading {csv_file}: {e}")
        return None

    # Search for the date
    stock_data = df[df['Date'] == date]
    if stock_data.empty:
        print(f"No data found for {company_name} on {date}.")
        return None

    # Extract required columns
    stock_details = stock_data.iloc[0][["Open", "High", "Low", "Close", "Volume"]].to_dict()

    return stock_details


if __name__ == "__main__":
    result = get_stock_price("TCS", "2021-03-01 11:05:00.000")
    if result:
        print("Stock Data:", result)