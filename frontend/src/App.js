import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from "@tensorflow/tfjs";
import { drawMesh } from "./utilities";
import logo from './logo.svg';
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require('@tensorflow-models/blazeface')

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
        document.getElementById("Angry").value = Math.round(pred_log.predictions.angry * 100);
        document.getElementById("Neutral").value = Math.round(pred_log.predictions.neutral * 100);
        document.getElementById("Happy").value = Math.round(pred_log.predictions.happy * 100);
        document.getElementById("Fear").value = Math.round(pred_log.predictions.fear * 100);
        document.getElementById("Surprise").value = Math.round(pred_log.predictions.surprise * 100);
        document.getElementById("Sad").value = Math.round(pred_log.predictions.sad * 100);
        document.getElementById("Disgust").value = Math.round(pred_log.predictions.disgust * 100);
        document.getElementById("emotion_text").value = pred_log.emotion;

        // Vẽ lại canvas với kết quả phát hiện khuôn mặt
        const ctx = canvasRef.current.getContext("2d");
        requestAnimationFrame(() => {
          drawMesh(faces, pred_log, ctx);
        });
      };
    }
  };

  useEffect(() => { runFaceDetectorModel(); }, []);

  return (
    <div className="App">
      <h1> Cười cái tao xem nào </h1>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 600,
          top:20,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 600,
          top:20,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
      
      {/* Phần Header hiển thị logo và bảng dự đoán cảm xúc */}
      <header className="App-header">
        <img src={logo} 
        className="App-logo" 
        alt="logo"
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          bottom:10,
          left: 0,
          right: 0,
          width: 150,
          height: 150,
        }}
        />   
        <div className="Prediction" style={{
          position:"absolute",
          right:100,
          width:500,
          top: 60
        }}>
          <label htmlFor="Angry" style={{ color: "red" }}>Angry{" "}</label>
          <progress id="Angry" value="0" max="100">0%</progress>
          <br /><br />
          <label htmlFor="Neutral" style={{ color: "lightgreen" }}>
            Neutral{" "}
          </label>
          <progress id="Neutral" value="0" max="100">
            0%
          </progress>
          <br /><br />
          <label htmlFor="Happy" style={{ color: "orange" }}>
            Happy{" "}
          </label>
          <progress id="Happy" value="0" max="100">
            0%
          </progress>
          <br /><br />
          <label htmlFor="Fear" style={{ color: "lightblue" }}>
            Fear{" "}
          </label>
          <progress id="Fear" value="0" max="100">
            0%
          </progress>
          <br /><br />
          <label htmlFor="Surprise" style={{ color: "yellow" }}>
            Surprised{" "}
          </label>
          <progress id="Surprise" value="0" max="100">
            0%
          </progress>
          <br /><br />
          <label htmlFor="Sad" style={{ color: "gray" }}>
            Sad{" "}
          </label>
          <progress id="Sad" value="0" max="100">
            0%
          </progress>
          <br /><br />
          <label htmlFor="Disgust" style={{ color: "pink" }}>
            Disgusted{" "}
          </label>
          <progress id="Disgust" value="0" max="100">
            0%
          </progress>
        </div>
        <input
          id="emotion_text"
          name="emotion_text"
          defaultValue="Neutral"
          style={{
            position: "absolute",
            width: 200,
            height: 50,
            bottom: 60,
            left: 300,
            fontSize: "30px",
          }}></input>
      </header>
    </div>
  );
}

export default App;
