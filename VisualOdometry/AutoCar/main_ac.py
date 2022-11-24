import base64
from PIL import Image
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import io 
import cv2
import numpy as np
import imutils



app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024
socketio = SocketIO(app,binary=True)
CORS(app)
socketio.init_app(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)

@socketio.on('video_slice')
def handle_frame(data):
    print("Received video slice data")# we received a video 
    with open('C:/Users/windows 10/Desktop/superP/VisualOdometry/AutoCar/v.webm', 'wb') as f:
        f.truncate()
        f.write(data)
     

    










