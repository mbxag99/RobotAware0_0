import logo from "./logo.svg";
import "./App.css";
import {
  Container,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { createRef } from "react";
import RecordingP from "./RecordingP.js";
import AutoCar from "./AutoCar";

let mediaRecorder;
let recordedBlobs;

function App() {
  const dispatch = useDispatch();
  const { _, __ } = useSelector((state) => state.MediaReducer);
  const phoneSTREAM = createRef();
  const [st, setSt] = useState(0);

  /* const RecordMedia = () => {
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
  };*/

  return st == 1 ? (
    <RecordingP />
  ) : st == 0 ? (
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
        Welcome to our Final project Autonomous Vehcile , Monocular Visual
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
          setSt(1);
        }}
      >
        Monocular Odometry
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
          setSt(2);
        }}
      >
        Autonomous Car
      </Button>
    </Container>
  ) : (
    <AutoCar />
  );
}

export default App;
