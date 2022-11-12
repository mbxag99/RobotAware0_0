import { Button, CircularProgress, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRef } from "react";
import { View } from "react-native";
import { call_analysis, start } from "./store/actions/actions";
let mediaRecorder;
let recordedBlobs = [];
export default function RecordingP() {
  const [status, setStatus] = useState(true);
  const [gotStream, setGotStream] = useState(false);
  const [gotResponse, setGotResponse] = useState(false);
  const dispatch = useDispatch();
  const { _, __ } = useSelector((state) => state.MediaReducer);
  const phoneSTREAM = createRef();
  const response_ref = createRef();
  const [boola, setBoola] = useState(true);
  useEffect(() => {
    dispatch(start(phoneSTREAM, setGotStream));
  }, []);
  // when we receive a stream
  const RecordMedia = () => {
    //recordedBlobs = [];
    mediaRecorder = new MediaRecorder(phoneSTREAM.current.srcObject);
    mediaRecorder.onstop = (event) => {
      console.log("Recorder stopped: ", event);
      console.log("Media recorded state: ", mediaRecorder.state);
      console.log("Recorded Blobs after stop: ", recordedBlobs);
      //sendVideoToFlask(recordedBlobs[0]);
      //console.log("Recorded Blobs: ", recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log("MediaRecorder started", mediaRecorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
  };

  const sendVideoToFlask = () => {
    console.log("Sending video to flask");
    // why recordedBlobs is undefined here ?
    // maybe because it is async ?
    console.log("Recorded Blobs: ", recordedBlobs[0]);
    var data = new FormData();
    data.append("video", recordedBlobs[0], "video");
    const obj = { hello: "world" };
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });
    data.append("pot", blob, "pot");
    console.log("DATA ", data);
    // we will send the video to a flask server
    fetch("http://127.0.0.1:5000/upload_vod", {
      method: "POST",
      body: data,
    }).then((response) => {
      console.log("Response: ", response);
      setGotResponse(true);
    });
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
              sendVideoToFlask();
            }}
          >
            send Record
          </Button>
        </View>
      ) : null}
      <Container
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          alightContent: "center",
          flexDirection: "row",
        }}
      >
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
        {gotResponse & boola // allow only once
          ? (console.log(boola),
            (
              <img
                src="http://127.0.0.1:5000/video_feed"
                loading="eager" // load the image as soon as possible
                width="500px"
                height="500px"
              />
            ))
          : null}
      </Container>
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
