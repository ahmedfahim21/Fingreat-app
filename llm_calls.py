import os
import time
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
from groq import Groq
import openai


genai.configure(api_key=os.getenv("GEMINI_API_KEY_3"))

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def query_open_ai(prompt):
    client = openai.OpenAI(api_key=os.environ.get("OPEN_AI_KEY"))
    
    response = client.responses.create(
    model="o3-mini",
    input=prompt
    )

    return response.output[1].content[0].text

def query_gemini(prompts, system_prompt=None):
    """
    Queries the Gemini model with an optional system prompt.

    Args:
        prompt (str): The user prompt to send to the model.
        system_prompt (str, optional): System-level instructions to prepend to the user prompt.

    Returns:
        str: The model's response.
    """
    # time.sleep(5)
    model = genai.GenerativeModel("gemini-2.0-flash-001")
    
    # Combine system prompt and user prompt if system_prompt is provided
    if system_prompt:
        full_prompt = f"{system_prompt}\n\n{prompts}"
    else:
        full_prompt = prompts


    # print(full_prompt)

    response = model.generate_content(full_prompt)
    return response.text
    
# def query_groq(prompt):
#     time.sleep(5) 
#     chat_completion = client.chat.completions.create(
#     messages=[
#         {"role": "system", "content": "Return all the answers in valid json"},
#         {
#             "role": "user",
#             "content": prompt,
#         }
#     ],
#         model="llama-3.3-70b-specdec",
#     )

#     result = chat_completion.choices[0].message.content
#     return result


if __name__ == "__main__":
    prompt = "Write a hello world program in Python"
    response = query_gemini(prompt)
    print(response)
