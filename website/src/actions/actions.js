import { io } from "socket.io-client";
import { Peer } from "peerjs";
import {} from "webrtc-sdk";
const API_URI = `http://10.0.0.16:3001/`;
let socket = io(`${API_URI}`, { forceNew: true });
socket.on("error", (error) => console.log(error + `socket error`));

let peerServer = new Peer(undefined, {
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

let c = 0;
export const start = async () => {
  //socket.emit("message-to-phone", { value: "dadsas" });
  //peerServer.call();
  peerServer.on("call", (call) => {
    if (c == 0) {
      console.log(`call recieved ${call.localStream}`);
      call.answer();
      console.log(`the peer call.peer ${call.peer}`);
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
  });
  socket.emit("connection-request", compID);
};
