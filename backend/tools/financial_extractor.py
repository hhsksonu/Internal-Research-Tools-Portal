import os
import re
import pandas as pd
from PyPDF2 import PdfReader
from openai import OpenAI
from typing import List, Dict, Any

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
                "Note: LLM is only used as fallback when pattern matching fails."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file
    Returns plain text or raises error
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Could not reliably extract text from PDF: {str(e)}")


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


def find_numbers_in_text(text: str, keyword: str) -> List[str]:
    """
    Simple pattern matching to find numbers near keywords
    Returns list of potential numbers
    """
    # Look for keyword and numbers nearby
    # This is basic - looks for numbers within 200 chars of keyword
    keyword_lower = keyword.lower()
    text_lower = text.lower()
    
    found_numbers = []
    
    # Find all occurrences of keyword
    start = 0
    while True:
        pos = text_lower.find(keyword_lower, start)
        if pos == -1:
            break
        
        # Get surrounding text (200 chars before and after)
        context_start = max(0, pos - 200)
        context_end = min(len(text), pos + 200)
        context = text[context_start:context_end]
        
        # Find numbers in context (with commas, decimals, etc)
        numbers = re.findall(r'\d[\d,]*\.?\d*', context)
        found_numbers.extend(numbers)
        
        start = pos + 1
    
    return found_numbers


def use_llm_fallback(text: str, line_items: Dict[str, List[str]]) -> Dict[str, Any]:
    """
    Use LLM as fallback when pattern matching fails
    Asks LLM to extract specific line items
    """
    try:
        # Get OpenAI client (only when needed)
        client = get_openai_client()
        
        # Create list of items to extract
        items_to_extract = list(line_items.keys())
        
        prompt = f"""You are analyzing a financial statement excerpt.

Text excerpt:
{text[:3000]}

Please identify and extract the following income statement line items (if present):
{', '.join(items_to_extract)}

For each line item found, extract:
1. The numeric value (without currency symbols)
2. The year (if mentioned as FY 25, FY 24, 2025, 2024, etc.)

Return ONLY a JSON object with this structure:
{{
  "Currency": "INR/USD/EUR/etc or Unknown",
  "Years": ["FY 25", "FY 24", ...],
  "Items": {{
    "Total Revenue": {{"FY 25": "123456", "FY 24": "Not Found"}},
    "PAT": {{"FY 25": "45678", "FY 24": "Not Found"}},
    ...
  }}
}}

If a line item is NOT found, use "Not Found" as the value.
DO NOT make up values. If unclear, use "Not Found".
"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=1500
        )
        
        result_text = response.choices[0].message.content
        
        # Try to parse JSON from response
        import json
        # Remove markdown code blocks if present
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(result_text)
        
        return result
    
    except Exception as e:
        print(f"LLM fallback failed: {e}")
        return {}


def extract_financial_data_from_text(text: str) -> Dict[str, Any]:
    """
    Main extraction logic - extracts 10-15 core income statement items
    Returns data structure with years as columns
    """
    
    # Define 10-15 core line items to extract
    line_items = {
        "Total Revenue": ["total revenue", "revenue from operations", "net revenue", "total income", "sales"],
        "Other Income": ["other income", "other operating revenue", "other sources"],
        "Total Income": ["total income", "total revenue and income"],
        "Operating Expenses": ["total operating expenses", "operating costs", "total expenses"],
        "Cost of Materials": ["cost of materials consumed", "cost of goods sold", "material cost", "cogs"],
        "Employee Expenses": ["employee benefit expenses", "employee costs", "staff costs", "salaries"],
        "Other Expenses": ["other expenses", "administrative expenses"],
        "EBITDA": ["ebitda", "earnings before interest"],
        "Depreciation": ["depreciation", "amortization", "depreciation and amortization"],
        "EBIT": ["ebit", "operating profit", "earnings before interest and tax"],
        "Finance Costs": ["finance costs", "interest expense", "finance charges"],
        "PBT": ["profit before tax", "pbt", "earnings before tax"],
        "Tax Expense": ["tax expense", "income tax", "current tax", "provision for tax"],
        "PAT": ["profit after tax", "pat", "net profit", "net income"],
    }
    
    # Try to find currency
    currency = "Unknown"
    currency_patterns = [
        r'\(.*?in\s+(USD|EUR|GBP|INR|JPY|CNY)\s+(?:crores?|millions?|thousands?)',
        r'\b(USD|EUR|GBP|INR|JPY|CNY|Rs\.?)\b',
        r'₹',  # Indian Rupee symbol
    ]
    
    for pattern in currency_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if '₹' in pattern:
                currency = "INR"
            else:
                currency = match.group(1).upper()
            break
    
    # Try to find years - look for FY patterns and year numbers
    year_patterns = [
        r'\bFY[\s-]?(\d{2})\b',  # FY 25, FY-25, FY25
        r'\bFY[\s-]?\'(\d{2})\b',  # FY '25, FY-'25
        r'\b(20\d{2})\b',  # 2025, 2024
        r'\b(19\d{2})\b',  # 1995, etc
    ]
    
    years_found = []
    for pattern in year_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if len(match) == 2:  # FY format
                year_num = int(match)
                # Convert to full year (assume 2000s)
                full_year = 2000 + year_num if year_num < 50 else 1900 + year_num
                years_found.append(f"FY {match}")
            else:
                years_found.append(match)
    
    # Get unique years, sorted descending
    unique_years = sorted(set(years_found), key=lambda x: int(x.replace('FY ', '').replace('\'', '')), reverse=True)[:6]
    
    if not unique_years:
        unique_years = ["Unknown"]
    
    # Initialize result structure
    result = {
        "Currency": currency,
        "Years": unique_years,
        "Line Items": {}
    }
    
    # Extract each line item for each year
    total_found = 0
    for item_name, keywords in line_items.items():
        result["Line Items"][item_name] = {}
        
        for year in unique_years:
            # Try to find value for this item and year
            value = find_value_for_item_and_year(text, keywords, year)
            result["Line Items"][item_name][year] = value if value else "Not Found"
            if value:
                total_found += 1
    
    # If pattern matching found almost nothing, try LLM fallback
    expected_values = len(line_items) * len(unique_years)
    if total_found < (expected_values * 0.2):  # Less than 20% found
        print("Pattern matching found very little data, trying LLM fallback...")
        try:
            llm_result = use_llm_fallback(text, line_items)
            if llm_result and "Items" in llm_result:
                # Merge LLM results with pattern matching results
                for item_name, year_values in llm_result["Items"].items():
                    if item_name in result["Line Items"]:
                        for year, value in year_values.items():
                            # Only use LLM value if pattern matching didn't find anything
                            if result["Line Items"][item_name].get(year) == "Not Found":
                                result["Line Items"][item_name][year] = value
                
                # Update currency if LLM found it
                if "Currency" in llm_result and llm_result["Currency"] != "Unknown":
                    result["Currency"] = llm_result["Currency"]
                
                # Update years if LLM found different ones
                if "Years" in llm_result and llm_result["Years"]:
                    result["Years"] = llm_result["Years"]
        except Exception as e:
            print(f"LLM fallback error: {e}")
    
    return result


def find_value_for_item_and_year(text: str, keywords: List[str], year: str) -> str:
    """
    Find the numeric value for a specific line item and year
    Uses simple pattern matching
    """
    # Search for keyword followed by numbers
    for keyword in keywords:
        # Create pattern that looks for keyword and year in proximity
        # Then finds numbers nearby
        keyword_lower = keyword.lower()
        
        # Find all occurrences of keyword
        start = 0
        while True:
            pos = text.lower().find(keyword_lower, start)
            if pos == -1:
                break
            
            # Get context (500 chars around keyword)
            context_start = max(0, pos - 250)
            context_end = min(len(text), pos + 250)
            context = text[context_start:context_end]
            
            # Check if year is mentioned in context
            if year.replace('FY ', '') in context or year in context:
                # Find numbers in this context
                # Look for common number formats: 1,234.56 or 1234.56 or 1,234
                numbers = re.findall(r'\d[\d,]*\.?\d*', context)
                if numbers:
                    # Return first substantial number (not single digits)
                    for num in numbers:
                        cleaned = num.replace(',', '')
                        if len(cleaned) >= 2:  # At least 2 digits
                            return num
            
            start = pos + 1
    
    return ""


def extract_financial_data(file_paths: List[str]) -> str:
    """
    Main function to extract financial data from uploaded files
    Returns path to generated Excel file
    """
    all_data = []
    
    for file_path in file_paths:
        try:
            # Extract text
            text = extract_text_from_file(file_path)
            
            if not text.strip():
                # Empty file - add error entry
                continue
            
            # Extract financial data
            data = extract_financial_data_from_text(text)
            data["Source File"] = os.path.basename(file_path)
            all_data.append(data)
        
        except Exception as e:
            # Error handling - add error entry
            print(f"Error processing {file_path}: {e}")
            continue
    
    if not all_data:
        # No data extracted - create error Excel
        df = pd.DataFrame([{
            "Error": "Could not extract financial data from any uploaded files"
        }])
        output_file = "financial_extraction.xlsx"
        df.to_excel(output_file, index=False, engine='openpyxl')
        return output_file
    
    # Convert to DataFrame with years as columns
    # Structure: Line Item | FY 25 | FY 24 | FY 23 | ... | Currency | Source File | Notes
    
    rows = []
    for file_data in all_data:
        source_file = file_data["Source File"]
        currency = file_data["Currency"]
        years = file_data["Years"]
        
        # Add header row for this file
        rows.append({
            "Line Item": f"=== {source_file} ===",
            **{year: "" for year in years},
            "Currency": currency,
            "Notes": ""
        })
        
        # Add each line item as a row
        for item_name, year_values in file_data["Line Items"].items():
            row = {"Line Item": item_name}
            
            # Add values for each year
            missing_years = []
            for year in years:
                value = year_values.get(year, "Not Found")
                row[year] = value
                if value == "Not Found":
                    missing_years.append(year)
            
            # Add notes for missing data
            if missing_years:
                row["Notes"] = f"Missing: {', '.join(missing_years)}"
            else:
                row["Notes"] = ""
            
            row["Currency"] = currency
            rows.append(row)
        
        # Add blank row between files
        rows.append({})
    
    # Create DataFrame
    df = pd.DataFrame(rows)
    
    # Ensure column order: Line Item, then years (newest first), then Currency, Notes
    year_columns = []
    for row in rows:
        for col in row.keys():
            if col not in ["Line Item", "Currency", "Notes"] and col:
                if col not in year_columns:
                    year_columns.append(col)
    
    # Sort years (newest first)
    year_columns = sorted(year_columns, reverse=True)
    
    column_order = ["Line Item"] + year_columns + ["Currency", "Notes"]
    
    # Reorder columns
    df = df.reindex(columns=column_order)
    
    # Save to Excel
    output_file = "financial_extraction.xlsx"
    df.to_excel(output_file, index=False, engine='openpyxl')
    
    return output_file
