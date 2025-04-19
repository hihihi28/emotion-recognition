import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import { drawMesh } from "./utilities";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require("@tensorflow-models/blazeface");
  const [capturedImage, setCapturedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Hàm tải và chạy mô hình phát hiện khuôn mặt
  const runFaceDetectorModel = async () => {
    const model = await blazeface.load();
    console.log("FaceDetection Model is Loaded..");
    setInterval(() => {
      detect(model);
    }, 100);
  };

  // Hàm phát hiện khuôn mặt và xử lý kết nối WebSocket
  const detect = async (net) => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Đồng bộ kích thước video và canvas
      video.width = videoWidth;
      video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Phát hiện khuôn mặt
      const faces = await net.estimateFaces(video);
      console.log(faces);

      // Tạo kết nối WebSocket và gửi ảnh
      const socket = new WebSocket("ws://localhost:8000");
      const imageSrc = webcamRef.current.getScreenshot();
      const apiCall = {
        event: "localhost:subscribe",
        data: { image: imageSrc },
      };

      socket.onopen = () => {
        socket.send(JSON.stringify(apiCall));
      };

      // Xử lý dữ liệu nhận từ WebSocket
      socket.onmessage = (event) => {
        const pred_log = JSON.parse(event.data);

        // Cập nhật các thẻ progress với giá trị dự đoán
        document.getElementById("Angry").value = Math.round(
          pred_log.predictions.angry * 100
        );
        document.getElementById("Neutral").value = Math.round(
          pred_log.predictions.neutral * 100
        );
        document.getElementById("Happy").value = Math.round(
          pred_log.predictions.happy * 100
        );
        document.getElementById("Fear").value = Math.round(
          pred_log.predictions.fear * 100
        );
        document.getElementById("Surprise").value = Math.round(
          pred_log.predictions.surprise * 100
        );
        document.getElementById("Sad").value = Math.round(
          pred_log.predictions.sad * 100
        );
        document.getElementById("Disgust").value = Math.round(
          pred_log.predictions.disgust * 100
        );
        document.getElementById("emotion_text").value = pred_log.emotion;

        // Vẽ lại canvas với kết quả phát hiện khuôn mặt
        const ctx = canvasRef.current.getContext("2d");
        requestAnimationFrame(() => {
          drawMesh(faces, pred_log, ctx);
        });
      };
    }
  };
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsModalOpen(true);
    }
  };
  useEffect(() => {
    runFaceDetectorModel();
  }, []);
  const savePhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `photo_${new Date().toISOString()}.jpg`;
      link.click();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCapturedImage(null);
  };
  return (
    <div className="App">
      <h1 style={{ marginBottom: "20px" }}>Cười cái tao xem nào</h1>
      <div className="content">
        <div className="camera-container">
          <div style={{ position: "relative", width: 640, height: 480 }}>
            <Webcam
              ref={webcamRef}
              style={{
                borderRadius: "12px",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                borderRadius: "12px",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 2,
              }}
            />
          </div>

          <div className="bottom-container">
            <input
              id="emotion_text"
              name="emotion_text"
              defaultValue="Neutral"
              readOnly
              style={{
                width: 200,
                height: 50,
                bottom: 60,
                left: 300,
                fontSize: "40px",
                borderRadius: "10px",
                textAlign: "center", // Căn giữa theo chiều ngang
                lineHeight: "50px", // Căn giữa theo chiều dọc (bằng chiều cao của ô)
              }}
            />
          </div>
          <button
            className="capture-button"
            onClick={capturePhoto}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginLeft: "10px", 
            }}
          >
            Chụp Ảnh
          </button>
        </div>{" "}
        {/* End of camera-container */}
        <header className="App-header">
          <div className="Prediction">
            <div className="progress-item">
              <label htmlFor="Angry">Angry </label>
              <progress id="Angry" value="0" max="100" />
            </div>
            <div className="progress-item">
              <label htmlFor="Neutral">Neutral </label>
              <progress id="Neutral" value="0" max="100" />
            </div>
            <div className="progress-item">
              <label htmlFor="Happy">Happy </label>
              <progress id="Happy" value="0" max="100" />
            </div>
            <div className="progress-item">
              <label htmlFor="Fear">Fear </label>
              <progress id="Fear" value="0" max="100" />
            </div>
            <div className="progress-item">
              <label htmlFor="Surprise">Surprised </label>
              <progress id="Surprise" value="0" max="100" />
            </div>
            <div className="progress-item">
              <label htmlFor="Sad">Sad </label>
              <progress id="Sad" value="0" max="100" />
            </div>
            <div className="progress-item">
              <label htmlFor="Disgust">Disgusted </label>
              <progress id="Disgust" value="0" max="100" />
            </div>
          </div>{" "}
          {/* End of Prediction */}
        </header>
      </div>{" "}
      <div className={`modal ${isModalOpen ? 'show' : ''}`} style={{ marginTop: "20px" }}>
            <div className="modal-content">
              {capturedImage && <img src={capturedImage} alt="Captured" />}
              <div className="modal-buttons">
                <button className="modal-button close-button" onClick={closeModal}>
                  Đóng
                </button>
                <button className="modal-button save-button" onClick={savePhoto}>
                  Lưu Ảnh
                </button>
              </div>
            </div>
          </div>
        
      {/* End of content */}
    </div> // End of App
  );
}

export default App;
