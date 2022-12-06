import cv2  
class Processing:
    def __init__(self):
      self.steering_angel = None    


    def start_processing(self,path):
      cap = cv2.VideoCapture(path)
        


