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
let socket_to_ac = io(`http://10.0.0.16:5000/`, {
  forceNew: true,
});

socket_to_ac.on('error', e => {
  console.log('errere ac ' + e);
});
socket_to_ac.on('connect-error', e => {
  console.log('errere ac ' + e);
});
let actiony = new action();
export default function MonocularTemp() {
  const [status, setStatus] = useState(0);
  const dispatch = useDispatch();
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  useEffect(() => {
    myFUN(false);
    //console.log('pitof');
  }, []);

  const setup_listeners = async () => {
    try {
      console.log('Sytttt ', socket_to_ac.connected);
      socket_to_ac.emit('test');
      socket_to_ac.on('command_to_phone', async command => {
        console.log('commnad ' + command);
        await RNBluetoothClassic.writeToDevice('98:D3:31:20:68:84', command);
      });
      socket_to_ac.on('pause', async () => {
        console.log('pause');
        await RNBluetoothClassic.writeToDevice('98:D3:31:20:68:84', 's');
      });
    } catch (error) {
      console.log('errrrrr ', error);
    }
  };

  const bluetooth_connect = async () => {
    try {
      await RNBluetoothClassic.connectToDevice('98:D3:31:20:68:84');
      console.log('connected');
      setIsBluetoothEnabled(true);
    } catch (error) {
      // if connection failed, you will get an error and in the app the user will be notified
      console.log('errrrrr ', error);
      // notify the user
      alert('Bluetooth Connection failed');
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
            },
          })
          .then(stream => {
            actiony.start_streaming(stream, setStatus, stopped);
            setup_listeners();
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
      <View
        style={[
          styles.cornerButton,
          {backgroundColor: isBluetoothEnabled ? '#007AFF' : 'red'},
        ]}>
        <TouchableOpacity
          onPress={() => {
            bluetooth_connect();
          }}>
          <Text>Connect To Blue</Text>
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
    height: 80,
    width: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  cornerButton: {
    position: 'absolute',
    top: 350,
    right: 20,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
