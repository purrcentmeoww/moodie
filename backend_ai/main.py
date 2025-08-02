from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.script import *
import traceback

app = Flask(__name__)
CORS(app)  # ป้องกัน CORS error ถ้า frontend เรียกจากต่าง origin

# โหลดโมเดล (แบบมีการตรวจจับ error)
try:
    model.load_state_dict(torch.load(MODEL_WEIGHT, map_location=DEVICE))
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Load model failed: {e}")
    model = None  # fallback เพื่อให้ API ไม่ crash

@app.route('/')
def main():
    try:
        response = testPredict()
        return jsonify(response=response, status='ok'), 200
    except Exception as e:
        return handle_exception(e)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        if not text:
            return jsonify({"error": "Missing 'text' in request"}), 400

        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        response = modelPredict(text)
        return jsonify(response=response, status='ok'), 200

    except Exception as e:
        return handle_exception(e)

@app.route('/healthz')
def health():
    return jsonify({'status': 'ok'}), 200

# ---------- Error Handlers ----------

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not Found", "message": str(e)}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method Not Allowed", "message": str(e)}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

def handle_exception(e):
    print("❌ Exception occurred:")
    traceback.print_exc()
    return jsonify({
        "error": "Unexpected Error",
        "message": str(e)
    }), 500

# ---------- Run Server ----------

if __name__ == '__main__':
    print(f"🚀 Starting AI service on port 3030 using device: {DEVICE}")
    app.run(host='0.0.0.0', port=3030, debug=True)
