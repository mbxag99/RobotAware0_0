import { Icon } from "@rneui/base";
import React, { createRef, useEffect, useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { mediaDevices } from "react-native-webrtc";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { accept, start, stopS } from "./store/actions";
// opencv js
let media_Recorder;
//let socket_to_ac = io("http://127.0.0.1:5000", { forceNew: true });
export default function MonocularTemp({ setPage }) {
  const [status, setStatus] = useState(0);
  const dispatch = useDispatch();
  //const phoneSTREAM = createRef();
  const [phoneSTREAM, setStream] = useState(null);
  const { msg, connected, isLoading } = useSelector(
    (state) => state.MessageReducer
  );
  //const [myStream, setMyStream] = useState(null);

  useEffect(() => {
    myFUN(false);
    // RecordMedia();
  }, []);
  const RecordMedia = () => {
    //recordedBlobs = [];
    console.log("record media" + phoneSTREAM);
    media_Recorder = new MediaRecorder(phoneSTREAM);
    media_Recorder.onstop = (event) => {
      console.log("Recorder stopped: ", event);
      console.log("Media recorded state: ", media_Recorder.state);
      console.log("Recorded Blobs after stop: ", recordedBlobs);
      //sendVideoToFlask(recordedBlobs[0]);
      //console.log("Recorded Blobs: ", recordedBlobs);
    };
    media_Recorder.ondataavailable = handleDataAvailable;
    media_Recorder.start(1000);
    console.log("MediaRecorder started", media_Recorder);
  };
  const handleDataAvailable = (event) => {
    console.log("handleDataAvailable", event);
    if (event.data && event.data.size > 0) {
      recordedBlobs = event.data;
      console.log("Sending video to flask");
      // why recordedBlobs is undefined here ?
      // maybe because it is async ?
      console.log("Recorded Blobs: ", recordedBlobs);
      var data = new FormData();
      data.append("incoming_data", recordedBlobs, "incoming_data");
      console.log("emitting to flask");
      socket_to_ac.emit("frame", data);
    }
  };
  const stopRecording = () => {
    media_Recorder.stop();
  };

  /*  const sendVideoToFlask = async () => {
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
    fetch("http://127.0.0.1:5000/auto_car", {
      method: "POST",
      body: data,
    }).then((response) => {
      console.log("Response: ", response);
    });
  };*/
  const myFUN = (stopped) => {
    console.log("myFUN " + stopped);
    try {
      let isFront = false;
      mediaDevices.enumerateDevices().then((sourceInfos) => {
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          console.log(sourceInfo);
          if (
            sourceInfo.kind == "videoinput" &&
            sourceInfo.facing == (isFront ? "front" : "environment")
          ) {
            videoSourceId = sourceInfo.deviceId;
          }
        }
        mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              deviceId: videoSourceId,
              mandatory: {
                minWidth: 300,
                minHeight: 300,
              },
              /* facingMode: isFront ? "user" : "environment",
              optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],*/
            },
          })
          .then((stream) => {
            //     setMyStream(stream);
            //const track = mediaStream.getVideoTracks()[0];
            //setStream(stream);
            //phoneSTREAM.current.srcObject = stream;
            //  console.log("stream " + phoneSTREAM.current.srcObject);
            dispatch(start(stream, setStatus, stopped));
          })
          .catch((error) => {
            console.log(error);
          });
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.connection,
          {
            backgroundColor:
              status == 2 ? "green" : status == 1 ? "red" : "grey",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (status != 0) {
              if (status == 1) {
                dispatch(accept());
              }
              setStatus((p) => (p == 2 ? 1 : 2));
              if (status == 2) {
                myFUN(true);
              }
            }
          }}
        >
          <Icon name="heartbeat" type="font-awesome" color="#280c00" />
        </TouchableOpacity>
        {isLoading ? null : <Text>{msg}</Text>}
      </View>
      <View style={styles.goBack}>
        <TouchableOpacity
          onPress={() => {
            setPage("Home");
          }}
        >
          <Icon
            name="arrow-left"
            type="font-awesome"
            color="#280c00"
            size={50}
          />
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(76,77,102)",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  text: {
    color: "whitesmoke",
    fontSize: 20,
    fontFamily: "Merriweather",
    textAlign: "center",
  },
  connection: {
    height: 50,
    width: 50,
    borderRadius: 40,
  },
  rtc: {
    height: 200,
    width: 200,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  goBack: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 10,
  },
});
