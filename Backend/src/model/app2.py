from flask import Flask, request, jsonify
from flask_cors import CORS
from main2 import check_drug_interactions  # Import function from main.py

app = Flask(__name__)


CORS(app)

latest_interaction = None  

@app.route("/check_interactions", methods=["POST"])
def check_interactions():
    global latest_interaction
    try:
        data = request.get_json()
        drugs = data.get("medications", [])

        if len(drugs) < 2:
            return jsonify({"error": "Provide at least two drug names."}), 400

        json_data = check_drug_interactions(drugs)

        if "error" not in json_data:
            latest_interaction = json_data
            return jsonify(json_data)
        else:
            return jsonify(json_data), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/interaction_summary", methods=["GET"])
def get_summary():
    if latest_interaction:
        return jsonify(latest_interaction)
    return jsonify({"error": "No drug interaction summary available"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=3000)
