from flask import Flask,render_template, Response
import matplotlib.pyplot as plt
import cv2
app = Flask(__name__)
if __name__ == "__main__":
    app.run(debug=True)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(get_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')   

def get_frames():
    ourVideo = cv2.VideoCapture('ourVideo.mp4')
    while ourVideo.isOpened():
        #success is a bool data type, returns true if Python is able to read the videoCapture() object.
        #frame is a numpy array, represents the first image that video captures.
        #read() returns a bool (True/False). If frame is read correctly, it will be true
        success, frame = ourVideo.read() 
        if not success:
            break
        else:
            height = ourVideo.get(cv2.CAP_PROP_FRAME_HEIGHT)
            width = ourVideo.get(cv2.CAP_PROP_FRAME_WIDTH)
            #cv2.imencode() function is to convert(encode) the image format into streaming data and assign
            # it to memory cache.
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result

