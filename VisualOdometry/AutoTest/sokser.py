import socketio
from time import time, sleep
import eventlet
import numpy as np

# create a Socket.IO server
sio = socketio.Server()

# wrap with a WSGI application
app = socketio.WSGIApp(sio)

@sio.on('phone')
def handle(sid):
    print('COMMMMMAND')
    aa_milne_arr = ['F', 'B', 'R', 'L']
    ran_comm = np.random.choice(aa_milne_arr, 1, p=[0.5, 0.1, 0.1, 0.3])
    print(ran_comm[0])
    sleep(5)
    sio.emit('command_to_phone',ran_comm[0])


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('10.0.0.16', 5000)), app)