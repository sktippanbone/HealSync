import os
import fitz 
import json
import requests
import google.generativeai as genai

genai.configure(api_key="AIzaSyDZr8Jv90UvuFytin_2JXTC8GwEYpt3YxU")

generation_config = {
    "temperature": 0.3,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 25536,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-thinking-exp-01-21",
    generation_config=generation_config,
)


def download_pdf_from_url(url, save_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, "wb") as f:
            f.write(response.content)
    else:
        raise Exception(f"Failed to download PDF: {response.status_code}")


def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = "".join([page.get_text() for page in doc])
    return text


def generate_summary_with_gemini(text):
    
    prompt = f"""
    You are a highly skilled medical assistant with expertise in summarizing patient medical records. Your task is to analyze the provided medical report(s) and extract the following details in a structured JSON format:

    {{
      "Patient Information": {{
        "Aadhaar": "",
        "Name": "",
        "Age": "",
        "City": "",
        "Date of Birth": "",
        "Mobile": "",
        "Blood Type": ""
      }},
      "Medical History": {{
        "Past Diseases": [],
        "Allergies": [],
        "Ongoing Medications": []
      }},
      "Diagnostics": {{
        "Blood Tests": [
          {{
            "Test": "",
            "Value": "",
            "Normal Range": ""
          }}
        ],
        "Scans": [
          {{
            "Type": "",
            "Date": "",
            "Result": ""
          }}
        ]
      }},
      "Doctor Visits": [
        {{
          "Doctor": "",
          "Specialty": "",
          "Date": "",
          "Next Step": ""
        }}
      ],
      "Recommendations": {{
        "Medication Adjustments": "",
        "Lifestyle Changes": "",
        "Follow-up Appointments": ""
      }},
      "Additional Notes": ""
    }}

    Instructions:
    1. Carefully read the entire text provided, which may include multiple medical reports.
    2. Extract and summarize all relevant information, including the patient's **complete medical history**, **current condition**, and **future recommendations**.
    3. Pay special attention to:
        - **Past diseases** and **previous surgeries**.
        - **Family history** of medical conditions.
        - **Allergies** and **ongoing medications**.
        - **Diagnostics** such as blood tests and scans.
        - **Upcoming appointments** and **next steps**.
    4. If any information is missing or not mentioned, explicitly state "Not mentioned in the report."
    5. Use professional medical terminology and ensure the output is concise, accurate, and well-structured
    6. Hash the First 8 digits of the Aadhar.
    Here is the medical report text:
    {text}
    """
    response = model.generate_content(prompt)
    return response.text


def clean_response_text(text):
    return text.replace("```json", "").replace("```", "").strip()


def convert_to_actual_json(json_like_text):
    try:
        return json.loads(json_like_text)
    except json.JSONDecodeError:
        return None


def summarize_pdfs(pdf_urls):
    combined_text = ""
    for i, pdf_url in enumerate(pdf_urls):
        pdf_path = f"temp_{i}.pdf"
        download_pdf_from_url(pdf_url, pdf_path)
        combined_text += extract_text_from_pdf(pdf_path) + "\n\n"
        os.remove(pdf_path)

    summary = generate_summary_with_gemini(combined_text)
    cleaned_summary = clean_response_text(summary)
    json_data = convert_to_actual_json(cleaned_summary)

    return json_data if json_data else {"error": "Failed to generate summary"}
