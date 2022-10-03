import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";

const app = express();
const server = http.Server(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:19006",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST"],
  },
});

const port = 3001;
app.use(bodyParser.json({ extended: true }));
app.use(cors());

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/",
});

app.use("/peerjs", peerServer);
peerServer.on("connection", () => console.log("peer is open"));
peerServer.on("error", () => console.log("peer is closed error"));
peerServer.on("disconnect", (e) => {
  console.log(`peer is closed disconnect ${e}`);
});

let connectedPeers = new Map();
//socket io
io.on("connection", (socket) => {
  console.log(socket.id);
  socket.emit("connection-success", { success: socket.id });

  connectedPeers.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log("one disconnected");
    connectedPeers.delete(socket.id);
  });

  socket.on("offerOrAnswer", (data) => {
    // send to the other peer(s) if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload.type);
        socket.emit("offerOrAnswer", data.payload);
      }
    }
  });

  socket.on("candidate", (data) => {
    // send candidate to the other peer(s) if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload);
        socket.emit("candidate", data.payload);
      }
    }
  });
});

server.listen(port, () => console.log("API initiated"));
