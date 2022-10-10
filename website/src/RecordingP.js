import { Button, CircularProgress, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRef } from "react";
import { View } from "react-native";
import { start } from "./store/actions/actions";
let mediaRecorder;
let recordedBlobs;
export default function RecordingP() {
  const [status, setStatus] = useState(true);
  const [gotStream, setGotStream] = useState(false);
  const dispatch = useDispatch();
  const { _, __ } = useSelector((state) => state.MediaReducer);
  const phoneSTREAM = createRef();
  useEffect(() => {
    dispatch(start(phoneSTREAM, setGotStream));
  }, []);
  // when we receive a stream
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
      {gotStream ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            //marginHorizontal: 5,
            //width: "40%",
          }}
        >
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
              status ? RecordMedia() : stopRecording();
              setStatus(!status);
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
      ) : null}
      {console.log(phoneSTREAM)}
      <video
        style={{
          width: 500,
          height: 500,
          margin: 5,
          backgroundColor: "black",
          //zIndex: 1,
        }}
        ref={phoneSTREAM}
        autoPlay
        muted
      ></video>
      {!gotStream ? (
        <>
          <CircularProgress
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -12,
              marginLeft: -12,
            }}
          />
          <Typography variant="h6" style={{ color: "white" }}>
            Waiting for a stream...
          </Typography>
        </>
      ) : null}
    </Container>
  );
}
