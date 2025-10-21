# Clinical Trial Site Selection - Agentic AI Demo

AI-powered site selection and enrollment monitoring for clinical trials.

## Tech Stack

**Backend:**
- Flask + CrewAI + Claude Sonnet 4.5
- Python 3.11+

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS + Recharts

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Demo Flow

**Part 1: Site Selection**
- Analyze 500 potential sites
- AI agents evaluate performance, patient density, logistics
- Recommend top 10 sites

**Part 2: Trial Monitoring** (unlocks after Part 1)
- Monitor 13 weeks of enrollment data
- Generate probabilistic forecasts
- Run what-if scenarios
