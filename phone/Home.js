import { Icon } from "@rneui/base";
import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import AutoCarTemp from "./AutoCarTemp";
import MonocularTemp from "./MonocularTemp";

export default function Home() {
  const [page, setPage] = useState("Home");
  return page == "Home" ? (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the phone side! Let's START!!</Text>
      <View style={styles.buttonsContainer}>
        {/*We will have two buttons here one for MVO and one for AC*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setPage("Monocular")}
        >
          <Text style={styles.text}>Monocular Odometry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setPage("AutoCar")}
        >
          <Text style={styles.text}>Autonomous</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : page == "Monocular" ? (
    <MonocularTemp setPage={setPage} />
  ) : (
    <AutoCarTemp setPage={setPage} />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(76,77,102)",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  text: {
    color: "whitesmoke",
    fontSize: 20,
    fontFamily: "Merriweather",
    textAlign: "center",
  },
  connection: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  rtc: {
    height: 200,
    width: 200,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    display: "flex",
    alignContent: "space-between",
  },
  button: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    width: 150,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
});
