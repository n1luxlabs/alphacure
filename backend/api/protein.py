from flask import Blueprint, request, jsonify
from backend.services.protein_service import fetch_protein_structure
from backend.database.db import log_analytic_event

protein_bp = Blueprint("protein", __name__)

@protein_bp.route("/structure", methods=["GET"])
def get_structure():
    pdb_id = request.args.get("id")
    if not pdb_id:
        return jsonify({"success": False, "error": "Missing 'id' parameter"}), 400
        
    result = fetch_protein_structure(pdb_id)
    
    if "error" in result:
        return jsonify({"success": False, "error": result["error"]}), 404
        
    log_analytic_event("protein_viewed", {"pdb_id": pdb_id, "source": result.get("source")})
    
    return jsonify({
        "success": True,
        "id": result["id"],
        "format": result["format"],
        "data": result["data"],
        "source": result.get("source")
    })
