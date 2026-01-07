from flask import Flask, jsonify, request
from flask_cors import CORS
from mongo_connector import mongo
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/mindcore"
mongo.init_app(app)

@app.route('/')
def index():
    return "MINDCORE Backend is running!"

@app.route('/api/users', methods=['GET'])
def get_users():
    users = mongo.db.users.find()
    result = []
    for user in users:
        user['_id'] = str(user['_id'])
        result.append(user)
    return jsonify(result)

@app.route('/api/users', methods=['POST'])
def create_or_login_user():
    data = request.get_json()

    # Registration logic
    if 'role' in data:
        existing_user = mongo.db.users.find_one({"username": data['username']})
        if existing_user:
            return jsonify({"error": "Username already exists"}), 409

        new_user = {
            "username": data['username'],
            "pin": data['pin'],
            "role": data.get('role', 'user'),
            "xp": data.get('xp', 0),
            "plan": data.get('plan', 'FREE'),
            "joinedAt": datetime.now().isoformat()
        }
        result = mongo.db.users.insert_one(new_user)
        user = mongo.db.users.find_one({"_id": result.inserted_id})
        if user:
            user['_id'] = str(user['_id'])
            return jsonify(user)
        return jsonify({"error": "Failed to create user"}), 500
    # Login logic
    else:
        user = mongo.db.users.find_one({"username": data['username'], "pin": data['pin']})
        if user:
            mongo.db.users.update_one(
                {'_id': user['_id']},
                {'$set': {'lastActive': datetime.now().isoformat()}}
            )
            user['_id'] = str(user['_id'])
            return jsonify(user)
        else:
            return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    # TODO: Add call to Gemini API here.
    # For now, echoing the message.
    ai_response = f"Echo from backend: {user_message}"
    
    # Storing the conversation.
    user_id = data.get('userId')
    if user_id:
        try:
            mongo.db.chats.insert_one({
                'userId': ObjectId(user_id), 
                'prompt': user_message, 
                'response': ai_response,
                'createdAt': datetime.now().isoformat()
            })
        except Exception as e:
            print(f"Error inserting chat to DB: {e}")


    return jsonify({"reply": ai_response})

@app.route('/api/chat/history', methods=['GET'])
def chat_history():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    
    try:
        chats = mongo.db.chats.find({'userId': ObjectId(user_id)}).sort('createdAt', 1)
        result = []
        for chat in chats:
            chat['_id'] = str(chat['_id'])
            chat['userId'] = str(chat['userId'])
            result.append(chat)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
