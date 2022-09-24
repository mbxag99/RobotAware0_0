import { registerRootComponent } from "expo";
import App from "./App";
import { applyMiddleware, compose } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { reducers } from "./store/reducers";
import { Provider } from "react-redux";

const store = configureStore({
  reducer: reducers,
  middleware: [thunk],
});

const RNR = () => (
  <Provider store={store}>
    <App />
  </Provider>
);
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RNR);
