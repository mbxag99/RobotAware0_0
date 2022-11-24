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
export default function AutoCar() {
  const [status, setStatus] = useState(true);
  const [gotStream, setGotStream] = useState(false);
  const [gotResponse, setGotResponse] = useState({ status: false, data: [] });
  const dispatch = useDispatch();
  const phoneSTREAM = createRef();
  const [boola, setBoola] = useState(true);
  useEffect(() => {
    dispatch(start(phoneSTREAM, setGotStream));
  }, []);
  // when we receive a stream
  const RecordMedia = () => {
    //recordedBlobs = [];
    mediaRecorder = new MediaRecorder(phoneSTREAM.current.srcObject);
    mediaRecorder.onstop = (event) => {
      console.log("Processing stopped: ", event);
      console.log("State: ", mediaRecorder.state);
      //sendVideoToFlask(recordedBlobs[0]);
      //console.log("Recorded Blobs: ", recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(5000);
    console.log("Processing started", mediaRecorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
  };

  /*const sendVideoToFlask = async () => {
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

      fetch("http://127.0.0.1:5000/get_analysis", {
        method: "GET",
      }).then(async (response) => {
        //hggggggggggggggggjjjjjjkiconsole.log("Response2: ", response.json());
        const estimates = await response.json();
        console.log("Estimates: ", estimates);
        console.log("Response2: ", estimates.Estimates);
        setGotResponse({ status: true, data: estimates.Estimates });
      });
    });
  };*/

  const handleDataAvailable = (event) => {
    console.log("handleDataAvailable", event);
    if (event.data && event.data.size > 0) {
      const recordedBlob = event.data;
      /*const DataForm = new FormData();
      DataForm.append("video_slice", recordedBlob, "video_slice");
      fetch("http://127.0.0.1:5000/video_slice", {
        method: "POST",
        body: DataForm,
      }).then((response) => {
        console.log("Response: ", response);
      });*/
      socket_to_ac.emit("video_slice", recordedBlob);
      /*var reader = new FileReader();
      reader.readAsDataURL(recordedBlob);
      reader.onloadend = () => {
        const base64data = reader.result;
        //console.log(base64data);
        socket_to_ac.emit("video_slice", base64data);
        // in the flask server we will receive the base64data
        // and we will write this:
        // with open("video.mp4", "wb") as f:
        // f.write(base64.b64decode(base64data))
      };*/
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
              status ? RecordMedia() : stopRecording();
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
