#!/bin/bash

# Startup script for Research Portal

echo "================================"
echo "Research Portal - Starting Server"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file with your OPENAI_API_KEY"
    echo "Example: cp .env.example .env"
    exit 1
fi

# Check if dependencies are installed
python3 -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Dependencies not installed. Installing..."
    pip install -r requirements.txt
fi

# Create uploads directory
mkdir -p uploads

# Start server
echo ""
echo "Starting server on http://localhost:8000"
echo "API docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 main.py
