/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {configureStore} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import {reducers} from './store/reducers';
import {Provider} from 'react-redux';

const store = configureStore({
  reducer: reducers,
  middleware: [thunk],
});

const RNR = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => RNR);
