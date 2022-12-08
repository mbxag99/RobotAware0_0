//import {Icon} from '@rneui/base';
import React, {createRef, useEffect, useRef, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import {mediaDevices} from 'react-native-webrtc';
import {useDispatch, useSelector} from 'react-redux';
import {action} from './actionfigure';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import {io} from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
// opencv js
//let socket_to_ac = io("http://127.0.0.1:5000", { forceNew: true });
/*let socket = io(`http://10.0.0.16:3001/`, {forceNew: true});
console.log(socket);
let pc = new RTCPeerConnection();*/
let actiony = new action();
export default function MonocularTemp() {
  const [status, setStatus] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    myFUN(false);
    //console.log('pitof');
    //funcc();
  }, []);

  funcc = async () => {
    console.log(await RNBluetoothClassic.isBluetoothEnabled());
    console.log(await RNBluetoothClassic.getBondedDevices());
    console.log(await RNBluetoothClassic.getConnectedDevices());
    await RNBluetoothClassic.connectToDevice('98:D3:31:20:68:84');
    while (true) {
      await RNBluetoothClassic.writeToDevice('98:D3:31:20:68:84', 'F');
    }
  };
  const myFUN = stopped => {
    console.log('myFUN ' + stopped);
    try {
      let isFront = false;
      mediaDevices.enumerateDevices().then(sourceInfos => {
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          console.log(sourceInfo);
          if (
            sourceInfo.kind == 'videoinput' &&
            sourceInfo.facing == (isFront ? 'front' : 'environment')
          ) {
            videoSourceId = sourceInfo.deviceId;
          }
        }
        mediaDevices
          .getUserMedia({
            audio: true,
            video: {
              deviceId: videoSourceId,
              /* facingMode: isFront ? "user" : "environment",
              optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],*/
            },
          })
          .then(stream => {
            // console.log('Stream ' + stream.getTracks());
            //     setMyStream(stream);
            //const track = mediaStream.getVideoTracks()[0];
            //setStream(stream);
            //phoneSTREAM.current.srcObject = stream;
            //  console.log("stream " + phoneSTREAM.current.srcObject);
            // dispatch(start(stream, setStatus, stopped));
            //start_streaming(stream, setStatus, stopped);
            // console.log('Stream Tracks ' + stream.getTracks());
            actiony.start_streaming(stream, setStatus, stopped);
          })
          .catch(error => {
            console.log('erereerddd ' + error);
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
              status == 2 ? 'green' : status == 1 ? 'red' : 'grey',
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            if (status != 0) {
              if (status == 1) {
                actiony.accept();
              }
              setStatus(p => (p == 2 ? 1 : 2));
              if (status == 2) {
                myFUN(true);
              }
            }
          }}>
          <Text> Click Me </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.goBack}>
        <TouchableOpacity
          onPress={() => {
            //setPage('Home');
          }}>
          <Text>POT</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(76,77,102)',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    color: 'whitesmoke',
    fontSize: 20,
    fontFamily: 'Merriweather',
    textAlign: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  goBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 10,
  },
});
