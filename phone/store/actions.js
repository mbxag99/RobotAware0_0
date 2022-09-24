import { io } from "socket.io-client";
import { Peer } from "react-native-peerjs";

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
let userIIDD;
peerServer.on("open", (id) => {
  console.log(id + `hELL yEAH It works`);
  userIIDD = id;
});
peerServer.on("error", (error) => console.log(error + "peer error"));

let c = 0;
export const start = (stream) => async (dispatch) => {
  //socket.emit("message-from-phone", { value: "Hello from the phone" });
  socket.on("computer-requesting-connection", (compID) => {
    if (c == 0) {
      if (stream != null) {
        console.log(`calling the police ${compID}`);
        console.log(`The stream is ${stream.toURL()}`);
        let call = peerServer.call(compID, stream);
        call.on("close", () => {
          console.log(`call closed`);
        });
        call.on("error", () => {
          console.log(`call errored`);
        });
        console.log(`calinng ${call}`);
        dispatch({ type: "CONNECTION_INITIATED" });
      }
      c++;
    }
  });
  /* socket.on("message-recieved-to-phone", (value) => {
    console.log(`hey from phone recieved ${value.value}`);
    dispatch({ type: "MSG_RECIEVED", payload: value.value });
  });*/
};
