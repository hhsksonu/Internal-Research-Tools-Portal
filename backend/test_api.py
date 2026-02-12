"""
Manual Test Script for Research Portal Backend

This script helps test the API endpoints manually.
Run the server first: python main.py
Then run this script: python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_home():
    """Test root endpoint"""
    print("\n=== Testing Home Endpoint ===")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_upload():
    """Test file upload"""
    print("\n=== Testing File Upload ===")
    
    # Upload both sample files
    files = [
        ('files', ('sample_financial_report.txt', open('sample_financial_report.txt', 'rb'), 'text/plain')),
        ('files', ('sample_earnings_call.txt', open('sample_earnings_call.txt', 'rb'), 'text/plain'))
    ]
    
    response = requests.post(f"{BASE_URL}/upload", files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_list_files():
    """Test list files endpoint"""
    print("\n=== Testing List Files ===")
    response = requests.get(f"{BASE_URL}/files")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_financial_extraction():
    """Test financial extraction tool"""
    print("\n=== Testing Financial Extraction (Option A) ===")
    response = requests.post(f"{BASE_URL}/tools/financial-extraction")
    
    if response.status_code == 200:
        # Save the Excel file
        with open('test_output_financial.xlsx', 'wb') as f:
            f.write(response.content)
        print("Status: 200")
        print("Excel file saved as: test_output_financial.xlsx")
    else:
        print(f"Status: {response.status_code}")
        print(f"Error: {response.text}")


def test_earnings_summary():
    """Test earnings summary tool"""
    print("\n=== Testing Earnings Summary (Option B) ===")
    response = requests.post(f"{BASE_URL}/tools/earnings-summary")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")


if __name__ == "__main__":
    print("=" * 60)
    print("Research Portal Backend - Test Suite")
    print("=" * 60)
    
    try:
        # Run tests in sequence
        test_home()
        test_upload()
        test_list_files()
        test_financial_extraction()
        test_earnings_summary()
        
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
    
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to server.")
        print("Make sure the server is running: python main.py")
    except Exception as e:
        print(f"\nERROR: {e}")
