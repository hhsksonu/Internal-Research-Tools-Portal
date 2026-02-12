import os
import re
from openai import OpenAI
from typing import List, Dict, Any
from PyPDF2 import PdfReader

# Don't initialize client globally - do it when needed
_client = None


def get_openai_client():
    """
    Get OpenAI client (lazy initialization)
    Only creates client when actually needed
    """
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise Exception(
                "OpenAI API key not found. Please set OPENAI_API_KEY in your .env file. "
                "LLM is required for earnings call analysis."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Could not extract text from PDF: {str(e)}")


def extract_text_from_file(file_path: str) -> str:
    """
    Extract text based on file type
    """
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise Exception(f"Unsupported file type: {file_path}")


def analyze_sentiment_basic(text: str) -> tuple:
    """
    Basic sentiment analysis using keywords
    Returns (tone, confidence_level)
    """
    text_lower = text.lower()
    
    # Keyword lists
    positive_keywords = ["growth", "strong", "increase", "improved", "optimistic", "positive", 
                        "expansion", "opportunity", "success", "excellent", "robust", "momentum"]
    negative_keywords = ["decline", "weak", "decrease", "challenging", "concern", "risk", 
                        "difficult", "pressure", "uncertainty", "cautious", "headwind"]
    
    # Count keywords
    positive_count = sum(1 for keyword in positive_keywords if keyword in text_lower)
    negative_count = sum(1 for keyword in negative_keywords if keyword in text_lower)
    
    # Determine tone
    if positive_count > negative_count * 1.5:
        tone = "optimistic"
    elif negative_count > positive_count * 1.5:
        tone = "pessimistic"
    elif positive_count > negative_count:
        tone = "cautiously optimistic"
    elif negative_count > positive_count:
        tone = "cautious"
    else:
        tone = "neutral"
    
    # Determine confidence based on text length and keyword density
    total_keywords = positive_count + negative_count
    text_length = len(text_lower.split())
    keyword_density = total_keywords / max(text_length, 1) * 100
    
    if keyword_density > 2:
        confidence = "high"
    elif keyword_density > 1:
        confidence = "medium"
    else:
        confidence = "low"
    
    return tone, confidence


def extract_key_points_with_llm(text: str, section_type: str) -> List[str]:
    """
    Use LLM to extract key points
    section_type: 'positives', 'concerns', or 'initiatives'
    """
    try:
        # Get OpenAI client (only when needed)
        client = get_openai_client()
        
        if section_type == "positives":
            instruction = "Extract 3-5 key positive highlights or achievements mentioned by management. Focus on facts, not opinions."
        elif section_type == "concerns":
            instruction = "Extract 3-5 key concerns, challenges, or risks mentioned by management. Focus on facts, not opinions."
        elif section_type == "initiatives":
            instruction = "Extract 2-3 growth initiatives or strategic priorities mentioned by management."
        else:
            return []
        
        prompt = f"""You are analyzing an earnings call transcript or management discussion.

Text:
{text[:4000]}

Task: {instruction}

Return ONLY a JSON array of strings, like:
["Point 1", "Point 2", "Point 3"]

If nothing relevant is found, return: ["Not mentioned"]

Do NOT make up information. Only extract what is clearly stated.
"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=500
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Parse JSON
        import json
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        points = json.loads(result_text)
        
        return points if isinstance(points, list) else []
    
    except Exception as e:
        print(f"Error extracting {section_type}: {e}")
        return ["Error extracting information"]


def extract_forward_guidance(text: str) -> str:
    """
    Extract forward guidance using simple pattern matching + LLM
    """
    text_lower = text.lower()
    
    # Look for guidance keywords
    guidance_keywords = ["guidance", "outlook", "forecast", "expect", "anticipate", "project"]
    
    has_guidance = any(keyword in text_lower for keyword in guidance_keywords)
    
    if not has_guidance:
        return "Not mentioned"
    
    # Use LLM to extract specific guidance
    try:
        # Get OpenAI client (only when needed)
        client = get_openai_client()
        
        prompt = f"""You are analyzing an earnings call transcript.

Text:
{text[:3000]}

Task: Extract any forward-looking guidance mentioned by management (revenue targets, earnings forecasts, growth rates, etc.)

Return a brief 1-2 sentence summary of the guidance, or "Not mentioned" if no specific guidance is provided.

Do NOT make up numbers or forecasts.
"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=200
        )
        
        guidance = response.choices[0].message.content.strip()
        return guidance if guidance else "Not mentioned"
    
    except Exception as e:
        print(f"Error extracting guidance: {e}")
        return "Not mentioned"


def extract_capacity_utilization(text: str) -> str:
    """
    Extract capacity utilization trends
    """
    text_lower = text.lower()
    
    # Keywords related to capacity
    capacity_keywords = ["capacity", "utilization", "production", "manufacturing", "output"]
    
    has_capacity_info = any(keyword in text_lower for keyword in capacity_keywords)
    
    if not has_capacity_info:
        return "Not mentioned"
    
    # Simple pattern matching for trends
    if "increas" in text_lower and any(kw in text_lower for kw in capacity_keywords):
        return "Increasing capacity utilization mentioned"
    elif "decreas" in text_lower and any(kw in text_lower for kw in capacity_keywords):
        return "Decreasing capacity utilization mentioned"
    elif "stable" in text_lower or "maintain" in text_lower:
        return "Stable capacity utilization mentioned"
    else:
        return "Capacity discussed but trend unclear"


def summarize_earnings_call(file_paths: List[str]) -> Dict[str, Any]:
    """
    Main function to summarize earnings call
    Returns structured JSON
    """
    # Combine text from all files
    combined_text = ""
    source_files = []
    
    for file_path in file_paths:
        try:
            text = extract_text_from_file(file_path)
            combined_text += text + "\n\n"
            source_files.append(os.path.basename(file_path))
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    if not combined_text.strip():
        return {
            "error": "Could not extract text from any uploaded files",
            "source_files": source_files
        }
    
    # Analyze sentiment
    tone, confidence = analyze_sentiment_basic(combined_text)
    
    # Extract key points using LLM
    positives = extract_key_points_with_llm(combined_text, "positives")
    concerns = extract_key_points_with_llm(combined_text, "concerns")
    initiatives = extract_key_points_with_llm(combined_text, "initiatives")
    
    # Extract guidance
    guidance = extract_forward_guidance(combined_text)
    
    # Extract capacity utilization
    capacity = extract_capacity_utilization(combined_text)
    
    # Build result
    result = {
        "source_files": source_files,
        "management_tone": tone,
        "confidence_level": confidence,
        "key_positives": positives[:5],  # Limit to 5
        "key_concerns": concerns[:5],  # Limit to 5
        "forward_guidance": guidance,
        "capacity_utilization_trends": capacity,
        "growth_initiatives": initiatives[:3]  # Limit to 3
    }
    
    return result
