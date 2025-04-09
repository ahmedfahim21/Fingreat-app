FACTORS_GENERATION_PROMPT_TEMPLATE = '''Please analyze the provided news and pinpoint the top 3 major factors impacting the stock price of {}. 
        Be concise, state each point as just one sentence with reasoning. 

        News: {} 

        Provide the response in valid JSON format:
        {{
            "factor": ["Factor 1", "Factor 2", "Factor 3"]
        }}'''

FEW_SHOT_PROMPT_TEMPLATE = ''' 
    You are an expert financial analyst tasked with predicting the impact of a news event on the stock price of {}.  
    You have been provided with key information that could influence the stock price. Your job is to analyze this data thoroughly and determine whether the stock price is likely going UP, DOWN or NEUTRAL.
    To assist you in making an informed decision, I have included examples of past situations which includes some situations and how they affected the immediately affected the stock price. Carefully evaluate the information, draw logical conclusions, and assess the likely market reaction.      
    {}
'''

NLP_REPRESENTATION_FEW_SHOT_TIME_SERIES_PROMPT_TEMPLATE = '''
    You are a stock market analyst responsible for evaluating how a company's stock has reacted around a news event. You will analyze stock price movements for three key dates:
    1. Pre-News Day (the last working day before the news was published)
    2. News Day (the day the news was published)
    3. Post-News Day (the next working day after the news was published)
    
    Convert the given time-series stock data into a clear, natural language summary that explains the movement of the stock price in an insightful but concise manner.
    
    Respond in JSON format:
    {{
    "pre-day": <explanation>
    "news-day": <explanation>
    "post-day": <explanation>
    }}

    Stock Price Data:
    {}
'''

NLP_REPRESENTATION_FEW_SHOT_TIME_SERIES_PROMPT_TEMPLATE_NO_NEWS_DAY_DATA = '''
    You are a stock market analyst responsible for evaluating how a company's stock has reacted around a news event. The stock market was closed on the news day, so there is no available data for that day. Thus, you will analyze stock price movements for two key dates:

    1. **Pre-News Day** (the last working day before the news was published)
    2. **Post-News Day** (the next working day after the news was published)

    Convert the given time-series stock data into a clear, natural language summary that explains the movement of the stock price in an insightful but concise manner.

    Respond in JSON format:
    {{
    "pre-day": <explanation>,
    "post-day": <explanation>
    }}

    **Stock Price Data:**
    {}
'''

FEW_SHOT_PROMPT_EXAMPLES_TEMPLATE = '''
    "Company: {} \n 
    Situation: {} \n 
    Stock Movement price information around that time: \n {} \n
'''

FEW_SHOT_PROMPT_TEMPLATE_END = '''
   Based on the information provided, analyze the situation carefully and predict the stock price movement.  
   Respond in JSON format:
   
   {{
    "result": "UP/DOWN/NEUTRAL",
    "explanation": "Detailed reasoning behind the prediction."
   }}

    Here is the current situation for your analysis:  
    {}

'''

NLP_REPRESENTATION_LAST_N_DAYS_PROMPT_TEMPLATE = '''
    I have collected stock data for an Indian company over the last few days. Can you summarize the time-series data in natural language?  
    Please keep it concise. 
    Respond in JSON format:  
    {{
        "summary": <natural language summary>
    }}

    Stock Data:
    {}
'''

COMPANY_FINANCIALS_PROMPT_TEMPLATE = '''You are an expert financial analyst tasked with analyzing company financials and providing deep insights.  

For reference, today is a day in February 2025. Here is the financial information:
{}

Respond in JSON format:  

{{
    "quarterlyAnalysis": {{
        "revenueGrowth": <analysis>,
        "profitStability": <analysis>,
        "marginTrend": <analysis>
    }},
    "yearlyAnalysis": {{
        "revenueGrowth": <analysis>,
        "profitGrowth": <analysis>,
        "assetExpansion": <analysis>,
        "cashFlow": <analysis>
    }},
    "cumulativeAnalysis": {{
        "salesGrowth": <analysis>,
        "profitGrowth": <analysis>,
        "stockPerformance": <analysis>,
        "returnOnEquity": <analysis>
    }},
    "ttmAnalysis": {{
        "revenuePerformance": <analysis>,
        "profitability": <analysis>,
        "marginObservation": <analysis>
    }}
}}

'''

REFINE_DECISION_PROMPT_TEMPLATE_1 = '''
    I want to analyze the impact of a news article on a company's stock price.

    The situation is influenced by {}, and based on these, an expert has predicted that the stock price will {} due to the following reason: {}.

    However, I want to focus more on the company's background and fundamentals and assess whether you still agree with this prediction. Do you maintain the same outlook, or do you have a different opinion?
    Keep in mind, you are making a prediction to access the immediate impact of the news, let's say within in the next 72 hours.
    Think step by step like a financial analyst. Be concise with your explanation. Provide your response in JSON format:
    {{
        "result": "UP/DOWN/NEUTRAL",
        "explanation": "Detailed reasoning behind the prediction."
    }}

    Here is some background information on the company: \n {}
    Company Financials: \n {}
'''

REFINE_DECISION_PROMPT_TEMPLATE_2 = '''
I want to analyze the impact of a news article on a company's stock price.

The situation is influenced by {}, and an expert—after analyzing these factors along with the company's financial statements—has predicted that the stock price will {} due to {}.

I am also providing the last 5 days of market movement data for the stock. Based on this additional data, do you still agree with the expert's prediction, or do you have a different opinion?
Keep in mind, you are making a prediction to access the immediate impact of the news, let's say within in the next 72 hours.
Think step by step like a financial analyst. Be concise with your explanation. Provide your response in JSON format:
{{
    "result": "UP/DOWN/NEUTRAL",
    "explanation": "Detailed reasoning behind the prediction."
}}

Market Data: {}
'''

FIND_IMPORTANT_RELATIONS_PROMPT_TEMPLATE = '''
    I want to analyze the impact of a news article on the stock price of the company the news is about. Given a set of relations, I need to determine which of these relations are most relevant to assessing the impact of the news on the company's stock.  

    Consider the following list of possible relations:  
    {}

    Your task is to identify the most important relations from this list that are relevant to understanding the impact of the given news on the company's stock price.  

    Please provide the response in JSON format:  
    
    {{
        "important_relations": ["RelevantRelation1", "RelevantRelation2", "RelevantRelation3"]
    }}

    News about {}: \n {}

'''

SUMMARISE_KG_TUPLES_PROMPT_TEMPLATE = '''
    I have extracted some information from a Knowledge Graph in the form of tuples of the format (source entity, relation, target entity).
    I need you to summarize the extracted information in a more understandable and concise manner.
    List of Knowledge Graph Tuples: \n {}.

    Respond in JSON format:
    {{"summary": "Summarized information"}}
'''

NIFTY_50_COMPANIES = ['HDFCBANK', 'RELIANCE', 'ICICIBANK', 'INFY', 'ITC', 'BHARTIARTL', 'TCS', 'LT', 'AXISBANK', 'SBIN', 'M&M', 'KOTAKBANK', 'HINDUNILVR', 'BAJFINANCE', 'NTPC', 'SUNPHARMA', 'TATAMOTORS', 'HCLTECH', 'MARUTI', 'TRENT', 'POWERGRID', 'TITAN', 'ASIANPAINT', 'TATASTEEL', 'BAJAJ-AUTO', 'ULTRACEMCO', 'COALINDIA', 'ONGC', 'HINDALCO', 'BAJAJFINSV', 'ADANIPORTS', 'GRASIM', 'BEL', 'SHRIRAMFIN', 'TECHM', 'JSWSTEEL', 'NESTLEIND', 'INDUSINDBK', 'CIPLA', 'SBILIFE', 'DRREDDY', 'TATACONSUM', 'HDFCLIFE', 'WIPRO', 'ADANIENT', 'HEROMOTOCO', 'BRITANNIA', 'APOLLOHOSP', 'BPCL', 'EICHERMOT']

NEWS_COMPANY_TO_KG_TICKER = {
    "APLH": "APOLLOHOSP",
    "APSE": "ADANIPORTS",
    "ASPN": "ASIANPAINT",
    "AXBK": "AXISBANK",
    "BAJA": "BAJAJ-AUTO",
    "BJFN": "BAJAJFINSV",
    "BJFS": "BAJFINANCE",
    "BRTI": "BHARTIARTL",
    "BRIT": "BRITANNIA",
    "BPCL": "BPCL",
    "CIPL": "CIPLA",
    "COAL": "COALINDIA",
    "EICH": "EICHERMOT",
    "GRAS": "GRASIM",
    "HALC": "HINDALCO",
    "HCLT": "HCLTECH",
    "HDBK": "HDFCBANK",
    "HDFC": "HDFCBANK",
    "HLL": "HINDUNILVR",
    "HROM": "HEROMOTOCO",
    "ICBK": "ICICIBANK",
    "INFY": "INFY",
    "ITC": "ITC",
    "JSTL": "JSWSTEEL",
    "KTKM": "KOTAKBANK",
    "MAHM": "M&M",
    "MRTI": "MARUTI",
    "NEST": "NESTLEIND",
    "NTPC": "NTPC",
    "ONGC": "ONGC",
    "REDY": "DRREDDY",
    "RELI": "RELIANCE",
    "SBI": "SBIN",
    "SBIL": "SBILIFE",
    "SUN": "SUNPHARMA",
    "TACN": "TATACONSUM",
    "TAMO": "TATAMOTORS",
    "TAMdv": "TATAMOTORS",
    "TCS": "TCS",
    "TISC": "TATASTEEL",
    "TITN": "TITAN",
    "ULTC": "ULTRACEMCO",
    "WIPR": "WIPRO"
}

KG_NODES_MAPPING = {
    "ADANIENT": "Adani Enterprises Limited",
    "APOLLOHOSP": "Apollo Hospitals Enterprise Ltd",
    "ASIANPAINT": "Asian Paints Limited",
    "AXISBANK": "Axis Bank Limited",
    "BAJAJ-AUTO": "Bajaj Auto Limited",
    "BAJFINANCE": "Bajaj Finance Limited",
    "BAJAJFINSV": "Bajaj Finserv Limited",
    "BHARTIARTL": "Bharti Airtel Limited",
    "BRITANNIA": "Britannia Industries Limited",
    "CIPLA": "Cipla Limited",
    "COALINDIA": "Coal India Limited",
    "DRREDDY": "Dr. Reddy's Laboratories",
    "EICHERMOT": "Eicher Motors",
    "GRASIM": "Grasim Industries Limited",
    "HCLTECH": "HCLTech",
    "HDFCBANK": "HDFC Bank Limited",
    "HDFCLIFE": "HDFC Life Insurance Company Limited",
    "HEROMOTOCO": "Hero MotoCorp",
    "HINDALCO": "Hindalco Industries Limited",
    "HINDUNILVR": "Hindustan Unilever Limited",
    "ICICIBANK": "ICICI Bank Limited",
    "INDUSINDBK": "IndusInd Bank",
    "INFY": "Infosys Limited",
    "ITC": "ITC Limited",
    "JSWSTEEL": "JSW Steel",
    "KOTAKBANK": "Kotak Mahindra Bank Limited",
    "LT": "Larsen & Toubro Limited",
    "M&M": "Mahindra & Mahindra Limited",
    "MARUTI": "Maruti Suzuki India Limited",
    "NESTLEIND": "Nestlé India Limited",
    "NTPC": "NTPC Limited",
    "ONGC": "Oil & Natural Gas Corporation (ONGC)",
    "POWERGRID": "Power Grid Corporation of India Limited",
    "RELIANCE": "Reliance Industries Limited",
    "SBIN": "State Bank of India",
    "SUNPHARMA": "Sun Pharmaceutical Industries Ltd",
    "TCS": "Tata Consultancy Services",
    "TATACONSUM": "Tata Consumer Products",
    "TATAMOTORS": "Tata Motors Limited",
    "TATASTEEL": "Tata Steel Limited",
    "TECHM": "Tech Mahindra",
    "TITAN": "Titan Company Limited",
    "ULTRACEMCO": "UltraTech Cement Limited",
    "WIPRO": "Wipro",
    "TRENT": "Trent Limited",
    "ADANIPORTS": "Adani Ports & SEZ",
    "BEL": "Bharat Electronics Limited",
    "BPCL": "BPCL",
    "SHRIRAMFIN": "Shriram Finance Limited",
    "SBILIFE": "SBI Life Insurance Company Limited",
}
