# Testing Instructions

## Prerequisites

1. Python 3.9 or higher installed
2. OpenAI API key
3. Sample documents (provided in the repository)

## Setup Steps

### 1. Install Dependencies

```bash
cd research-portal
pip install -r requirements.txt
```

### 2. Configure API Key

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### 3. Start the Server

```bash
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Testing Methods

### Method 1: Using the Test Script (Recommended)

```bash
# In a new terminal (keep server running)
python test_api.py
```

This will automatically:
- Test all endpoints
- Upload sample files
- Run both tools
- Save output files

### Method 2: Using curl

#### Test 1: Home Endpoint
```bash
curl http://localhost:8000/
```

Expected output:
```json
{
  "message": "Research Portal API",
  "version": "1.0",
  "tools": ["financial_extraction", "earnings_summary"]
}
```

#### Test 2: Upload Files
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "files=@sample_financial_report.txt" \
  -F "files=@sample_earnings_call.txt"
```

Expected output:
```json
{
  "message": "Uploaded 2 file(s) successfully",
  "files": [
    {"filename": "sample_financial_report.txt", "size": 1234},
    {"filename": "sample_earnings_call.txt", "size": 5678}
  ]
}
```

#### Test 3: List Files
```bash
curl http://localhost:8000/files
```

#### Test 4: Financial Extraction (Option A)
```bash
curl -X POST "http://localhost:8000/tools/financial-extraction" \
  --output financial_extraction.xlsx
```

This downloads an Excel file. Open it to verify:
- Columns: Source File, Year, Revenue, Operating Expenses, EBIT, Net Profit, Currency, Notes
- Data extracted from sample_financial_report.txt

#### Test 5: Earnings Summary (Option B)
```bash
curl -X POST "http://localhost:8000/tools/earnings-summary"
```

Expected output structure:
```json
{
  "source_files": ["sample_earnings_call.txt"],
  "management_tone": "optimistic",
  "confidence_level": "high",
  "key_positives": [
    "Revenue grew 15% year-over-year",
    "Operating margins improved to 20.5%",
    ...
  ],
  "key_concerns": [
    "Supply chain challenges persist",
    "Raw material costs increased by 8%",
    ...
  ],
  "forward_guidance": "10-12% revenue growth and operating margin expansion",
  "capacity_utilization_trends": "Increasing capacity utilization mentioned",
  "growth_initiatives": [
    "Expansion into Asian markets",
    "Investment in R&D for next-generation products",
    ...
  ]
}
```

### Method 3: Using Python Requests

```python
import requests

# Upload
files = [('files', open('sample_financial_report.txt', 'rb'))]
r = requests.post('http://localhost:8000/upload', files=files)
print(r.json())

# Financial Extraction
r = requests.post('http://localhost:8000/tools/financial-extraction')
with open('output.xlsx', 'wb') as f:
    f.write(r.content)

# Earnings Summary
r = requests.post('http://localhost:8000/tools/earnings-summary')
print(r.json())
```

### Method 4: Using Swagger UI

1. Open browser: http://localhost:8000/docs
2. Interactive API documentation
3. Click "Try it out" on any endpoint
4. Test directly from browser

## Expected Outputs

### Option A: Financial Extraction

Excel file with columns:
- **Source File**: Name of the uploaded file
- **Year**: Extracted year (e.g., 2023, 2022)
- **Revenue**: Revenue value or "Not Found"
- **Operating Expenses**: Operating expenses value or "Not Found"
- **Operating Profit / EBIT**: EBIT value or "Not Found"
- **Net Profit**: Net profit value or "Not Found"
- **Currency**: Detected currency (e.g., USD) or "Unknown"
- **Notes / Warnings**: Any warnings like "Missing: Revenue"

### Option B: Earnings Summary

JSON with structure:
```json
{
  "source_files": ["filename.txt"],
  "management_tone": "optimistic | cautious | neutral | pessimistic",
  "confidence_level": "high | medium | low",
  "key_positives": ["Point 1", "Point 2", ...],
  "key_concerns": ["Concern 1", "Concern 2", ...],
  "forward_guidance": "Guidance text or 'Not mentioned'",
  "capacity_utilization_trends": "Trend description or 'Not mentioned'",
  "growth_initiatives": ["Initiative 1", "Initiative 2", ...]
}
```

## Troubleshooting

### Error: "No files uploaded"
- Make sure you uploaded files first using `/upload` endpoint

### Error: "OPENAI_API_KEY not found"
- Check that `.env` file exists
- Verify API key is set correctly
- Restart the server after adding API key

### Error: "Could not extract text from PDF"
- PDF might be scanned/image-based
- Try converting to text first
- Use text files instead

### Error: "LLM API failed"
- Check API key is valid
- Verify you have OpenAI credits
- Check internet connection

### Empty Results
- Make sure sample files are in the correct directory
- Check file content is readable
- Try with different documents

## Testing with Your Own Documents

### For Financial Extraction:
1. Upload PDF or text file with financial statements
2. Should contain: Income statement, revenue, expenses, profit figures
3. Better results with structured, clear formatting

### For Earnings Summary:
1. Upload earnings call transcript or management discussion
2. Should contain: Management commentary, guidance, initiatives
3. Better results with conversational, narrative text

## API Performance

- **Upload**: < 1 second
- **Financial Extraction**: 5-15 seconds (depending on file size and LLM calls)
- **Earnings Summary**: 5-10 seconds (1-2 LLM calls)

## Free Tier Notes

- OpenAI GPT-4o-mini costs approximately $0.15 per million input tokens
- Each tool run uses ~1000-3000 tokens
- Cost per run: ~$0.0003-0.0005
- 100 runs ≈ $0.05
