# Research Portal - Project Overview

## What This Is

An internal research portal that uses AI as specific research tools (NOT a chatbot).

Researchers upload documents → System processes them → Tools produce structured outputs

## Two Research Tools

### Tool A: Financial Statement Extraction
**Purpose**: Extract key financial metrics from annual reports/statements

**Input**: PDF or text files with financial data  
**Output**: Excel spreadsheet with structured data

**What it does**:
1. Extracts text from uploaded PDF/text files
2. Uses pattern matching to find: Revenue, Operating Expenses, EBIT, Net Profit
3. Falls back to LLM only for ambiguous label normalization
4. Returns Excel file with all extracted data

**Key features**:
- No hallucination - only extracts what's clearly present
- Marks missing data as "Not Found"
- Extracts multiple years if present
- Identifies currency when mentioned

### Tool B: Earnings Call Summary
**Purpose**: Analyze earnings call transcripts and management discussions

**Input**: Text files with earnings call transcripts  
**Output**: Structured JSON with key insights

**What it does**:
1. Reads transcript text
2. Performs sentiment analysis (optimistic/cautious/neutral/pessimistic)
3. Uses LLM to extract:
   - 3-5 key positives
   - 3-5 key concerns
   - Forward guidance
   - Growth initiatives
   - Capacity utilization trends
4. Returns structured JSON

**Key features**:
- Tone justified by text evidence
- Explicit "Not mentioned" for missing info
- No fabrication of data
- Confidence level based on keyword density

## Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (Future)              │
│     - Upload interface                  │
│     - Tool selection                    │
│     - Results display                   │
└─────────────────┬───────────────────────┘
                  │ HTTP API
┌─────────────────▼───────────────────────┐
│         FastAPI Backend                 │
│  ┌────────────────────────────────┐    │
│  │  Endpoints:                     │    │
│  │  - POST /upload                 │    │
│  │  - POST /tools/financial-extract│    │
│  │  - POST /tools/earnings-summary │    │
│  └────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼───────────┐
│  Tool A        │  │  Tool B          │
│  Financial     │  │  Earnings        │
│  Extractor     │  │  Summarizer      │
│                │  │                  │
│ - PDF parse    │  │ - Text extract   │
│ - Regex match  │  │ - Sentiment      │
│ - LLM fallback │  │ - LLM extract    │
│ - Excel output │  │ - JSON output    │
└────────────────┘  └──────────────────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │   OpenAI API      │
        │   (GPT-4o-mini)   │
        └───────────────────┘
```

## Tech Stack

- **Backend**: FastAPI (Python web framework)
- **LLM**: OpenAI GPT-4o-mini (cost-effective)
- **PDF Processing**: PyPDF2
- **Data Processing**: Pandas
- **Excel Generation**: openpyxl

## File Structure

```
research-portal/
├── main.py                          # FastAPI app with endpoints
├── requirements.txt                 # Python dependencies
├── .env                            # API keys (create this)
├── .env.example                    # Example env file
├── render.yaml                     # Render deployment config
├── start.sh                        # Quick start script
├── tools/
│   ├── __init__.py
│   ├── financial_extractor.py      # Option A logic
│   └── earnings_summarizer.py      # Option B logic
├── uploads/                        # Temporary file storage
├── sample_financial_report.txt     # Test data
├── sample_earnings_call.txt        # Test data
├── test_api.py                     # Automated test script
├── README.md                       # Setup guide
├── TESTING.md                      # Testing instructions
└── DEPLOYMENT.md                   # Deployment guide
```

## How Data Flows

### Financial Extraction Flow:
```
1. User uploads PDF/text file
   → Saved to /uploads

2. User clicks "Run Financial Extraction"
   → POST /tools/financial-extraction

3. Backend:
   a. Read file from /uploads
   b. Extract text (PyPDF2 or plain text)
   c. Pattern matching for keywords:
      - "Revenue" → find nearby numbers
      - "Operating Expenses" → find nearby numbers
      - etc.
   d. If pattern matching fails:
      → Call OpenAI API to normalize labels
   e. Create Pandas DataFrame
   f. Export to Excel (.xlsx)

4. Return Excel file to user
```

### Earnings Summary Flow:
```
1. User uploads text file
   → Saved to /uploads

2. User clicks "Run Earnings Summary"
   → POST /tools/earnings-summary

3. Backend:
   a. Read file from /uploads
   b. Basic sentiment analysis:
      - Count positive keywords (growth, strong, etc.)
      - Count negative keywords (decline, concern, etc.)
      - Determine tone
   c. Call OpenAI API (1-2 calls):
      - Extract key positives
      - Extract key concerns
      - Extract growth initiatives
   d. Pattern match for guidance and capacity info
   e. Build JSON response

4. Return JSON to user
```

## Code Style Philosophy

The code is written to look like a junior/mid-level developer wrote it:

✅ **Good practices**:
- Clear variable names
- Simple logic
- Comments where helpful
- Straightforward flow

❌ **Avoided**:
- Over-engineering
- Complex abstractions
- Fancy design patterns
- Heavy optimizations
- Enterprise-grade structure

**Why?**: Reliability and clarity over cleverness.

## Error Handling Strategy

- **Transparent errors**: Show real error messages
- **No retries**: If LLM fails, return error (don't hide it)
- **No hallucination**: If data missing, say "Not Found"
- **Clear warnings**: Mark ambiguous extractions

## LLM Usage Strategy

**Minimal and purposeful**:

Option A (Financial):
- Primary: Pattern matching + regex
- LLM: Only for normalizing ambiguous labels
- ~1 LLM call per run (sometimes 0)

Option B (Earnings):
- Primary: Keyword-based sentiment
- LLM: Extract specific points from text
- ~1-2 LLM calls per run

**Why minimal?**:
- Cost efficiency
- Faster processing
- More reliable (less hallucination)

## Deployment

**Recommended**: Render.com (free tier)
- Automatic deployment from GitHub
- Environment variable management
- HTTPS included
- Cold start: 30-60 seconds

**Alternatives**:
- Railway
- Heroku
- Vercel (for serverless)

## Free Tier Limitations

- **Processing**: May be slower on free hosting
- **File size**: Limited to ~10MB per file
- **Concurrency**: One request at a time
- **Storage**: Temporary only (files deleted)
- **Uptime**: Render free tier spins down after 15min inactivity

## What Makes This Different from a Chatbot

| Chatbot | Research Tools |
|---------|---------------|
| Open-ended conversations | Specific structured tasks |
| General Q&A | Targeted data extraction |
| Free-form output | Structured output (Excel/JSON) |
| Unpredictable results | Consistent format |
| Hard to audit | Easy to verify |

## Success Criteria

1. ✅ Both tools work end-to-end
2. ✅ No hallucination - honest about missing data
3. ✅ Structured output (Excel + JSON)
4. ✅ Simple, readable code
5. ✅ Clear error messages
6. ✅ Deployable on free tier
7. ✅ Testable with sample docs

## Next Steps (Frontend - Not Yet Built)

1. Simple upload interface
2. Tool selection buttons
3. Results display area
4. Download button for Excel
5. JSON viewer for earnings summary

Will be built with: HTML + Tailwind CSS + Vanilla JavaScript
(Keeping it simple - no React/Vue complexity)
