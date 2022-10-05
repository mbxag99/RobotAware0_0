import logo from "./logo.svg";
import "./App.css";
import {
  Container,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import background from "./img/back.png";
import { start } from "./store/actions/actions";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";
import { createRef } from "react";
import RecordingP from "./components/RecordingP.js";

let mediaRecorder;
let recordedBlobs;

function App() {
  const dispatch = useDispatch();
  const { _, __ } = useSelector((state) => state.MediaReducer);
  const phoneSTREAM = createRef();
  const [st, setSt] = useState(false);
  const RecordMedia = () => {
    recordedBlobs = [];
    mediaRecorder = new MediaRecorder(phoneSTREAM.current.srcObject);
    mediaRecorder.onstop = (event) => {
      console.log("Recorder stopped: ", event);
      console.log("Recorded Blobs: ", recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log("MediaRecorder started", mediaRecorder);
    console.log("Created MediaRecorder", mediaRecorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
  };

  const handleDataAvailable = (event) => {
    console.log("handleDataAvailable", event);
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };

  const downloadRecordedVideo = () => {
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "recordedVideo.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return st ? (
    <RecordingP />
  ) : (
    <Container
      maxWidth="lg"
      style={{
        width: "100%",
        height: "700px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alightContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h2" color={"whitesmoke"} fontFamily="Merriweather">
        {" "}
        Welcome to our magnificent project Autonomous car , Monocular and video
        Odometry
      </Typography>
      <p></p>
      <Button
        size="large"
        className="Rectangle"
        variant="contained"
        color="success"
        style={{
          fontFamily: "Merriweather",
          borderRadius: "10px",
        }}
        onClick={() => {
          dispatch(start(phoneSTREAM));
        }}
      >
        Start video
      </Button>
      <Button
        onClick={() => {
          setSt(true);
        }}
      >
        TEST
      </Button>
      <video
        style={{
          width: 300,
          height: 300,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={phoneSTREAM}
        autoPlay
        muted
      ></video>
      <Button
        size="large"
        className="Rectangle"
        variant="contained"
        color="success"
        style={{
          fontFamily: "Merriweather",
          borderRadius: "10px",
        }}
        onClick={() => {
          RecordMedia();
        }}
      >
        Start Record
      </Button>
      <Button
        size="large"
        className="Rectangle"
        variant="contained"
        color="success"
        style={{
          fontFamily: "Merriweather",
          borderRadius: "10px",
        }}
        onClick={() => {
          stopRecording();
        }}
      >
        Stop Record
      </Button>
      <Button
        size="large"
        className="Rectangle"
        variant="contained"
        color="success"
        style={{
          fontFamily: "Merriweather",
          borderRadius: "10px",
        }}
        onClick={() => {
          downloadRecordedVideo();
        }}
      >
        Download Record
      </Button>
    </Container>
  );
}

export default App;
