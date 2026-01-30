
import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv
from resumeScorer import pdfReader

load_dotenv()

client = OpenAI(
    api_key=os.getenv("CHUTES_API_KEY"),
    base_url="https://llm.chutes.ai/v1",
)

MODEL_NAME = "deepseek-ai/DeepSeek-V3-0324-TEE"

SYSTEM_PROMPT = """
You are an intelligent assistant that extracts structured job information from raw text.
You must output a valid JSON object with the following keys:
- "title": The job title (string). MUST BE CONCISE (under 6 words).
- "company_name": The company name (string).
- "description": The full job description (string).

EXAMPLES:
Text: "We are hiring a Senior Python Developer at TechCorp..."
JSON: {"title": "Senior Python Developer", "company_name": "TechCorp", ...}

Text: "Role: Product Manager. Use your skills to..."
JSON: {"title": "Product Manager", ...}

If you cannot find a specific field, make a reasonable guess or leave it empty string.
Do not include any markdown formatting (like ```json), just the raw JSON string.
"""

def parse_job_text(text: str) -> dict:
    completion = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Extract job details from this text:\n\n{text}"}
        ],
        temperature=0.1
    )

    raw_output = completion.choices[0].message.content.strip()
    
    raw_output = re.sub(r"^```json\s*", "", raw_output)
    raw_output = re.sub(r"^```\s*", "", raw_output)
    raw_output = re.sub(r"\s*```$", "", raw_output)

    try:
        result = json.loads(raw_output)
    except json.JSONDecodeError:
      
        print(f"Failed to parse JSON: {raw_output}")
        result = {
            "title": "",
            "company_name": "",
            "description": text[:500] 
        }

    title = result.get("title", "").strip()
    
    if len(title) > 60:
        print(f"Warning: Extracted title is too long ({len(title)} chars). Truncating.")
        title = title[:60].rsplit(' ', 1)[0] + "..." # Try to split on clean word boundary

    bad_phrases = ["looking for", "role supports", "responsible for", "summary", "description", "we are", "candidate will"]
    if any(phrase in title.lower() for phrase in bad_phrases):
        print(f"Warning: Title contains description phrase '{title}'. Clearing.")
        title = "" # Better to have empty than garbage

    result["title"] = title
    
    return result

def parse_job_file(file_bytes: bytes, filename: str) -> dict:
    text = ""
    if filename.lower().endswith('.pdf'):
        try:
            text = pdfReader(file_bytes)
        except Exception as e:
            print(f"PDF reading error: {e}")
            text = ""
    else:
        try:
            text = file_bytes.decode('utf-8', errors='ignore')
        except:
             text = ""
    
    if not text or len(text.strip()) < 10:
        return {"title": "", "company_name": "", "description": ""}

    return parse_job_text(text)