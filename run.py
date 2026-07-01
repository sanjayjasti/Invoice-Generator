#!/usr/bin/env python3
"""
Development server runner.
For production, use wsgi.py with gunicorn.
"""

import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# Create app
app = create_app('development')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)