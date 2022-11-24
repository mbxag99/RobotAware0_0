import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@rneui/themed";
import { accept, start, stopS } from "./store/actions";
import { useDispatch, useSelector } from "react-redux";
import { RTCView, mediaDevices } from "react-native-webrtc";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import MonocularTemp from "./MonocularTemp";
import AutoCarTemp from "./AutoCarTemp";
import { SafeAreaView } from "react-native-safe-area-context";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export default function App() {
  return (
    <>
      <StatusBar backgroundColor={"black"} />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <MonocularTemp />
      </SafeAreaView>
    </>
  );
}
