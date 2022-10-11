import { io } from "socket.io-client";

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from "react-native-webrtc";

/*import { BleManager } from "react-native-ble-plx";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";

const manager = new BleManager();
manager.onStateChange((state) => {
  console.log("state", state);
  if (state === "PoweredOn") {
    console.log("BLE is powered on");
  }
}, true);*/
const API_URI = `http://10.0.0.16:3001/`;
let socket = io(`${API_URI}`, { forceNew: true });
socket.on("error", (error) => console.log(error + `socket error`));

let textref;

const pc_config = {
  /*iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],*/
};

let pc = new RTCPeerConnection(pc_config);

const sendToPeer = (messageType, payload) => {
  socket.emit(messageType, {
    socketID: socket.id,
    payload,
  });
};

const createAnswer = () => {
  console.log("Answer");
  pc.createAnswer({ offerToReceiveVideo: 1 }).then((sdp) => {
    console.log(JSON.stringify(sdp));

    // set answer sdp as local description
    pc.setLocalDescription(sdp);

    sendToPeer("offerOrAnswer", sdp);
  });
};

export const start = (stream, setStatus, stopped) => async (dispatch) => {
  console.log("hhhi");
  if (stopped) {
    console.log("stop");
    pc.close();
    // reset to allow for new connections
    pc = new RTCPeerConnection(pc_config);
  }
  socket.on("offerOrAnswer", (sdp) => {
    console.log("received offer or answer");
    console.log(sdp);
    //textref.value = sdp;
    console.log("steee");
    // set sdp as remote description
    pc.setRemoteDescription(new RTCSessionDescription(sdp));
  });

  socket.on("candidate", (candidate) => {
    console.log("From Peer... ", JSON.stringify(candidate));
    pc.addIceCandidate(new RTCIceCandidate(candidate));
    setStatus(1);
  });

  socket.on("disconnected-boy", (data) => {
    setStatus(0);
  });

  pc.onicecandidate = (e) => {
    // send the candidates to the remote peer
    // see addCandidate below to be triggered on the remote peer
    if (e.candidate) {
      // console.log(JSON.stringify(e.candidate))
      sendToPeer("candidate", e.candidate);
    }
  };

  pc.oniceconnectionstatechange = (e) => {
    console.log(e);
  };

  for (const track of stream.getTracks()) {
    pc.addTrack(track, [stream]);
  }
  console.log("added tracks");
  if (stopped) socket.emit("buddy-phone-stop");
};

export const accept = () => async (dispatch) => {
  console.log(pc.signalingState + " sassy");
  if (pc.signalingState == "have-remote-offer") {
    console.log("ACCEPT");
    createAnswer();
  }
};

/*export const stopS = () => async (dispatch) => {
  console.log("stop");
  pc.close();
  // reset to allow for new connections
  pc = new RTCPeerConnection(pc_config);
  socket.emit("buddy-phone-stop");
};

export const bluetooth_connect = () => async (dispatch) => {
  console.log("bluetooth_connect");
  try {
    const available = await RNBluetoothClassic.getBondedDevices();
    console.log(available + "Aavsdasdsdsadsadasdasd");
  } catch (error) {
    console.log(error);
  }

  manager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log(device.name);
    console.log(device.localName);
    if (device.name === "ourRobot") {
      manager.stopDeviceScan();
      console.log(device);
      device
        .connect()
        .then((device) => {
          return device.discoverAllServicesAndCharacteristics();
        })
        .then((device) => {
          console.log(device);
          console.log(device.services());
          console.log(device.characteristics());
          // Send a message that you want to send to the device
          return device.writeCharacteristicWithResponseForService(
            "0000ffe0-0000-1000-8000-00805f9b34fb", //"00001101-0000-1000-8000-00805F9B34FB"
            "0000ffe1-0000-1000-8000-00805f9b34fb",
            "Hello"
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
};*/
