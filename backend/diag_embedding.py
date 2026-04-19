import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
model_name = "models/gemini-embedding-001"

print(f"Testing Gemini Embedding API with key: {api_key[:5]}...{api_key[-5:]}")
print(f"Using model: {model_name}")

genai.configure(api_key=api_key)

try:
    result = genai.embed_content(
        model=model_name,
        content="Testing the RAG pipeline embedding function.",
        task_type="retrieval_document"
    )
    print("SUCCESS: Embedding generated successfully!")
    print(f"Vector length: {len(result['embedding'])}")
except Exception as e:
    print(f"FAILURE: Embedding failed.")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Details: {e}")
