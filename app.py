import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import PyPDF2
import io
import logging
import json
import traceback

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyC16ILL4rIHHUue9H8hvDA0qxqmaIdp9cs"  # Replace with your key
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Rate limiting variables
LAST_REQUEST_TIME = 0
REQUEST_DELAY = 10  # Delay in seconds between requests

def process_gemini_response(response_text):
    """Clean and format Gemini response"""
    try:
        cleaned_text = response_text.replace('```json', '').replace('```', '').strip()
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        try:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response_text[start:end]
                return json.loads(json_str)
        except:
            raise ValueError("Could not parse Gemini response as JSON")

def extract_text_with_positions(pdf_stream):
    """Extract text from PDF with page numbers"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        total_pages = len(pdf_reader.pages)
        text_data = []
        
        for page_num in range(total_pages):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            if text.strip():  # Only add non-empty pages
                text_data.append({
                    "page": page_num + 1,
                    "text": text
                })
        
        return text_data, total_pages
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise

def analyze_quarterly_report(text_data, total_pages):
    """Analyze report using Gemini"""
    global LAST_REQUEST_TIME
    
    try:
        # Rate limiting: Ensure a delay between requests
        current_time = time.time()
        if current_time - LAST_REQUEST_TIME < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - (current_time - LAST_REQUEST_TIME))
        LAST_REQUEST_TIME = time.time()
        
        # Combine text with page markers
        marked_text = "\n".join([
            f"[PAGE {page['page']}]\n{page['text']}" 
            for page in text_data
        ])
        
        prompt = f"""Analyze this quarterly financial report and extract key information in exactly this JSON format:
        {{
            "financialHighlights": [
                {{"title": "<metric name>", "value": "<actual value>", "page": <page number>, "keyword": "<search term>"}}
            ],
            "keyMetrics": [
                {{"title": "<metric name>", "value": "<actual value>", "page": <page number>, "keyword": "<search term>"}}
            ],
            "futureOutlook": [
                {{"title": "<point>", "value": "<description>", "page": <page number>, "keyword": "<search term>"}}
            ]
        }}

        Rules:
        1. Extract 3-4 most important items per category
        2. Use exact numbers and values from the text
        3. Ensure page numbers are accurate based on [PAGE X] markers
        4. Keep keyword short but specific for highlighting
        5. Include the most significant metrics only

        Total pages in document: {total_pages}
        """
        
        response = model.generate_content([prompt, marked_text])
        parsed_response = process_gemini_response(response.text)
        
        # Validate structure
        required_keys = ['financialHighlights', 'keyMetrics', 'futureOutlook']
        if not all(key in parsed_response for key in required_keys):
            raise ValueError("Missing required sections in analysis")
            
        return parsed_response
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}\nResponse: {response.text if 'response' in locals() else 'No response'}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'version': '1.0',
            'gemini': bool(GEMINI_API_KEY)
        })
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/analyze-pdf', methods=['POST'])
def analyze_pdf():
    """PDF analysis endpoint"""
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        # Process PDF
        file_content = file.read()
        pdf_stream = io.BytesIO(file_content)
        
        # Extract text
        text_data, total_pages = extract_text_with_positions(pdf_stream)
        if not text_data:
            return jsonify({'error': 'Could not extract text from PDF'}), 400
            
        # Analyze content
        insights = analyze_quarterly_report(text_data, total_pages)
        
        return jsonify({
            'success': True,
            'insights': insights,
            'totalPages': total_pages
        })
        
    except Exception as e:
        logger.error(f"Error processing request: {traceback.format_exc()}")
        return jsonify({
            'error': 'Analysis failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    # Ensure GEMINI_API_KEY is set
    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        raise ValueError("Please set your Gemini API key!")
        
    app.run(debug=True, port=5001)