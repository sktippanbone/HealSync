import requests
import google.generativeai as genai
import json


OPENFDA_API_KEY = "NOhCvrhSOeyXEywcmqLHjxhgvsCXKoOsMb8ctRcC"
GEMINI_API_KEY = "AIzaSyDZr8Jv90UvuFytin_2JXTC8GwEYpt3YxU"


genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

BASE_URL = "https://api.fda.gov/drug/event.json"

def search_adverse_events(drugs, api_key):
    """Fetch adverse event data from OpenFDA API for given drugs."""
    search_query = " AND ".join([f'patient.drug.medicinalproduct:"{drug}"' for drug in drugs])
    params = {"api_key": api_key, "search": search_query, "limit": 10}
    response = requests.get(BASE_URL, params=params)
    return response.json() if response.status_code == 200 else None

def refine_adverse_events(adverse_events, drugs):
    """Uses Gemini AI to refine and filter critical adverse events."""
    if not adverse_events or "results" not in adverse_events:
        return None
    
    reactions = set()
    for result in adverse_events["results"]:
        for reaction in result["patient"]["reaction"]:
            reactions.add(reaction["reactionmeddrapt"])
    
    if not reactions:
        return None

    # Enhanced AI Prompt
    prompt = f"""
    You are a medical AI expert specializing in drug interactions.
    Your task is to analyze adverse reactions from the following drugs and return the **most critical reactions**.
    
    **Drugs involved**: {json.dumps(drugs)}

    Here are the observed adverse reactions:
    {json.dumps(list(reactions))}

    Please return the most critical reactions in the following structured JSON format:
    {{
        "drugs": {json.dumps(drugs)},
        "critical_adverse_reactions": [
            "Reaction 1",
            "Reaction 2",
            "Reaction 3"
        ]
    }}
    """

    try:
        response = model.generate_content(prompt)
        return response.text if response else None
    except Exception as e:
        print(f"Error refining adverse events: {e}")
        return None

def clean_response_text(text):
    return text.replace("```json", "").replace("```", "").strip()

def convert_to_actual_json(json_like_text):
    try:
        return json.loads(json_like_text)
    except json.JSONDecodeError:
        return None

def check_drug_interactions(drugs):
    adverse_events = search_adverse_events(drugs, OPENFDA_API_KEY)
    refined_response = refine_adverse_events(adverse_events, drugs)

    if refined_response:
        cleaned_response = clean_response_text(refined_response)
        json_data = convert_to_actual_json(cleaned_response)
        return json_data if json_data else {"error": "Failed to generate refined summary"}

    return {"message": "No critical adverse reactions found."}
