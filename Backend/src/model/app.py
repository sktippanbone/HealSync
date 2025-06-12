from flask import Flask, request, jsonify
from flask_cors import CORS
from main import summarize_pdfs  

app = Flask(__name__)

CORS(app)

latest_summary = None  

@app.route("/summarize", methods=["POST"])
def summarize():
    global latest_summary
    try:
        data = request.get_json()
        pdf_urls = data.get("pdf_urls", [])

        if not pdf_urls:
            return jsonify({"error": "No PDF URLs provided"}), 400

      
        json_data = summarize_pdfs(pdf_urls)

        if "error" not in json_data:
            latest_summary = json_data
            return jsonify(json_data)
        else:
            return jsonify(json_data), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/summary", methods=["GET"])
def get_summary():
    if latest_summary:
        return jsonify(latest_summary)
    return jsonify({"error": "No summary available"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=3000)