import os
import json
import requests
from dotenv import load_dotenv

# Load env variables
load_dotenv()

API_KEY = os.getenv("SAMBANOVA_API_KEY", "7fd9b624-8105-4ced-b481-6611db0b1961")
BASE_URL = "https://api.sambanova.ai/v1/chat/completions"

# Gemini / Google Generative API support (optional)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6IvR2jVkX7Z7TLy9NnrCGqW76F8jTB2okV08O7YnrD9xg")
GEMINI_ENDPOINT = os.getenv("GEMINI_ENDPOINT", "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent")
# Enable Gemini by default; override with USE_GEMINI=false in .env
USE_GEMINI = os.getenv("USE_GEMINI", "True").lower() in ("1", "true", "yes")
def generate_chat_completion(messages, temperature=0.7, json_response=False):
    """
    Sends a request to SambaNova AI, falling back to clean mock responses if offline or errors occur.
    """
    # Sanitize roles to match provider expectations
    allowed_roles = {"system", "assistant", "user", "function", "tool", "developer"}
    sanitized_messages = []
    for m in messages:
        role = (m.get("role") or "user").lower()
        if role == "mentor":
            role = "assistant"
        if role not in allowed_roles:
            role = "user"
        sanitized_messages.append({"role": role, "content": m.get("content", "")})

    # Prefer Gemini if configured
    if USE_GEMINI and GEMINI_API_KEY:
        try:
            return generate_with_gemini(sanitized_messages)
        except Exception as e:
            print(f"Gemini generation failed: {e}")

    if API_KEY:
        try:
            headers = {
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "Meta-Llama-3.3-70B-Instruct",
                "messages": sanitized_messages,
                "temperature": temperature
            }
            if json_response:
                # Meta-Llama-3.3-70B supports structured requests or standard formatting
                payload["response_format"] = {"type": "json_object"} if "json_object" in str(requests.post) else None # fallback if endpoint demands plain formatting
                
            response = requests.post(BASE_URL, headers=headers, json=payload, timeout=12)
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return content
            else:
                print(f"SambaNova API error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Failed to fetch SambaNova completion: {e}")
            
    # Fallback response system if API fails or offline
    return get_local_fallback_response(messages)

def get_local_fallback_response(messages):
    """
    A smart local rule engine providing high-quality science responses if the SambaNova API is unavailable.
    """
    # Find user input or target system prompt
    user_msg = ""
    system_prompt = ""
    for msg in messages:
        if msg["role"] == "user":
            user_msg = msg["content"]
        elif msg["role"] == "system":
            system_prompt = msg["content"]
            
    # Determine the topic
    user_lower = user_msg.lower()
    
    # Check if a quiz was requested (e.g. word "quiz" or "question" in message)
    if "quiz" in user_lower or "question" in user_lower:
        # Generate dummy biology quiz questions based on topic
        if "dna" in user_lower:
            return json.dumps({
                "questions": [
                    {
                        "question": "Which nitrogenous base pairs with Guanine in DNA?",
                        "options": ["Adenine", "Cytosine", "Thymine", "Uracil"],
                        "answer": "Cytosine",
                        "explanation": "In DNA, Guanine always pairs with Cytosine via three hydrogen bonds, while Adenine pairs with Thymine."
                    },
                    {
                        "question": "What is the sugar component of DNA?",
                        "options": ["Ribose", "Deoxyribose", "Glucose", "Fructose"],
                        "answer": "Deoxyribose",
                        "explanation": "Deoxyribose is the five-carbon sugar that forms the backbone of DNA. RNA uses Ribose sugar."
                    }
                ]
            })
        elif "rna" in user_lower or "transcription" in user_lower:
            return json.dumps({
                "questions": [
                    {
                        "question": "What nitrogenous base is found in RNA but NOT in DNA?",
                        "options": ["Thymine", "Uracil", "Adenine", "Cytosine"],
                        "answer": "Uracil",
                        "explanation": "RNA replaces Thymine with Uracil, which pairs with Adenine."
                    },
                    {
                        "question": "Which enzyme is responsible for synthesizing mRNA from a DNA template?",
                        "options": ["DNA Polymerase", "RNA Polymerase", "Ribosome", "Ligase"],
                        "answer": "RNA Polymerase",
                        "explanation": "RNA Polymerase reads the DNA template strand and builds a matching messenger RNA molecule."
                    }
                ]
            })
        elif "folding" in user_lower or "structure" in user_lower:
            return json.dumps({
                "questions": [
                    {
                        "question": "What level of protein structure is characterized by alpha-helices and beta-sheets?",
                        "options": ["Primary", "Secondary", "Tertiary", "Quaternary"],
                        "answer": "Secondary",
                        "explanation": "Secondary structure refers to local, regular folding shapes like alpha-helices and beta-pleated sheets, stabilized by backbone hydrogen bonds."
                    },
                    {
                        "question": "Which force is the primary driver of tertiary protein folding in aqueous cellular environments?",
                        "options": ["Ionic bonds", "Disulfide links", "Hydrophobic collapse", "Covalent bonds"],
                        "answer": "Hydrophobic collapse",
                        "explanation": "Hydrophobic collapse drives non-polar side chains to the interior of the protein to avoid water, which stabilizes the fold."
                    }
                ]
            })
        else:
            return json.dumps({
                "questions": [
                    {
                        "question": "What are the building blocks of proteins?",
                        "options": ["Nucleotides", "Amino Acids", "Fatty Acids", "Monosaccharides"],
                        "answer": "Amino Acids",
                        "explanation": "Proteins are constructed from long chains of 20 standard amino acids linked by peptide bonds."
                    },
                    {
                        "question": "What is the cell's macromolecular factory where protein synthesis occurs?",
                        "options": ["Mitochondrion", "Nucleus", "Ribosome", "Golgi Apparatus"],
                        "answer": "Ribosome",
                        "explanation": "The Ribosome reads mRNA codons and translates them into amino acids, building the polypeptide chain."
                    }
                ]
            })

    # Default chatbot response rules
    if "hemoglobin" in user_lower:
        return "Hemoglobin is an oxygen-transport protein found in red blood cells. It has a quaternary structure made of four subunits, each containing a heme group with an iron atom that binds oxygen."
    elif "collagen" in user_lower:
        return "Collagen is the most abundant structural protein in skin, bone, and connective tissue. It is famous for its super-strong triple-helix structure."
    elif "keratin" in user_lower:
        return "Keratin is a fibrous structural protein that builds hair, nails, and the outer layer of skin. It is rich in cysteine residues, forming disulfide bonds that give it rigidity."
    elif "insulin" in user_lower:
        return "Insulin is a hormone produced in the pancreas that regulates blood glucose levels. It folds into a small, highly stable structure with multiple disulfide bonds."
    elif "antibody" in user_lower or "immunoglobulin" in user_lower:
        return "Antibodies are Y-shaped proteins that identify and neutralize foreign agents like viruses and bacteria. They have highly variable hypervariable regions that bind antigens specifically."
    elif "sickle cell" in user_lower:
        return "Sickle Cell disease is caused by a single point mutation in the Hemoglobin beta gene (Glu6Val). This introduces a hydrophobic patch on the protein surface, causing them to aggregate into long fibers."
    elif "alzheimer" in user_lower:
        return "Alzheimer's is characterized by misfolding of Amyloid-Beta and Tau proteins, which aggregate into toxic plaques and neurofibrillary tangles, destroying brain cells."
    
    return "Hi, I'm N1LUX AI! I can guide you through the wonderful world of proteins and molecular biology. Try navigating through the RPG journey levels or selecting mutation tests in the playground!"


def generate_with_gemini(messages):
    """Call Google Gemini API (gemini-flash-latest generateContent).
    Expects `messages` as a list of dicts with 'role' and 'content'. Returns text string.
    """
    if not GEMINI_API_KEY:
        raise RuntimeError("Missing GEMINI_API_KEY")

    # Separate system prompt from conversation messages
    system_instruction = None
    contents = []

    for m in messages:
        role = m.get("role", "user")
        text = m.get("content", "")
        if role == "system":
            system_instruction = {"parts": [{"text": text}]}
        elif role == "assistant":
            contents.append({"role": "model", "parts": [{"text": text}]})
        elif role == "user":
            contents.append({"role": "user", "parts": [{"text": text}]})

    payload = {"contents": contents}
    if system_instruction:
        payload["system_instruction"] = system_instruction

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }

    resp = requests.post(GEMINI_ENDPOINT, headers=headers, json=payload, timeout=15)
    if resp.status_code == 200:
        try:
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError) as e:
            return resp.text
    else:
        raise RuntimeError(f"Gemini API error {resp.status_code}: {resp.text}")
