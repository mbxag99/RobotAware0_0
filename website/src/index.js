import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { applyMiddleware, compose } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { reducers } from "./store/reducers/index";
import { createRoot } from "react-dom/client";

//const store = configureStore(reducers, compose(applyMiddleware(thunk)));
const store = configureStore({
  reducer: reducers,
  middleware: [thunk],
});
const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
