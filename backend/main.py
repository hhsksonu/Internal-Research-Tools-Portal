from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from typing import List
from dotenv import load_dotenv

# Import our tool modules
from tools.financial_extractor import extract_financial_data
from tools.earnings_summarizer import summarize_earnings_call

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Research Portal API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Global variable to store current session files
current_files = []


@app.get("/")
def home():
    """Root endpoint"""
    return {
        "message": "Research Portal API",
        "version": "1.0",
        "tools": ["financial_extraction", "earnings_summary"]
    }


@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Upload one or more documents
    Stores them temporarily in uploads/ folder
    """
    global current_files
    
    # Clear previous uploads
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting {file_path}: {e}")
    
    current_files = []
    uploaded_files = []
    
    # Save new files
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        current_files.append(file_path)
        uploaded_files.append({
            "filename": file.filename,
            "size": os.path.getsize(file_path)
        })
    
    return {
        "message": f"Uploaded {len(files)} file(s) successfully",
        "files": uploaded_files
    }


@app.get("/files")
def list_uploaded_files():
    """List currently uploaded files"""
    files_info = []
    for file_path in current_files:
        if os.path.exists(file_path):
            files_info.append({
                "filename": os.path.basename(file_path),
                "size": os.path.getsize(file_path)
            })
    return {"files": files_info}


@app.post("/tools/financial-extraction")
async def run_financial_extraction():
    """
    Run Option A: Financial Statement Extraction
    Returns downloadable Excel file
    """
    if not current_files:
        raise HTTPException(status_code=400, detail="No files uploaded. Please upload documents first.")
    
    try:
        # Process files and generate Excel
        output_file = extract_financial_data(current_files)
        
        if not os.path.exists(output_file):
            raise HTTPException(status_code=500, detail="Failed to generate Excel file")
        
        return FileResponse(
            output_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="financial_extraction.xlsx"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing financial data: {str(e)}")


@app.post("/tools/earnings-summary")
async def run_earnings_summary():
    """
    Run Option B: Earnings Call Summary
    Returns structured JSON
    """
    if not current_files:
        raise HTTPException(status_code=400, detail="No files uploaded. Please upload documents first.")
    
    try:
        # Process files and generate summary
        summary = summarize_earnings_call(current_files)
        return summary
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
