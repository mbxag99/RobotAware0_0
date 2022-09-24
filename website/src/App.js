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
import { start } from "./actions/actions";
//import { RTCView } from "react-native-web-webrtc";
function App() {
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
          start();
        }}
      >
        Start recording
      </Button>

      {/* <RTCView
        streamURL={myStream.toURL()}
        style={{ height: 200, width: 200 }}
      /><video playsInline muted ref={""} autoPlay />*/}
    </Container>
  );
}

export default App;
