import os
import sys

# Add project root to python path for internal imports
backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.append(project_root)

from flask import Flask, render_template, send_from_directory
from dotenv import load_dotenv

# Load environment configuration
load_dotenv(os.path.join(project_root, ".env"))

frontend_dir = os.path.join(project_root, "frontend")
templates_dir = os.path.join(frontend_dir, "templates")
static_dir = os.path.join(frontend_dir, "static")

app = Flask(__name__, template_folder=templates_dir, static_folder=static_dir)

# Register Blueprints
from backend.api.auth import auth_bp
from backend.api.ai_mentor import mentor_bp
from backend.api.protein import protein_bp
from backend.api.progress import progress_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(mentor_bp, url_prefix="/api/mentor")
app.register_blueprint(protein_bp, url_prefix="/api/protein")
app.register_blueprint(progress_bp, url_prefix="/api/progress")

# Route to render main entrypoint HTML for SPA paths
@app.route("/")
@app.route("/dashboard")
@app.route("/museum")
@app.route("/journey")
@app.route("/factory-sim")
@app.route("/reverse-lab")
@app.route("/playground")
@app.route("/disease-detective")
@app.route("/body-map")
@app.route("/collection")
@app.route("/protein-world")
@app.route("/drug-lab")
@app.route("/comics")
@app.route("/leaderboard")
@app.route("/news-hub")
@app.route("/career")
def index():
    return render_template("index.html")

# Serve files from the 'src' modular frontend directory
@app.route("/src/<path:filename>")
def serve_src(filename):
    return send_from_directory(os.path.join(frontend_dir, "src"), filename)

# Serve files from the 'static' directory
@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory(static_dir, filename)

# Serve legacy model_data.js from frontend/static/js
@app.route("/model_data.js")
def serve_model_data():
    return send_from_directory(os.path.join(static_dir, "js"), "model_data.js")

# Serve legacy assets if needed
@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(frontend_dir, "assets"), filename)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "True").lower() == "true"
    app.run(debug=debug, host=host, port=port)
