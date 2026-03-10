from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
# Enable CORS so our frontend HTML can talk to this backend
CORS(app)

# --- 1. MOCK DATABASE ---
# For the hackathon, we load scholarships from a simple JSON file
def load_scholarships():
    try:
        with open('scholarships.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []

# --- 2. SCHOLARSHIP SEARCH API ---
@app.route('/api/scholarships', methods=['GET'])
def get_scholarships():
    # In a real app we'd filter by checking request.args.get('course') etc.
    # For now, we just return the whole list to prove it works!
    scholarships = load_scholarships()
    return jsonify({"success": True, "data": scholarships})

# --- 3. AI CHATBOT API (The Hackathon Winner!) ---
@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    data = request.json
    user_message = data.get("message", "").lower()
    
    # Very simple logic for the hackathon demo. 
    # If we have time later, we can connect this to a real AI like Google Gemini!
    bot_response = "I couldn't quite understand that. Try asking about 'BTech' or 'Kerala'."
    
    if "btech" in user_message or "engineering" in user_message:
        bot_response = "For B.Tech students, I highly recommend the 'AICTE Pragati Scheme for Girls'. It offers ₹50,000/year!"
    elif "kerala" in user_message:
        bot_response = "In Kerala, the 'Vidyadhan Scholarship' is very popular for high school and plus-two students."
    elif "medical" in user_message or "mbbs" in user_message:
        bot_response = "For Medical students, check out the 'L'Oréal India For Young Women in Science' grant."
    elif "document" in user_message:
        bot_response = "Usually, you need your Aadhar Card, Income Certificate, and previous year Marksheets."
        
    return jsonify({
        "success": True, 
        "reply": bot_response
    })

# --- 4. USER AUTHENTICATION API (MOCK DATABASE) ---

def load_users():
    try:
        with open('users.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []

def save_users(users):
    with open('users.json', 'w') as file:
        json.dump(users, file, indent=4)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    users = load_users()
    
    # Check if user exists
    if any(u['email'] == email for u in users):
        return jsonify({"success": False, "message": "User already exists!"})
    
    # Save new user
    new_user = {"name": name, "email": email, "password": password}
    users.append(new_user)
    save_users(users)
    
    return jsonify({"success": True, "message": "Account created successfully!"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    users = load_users()
    
    # Check credentials
    for user in users:
        if user['email'] == email and user['password'] == password:
            return jsonify({"success": True, "message": f"Welcome back, {user['name']}!", "user": user})
            
    return jsonify({"success": False, "message": "Invalid email or password."})

if __name__ == '__main__':
    print("ScholarlyWomen Backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
