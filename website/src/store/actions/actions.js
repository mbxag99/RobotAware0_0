import { createRef, useRef } from "react";
import { io } from "socket.io-client";

const API_URI = `http://10.0.0.16:3001/`;
let socket = io(`${API_URI}`, { forceNew: true });
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
    // console.log(JSON.stringify(sdp))

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
/* ******************************************************************************* */
export const start = (phoneSTREAM) => async (dispatch) => {
  socket.on("offerOrAnswer", (sdp) => {
    //textref.value = JSON.stringify(sdp);

    // set sdp as remote description
    pc.setRemoteDescription(new RTCSessionDescription(sdp));
  });

  socket.on("candidate", (candidate) => {
    // console.log('From Peer... ', JSON.stringify(candidate))
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
    /* remoteVideoref.current = new MediaStream();*/
    //global.remoteVideoref.srcObject = e.streams[0];
    console.log(e.streams[0]);
    phoneSTREAM.current.srcObject = e.streams[0];
    dispatch({ type: "ADD_STREAM" });
  };

  createOffer();
  //socket.emit("connection-request", compID);
};
/* ******************************************************************************* */
/*let peerServer = new Peer(undefined, {
  host: "10.0.0.16",
  secure: false,
  port: 3001,
  path: "/peerjs",
  config: {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
  },
});
let compID;
peerServer.on("open", (id) => {
  console.log(id + `hELL yEAH It works`);
  compID = id;
});
peerServer.on("error", (error) => console.log(error + "peer error"));

let c = 0;*/
//socket.emit("message-to-phone", { value: "dadsas" });
//peerServer.call();
/* const compPeer = new SimplePeer({
    initiator: false,
    trickle: false,
  });
  compPeer.on("signal", (data) => {
    console.log("SIGNAL", JSON.stringify(data));
  });
  compPeer.on("connect", () => {
    console.log("CONNECT");
    compPeer.send("whatever" + Math.random());
  });

   compPeer.on("data", (data) => {
    console.log("data: " + data);
  });
  peerServer.on("call", (call) => {
    if (c == 0) {
      console.log(`call recieved ${call.localStream}`);
      call.answer();
      console.log(`the peer call.peer ${call.peer}`);
      call.peerConnection.onaddstream = (e) => {
        call.addStream(e.stream, call);
      };
      call.on("stream", (PhoneStream) => {
        console.log(PhoneStream);
        c = 8000;
      });
      call.on("close", () => {
        console.log(`call closed`);
      });
      call.on("error", () => {
        console.log(`call errored`);
      });
      c++;
    }
  });*/
