import base64
from PIL import Image
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import io 
import cv2
import numpy as np
import imutils
from ProcessFrame import Processing



app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024
socketio = SocketIO(app,binary=True)
CORS(app)
socketio.init_app(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
counter = 0
if __name__ == '__main__':
    socketio.run(app, debug=True)

@socketio.on('video_slice')
def handle_frame(data):
    global counter 
    print("Received video slice data")# we received a video 
    socketio.emit('pause',broadcast=True)
    path = 'C:/Users/windows 10/Desktop/superP/VisualOdometry/AutoCar/v' + str(counter) + '.webm'
    with open(path, 'wb') as f:
        f.write(data)
    counter+=1
    Processing.start_processing()
    socketio.emit('resume',broadcast=True)

    










