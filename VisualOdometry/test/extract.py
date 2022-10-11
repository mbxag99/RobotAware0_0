import cv2 
import numpy as np
import matplotlib.pyplot as plt

orb = cv2.ORB_create()

def extract_frame(img,prevFrame,out):
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
    cv2.imshow('img', img)
    cv2.waitKey(1) 
    out.write(img)
    return prevFrame

def create_video(filename, width, height, fps=30):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video = cv2.VideoWriter(filename, fourcc, float(fps), (width, height))

    return video


if __name__ == "__main__":
    cap = cv2.VideoCapture('test2.mp4')
    if cap.isOpened():
      W = int((cap.get(cv2.CAP_PROP_FRAME_WIDTH))/2)
      H = int((cap.get(cv2.CAP_PROP_FRAME_HEIGHT))/2)
    prevFrame = None
    out = create_video('pop.mp4',W,H)
    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            img = cv2.resize(frame, (W, H))
            prevFrame =  extract_frame(img,prevFrame,out)
        else:
            break

