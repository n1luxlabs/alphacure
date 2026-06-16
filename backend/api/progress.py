import uuid
from flask import Blueprint, request, jsonify
from backend.database.db import (
    update_user_profile, 
    save_certificate, 
    verify_certificate, 
    log_analytic_event, 
    get_analytics_summary
)

progress_bp = Blueprint("progress", __name__)

@progress_bp.route("/update", methods=["POST"])
def update_progress():
    data = request.json or {}
    user_id = data.get("user_id", "default_user")
    current_level = data.get("current_level")
    achievements = data.get("achievements")
    quiz_scores = data.get("quiz_scores")
    
    updated_profile = update_user_profile(
        user_id, 
        current_level=current_level, 
        achievements=achievements, 
        quiz_scores=quiz_scores
    )
    
    log_analytic_event("progress_updated", {
        "user_id": user_id,
        "current_level": current_level,
        "new_achievements": achievements,
        "quiz_scores": quiz_scores
    })
    
    return jsonify({
        "success": True,
        "profile": updated_profile
    })

@progress_bp.route("/certificate/issue", methods=["POST"])
def issue_cert():
    data = request.json or {}
    name = data.get("name", "Honored Student")
    score = data.get("score", 100)
    level = data.get("level", 10)
    user_id = data.get("user_id", "default_user")
    
    # Generate unique cert ID
    cert_id = f"PVX-{uuid.uuid4().hex[:8].upper()}"
    
    cert_details = save_certificate(cert_id, name, score, level)
    
    # Also unlock final badge for the user
    update_user_profile(user_id, achievements=["Protein Master"])
    
    log_analytic_event("certificate_issued", {
        "user_id": user_id,
        "cert_id": cert_id,
        "name": name,
        "score": score
    })
    
    return jsonify({
        "success": True,
        "certificate": cert_details
    })

@progress_bp.route("/certificate/verify", methods=["GET"])
def verify_cert():
    cert_id = request.args.get("id", "").strip().upper()
    if not cert_id:
        return jsonify({"success": False, "error": "Missing 'id' parameter"}), 400
        
    cert = verify_certificate(cert_id)
    if not cert:
        return jsonify({
            "success": False, 
            "error": "Certificate not found. Double check the ID."
        }), 404
        
    return jsonify({
        "success": True,
        "certificate": cert
    })

@progress_bp.route("/analytics", methods=["GET"])
def get_analytics():
    summary = get_analytics_summary()
    return jsonify({
        "success": True,
        "analytics": summary
    })

@progress_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    timeframe = request.args.get("timeframe", "all_time")
    from backend.database.db import get_leaderboard
    ranks = get_leaderboard(timeframe)
    return jsonify({
        "success": True,
        "leaderboard": ranks
    })

@progress_bp.route("/daily_challenge", methods=["GET"])
def daily_challenge():
    # Deterministic challenge based on current date
    from datetime import date
    today = date.today()
    seed = today.year + today.month + today.day
    
    proteins_pool = ["hemoglobin", "insulin", "collagen", "egfr", "tau", "myosin"]
    mutations_pool = ["Glu6Val", "Glu22Gln", "Ala53Thr", "Cys145Ala"]
    diseases_pool = ["Sickle Cell Anemia", "Alzheimer's", "Parkinson's", "COVID-19 Mpro blockage"]
    missions_pool = [
        "Unfold the protein to raw sequence levels in the Reverse Engineering Lab.",
        "Change Glu at residue 6 in Hemoglobin to Val inside the Playground.",
        "Test binding affinity scores of Paxlovid in the Drug Discovery Lab.",
        "Highlight residue Cys145 on COVID Mpro in the science terminal."
    ]
    
    protein = proteins_pool[seed % len(proteins_pool)]
    mutation = mutations_pool[seed % len(mutations_pool)]
    disease = diseases_pool[seed % len(diseases_pool)]
    mission = missions_pool[seed % len(missions_pool)]
    
    return jsonify({
        "success": True,
        "challenge": {
            "protein": protein,
            "mutation": mutation,
            "disease": disease,
            "mission": mission,
            "xp_reward": 150,
            "date": today.isoformat()
        }
    })
