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

const API_URI = `http://192.168.1.133:3001/`;
let socket = io(`${API_URI}`, { forceNew: true });
socket.on("error", (error) => console.log(error + `socket error`));

let textref;
let candidates = [];

const pc_config = {
  /*iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],*/
};

const pc = new RTCPeerConnection(pc_config);

const sendToPeer = (messageType, payload) => {
  socket.emit(messageType, {
    socketID: socket.id,
    payload,
  });
};

const createOffer = () => {
  console.log("Offer");

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
  // initiates the creation of SDP
  pc.createOffer({ offerToReceiveVideo: 1 }).then((sdp) => {
    // console.log(JSON.stringify(sdp))

    // set offer sdp as local description
    pc.setLocalDescription(sdp);

    sendToPeer("offerOrAnswer", sdp);
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

const setRemoteDescription = () => {
  // retrieve and parse the SDP copied from the remote peer
  const desc = JSON.parse(textref.value);

  // set sdp as remote description
  pc.setRemoteDescription(new RTCSessionDescription(desc));
};
const addCandidate = () => {
  // retrieve and parse the Candidate copied from the remote peer
  // const candidate = JSON.parse(this.textref.value)
  //console.log("Adding candidate:", candidate);

  //add the candidate to the peer connection
  //pc.addIceCandidate(new RTCIceCandidate(candidate));

  candidates.forEach((candidate) => {
    console.log(JSON.stringify(candidate));
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  });
};
export const start = (stream) => async (dispatch) => {
  console.log("hhhi");
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
    // this.candidates = [...this.candidates, candidate]
    pc.addIceCandidate(new RTCIceCandidate(candidate));
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

  pc.ontrack = (e) => {
    console.log("STRREEAAAAM MOFO");
    //debugger;
    // this.remoteVideoref.current.srcObject = e.streams[0];
    dispatch({ type: "ADD_STREAM", payload: e.streams[0] });
  };
  for (const track of stream.getTracks()) {
    pc.addTrack(track, [stream]);
  }
  console.log("added tracks");
};

export const accept = () => async (dispatch) => {
  console.log(pc.signalingState);
  if (pc.signalingState == "have-remote-offer") {
    console.log("ACCEPT");
    createAnswer();
  }
};
