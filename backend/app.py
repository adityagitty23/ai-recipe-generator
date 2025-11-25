from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
import json
import re

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

API_URL = "https://models.inference.ai.azure.com/chat/completions"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


@app.route("/api/recipe", methods=["POST"])
def generate_recipe():
    data = request.json or {}
    ingredients = data.get("ingredients", "")
    cuisine = data.get("cuisine", "Any")
    diet = data.get("diet", "Any")
    servings = data.get("servings", 2)

    prompt = f"""
    You are a professional chef and nutrition expert.

    Task:
    Create ONE detailed recipe using ONLY these ingredients: {ingredients}

    Constraints:
    - Cuisine type: {cuisine}
    - Diet type: {diet}
    - Target servings: {servings}
    - If necessary, you may assume common basics like salt, water, oil, basic spices.

    Return VALID JSON ONLY, with this exact structure:
    {{
      "title": "string",
      "servings": number,
      "estimated_time_minutes": number,
      "ingredients": [
        {{"name": "string", "quantity": number, "unit": "string"}}
      ],
      "steps": [
        "Step 1 ...",
        "Step 2 ..."
      ],
      "nutrition_per_serving": {{
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number
      }}
    }}

    Do NOT include any markdown, backticks, comments, or text outside the JSON.
    """

    payload = {
        "model": "gpt-4.1",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        resp = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {GITHUB_TOKEN}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )

        resp.raise_for_status()
        reply_text = resp.json()["choices"][0]["message"]["content"].strip()

        # In case model still wraps in ```json ... ```
        if reply_text.startswith("```"):
            reply_text = re.sub(r"^```[a-zA-Z]*", "", reply_text).strip()
            reply_text = re.sub(r"```$", "", reply_text).strip()

        recipe_json = json.loads(reply_text)
        return jsonify(recipe_json)

    except Exception as e:
        print("RECIPE ERROR:", e)
        return jsonify({"error": "Failed to generate recipe", "details": str(e)}), 500


@app.route("/")
def home():
    return jsonify({"server": "AI Recipe Backend running"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
