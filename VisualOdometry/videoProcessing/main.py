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

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024 # 
CORS(app)


if __name__ == "__main__":
    app.run(debug=True)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed', methods=['POST','GET'])
def video_feed():
    print("video feed")
    uploaded_file = request.files['video']
    uploaded_file.save('C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing/recieved.webm')
    return Response(process(), mimetype='multipart/x-mixed-replace; boundary=frame')   

def process():
        print("get frames")

