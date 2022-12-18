import socketio
from time import time, sleep
import eventlet
import numpy as np
from  ProcessFrame_w import HandCodedLaneFollower
# create a Socket.IO server
sio = socketio.Server()

# wrap with a WSGI application
app = socketio.WSGIApp(sio)
counter = 0

@sio.on('test')
def handle(sid):
    print('COMMMMMAND')
    aa_milne_arr = ['F', 'B', 'R', 'L']
    ran_comm = np.random.choice(aa_milne_arr, 1, p=[0.5, 0.1, 0.1, 0.3])
    print(ran_comm[0])
    sleep(5)
    sio.emit('command_to_phone',ran_comm[0])

@sio.on('video_slice')
def handle_frame(sid,data):
    global counter 
    print("Received video slice data")# we received a video 
    sio.emit('pause',broadcast=True)
    path = 'C:/Users/windows 10/Desktop/superP/VisualOdometry/AutoTest/inc_vid_slices/v' + str(counter) + '.webm'
    with open(path, 'wb') as f:
        f.write(data)
    counter+=1
    comnd = handleVideo(path)
    sio.emit('command_to_phone',comnd)
    # if comnd is forwared we can cotinue receiving video slices immediately
    # if comnd is left then we need the recording to be halted as we need to send a command to the phone to go left then after turning then we can continue receiving video slices
    # if comnd is right then we need the recording to be halted as we need to send a command to the phone to go right then after turning then we can continue receiving video slices
    if comnd == 'F':
        sio.emit('resume',broadcast=True)
    else:
        # time out for 2 seconds the emit resume
        sleep(2)
        sio.emit('resume',broadcast=True)


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('10.0.0.16', 5000)), app)




def handleVideo(path):
        calso = HandCodedLaneFollower()
        calso.test_video(path)
        print("Done!")
        max_out = max(calso.dirc, key=calso.dirc.count) # get the most frequent direction 
        return max_out