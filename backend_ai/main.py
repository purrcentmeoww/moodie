from flask import Flask, jsonify, request
from utils.script import *

app = Flask(__name__)

@app.route('/')
def main():
    response = testPredict()
    return jsonify(response=response, status='ok'), 200


@app.route('/predict', methods=['POST'])
def predict():
    # รับ JSON จาก request body
    data = request.get_json()
    # สมมติ field ชื่อ 'text'
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "Missing 'text' in request"}), 400

    # ส่งข้อความเข้า model predict
    response = modelPredict(text)
    return jsonify(response=response, status='ok'), 200

if __name__ == '__main__':
    app.run(port=3030, debug=True)