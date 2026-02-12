# Quick Start Guide

Get the Research Portal running in under 5 minutes.

## Step 1: Clone/Download

Download the `research-portal` folder.

## Step 2: Install Dependencies

```bash
cd research-portal
pip install -r requirements.txt
```

## Step 3: Add OpenAI API Key

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

## Step 4: Start Server

```bash
python main.py
```

Or use the startup script:
```bash
./start.sh
```

Server runs at: http://localhost:8000

## Step 5: Test It

### Quick Test (Using Test Script)

```bash
# In a new terminal
python test_api.py
```

This automatically tests all features!

### Manual Test (Using curl)

**Upload files:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "files=@sample_financial_report.txt" \
  -F "files=@sample_earnings_call.txt"
```

**Run Financial Extraction:**
```bash
curl -X POST "http://localhost:8000/tools/financial-extraction" \
  --output result.xlsx
```

**Run Earnings Summary:**
```bash
curl -X POST "http://localhost:8000/tools/earnings-summary"
```

### Browser Test

Go to: http://localhost:8000/docs

Interactive API testing interface!

## What You Should See

### Financial Extraction Output
Excel file with:
- Years: 2023, 2022
- Revenue extracted
- Operating Expenses extracted
- EBIT extracted
- Net Profit extracted
- Currency: USD

### Earnings Summary Output
JSON with:
- Tone: "optimistic"
- Key positives (3-5 points)
- Key concerns (3-5 points)
- Forward guidance
- Growth initiatives

## Troubleshooting

**Error: "No module named 'fastapi'"**
→ Run: `pip install -r requirements.txt`

**Error: "OPENAI_API_KEY not found"**
→ Create `.env` file with your API key

**Error: "No files uploaded"**
→ Upload files first using `/upload` endpoint

## Next Step: Frontend

After backend testing, proceed to frontend development.

---

**Need help?** See detailed docs:
- README.md - Full setup guide
- TESTING.md - Comprehensive testing
- DEPLOYMENT.md - Deploy to Render
- PROJECT_OVERVIEW.md - Architecture details
