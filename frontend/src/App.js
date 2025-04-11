import logo from './logo.svg';
import './App.css';
import Webcam from 'react-webcam';

const videoConstraints = {

  facingMode: "user" // hoặc "environment" nếu là camera sau
};

function App() {
  return (
    <div className="App">
      <h1> Welcom to my app</h1>
      <Webcam 
      className="webcam-rounded"
      audio={false}
      mirrored={true}
      screenshotFormat="image/jpeg"
      videoConstraints={videoConstraints}
      />
      <img src={logo} alt="Logo" className="App-logo" />

    </div>
  );
}

export default App;
