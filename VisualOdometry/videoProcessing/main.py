import io
import os
from flask import Flask,render_template, Response , request
from flask_cors import CORS
from wand.image import Image 
import matplotlib.pyplot as plt
import cv2
import numpy as np
import base64


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024 # 
CORS(app)

orb = cv2.ORB_create()
def extract_frame(img,prevFrame):
    feats = cv2.goodFeaturesToTrack(np.mean(img,axis=2).astype(np.uint8), 3000, qualityLevel=0.01, minDistance=3)
    kps = [cv2.KeyPoint(x=f[0][0], y=f[0][1], size=20) for f in feats]
    kps, des = orb.compute(img, kps)
    # draw features
    for p in kps:
     cv2.circle(img, (int(p.pt[0]), int(p.pt[1])), 2, (0, 255, 0), 1)
    if prevFrame:
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
        matches = matcher.knnMatch(des, prevFrame['des'],k=2)
        good = []
        for m,n in matches:
         if m.distance < 0.75*n.distance:
           kp1 = kps[m.queryIdx].pt
           kp2 = prevFrame['kps'][m.trainIdx].pt
           good.append((kp1,kp2))
        for m in good:
          cv2.line(img, (int(m[0][0]), int(m[0][1])), (int(m[1][0]), int(m[1][1])), (255, 0, 0), 1)
    prevFrame = {"kps": kps, "des": des, 'img': img}
    return img,prevFrame

if __name__ == "__main__":
    app.run(debug=True)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed', methods=['POST','GET'])
def video_feed():
    print("video feed")
    ''''
    wtf = request.files['video']
    print(wtf)
    print(wtf.stream)
    print(wtf.stream.read())
    if os.path.isfile('C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing/out.webm'):#C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing
      os.remove('C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing/out.webm')
    with open('C:/Users/windows 10/Desktop/superP/VisualOdometry/videoProcessing/out.webm', 'wb') as f:
        f.write(wtf.stream.read())
    '''
    return Response(get_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')   

def get_frames():
        # video is a Binary Large Object (BLOB) that contains the video file
        # video is a file-like object
        # so to allow cv2 to read the video, we need to convert it to a numpy array
        # then we can use cv2 to read the video
        print("get frames")
        ourVideo = cv2.VideoCapture('ourVideo.mp4')

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
