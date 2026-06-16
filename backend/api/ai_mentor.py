import json
from flask import Blueprint, request, jsonify
from backend.services.ai_service import generate_chat_completion
from backend.database.db import log_analytic_event

mentor_bp = Blueprint("mentor", __name__)

@mentor_bp.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_id = data.get("user_id", "default_user")
    message = data.get("message", "")
    context = data.get("context", {})
    history = data.get("history", [])
    
    current_level = context.get("level", 0)
    current_protein = context.get("protein", "None")
    current_view = context.get("view", "Home")
    
    # Constructing a premium context system prompt
    system_prompt = (
        "You are N1LUX, a premium molecular biology learning coach and AI guide. "
        "Your mission is to make biology exciting, visual, and simple for beginners.\n"
        f"The student is currently at LEVEL {current_level} on their journey, viewing the '{current_view}' screen.\n"
        f"They are inspecting the protein structure: '{current_protein}'.\n"
        "Keep responses highly engaging, scientifically accurate, and relatively concise (2-4 sentences max).\n"
        "Use formatting like bold text for key terms. End with an intriguing question related to what they are seeing."
    )
    
    # Compile messages
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add historical messages (limit to last 6 messages)
    for msg in history[-6:]:
        # Normalize roles (frontend may send 'mentor')
        r = (msg.get("role") or "user").lower()
        if r == "mentor":
            r = "assistant"
        if r not in ("system", "assistant", "user", "function", "tool", "developer"):
            r = "user"
        messages.append({"role": r, "content": msg.get("content", "")})
        
    # Add new user message
    messages.append({"role": "user", "content": message})
    
    response_text = generate_chat_completion(messages, temperature=0.7)
    
    log_analytic_event("mentor_chat", {
        "user_id": user_id,
        "level": current_level,
        "view": current_view,
        "protein": current_protein
    })
    
    return jsonify({
        "success": True,
        "reply": response_text
    })

@mentor_bp.route("/quiz", methods=["POST"])
def quiz():
    data = request.json or {}
    user_id = data.get("user_id", "default_user")
    topic = data.get("topic", "general biology")
    difficulty = data.get("difficulty", "easy")
    
    prompt = (
        f"Create a set of 3 multiple-choice questions about '{topic}' at a '{difficulty}' difficulty level. "
        "The response must be in valid JSON format only, matching this schema exactly:\n"
        "{\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"question\": \"Question text here?\",\n"
        "      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
        "      \"answer\": \"Correct Option Text\",\n"
        "      \"explanation\": \"Explain why this is correct and others are wrong in one clear sentence.\"\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "Do not include any extra introductory or concluding conversational text."
    )
    
    messages = [
        {"role": "system", "content": "You are a professional biochemistry examiner. You output strict JSON documents containing biology quizzes."},
        {"role": "user", "content": prompt}
    ]
    
    response_raw = generate_chat_completion(messages, temperature=0.6, json_response=True)
    
    # Attempt to parse JSON response. If fail, clean backticks or use local fallback
    try:
        # Strip code fences if present
        clean_text = response_raw.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()
        
        quiz_data = json.loads(clean_text)
    except Exception as e:
        print(f"Failed to parse AI quiz JSON: {e}. Raw was: {response_raw}")
        # Call service fallback directly
        from backend.services.ai_service import get_local_fallback_response
        fallback_raw = get_local_fallback_response([{"role": "user", "content": f"generate quiz on {topic}"}])
        quiz_data = json.loads(fallback_raw)
        
    log_analytic_event("quiz_generated", {
        "user_id": user_id,
        "topic": topic,
        "difficulty": difficulty
    })
    
    return jsonify({
        "success": True,
        "quiz": quiz_data
    })

@mentor_bp.route("/cases", methods=["GET"])
def clinical_cases():
    prompt = (
        "Generate 3 unique clinical case files for a molecular biology detective game. "
        "Each case must be a real human disease caused by a known protein mutation. "
        "The response must be valid JSON only, matching this exact schema:\n"
        "{\n"
        "  \"cases\": [\n"
        "    {\n"
        "      \"id\": 1,\n"
        "      \"title\": \"Case File #XXX: Short Title\",\n"
        "      \"symptoms\": \"Detailed patient symptoms and lab findings\",\n"
        "      \"proteinClue\": \"Clue about the affected protein and its normal function\",\n"
        "      \"mutationClue\": \"Genomic sequencing clue about the specific mutation\",\n"
        "      \"pdbId\": \"4-letter PDB ID\",\n"
        "      \"uniprotAccession\": \"UniProtKB accession like P69905\",\n"
        "      \"resi\": 123,\n"
        "      \"correctDiagnosis\": \"Disease Name\",\n"
        "      \"options\": [\"Wrong Option\", \"Correct Option\", \"Wrong Option\", \"Wrong Option\"],\n"
        "      \"explanation\": \"Molecular explanation of how the mutation causes disease\"\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "Use real PDB IDs, real UniProt accessions, and real residue numbers. "
        "The correct diagnosis must be one of the 4 options. "
        "Do not include any extra text outside the JSON."
    )

    messages = [
        {"role": "system", "content": "You are a clinical genetics professor. Output strict JSON only."},
        {"role": "user", "content": prompt}
    ]

    response_raw = generate_chat_completion(messages, temperature=0.8, json_response=True)

    try:
        clean = response_raw.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.endswith("```"):
            clean = clean[:-3]
        clean = clean.strip()
        cases_data = json.loads(clean)
    except Exception as e:
        print(f"Failed to parse cases JSON: {e}")
        cases_data = {"cases": []}

    return jsonify({
        "success": True,
        "cases": cases_data.get("cases", [])
    })

@mentor_bp.route("/news", methods=["GET"])
def science_news():
    user_id = request.args.get("user_id", "default_user")

    prompt = (
        "Generate 6 recent real science breakthroughs in structural biology, genomics, and AI-driven drug discovery. "
        "The response must be valid JSON only, matching this exact schema:\n"
        "{\n"
        "  \"news\": [\n"
        "    {\n"
        "      \"title\": \"Breakthrough title here\",\n"
        "      \"category\": \"Category like AI Biology / Structural Biology / Genomics / Drug Discovery\",\n"
        "      \"summary\": \"2-3 sentence summary of the breakthrough\",\n"
        "      \"date\": \"Month Year format like Jun 2026\",\n"
        "      \"readTime\": \"X min read\"\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "Include real recent discoveries from 2024-2026. Sort by date newest first. "
        "Do not include any extra text outside the JSON."
    )

    messages = [
        {"role": "system", "content": "You are a science news curator. Output strict JSON only."},
        {"role": "user", "content": prompt}
    ]

    response_raw = generate_chat_completion(messages, temperature=0.6, json_response=True)

    try:
        clean = response_raw.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.endswith("```"):
            clean = clean[:-3]
        clean = clean.strip()
        news_data = json.loads(clean)
    except Exception as e:
        print(f"Failed to parse news JSON: {e}")
        news_data = {"news": []}

    return jsonify({
        "success": True,
        "news": news_data.get("news", [])
    })
