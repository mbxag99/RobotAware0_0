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

//socket io
io.on("connection", (socket) => {
  console.log("Someone connected");
  socket.join(0);
  socket.on("connection-request", (compID) => {
    console.log(compID);
    io.to(0).emit("computer-requesting-connection", compID);
  });
  /*  socket.on("message-to-phone", ({ value }) => {
    console.log(value);
    io.to(0).emit("message-recieved-to-phone", {
      value: value,
    });
  });
     socket.on("message-from-phone", ({ value }) => {
    console.log(value);
    io.to(0).emit("message-recieved-from-phone", {
      value: value,
    });
  });
  socket.on("user-disconnected", () => {
    socket.leave(0);
    if (isListen) removeUser(userId);
    socket.to(0).emit("other-user-disconnected", userId);
    io.to(0).emit("all-listeners", getRoomListeners(0));
  });

  socket.on("disconnect", () => {
    console.log(`${userName} just Disconnected`);
    socket.leave(0);
    if (isListen) removeUser(userId);
    socket.to(0).emit("other-user-disconnected", userId);
    io.to(0).emit("all-listeners", getRoomListeners(0));
  });

  socket.on("end", () => {
    socket.disconnect(0);
  });*/
});

server.listen(port, () => console.log("API initiated"));
