import os
import requests
import json
from backend.database.db import protein_cache_db

# Common biological proteins for instant offline lookup
OFFLINE_PROTEINS = {
    # Hemoglobin Subunit Beta (PDB: 1A3N, or similar)
    "hemoglobin": "1a3n",
    "keratin": "3tid",
    "collagen": "1bkv",
    "myosin": "1w7j",
    "insulin": "1trz",
    "antibody": "1igy",
    "amyloid": "2mxu",
    "parkinson": "1xq8"
}

def fetch_protein_structure(pdb_or_uniprot_id):
    """
    Fetches the CIF/PDB structure data for a given PDB ID or UniProt ID.
    Caches it locally in protein_cache.json.
    """
    pdb_id = pdb_or_uniprot_id.lower().strip()
    
    # Resolve aliases
    if pdb_id in OFFLINE_PROTEINS:
        pdb_id = OFFLINE_PROTEINS[pdb_id]
        
    # Check cache first
    cache = protein_cache_db.load()
    if pdb_id in cache:
        return cache[pdb_id]
        
    # Attempt to fetch from RCSB PDB (CIF file format is modern and compatible with 3Dmol)
    url = f"https://files.rcsb.org/view/{pdb_id.upper()}.cif"
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            cif_data = response.text
            cache[pdb_id] = {
                "id": pdb_id,
                "format": "cif",
                "data": cif_data,
                "source": "PDB"
            }
            protein_cache_db.save(cache)
            return cache[pdb_id]
    except Exception as e:
        print(f"RCSB fetch failed for {pdb_id}: {e}")
        
    # Attempt to fetch from AlphaFold Database (if long alphanumeric UniProt code)
    if len(pdb_id) >= 6:
        af_url = f"https://alphafold.ebi.ac.uk/files/AF-{pdb_id.upper()}-F1-model_v4.cif"
        try:
            response = requests.get(af_url, timeout=3)
            if response.status_code == 200:
                cif_data = response.text
                cache[pdb_id] = {
                    "id": pdb_id,
                    "format": "cif",
                    "data": cif_data,
                    "source": "AlphaFold"
                }
                protein_cache_db.save(cache)
                return cache[pdb_id]
        except Exception as e:
            print(f"AlphaFold fetch failed for {pdb_id}: {e}")

    # Fallback to local default model (Hemoglobin Subunit Beta) if all else fails
    # Let's see if we can load the existing model_data.js to provide a local CIF payload
    try:
        # Load local model_data.js
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_data_path = os.path.join(root_dir, "frontend", "static", "js", "model_data.js")
        if os.path.exists(model_data_path):
            with open(model_data_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Extract the string content
                start_idx = content.find('`') + 1
                end_idx = content.rfind('`')
                if start_idx > 0 and end_idx > start_idx:
                    cif_text = content[start_idx:end_idx]
                    return {
                        "id": pdb_id,
                        "format": "cif",
                        "data": cif_text,
                        "source": "Local Fallback"
                    }
    except Exception as e:
        print(f"Failed loading local fallback model_data: {e}")
        
    # Return minimal CIF structure if we have nothing else (so visualizer doesn't crash)
    return {
        "id": pdb_id,
        "format": "cif",
        "data": "",
        "error": "Protein structure not found offline, and internet fetch failed."
    }
