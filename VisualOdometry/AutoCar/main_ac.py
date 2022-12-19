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
from time import time, sleep
import math
from  ProcessFrame_w import HandCodedLaneFollower

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024
socketio = SocketIO(app,binary=True)
CORS(app)
socketio.init_app(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
counter = 0
if __name__ == '__main__':
    socketio.run(app,host='10.0.0.16',port='5000', debug=True,use_reloader=True)

@socketio.on('connect')
def on_connect():
    print('A client connected!')

@socketio.on('disconnect')
def on_disconnect():
    print('A client disconnected!')
    
@socketio.on('video_slice')
def handle_frame(data):
    #global counter 
    print("Received video slice data")# we received a video 
    socketio.emit('pause',broadcast=True)
    path = 'C:/Users/windows 10/Desktop/superP/VisualOdometry/AutoTest/inc_vid_slices/v' + str(counter) + '.webm'
    with open(path, 'wb') as f:
        f.write(data)
    counter+=1
    direc , duration = handleVideo(path)
    # if direc is forwared we can cotinue receiving video slices immediately
    # if direc is left then we need the recording to be halted as we need to send a command to the phone to go left then after turning then we can continue receiving video slices
    # if direc is right then we need the recording to be halted as we need to send a command to the phone to go right then after turning then we can continue receiving video slices
    socketio.emit('command_to_phone',(direc,duration))
    if direc == 'F':
        socketio.emit('resume',broadcast=True)
    else:
        # time out for 2 seconds the emit resume
        sleep(2)
        socketio.emit('resume',broadcast=True)


@socketio.on('test')
def handle():
    print('COMMMMMAND')
    aa_milne_arr = ['F', 'B', 'R', 'L']
    ran_comm = np.random.choice(aa_milne_arr, 1, p=[0.5, 0.1, 0.1, 0.3])
    print(ran_comm[0])
    sleep(5)
    socketio.emit('command_to_phone',ran_comm[0])


def handleVideo(path):
        calso = HandCodedLaneFollower()
        calso.test_video(path)
        print("Done!") 
        # most frequent direction keep in mind that the direction is a tuple (direction , angle)
        last_half = calso.dirc[len(calso.dirc)//2:]
        most_freq_dir = max(calso.dirc, key=calso.dirc.count)
        average_angle = sum([x[1] for x in calso.dirc if x[0] == most_freq_dir[0]]) / len([x[1] for x in calso.dirc if x[0] == most_freq_dir[0]])
        print('most frequent direction is ', most_freq_dir[0], 'with average angle of ', average_angle)
        turning_radius = 10 # cm
        circumference = 2 * math.pi * turning_radius
        distance = circumference * (average_angle / 360)
        turning_speed = 10 # cm/s
        duration = distance / turning_speed
        return most_freq_dir , duration


    










