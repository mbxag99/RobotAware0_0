import logo from "./logo.svg";
import "./App.css";
import {
  Container,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import background from "./img/back.png";
import { start } from "./store/actions/actions";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import { createRef } from "react";

function App() {
  const dispatch = useDispatch();
  const { phoneStream, phoneStreamLoading } = useSelector(
    (state) => state.MediaReducer
  );
  const phoneSTREAM = createRef();
  return (
    <Container
      maxWidth="lg"
      style={{
        width: "100%",
        height: "700px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alightContent: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h2" color={"whitesmoke"} fontFamily="Merriweather">
        {" "}
        Welcome to our magnificent project Autonomous car , Monocular and video
        Odometry
      </Typography>
      <p></p>
      <Button
        size="large"
        className="Rectangle"
        variant="contained"
        color="success"
        style={{
          fontFamily: "Merriweather",
          borderRadius: "10px",
        }}
        onClick={() => {
          dispatch(start(phoneSTREAM));
        }}
      >
        Start recording
      </Button>
      <video
        style={{
          width: 300,
          height: 300,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={phoneSTREAM}
        autoPlay
        muted
      ></video>

      {/* <RTCView
        streamURL={myStream.toURL()}
        style={{ height: 200, width: 200 }}
      /><video playsInline muted ref={""} autoPlay />*/}
    </Container>
  );
}

export default App;
