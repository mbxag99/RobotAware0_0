import { Button, CircularProgress, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRef } from "react";
import { View } from "react-native";
import { call_analysis, start } from "./store/actions/actions";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
let mediaRecorder;
let socket_to_ac = io("http://127.0.0.1:5000", { forceNew: true });
//let interval;
export default function AutoCar() {
  const [status, setStatus] = useState(true);
  const [gotStream, setGotStream] = useState(false);
  const [gotResponse, setGotResponse] = useState({ status: false, data: [] });
  const dispatch = useDispatch();
  const phoneSTREAM = createRef();
  const [boola, setBoola] = useState(true);
  const [Pause, setPause] = useState(false);
  useEffect(() => {
    dispatch(start(phoneSTREAM, setGotStream));
  }, []);

  useEffect(() => {
    // this will excuted every 1 second
    const interval = setInterval(() => {
      if (!Pause) {
        RecordMedia();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [gotStream]);

  socket_to_ac.on("pause", () => {
    console.log("pause");
    setPause(true);
  });

  socket_to_ac.on("resume", () => {
    console.log("resume");
    setPause(false);
  });

  // when we receive a stream
  const RecordMedia = () => {
    //recordedBlobs = [];
    if (!gotStream) return;
    console.log("recording");
    mediaRecorder = new MediaRecorder(phoneSTREAM.current.srcObject);
    mediaRecorder.onstop = (event) => {
      console.log("Processing stopped: ", event);
      console.log("State: ", mediaRecorder.state);
    };

    mediaRecorder.onerror = (event) => {
      console.log("Error: ", event);
    };

    mediaRecorder.ondataavailable = handleDataAvailable;
    setTimeout(() => {
      mediaRecorder.stop();
    }, 3000);
    mediaRecorder.start();
    console.log("Processing started", mediaRecorder);
  };

  const stopRecording = () => {
    /*mediaRecorder.stop();
   clearInterval(interval);
    setStart(false);*/
  };
  const startRecording = () => {
    /* setStart(true);
    interval = setInterval(() => {
      console.log("This will run every second!");
      RecordMedia();
    }, 2000);*/
  };

  const handleDataAvailable = (event) => {
    console.log("handleDataAvailable", event);
    if (event.data && event.data.size > 0) {
      console.log("handleData----Available", event.data);
      const recordedBlob = event.data;
      socket_to_ac.emit("video_slice", recordedBlob);
    }
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
              status ? startRecording() : stopRecording();
              setStatus(!status);
            }}
          >
            {status ? "Start recording" : "Stop Recording"}
          </Button>
          {/*  <Button
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
        </Button>*/}
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
          flexDirection: "column",
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
        {gotResponse.status & boola // allow only once
          ? (console.log(boola),
            (
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
                <Plot
                  data={[
                    {
                      x: gotResponse.data.map((item) => item[0]),
                      y: gotResponse.data.map((item) => item[1]),
                      z: gotResponse.data.map((item) => item[2]),
                      type: "scatter3d",
                      mode: "markers",
                      // make it such that the color dims as the index increases
                      marker: {
                        color: gotResponse.data.map((item, index) => index),
                        size: 12,
                        line: {
                          color: "rgba(217, 217, 217, 0.14)",
                          width: 0.5,
                        },
                        opacity: 0.8,
                      },
                    },
                  ]}
                  layout={{ width: 500, height: 500, title: "3D Plot" }}
                />
                <Plot
                  data={[
                    {
                      x: gotResponse.data.map((item) => item[0]),
                      y: gotResponse.data.map((item) => item[2]),
                      // 2d plot
                      type: "scatter",
                      mode: "markers",
                      // make it such that the color dims as the index increases
                      marker: {
                        color: gotResponse.data.map((item, index) => index),
                        size: 12,
                        line: {
                          color: "rgba(217, 217, 217, 0.14)",
                          width: 0.5,
                        },
                        opacity: 0.8,
                      },
                    },
                  ]}
                  layout={{ width: 500, height: 500, title: "2D Plot" }}
                />
              </Container>
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
