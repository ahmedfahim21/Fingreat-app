import json
import urllib3
import os
import csv
import io
from dotenv import load_dotenv
load_dotenv()

# Date ranges for fetching the data
from_date_1 = "2003-01-01"
to_date_1 = "2010-12-31"

from_date_2 = "2011-01-01"
to_date_2 = "2020-12-31"

from_date_3 = "2021-01-01"
to_date_3 = "2025-04-28"

from templates import INSTRUMENT_KEYS

# Initialize urllib3 pool manager
http = urllib3.PoolManager()

# Hardcoded access token (replace with a valid one if expired)
def get_access_token():
    return os.getenv("UPSTOX_ACCESS_TOKEN")

def fetch_price_for_company(company, from_date, to_date):
    print(f"Fetching data for {company} from {from_date} to {to_date}")
    access_token = get_access_token()
    base_url = "https://api.upstox.com/v2/historical-candle"
    interval = "day"
    url = f"{base_url}/{INSTRUMENT_KEYS[company]}/{interval}/{to_date}/{from_date}"
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    response = http.request('GET', url, headers=headers)
    if response.status == 200:
        candles = json.loads(response.data.decode('utf-8'))['data']['candles']
        formatted_data = [
            [row[0].split("T")[0]] + row[1:] for row in candles
        ]
        return formatted_data
    else:
        error_details = json.loads(response.data.decode('utf-8')) if response.data else {}
        print(f"Error fetching data for {company}: {response.status}, Details: {error_details}")
        return []

def generate_csv_locally(data, company):
    folder = 'stock_price'
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, f"{company}.csv")

    fields = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(fields)
        for row in data:
            writer.writerow(row[:-1])  # Skip the last value (oi)

def main():
    for company in INSTRUMENT_KEYS:
        print(f"Fetching data for: {company}")
        r1 = fetch_price_for_company(company, from_date_1, to_date_1)
        r2 = fetch_price_for_company(company, from_date_2, to_date_2)
        r3 = fetch_price_for_company(company, from_date_3, to_date_3)
        all_data = r3 + r2 + r1
        generate_csv_locally(all_data, company)
        print(f"Saved CSV for {company} with {len(all_data)} rows")

if __name__ == "__main__":
    main()


