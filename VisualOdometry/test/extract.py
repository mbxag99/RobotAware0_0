import cv2 
import numpy as np

orb = cv2.ORB_create()

def extract_frame(img,prevFrame):
    feats = cv2.goodFeaturesToTrack(np.mean(img,axis=2).astype(np.uint8), 200, qualityLevel=0.01, minDistance=3)
    kps = [cv2.KeyPoint(x=f[0][0], y=f[0][1], size=20) for f in feats]
    kps, des = orb.compute(img, kps)
    # draw features
    for p in kps:
     cv2.circle(img, (int(p.pt[0]), int(p.pt[1])), 2, (255, 0, 0), 1)
    cv2.imshow('img', img)
    cv2.waitKey(100) 

if __name__ == "__main__":
    cap = cv2.VideoCapture('test1.mp4')
    if cap.isOpened():
      W = int((cap.get(cv2.CAP_PROP_FRAME_WIDTH))/2)
      H = int((cap.get(cv2.CAP_PROP_FRAME_HEIGHT))/2)
    prevFrame = None
    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            img = cv2.resize(frame, (500, 500))
            extract_frame(img,prevFrame)
        else:
            break