import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

MASTER_KEY = os.getenv("JSONBIN_MASTER_KEY", "$2a$10$pzVeYdOlJBOvUUhcsSk92ewKp5qZZYm75YLBClp40kX9oh/8nyD2q")
ACCESS_KEY = os.getenv("JSONBIN_ACCESS_KEY", "$2a$10$p9LsdRiiCNtst2JHrpWKy..Nr0thBsWuU3jhvobdEJ2oglAlbDKO6")
ACCESS_KEY_ID = os.getenv("JSONBIN_ACCESS_KEY_ID", "6a2eda2ff5f4af5e29f0e9e5")

HEADERS = {
    "X-Master-Key": MASTER_KEY,
    "X-Access-Key": ACCESS_KEY,
    "Content-Type": "application/json"
}

BASE_URL = "https://api.jsonbin.io/v3"

class JsonBinClient:
    @staticmethod
    def create(data):
        r = requests.post(f"{BASE_URL}/b", headers=HEADERS, json=data, timeout=10)
        try:
            return r.json()
        except Exception:
            return {"status": r.status_code, "text": r.text}

    @staticmethod
    def read(bin_id):
        # bin_id may be a filename or an actual bin id
        r = requests.get(f"{BASE_URL}/b/{bin_id}/latest", headers=HEADERS, timeout=10)
        try:
            return r.json()
        except Exception:
            return {"status": r.status_code, "text": r.text}

    @staticmethod
    def update(bin_id, data):
        r = requests.put(f"{BASE_URL}/b/{bin_id}", headers=HEADERS, json=data, timeout=10)
        try:
            return r.json()
        except Exception:
            return {"status": r.status_code, "text": r.text}

    @staticmethod
    def delete(bin_id):
        r = requests.delete(f"{BASE_URL}/b/{bin_id}", headers=HEADERS, timeout=10)
        return {"status": r.status_code, "success": r.ok}

# Helper: try to parse a filename to a bin id (best-effort)
def filename_to_bin_id(filename):
    # If caller provides explicit bin id (looks like hex) return it
    if isinstance(filename, str) and len(filename) > 20 and all(c.isalnum() or c == '-' for c in filename):
        return filename
    # fallback: use ACCESS_KEY_ID as a shared bin container id
    return ACCESS_KEY_ID

def read_json(filename):
    bin_id = filename_to_bin_id(filename)
    res = JsonBinClient.read(bin_id)
    # Expected structure: {"record": {...}} or {"metadata":..., "record": ...}
    if isinstance(res, dict) and "record" in res:
        return res["record"]
    return {}

def write_json(filename, data):
    bin_id = filename_to_bin_id(filename)
    res = JsonBinClient.update(bin_id, data)
    return res
