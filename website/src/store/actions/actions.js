import { createRef, useRef } from "react";
import { io } from "socket.io-client";

const API_URI = `http://192.168.1.21:3001/`;
let socket = io(`${API_URI}`, { forceNew: true });
let videoReff = null;
socket.on("error", (error) => console.log(error + `socket error`));

socket.on("connection-success", (success) => {
  console.log(success);
});
// const pc_config = null
let textref;
let candidates = [];

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

const createOffer = () => {
  console.log("Offer");

  pc.createOffer({ offerToReceiveVideo: 1 }).then((sdp) => {
    pc.setLocalDescription(sdp);

    sendToPeer("offerOrAnswer", sdp);
  });
};

const createAnswer = () => {
  console.log("Answer");
  pc.createAnswer({ offerToReceiveVideo: 1 }).then((sdp) => {
    // console.log(JSON.stringify(sdp))

    // set answer sdp as local description
    pc.setLocalDescription(sdp);

    sendToPeer("offerOrAnswer", sdp);
  });
};

const addListeners = (phoneSTREAM, setGotStream) => {
  pc.onicecandidate = (e) => {
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
    console.log(e.streams[0]);
    phoneSTREAM.current.srcObject = e.streams[0];
    setGotStream(true);

    //dispatch({ type: "ADD_STREAM" });
  };
};

/* ******************************************************************************* */
export const start = (phoneSTREAM, setGotStream) => async (dispatch) => {
  socket.on("offerOrAnswer", (sdp) => {
    pc.setRemoteDescription(new RTCSessionDescription(sdp));
  });

  socket.on("candidate", (candidate) => {
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on("phone-stop", () => {
    console.log("phone-stop");
    setGotStream(false);
    pc.close();
    pc = new RTCPeerConnection(pc_config);
    addListeners(phoneSTREAM, setGotStream);
    createOffer();
  });

  addListeners(phoneSTREAM, setGotStream);
  createOffer();
};
