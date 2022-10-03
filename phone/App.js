import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@rneui/themed";
import { accept, start } from "./store/actions";
import { useDispatch, useSelector } from "react-redux";
import { RTCView, mediaDevices } from "react-native-webrtc";

export default function App() {
  const [status, setStatus] = useState(false);
  const dispatch = useDispatch();
  const { msg, connected, isLoading } = useSelector(
    (state) => state.MessageReducer
  );
  //const [myStream, setMyStream] = useState(null);

  useEffect(() => {
    myFUN();
  }, []);

  const myFUN = () => {
    try {
      let isFront = true;
      mediaDevices.enumerateDevices().then((sourceInfos) => {
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          if (
            sourceInfo.kind == "videoinput" &&
            sourceInfo.facing == (isFront ? "front" : "environment")
          ) {
            videoSourceId = sourceInfo.deviceId;
          }
        }
        mediaDevices
          .getUserMedia({
            audio: true,
            video: {
              mandatory: {
                minWidth: 300,
                minHeight: 300,
                minFrameRate: 30,
              },
              facingMode: isFront ? "user" : "environment",
              optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
          })
          .then((stream) => {
            //     setMyStream(stream);
            dispatch(start(stream));
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
      <Text style={styles.text}>Welcome to the phone side! Let's START!!</Text>
      <View
        style={[
          styles.connection,
          { backgroundColor: connected ? "green" : "red" },
        ]}
      >
        <TouchableOpacity onPress={() => dispatch(accept())}>
          <Icon name="heartbeat" type="font-awesome" color="#280c00" />
        </TouchableOpacity>
        {isLoading ? null : <Text>{msg}</Text>}

        {/*   <RTCView streamURL={myStream.toURL()} style={styles.rtc} /><ImageBackground
          source={require("./img/connection.png")}
          resizeMode="cover"
      ></ImageBackground> */}
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
    borderRadius: 50,
  },
  rtc: {
    height: 200,
    width: 200,
  },
});
