import { Button, Container } from "@mui/material";
import React, { useState } from "react";

export default function RecordingP() {
  const [status, setStatus] = useState(false);
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
      <Button
        size="large"
        className="Rectangle"
        variant="contained"
        color={status ? "success" : "error"}
        style={{
          fontFamily: "Merriweather",
          borderRadius: "10px",
        }}
        onClick={() => {
          setStatus(!status);
        }}
      >
        {status ? "Start recording" : "Stop Recording"}
      </Button>
      {/*<video
        style={{
          width: 300,
          height: 300,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={}
        autoPlay
        muted
    ></video>*/}
    </Container>
  );
}
