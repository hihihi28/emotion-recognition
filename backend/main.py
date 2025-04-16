import json
import base64
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket
from fer import FER

app = FastAPI()
detector = FER()

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        #while True:
            payload = await websocket.receive_text()
            payload = json.loads(payload)
            imageByt64 = payload['data']['image'].split(',')[1]

            # Decode ảnh base64 sang mảng numpy
            image_bytes = base64.b64decode(imageByt64)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # Dự đoán cảm xúc bằng FER
            prediction = detector.detect_emotions(image)

            if prediction:  # Nếu phát hiện khuôn mặt
                emotions = prediction[0]['emotions']
                dominant = max(emotions, key=emotions.get)
            else:
                emotions = {emo: 0.0 for emo in ['angry','disgust','fear','happy','sad','surprise','neutral']}
                dominant = "No Face"

            # Gửi kết quả về frontend
            response = {
                "predictions": emotions,
                "emotion": dominant
            }
            await websocket.send_json(response)
    except Exception as e:
        print("WebSocket closed:", e)
        await websocket.close()
