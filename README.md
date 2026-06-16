# AlphaCure — Advanced Molecular Biology Portal

An interactive educational platform that lets students explore molecular biology, protein structures, AI-driven drug discovery, and bioinformatics through gamified learning, 3D visualizations, and interactive labs.

---

## Project Overview

AlphaCure (ProteinVerse) transforms complex molecular biology concepts into interactive, visual learning experiences. The platform combines a Flask backend with a modern JavaScript SPA frontend featuring 3D protein visualization via Mol* (MolStar).

### Key Features

- **Science Museum** — Interactive exhibit hall with protein system cards
- **Reverse Engineering Lab** — Deconstruct 3D protein folds layer-by-layer (Sequence → Primary → Secondary → Tertiary) with auto-zoom 3D
- **RPG Learning Pathway** — 11-level gamified quest from "Curious Visitor" to "Protein Master" with quizzes and badges
- **Mutation Playground** — Experiment with point mutations on 3D protein models
- **Disease Detective** — Solve biomedical mysteries by analyzing protein-disease relationships
- **Drug Discovery Lab** — Design virtual drugs to target disease proteins
- **Human Protein Body Map** — Explore protein expression across human anatomy
- **Factory Simulator** — Build and manage a ribosome protein factory
- **Protein Album** — Collect and catalog protein trading cards
- **Protein World** — Discover protein taxonomy across all domains of life
- **Science Comics** — Illustrated educational stories (COVID-19, Hemoglobin)
- **Leaderboards** — Compete with other explorers
- **Science News Hub** — Curated molecular biology news
- **N1LUX AI Mentor** — Floating AI assistant for guidance
- **Career & Badges** — Achievement system tracking progress

---

## Project Structure

```
AlphaCure/
├── .env                          # Environment variables (API keys, config)
├── requirements.txt              # Python dependencies
├── README.md                     # This file
│
├── backend/                      # Flask Python backend
│   ├── __init__.py
│   ├── app.py                    # Flask app entry, route definitions
│   ├── api/
│   │   ├── __init__.py
│   │   ├── ai_mentor.py          # AI mentor chat API endpoint
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── progress.py           # User progress & quiz API
│   │   └── protein.py            # Protein data & structure API
│   ├── database/
│   │   ├── db.py                 # JSON file-based database handler
│   │   └── data/
│   │       ├── analytics.json    # Usage analytics
│   │       ├── certificates.json # Earned certificates
│   │       ├── progress.json     # User progress data
│   │       ├── protein_cache.json# Cached protein structures
│   │       └── users.json        # User accounts
│   └── services/
│       ├── ai_service.py         # AI/LLM integration service
│       ├── jsonbin_service.py    # Remote JSON storage (JsonBin)
│       └── protein_service.py    # Protein data fetching & caching
│
├── frontend/                     # JavaScript SPA frontend
│   ├── assets/
│   │   └── CHAT BOT LOGO.webm    # AI mentor avatar animation
│   ├── src/
│   │   ├── main.js               # SPA orchestrator, routing, page init
│   │   ├── components/
│   │   │   ├── fux_stepper.js    # Onboarding wizard stepper
│   │   │   ├── mentor.js         # N1LUX AI Mentor floating UI
│   │   │   ├── terminal.js       # Terminal-style UI component
│   │   │   └── viewer_molstar.js # Mol* 3D protein viewer wrapper
│   │   ├── pages/
│   │   │   ├── body_map.js       # Human Protein Body Map
│   │   │   ├── career_center.js  # Career & Badges center
│   │   │   ├── collection.js     # Protein Album collection
│   │   │   ├── comics.js         # Science Comics reader
│   │   │   ├── disease_detective.js # Disease Detective game
│   │   │   ├── drug_lab.js       # Drug Discovery Lab
│   │   │   ├── factory_sim.js    # Factory Simulator
│   │   │   ├── leaderboard.js    # Leaderboard rankings
│   │   │   ├── museum.js         # Science Museum exhibit hall
│   │   │   ├── mutation_playground.js # Mutation Playground
│   │   │   ├── news_hub.js       # Science News Hub
│   │   │   ├── protein_world.js  # Protein World taxonomy
│   │   │   ├── reverse_lab.js    # Reverse Engineering Lab
│   │   │   └── rpg_path.js       # RPG Learning Pathway
│   │   ├── services/
│   │   │   └── api.js            # API client service
│   │   ├── styles/
│   │   │   └── main.css          # Halo design system (2544 lines)
│   │   └── utils/
│   │       └── particles.js      # Background molecular particles
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css         # Landing page styles
│   │   ├── js/
│   │   │   ├── model_data.js     # PDB/CIF model data cache
│   │   │   └── script.js         # Landing page GSAP animations
│   │   ├── assets/comics/
│   │   │   ├── covid19/          # COVID-19 comic pages (14)
│   │   │   └── hemo-hero/        # Hemoglobin comic pages (14)
│   │   └── molstar/              # Mol* 3D viewer library
│   │       ├── molstar.js        # Mol* core library
│   │       └── molstar.css       # Mol* styles
│   └── templates/
│       └── index.html            # Main SPA entry HTML
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS (ES Modules), CSS Custom Properties, GSAP |
| **3D Viewer** | Mol* (MolStar) — WebGL molecular visualization |
| **Backend** | Python 3, Flask 3.1 |
| **Database** | JSON file-based (local) + JsonBin (remote) |
| **AI Integration** | OpenAI/LLM API (configurable via .env) |
| **External APIs** | UniProt, AlphaFold DB, PDB, RCSB |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Modern web browser (Chrome/Firefox/Edge)

### Installation

```bash
git clone <repo-url>
cd AlphaCure

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Running

```bash
# Start the backend server
python backend/app.py

# Open in browser
# http://localhost:5000
```

The server serves both the API and the frontend SPA. Navigate through the sidebar to explore all tools.

### Environment Variables (`.env`)

| Variable | Description |
|----------|-------------|
| `USE_JSONBIN` | Enable remote JsonBin storage |
| `JSONBIN_API_KEY` | JsonBin API key |
| `JSONBIN_BIN_ID` | JsonBin bin ID |
| `AI_API_KEY` | LLM API key for AI mentor |
| `AI_MODEL` | AI model name (default: gpt-4o-mini) |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/progress/<user>` | GET | Get user profile & progress |
| `/api/progress/<user>` | PUT | Update user progress |
| `/api/mentor/chat` | POST | AI mentor chat |
| `/api/protein/fetch` | GET | Fetch protein data from UniProt/PDB |
| `/api/protein/search` | GET | Search proteins |
| `/api/protein/quiz` | POST | Generate adaptive quiz |

---

## AI Mentor (N1LUX)

The floating N1LUX AI Mentor provides contextual guidance across all pages. It adapts its advice based on:
- Current page/view context
- User's RPG level
- Active protein being explored
- User-triggered alerts (hints, explanations)

---

## License

Educational project — +2 Raghunathpur High School, Dumka, Jharkhand

**Developer:** Nilay Singh — nilaysinghofficial@hotmail.com
