import {io} from 'socket.io-client';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';

export class action {
  constructor() {
    console.log('ssssssssssssssss');
    console.log('++++++++++++');
    this.socket = io(`http://10.0.0.16:3001/`, {forceNew: true});
    this.socket_to_ac = 0;
    /* io(`http://10.0.0.16:5000`, {
      transports: ['websocket'],
    }); */
    console.log('for every piece');
    this.socket.on('error', error => console.log(error + `socket error`));
    /* this.socket_to_ac.on('error', error =>
      console.log(`socket error ` + error),
    );
    this.socket_to_ac.on('connect_error', err => {
      console.log(`connect_error due to ${err}`);
    });
    this.socket_to_ac.on('connect', ss => {
      console.log(`cCOONNECTION TO AC`);
    });*/
    this.socket.on('connect', ss => {
      console.log(`cCOONNECTION SO`);
    });
    this.pc = new RTCPeerConnection();
  }

  sendToPeer(messageType, payload) {
    this.socket.emit(messageType, {
      socketID: this.socket.id,
      payload,
    });
  }

  createAnswer() {
    console.log('Answer');
    this.pc.createAnswer({offerToReceiveVideo: 1}).then(sdp => {
      console.log(JSON.stringify(sdp));

      // set answer sdp as local description
      this.pc.setLocalDescription(sdp);

      this.sendToPeer('offerOrAnswer', sdp);
    });
  }

  start_streaming(stream, setStatus, stopped) {
    console.log('hhhi ddd we are starting');
    if (stopped) {
      console.log('stop');
      this.pc.close();
      // reset to allow for new connections
      this.pc = new RTCPeerConnection(pc_config);
    }

    this.socket.on('offerOrAnswer', sdp => {
      console.log('received offer or answer');
      console.log(sdp);
      //textref.value = sdp;
      console.log('steee');
      // set sdp as remote description
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    this.socket.on('candidate', candidate => {
      console.log('From Peer... ', JSON.stringify(candidate));
      this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      setStatus(1);
    });

    this.socket.on('disconnected-boy', data => {
      setStatus(0);
    });

    this.pc.onicecandidate = e => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      if (e.candidate) {
        // console.log(JSON.stringify(e.candidate))
        this.sendToPeer('candidate', e.candidate);
      }
    };

    this.pc.oniceconnectionstatechange = e => {
      console.log(e);
    };
    //console.log(stream.getTracks());
    console.log(stream.active);
    console.log('OPIUM');
    for (const track of stream.getTracks()) {
      console.log('1 ' + track);
      //this.pc.addTrack(track, [stream]);
      this.pc.addStream(stream);
    }
    console.log('added tracksV  SD');
    if (stopped) this.socket.emit('buddy-phone-stop');
  }
  accept() {
    console.log(this.pc.signalingState + ' sassy');
    if (this.pc.signalingState == 'have-remote-offer') {
      console.log('ACCEPT');
      this.createAnswer();
    }
  }

  set_listeners_for_ac(RNBluetoothClassic) {
    try {
      console.log('dassadasdw222 ', this.socket.connected);
      console.log('Sytttt ', this.socket_to_ac.connected);
      //console.log(await RNBluetoothClassic.isBluetoothEnabled());
      //console.log(await RNBluetoothClassic.getBondedDevices());
      //console.log(await RNBluetoothClassic.getConnectedDevices());
      RNBluetoothClassic.connectToDevice('98:D3:31:20:68:84');
      this.socket_to_ac.on('command_to_phone', command => {
        console.log('commnad ' + command);
        RNBluetoothClassic.writeToDevice('98:D3:31:20:68:84', command);
        //socket_to_ac.emit('phone_sent_to_robot');
        this.socket_to_ac.emit('phone');
      });
      this.socket_to_ac.emit('phone');
    } catch (error) {
      console.log('errrrrr ', error);
    }
  }
}
