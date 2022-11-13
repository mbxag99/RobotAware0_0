import io
import os
from flask import Flask,render_template, Response , request
from flask_cors import CORS
from wand.image import Image 
import matplotlib.pyplot as plt
import cv2
import numpy as np
import base64
import tempfile
from pathlib import Path
from VOclass import VisualOdometry
import threading

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024 # 
CORS(app)


if __name__ == "__main__":
    app.run(debug=True)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload_vod', methods=['POST'])
def upload():
    print("Uploading VOD")
    uploaded_file = request.files['video']
    uploaded_file.save('C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing/recieved.webm')
    return 'DONE' 





@app.route('/video_feed', methods=['GET'])
def video_feed():
    print("video feed")
    return Response(start_processing(), mimetype='multipart/x-mixed-replace; boundary=frame')   

'''

def get_frames():
        print("get frames")
        ourVideo = cv2.VideoCapture('recieved.webm')

        prevFrame = None
        if ourVideo.isOpened():
            W = int((ourVideo.get(cv2.CAP_PROP_FRAME_WIDTH))/2)
            H = int((ourVideo.get(cv2.CAP_PROP_FRAME_HEIGHT))/2)
        while ourVideo.isOpened():
            success, frame = ourVideo.read() 
            if not success:
                break
            else:
                img , prevFrame = extract_frame(cv2.resize(frame, (W, H)),prevFrame)
                ret, buffer = cv2.imencode('.jpg', img)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result

'''
def start_processing():
    print("start processingsss")
    VO = VisualOdometry()
    t = threading.Thread(target=VO.start_Processing)
    t.start()
    while True:
        img = VO.get_image()
        if VO.can_expose and img is not None:
            ret, buffer = cv2.imencode('.jpg', img)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


