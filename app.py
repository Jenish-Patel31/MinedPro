from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/company', methods=['POST'])
def handle_company_request():
    try:
        data = request.json
        url = data.get('url')
        
        if not url:
            return jsonify({"error": "URL is required"}), 400

        # Extract company symbol from URL
        company_symbol = url.split('/')[2]
        
        # Return test data
        return jsonify({
            "company_symbol": company_symbol,
            "test_response": "API is working",
            "metrics": {
                "core_financials": {
                    "revenue": {"value": 1000, "unit": "Cr"},
                    "net_profit": {"value": 100, "unit": "Cr"}
                }
            }
        })

    except Exception as e:
        print(f"Error handling request: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)