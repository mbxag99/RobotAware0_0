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
    console.log('for every piece');
    this.socket.on('error', error => console.log(error + `socket error`));
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
}
