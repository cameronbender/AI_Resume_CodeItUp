from openai import OpenAI
from PyPDF2 import PdfReader
import os
import time
import re
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(
    api_key=os.getenv("CHUTES_API_KEY"),
    base_url="https://llm.chutes.ai/v1",
)

# Text Reader

def textReader(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as file:
        return file.read()

# PDF Reader

def pdfReader(path: str) -> str:
    reader = PdfReader(path)
    pages = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)

    return "\n".join(pages)

RESUME_FOLDER = "testResumes"
JOB_DESCRIPTION_FILE = "Applied_Data_Scientist.txt"
MODEL_NAME = "deepseek-ai/DeepSeek-V3-0324-TEE"

jobDescription = textReader(JOB_DESCRIPTION_FILE)

SYSTEM_PROMPT = """
You are an expert technical recruiter and hiring committee member evaluating candidates for a specific role.

Your task is to assess how hireable the candidate is FOR THIS JOB, not in general.

You must evaluate:
- Role relevance and alignment
- Technical and analytical competence
- Applied problem-solving and real-world impact
- Seniority and career fit
- Professional communication and structure


========================
SCORING RUBRIC (TOTAL: 100)
========================

1. Role Relevance & Alignment (30 points)
2. Technical & Analytical Competence (25 points)
3. Applied Problem-Solving & Impact (20 points)
4. Experience Level & Career Fit (15 points)
5. Communication & Professionalism (10 points)

========================
FINAL SCORING RULES
========================

- Output ONE integer score from 0 to 100
- Strong candidates should be rare
- 85+ = strong hire / interview
- 70-84 = consider for interview
- 51-69 = weak hire / no interview
- <50 = reject at resume screen

========================
OUTPUT FORMAT (STRICT)
========================

<number>

No explanation. No commentary.
Only output the numeric score.
"""


# Load Resumes

resumes = []

for filename in os.listdir(RESUME_FOLDER):
    if filename.lower().endswith(".pdf"):
        path = os.path.join(RESUME_FOLDER, filename)
        resume_text = pdfReader(path)

        if resume_text.strip():
            resumes.append({
                "filename": filename,
                "text": resume_text
            })

print(f"Loaded {len(resumes)} resumes.\n")

# Loading/Score Resumes

results = []

for resume in resumes:
    print(f"Scoring {resume['filename']}...")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"JOB DESCRIPTION:\n{jobDescription}"},
        {"role": "user", "content": f"CANDIDATE RESUME:\n{resume['text']}"}
    ]

    completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3-0324",
        messages=messages,
    )

    score = completion.choices[0].message.content
    
    results.append({
    "filename": resume["filename"],
    "score": int(score)
    })

    print(f"{resume['filename']} → {score}")
    print("-" * 40)

    time.sleep(1)  # avoid rate limits

results.sort(key=lambda r: r["score"], reverse=True)
print("Ranked Resumes")
print("-" * 40)

for rank, result in enumerate(results, start=1):
    print(f"{rank}. {result['filename']} → {result['score']}/100")