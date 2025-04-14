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


class APIKeyManager:
    def __init__(self, key_count=8, requests_per_minute=15):
        self.keys = []
        self.last_used_times = []
        
        # Load API keys
        for i in range(1, key_count + 1):
            key = os.getenv(f"GEMINI_API_KEY_{i}")
            if key:
                self.keys.append(key)
                self.last_used_times.append(0)
        
        self.current_index = 0
        self.seconds_per_request = 60 / requests_per_minute
        
    def get_next_available_key(self):
        start_index = self.current_index
        
        while True:
            # Check if enough time has passed for the current key
            current_time = time.time()
            time_since_last_use = current_time - self.last_used_times[self.current_index]
            
            if time_since_last_use >= self.seconds_per_request:
                # This key is available
                key = self.keys[self.current_index]
                self.last_used_times[self.current_index] = current_time
                
                # Move to the next key for the next request
                self.current_index = (self.current_index + 1) % len(self.keys)
                
                return key
            else:
                # This key needs more time, try the next one
                self.current_index = (self.current_index + 1) % len(self.keys)
                
                # If we've checked all keys and come back to the start, wait for the first key to become available
                if self.current_index == start_index:
                    wait_time = self.seconds_per_request - time_since_last_use + 0.1  # Add a small buffer
                    time.sleep(wait_time)

# Initialize the key manager
key_manager = APIKeyManager()

def query_gemini(prompts, system_prompt=None):
    """
    Queries the Gemini model with an optional system prompt,
    using a rotation of API keys to avoid rate limiting.

    Args:
        prompt (str): The user prompt to send to the model.
        system_prompt (str, optional): System-level instructions to prepend to the user prompt.

    Returns:
        str: The model's response.
    """
    # Get the next available API key
    api_key = key_manager.get_next_available_key()
    
    # Configure genai with the current key
    genai.configure(api_key=api_key)
    
    # Create the model with the current API key
    model = genai.GenerativeModel("gemini-2.0-flash-001")
    
    # Combine system prompt and user prompt if system_prompt is provided
    if system_prompt:
        full_prompt = f"{system_prompt}\n\n{prompts}"
    else:
        full_prompt = prompts

    # Send the request
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
