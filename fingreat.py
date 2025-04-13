from datetime import datetime, timedelta
import json
import pandas as pd
from llm_calls import query_gemini, query_open_ai
from fetch_stock_price_data_utils import get_stock_price
from similarity_search import search_similar
from company_financials import generate_financial_report
import json
from templates import (
    FACTORS_GENERATION_PROMPT_TEMPLATE,
    NLP_REPRESENTATION_FEW_SHOT_TIME_SERIES_PROMPT_TEMPLATE,
    NLP_REPRESENTATION_FEW_SHOT_TIME_SERIES_PROMPT_TEMPLATE_NO_NEWS_DAY_DATA,
    NLP_REPRESENTATION_LAST_N_DAYS_PROMPT_TEMPLATE,
    FIND_IMPORTANT_RELATIONS_PROMPT_TEMPLATE,
    SUMMARISE_KG_TUPLES_PROMPT_TEMPLATE,
    NIFTY_50_COMPANIES,
    NEWS_COMPANY_TO_KG_TICKER,
    KG_NODES_MAPPING,
)

def search_similar_news(news_article):
    result = search_similar(news_article)
    return result

def get_knowledge_graph_summary(news_article, company_ticker):
    def load_knowledge_graph(filepath):
        kg = {}
        with open(filepath, 'r') as file:
            for line in file:
                entity1, relation, entity2 = line.strip().strip('()').split(', ')
                if entity1 not in kg:
                    kg[entity1] = []
                kg[entity1].append((relation, entity2))
        return kg
    
    def fetch_all_edges(kg, entity):
        return set([pair[0] for pair in kg.get(entity, [])])
    
    def fetch_relevant_relations(kg, important_edges):
        relevant_relations = []
        all_entity_relations = kg.get(KG_NODES_MAPPING[company_ticker], [])
        for edge, entity in all_entity_relations:
            if edge in important_edges:
                relevant_relations.append((KG_NODES_MAPPING[company_ticker], edge, entity))
        return relevant_relations

    kg_filepath = 'final_kg.txt'
    kg = load_knowledge_graph(kg_filepath)
    relations = fetch_all_edges(kg, KG_NODES_MAPPING[company_ticker])
    find_important_relations_prompt = FIND_IMPORTANT_RELATIONS_PROMPT_TEMPLATE.format(relations, KG_NODES_MAPPING[company_ticker], news_article)
    result = query_gemini(find_important_relations_prompt)
    important_edges = to_json(result)["important_relations"]

    fetched_relations = fetch_relevant_relations(kg, important_edges)
    
    summarise_kg_tuples_prompt = SUMMARISE_KG_TUPLES_PROMPT_TEMPLATE.format(fetched_relations)

    result = to_json(query_gemini(summarise_kg_tuples_prompt))
    result = result["summary"]
    
    return result


def to_json(json_string):
    try:
        first_curly_index = json_string.find("{")
        last_curly_index = json_string.rfind("}")
        result = json_string[first_curly_index:last_curly_index+1]
        json_string = json.loads(result)
        return json_string
    except:
        print("Error parsing JSON!!!!!!!!!!!!!!!!!!!")
        exit(1)
        
def generate_factors(news_article, company_name):
    prompt = FACTORS_GENERATION_PROMPT_TEMPLATE.format(company_name, news_article)
    result = to_json(query_gemini(prompt))

    return result["factor"]

def fetch_financials(compay_ticker):
    financial_report = generate_financial_report(compay_ticker)
    return financial_report

def get_other_day_stock(company, input_date, previous_day = True):
    date_str, _ = input_date.split(" ")  
    result = None
    counter = 1
    date = datetime.strptime(date_str, "%Y-%m-%d")
    while result is None:
        new_date = date - timedelta(days=counter) if previous_day else date + timedelta(days=counter)
        result = get_stock_price(company, new_date.strftime("%Y-%m-%d"))
        counter += 1
    return result

import json

def generate_timeseries_nlp_representations_for_examples(stock_price_last_working_day, stock_price_that_day, stock_price_next_working_day):
    stock_price_info = f'''
        Stock Price on Last Working Day: {stock_price_last_working_day}
    '''
    
    if stock_price_that_day: 
        stock_price_info += f'''
        Stock Price on News Day: {stock_price_that_day}
        '''

    stock_price_info += f'''
        Stock Price on Next Working Day: {stock_price_next_working_day}
    '''
    
    prompt = ""
    if stock_price_that_day:
        prompt = NLP_REPRESENTATION_FEW_SHOT_TIME_SERIES_PROMPT_TEMPLATE.format(stock_price_info)
    else:
        prompt = NLP_REPRESENTATION_FEW_SHOT_TIME_SERIES_PROMPT_TEMPLATE_NO_NEWS_DAY_DATA.format(stock_price_info)

    result = to_json(query_gemini(prompt))

    output = f'''
        Stock Price Movement on Last working day: {result["pre-day"]}
    '''

    if stock_price_that_day: 
        output += f'''
        Stock Price Movement on News Day: {result["news-day"]}
        '''

    output += f'''
        Stock Price Movement on Next Working Day: {result["post-day"]}
    '''

    return output



def get_nlp_representation_last_n_working_days(company, date_time_str):
    date_str, _ = date_time_str.split(" ")  
    date = datetime.strptime(date_str, "%Y-%m-%d")  

    offsets = [-1, -2, -3, -4, -5] 

    stock_prices = []
    seen_dates = set()  

    for offset in offsets:
        counter = offset
        while True:
            new_date = date + timedelta(days=counter)  
            new_date_str = new_date.strftime("%Y-%m-%d")
            
            if new_date_str in seen_dates:
                counter -= 1
                continue

            print(f"Fetching stock price for {new_date_str}")
            stock_price = get_stock_price(company, new_date_str)

            if stock_price is not None: 
                stock_prices.append({"date": new_date_str, "price": stock_price})
                seen_dates.add(new_date_str) 
                break  

            counter -= 1

    prompt = NLP_REPRESENTATION_LAST_N_DAYS_PROMPT_TEMPLATE.format(stock_prices)
    response = to_json(query_gemini(prompt))
    return response["summary"]


def get_nifty50_companies_from_news_stocks(news_stocks):
    nifty50_companies_involved = []
    l = {
        NEWS_COMPANY_TO_KG_TICKER[comp["sid"]]
        for comp in eval(news_stocks)
        if comp["sid"] in NEWS_COMPANY_TO_KG_TICKER
    }
    for company in l:
        if NIFTY_50_COMPANIES.count(company) >= 1 :
            nifty50_companies_involved.append(company)
    return nifty50_companies_involved