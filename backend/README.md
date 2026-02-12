# Research Portal - Backend

Internal research portal with AI-powered document analysis tools.

## Features

This portal provides TWO research tools:

### Option A: Financial Statement Extraction
- Extracts income statement line items from annual reports / financial statements
- Outputs: Excel file with Revenue, Operating Expenses, EBIT, Net Profit
- Uses PDF parsing + pattern matching (LLM fallback for ambiguous cases)

### Option B: Earnings Call Summary
- Analyzes earnings call transcripts / management discussions
- Outputs: Structured JSON with tone, key points, guidance, growth initiatives
- Uses sentiment analysis + LLM extraction

## Technology Stack

- **Backend**: FastAPI
- **LLM**: OpenAI GPT-4o-mini
- **PDF Processing**: PyPDF2
- **Data Processing**: Pandas, openpyxl

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd research-portal
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload
```

Server will start at: `http://localhost:8000`

## API Endpoints

### 1. Upload Documents
```
POST /upload
Content-Type: multipart/form-data

files: [file1.pdf, file2.txt, ...]
```

Response:
```json
{
  "message": "Uploaded 2 file(s) successfully",
  "files": [
    {"filename": "report.pdf", "size": 123456}
  ]
}
```

### 2. List Uploaded Files
```
GET /files
```

### 3. Run Financial Extraction (Option A)
```
POST /tools/financial-extraction
```

Returns: Excel file download (`financial_extraction.xlsx`)

### 4. Run Earnings Summary (Option B)
```
POST /tools/earnings-summary
```

Returns: JSON object
```json
{
  "source_files": ["transcript.txt"],
  "management_tone": "optimistic",
  "confidence_level": "high",
  "key_positives": ["Revenue growth of 15%", ...],
  "key_concerns": ["Supply chain challenges", ...],
  "forward_guidance": "Expecting 10-12% revenue growth in Q4",
  "capacity_utilization_trends": "Increasing capacity utilization mentioned",
  "growth_initiatives": ["Expanding into new markets", ...]
}
```

## Testing the Backend

### Test 1: Upload Files

Using curl:
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "files=@sample_report.pdf"
```

Using Python:
```python
import requests

files = [('files', open('sample_report.pdf', 'rb'))]
response = requests.post('http://localhost:8000/upload', files=files)
print(response.json())
```

### Test 2: Financial Extraction

```bash
curl -X POST "http://localhost:8000/tools/financial-extraction" \
  --output financial_extraction.xlsx
```

### Test 3: Earnings Summary

```bash
curl -X POST "http://localhost:8000/tools/earnings-summary"
```

## File Structure

```
research-portal/
├── main.py                 # FastAPI application
├── requirements.txt        # Dependencies
├── .env                    # Environment variables (create this)
├── .env.example           # Example env file
├── tools/
│   ├── __init__.py
│   ├── financial_extractor.py    # Option A implementation
│   └── earnings_summarizer.py    # Option B implementation
├── uploads/               # Temporary file storage (auto-created)
└── README.md
```

## Important Notes

### Free Tier Limitations
- Uses OpenAI GPT-4o-mini (cheaper model)
- Approximately 1-2 API calls per tool run
- PDF processing may be slow for large files
- Temporary file storage only (files deleted on new upload)

### Data Handling
- Files stored in `uploads/` directory temporarily
- Previous uploads are deleted when new files are uploaded
- No database - everything is stateless
- Excel files generated in root directory

### Error Handling
- If PDF extraction fails: Returns clear error message
- If LLM API fails: Returns error with reason (no retries)
- Missing data: Clearly marked as "Not Found" or "Not mentioned"
- No hallucination: System only returns what it can reliably extract

## Deployment

Ready for deployment on:
- Render (recommended)
- Vercel
- Railway
- Heroku

Make sure to:
1. Set `OPENAI_API_KEY` environment variable in hosting platform
2. Use Python 3.9+
3. Install dependencies from requirements.txt

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
