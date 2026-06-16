import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Optionally enable remote storage via JsonBin
USE_JSONBIN = os.getenv("USE_JSONBIN", "False").lower() in ("1", "true", "yes")
if USE_JSONBIN:
    try:
        from backend.services.jsonbin_service import read_json, write_json
    except Exception:
        USE_JSONBIN = False

DB_DIR = os.path.join(os.path.dirname(__file__), "data")

# Create data directory if it doesn't exist
os.makedirs(DB_DIR, exist_ok=True)

class JSONDatabase:
    def __init__(self, filename):
        self.filepath = os.path.join(DB_DIR, filename)
        if not os.path.exists(self.filepath):
            # Initialize local file and remote bin if enabled
            self.save({})
            if USE_JSONBIN:
                try:
                    write_json(filename, {})
                except Exception:
                    pass
            
    def load(self):
        # If configured, prefer remote JsonBin store (best-effort)
        if USE_JSONBIN:
            try:
                data = read_json(os.path.basename(self.filepath))
                if isinstance(data, dict):
                    return data
            except Exception:
                pass
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
            
    def save(self, data):
        try:
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4)
            # write remote copy if enabled
            if USE_JSONBIN:
                try:
                    write_json(os.path.basename(self.filepath), data)
                except Exception:
                    pass
            return True
        except Exception:
            return False

# Initialize database connections
users_db = JSONDatabase("users.json")
progress_db = JSONDatabase("progress.json")
certificates_db = JSONDatabase("certificates.json")
analytics_db = JSONDatabase("analytics.json")
protein_cache_db = JSONDatabase("protein_cache.json")

def get_user_profile(user_id="default_user"):
    users = users_db.load()
    if user_id not in users:
        # Default starting profile (Level 1)
        users[user_id] = {
            "id": user_id,
            "name": "Curious Visitor",
            "username": "curious_visitor",
            "class_name": "Class 10",
            "school": "",
            "country": "",
            "current_level": 1,
            "xp": 0,
            "daily_streak": 1,
            "last_active": datetime.now().isoformat(),
            "favorite_proteins": [],
            "collected_proteins": ["hemoglobin"], # starts with Hemoglobin unlocked
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "achievements": ["Protein Beginner"],
            "quiz_scores": {}
        }
        users_db.save(users)
    return users[user_id]

def update_user_profile(user_id, name=None, username=None, class_name=None, school=None, country=None, 
                        current_level=None, xp=None, achievements=None, quiz_scores=None, 
                        favorite_protein=None, collected_protein=None):
    users = users_db.load()
    if user_id not in users:
        get_user_profile(user_id)
        users = users_db.load()
        
    user = users[user_id]
    
    # Text attributes
    if name is not None:
        user["name"] = name
    if username is not None:
        user["username"] = username
    if class_name is not None:
        user["class_name"] = class_name
    if school is not None:
        user["school"] = school
    if country is not None:
        user["country"] = country
        
    # Stats progress
    if xp is not None:
        user["xp"] = user.get("xp", 0) + xp
        # Automatically update current level based on XP (500 XP per level, max Level 10)
        calculated_level = min(10, (user["xp"] // 500) + 1)
        user["current_level"] = max(user.get("current_level", 1), calculated_level)
        
    if current_level is not None:
        user["current_level"] = max(user.get("current_level", 1), current_level)
        
    if achievements is not None:
        user["achievements"] = list(set(user.get("achievements", []) + achievements))
        
    if quiz_scores is not None:
        if "quiz_scores" not in user:
            user["quiz_scores"] = {}
        user["quiz_scores"].update(quiz_scores)
        
    # Collections and favorites
    if favorite_protein is not None:
        favs = user.get("favorite_proteins", [])
        if favorite_protein in favs:
            favs.remove(favorite_protein) # Toggle off
        else:
            favs.append(favorite_protein) # Toggle on
        user["favorite_proteins"] = favs
        
    if collected_protein is not None:
        colls = user.get("collected_proteins", [])
        if collected_protein not in colls:
            colls.append(collected_protein)
        user["collected_proteins"] = colls
        
    # Daily streak checking
    try:
        from datetime import date
        last_active_str = user.get("last_active")
        if last_active_str:
            last_date = datetime.fromisoformat(last_active_str).date()
            today = date.today()
            diff = (today - last_date).days
            if diff == 1:
                user["daily_streak"] = user.get("daily_streak", 1) + 1
            elif diff > 1:
                user["daily_streak"] = 1
        user["last_active"] = datetime.now().isoformat()
    except Exception:
        pass
        
    user["updated_at"] = datetime.now().isoformat()
    users[user_id] = user
    users_db.save(users)
    return user

def get_leaderboard(timeframe="all_time"):
    """
    Returns lists of users sorted by XP metrics.
    """
    users = users_db.load()
    leaderboard_list = []
    for uid, u in users.items():
        leaderboard_list.append({
            "name": u.get("name", "Curious Visitor"),
            "username": u.get("username", "curious_visitor"),
            "class_name": u.get("class_name", ""),
            "school": u.get("school", ""),
            "current_level": u.get("current_level", 1),
            "xp": u.get("xp", 0),
            "daily_streak": u.get("daily_streak", 1)
        })
    # Sort descending by XP
    leaderboard_list.sort(key=lambda x: x["xp"], reverse=True)
    return leaderboard_list

def log_analytic_event(event_type, details=None):
    analytics = analytics_db.load()
    timestamp = datetime.now().isoformat()
    if event_type not in analytics:
        analytics[event_type] = []
    analytics[event_type].append({
        "timestamp": timestamp,
        "details": details or {}
    })
    analytics_db.save(analytics)

def get_analytics_summary():
    return analytics_db.load()

def save_certificate(cert_id, name, score, level):
    certs = certificates_db.load()
    certs[cert_id] = {
        "id": cert_id,
        "name": name,
        "score": score,
        "level": level,
        "issued_at": datetime.now().isoformat()
    }
    certificates_db.save(certs)
    return certs[cert_id]

def verify_certificate(cert_id):
    certs = certificates_db.load()
    return certs.get(cert_id)
