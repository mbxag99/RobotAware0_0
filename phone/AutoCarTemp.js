import { Icon } from "@rneui/base";
import React, { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
  r,
} from "react-native";
import { mediaDevices } from "react-native-webrtc";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { accept, start, stopS } from "./store/actions";

export default function AutoCarTemp({ setPage }) {
  return (
    <View>
      <Text>AutoCarTemp</Text>
      <View style={styles.goBack}>
        <TouchableOpacity
          onPress={() => {
            setPage("Home");
          }}
        >
          <Icon
            name="arrow-left"
            type="font-awesome"
            color="#280c00"
            size={50}
          />
        </TouchableOpacity>
      </View>
    </View>
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
    borderRadius: 40,
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
  },
  goBack: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 10,
  },
});
