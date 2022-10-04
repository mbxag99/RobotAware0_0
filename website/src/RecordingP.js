import { Button, Container } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRef } from "react";
import { View} from "react-native";
import { start } from "./store/actions/actions";
let mediaRecorder;
let recordedBlobs;
export default function RecordingP() {
  const [status, setStatus] = useState(true);
  const dispatch = useDispatch();
  const { _, __ } = useSelector((state) => state.MediaReducer);
  const phoneSTREAM = createRef();
  const RecordMedia = () => {
    dispatch(start(phoneSTREAM));
    recordedBlobs = [];
    //const mimeType =
    //codecPreferences.options[codecPreferences.selectedIndex].value;
    //const options = { mimeType };
    mediaRecorder = new MediaRecorder(
      phoneSTREAM.current.srcObject
      //options
    );
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
    a.download = "recorderVideo.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };
  return (
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
      <View style={{ flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
        width:'40%',
        }}>
          <Button
            size="large"
            className="Rectangle"
            variant="contained"
            color={status ? "success" : "error"}
            style={{
              fontFamily: "Merriweather",
              borderRadius: "10px",
            }}
            onClick={() => {
              setStatus(!status);
              status ? stopRecording():RecordMedia()
            }}
          >
            {status ? "Start recording" : "Stop Recording"}
          </Button>
          <Button
            size="large"
            className="Rectangle"
            variant="contained"
            color={status ? "error" : "success"}
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
      </View>
      <video
        style={{
          width: 500,
          height: 500,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={phoneSTREAM}
        autoPlay
        muted
      ></video>
    </Container>
  );
}
