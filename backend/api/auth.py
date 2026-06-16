from flask import Blueprint, request, jsonify
from backend.database.db import get_user_profile, update_user_profile, log_analytic_event

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/profile", methods=["GET"])
def profile_get():
    user_id = request.args.get("user_id", "default_user")
    profile = get_user_profile(user_id)
    return jsonify({"success": True, "profile": profile})

@auth_bp.route("/profile", methods=["POST"])
def profile_post():
    data = request.json or {}
    user_id = data.get("user_id", "default_user")
    name = data.get("name")
    username = data.get("username")
    class_name = data.get("class_name")
    school = data.get("school")
    country = data.get("country")
    xp = data.get("xp")
    favorite_protein = data.get("favorite_protein")
    collected_protein = data.get("collected_protein")
    
    profile = update_user_profile(
        user_id, 
        name=name, 
        username=username, 
        class_name=class_name, 
        school=school, 
        country=country,
        xp=xp,
        favorite_protein=favorite_protein,
        collected_protein=collected_protein
    )
    log_analytic_event("profile_updated", {
        "user_id": user_id, 
        "name": name, 
        "username": username,
        "class_name": class_name
    })
    return jsonify({"success": True, "profile": profile})
