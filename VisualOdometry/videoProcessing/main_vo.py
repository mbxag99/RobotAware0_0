import io
import os
from flask import Flask,render_template, Response , request,jsonify
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
    print(uploaded_file)
    uploaded_file.save('C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing/recieved.webm')
    return 'DONE' 





@app.route('/get_analysis', methods=['GET'])
def video_feed():
    print("start processingsss")
    VO = VisualOdometry()
    VO.start_Processing()
    return jsonify({'Estimates': VO.out_estimated_path})


@app.route('/video_slice', methods=['POST'])
def video_slice():
    print("Received video slice data")
    data = request.files['video_slice']
    # make data readable by opencv
    data = np.frombuffer(data.read(), np.uint8)
    # read from data frame by frame processing
    frame = cv2.imdecode(data, cv2.IMREAD_COLOR)
    #data.save('C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing/v.webm')
    return 'DONE'

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
'''
def start_processing():
    print("start processingsss")
    VO = VisualOdometry()
    VO.start_Processing()
    return VO.camera_pose_list , VO.estimated_path
    #t = threading.Thread(target=VO.start_Processing)
    #t.start()
    #counter = 0
    #while True:
    #        img = VO.get_image()
    #        if img is not None and counter % 10 == 0:
    #            ret, buffer = cv2.imencode('.jpg', img)
    #            frame = buffer.tobytes()
    #            yield (b'--frame\r\n'
    #                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    #            counter += 1
'''

