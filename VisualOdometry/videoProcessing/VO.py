import cv2 
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits import mplot3d
from skimage.measure import ransac
from skimage.transform import FundamentalMatrixTransform , EssentialMatrixTransform

import pytransform3d.transformations as pt
import pytransform3d.trajectories as ptr
import pytransform3d.rotations as pr
import pytransform3d.camera as pc

from cycler import cycle

orb = cv2.ORB_create()


def add_ones(x):
    return np.concatenate([x, np.ones((x.shape[0], 1))], axis=1)

def normalizecoordinates(pts,Kinv): # DeDistortes 
    pts[:,0,:] = np.dot(Kinv,add_ones(pts[:,0,:]).T).T[:,0:2]
    pts[:,1,:] = np.dot(Kinv,add_ones(pts[:,1,:]).T).T[:,0:2]
    return pts

def denormalize(pt,K): # Back to original 
    ret = np.dot(K,np.array([pt[0],pt[1],1.0]).T)
    #print(ret)
    return int(round(ret[0])),int(round(ret[1])) 

def get_pose(pts,K,E):
        # Essential matrix
        #E, mask = cv2.findEssentialMat(pts[:,0], pts[:,1], K)

        # Decompose the Essential matrix into R and t
        R, t = decomp_essential_mat(E, K, pts)
        if np.linalg.norm(t) > 80:
            return None
        # Get transformation matrix
        transformation_matrix = _form_transf(R, np.squeeze(t))
        #print(transformation_matrix)
        return transformation_matrix


def extract_frame(img,prevFrame,K,Kinv):
    feats = cv2.goodFeaturesToTrack(np.mean(img,axis=2).astype(np.uint8), 1000, qualityLevel=0.01, minDistance=3)
    kps = [cv2.KeyPoint(x=f[0][0], y=f[0][1], size=20) for f in feats]
    kps, des = orb.compute(img, kps)
    transf = None
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

        if len(good) > 0:
          good = np.array(good)
          good = normalizecoordinates(good,Kinv)
          model, inliers = ransac((good[:,0],good[:,1]),
                                 EssentialMatrixTransform,
                                 min_samples=8,
                                 residual_threshold=0.001,
                                 max_trials=50)
          transf = get_pose(good[inliers],K,model.params)     
          #threeD_Points(good[inliers],Rt,prevRt)                
          for m in good[inliers]:
            u1,v1 = denormalize(m[0],K)
            u2,v2 = denormalize(m[1],K)
            cv2.line(img , (u1,v1),(u2,v2),(255,0,0),1)
    prevFrame = {"kps": kps, "des": des, 'img': img}
    cv2.imshow('img', img)
    cv2.waitKey(1) 
    #out.write(img)
    return prevFrame, transf

def _form_transf(R, t):
        T = np.eye(4, dtype=np.float64)
        T[:3, :3] = R
        T[:3, 3] = t
        
        return T

def decomp_essential_mat(E,K, pts):
        R1, R2, t = cv2.decomposeEssentialMat(E)
        T1 = _form_transf(R1,np.ndarray.flatten(t))
        T2 = _form_transf(R2,np.ndarray.flatten(t))
        T3 = _form_transf(R1,np.ndarray.flatten(-t))
        T4 = _form_transf(R2,np.ndarray.flatten(-t))
        transformations = [T1, T2, T3, T4]
        
        # Homogenize K
        K_hom = np.concatenate((K, np.zeros((3,1)) ), axis = 1)
        #print(K)
        #print(K_hom)

        # List of projections
        projections = [K_hom @ T1, K_hom @ T2, K_hom @ T3, K_hom @ T4]

        positives = []
        for P, T in zip(projections, transformations):
            hom_Q1 = cv2.triangulatePoints(P, P, pts[:,0].T, pts[:,1].T)
            hom_Q2 = T @ hom_Q1
            # Un-homogenize
            Q1 = hom_Q1[:3, :] / hom_Q1[3, :]
            Q2 = hom_Q2[:3, :] / hom_Q2[3, :]
           # print(Q1)
            total_sum = sum(Q2[2, :] > 0) + sum(Q1[2, :] > 0) # T
           # print(total_sum)
            relative_scale = np.mean(np.linalg.norm(Q1.T[:-1] - Q1.T[1:], axis=-1)/
                                     np.linalg.norm(Q2.T[:-1] - Q2.T[1:], axis=-1))
            positives.append(total_sum + relative_scale)
            
        # Decompose the Essential matrix using built in OpenCV function
        # Form the 4 possible transformation matrix T from R1, R2, and t
        # Create projection matrix using each T, and triangulate points hom_Q1
        # Transform hom_Q1 to second camera using T to create hom_Q2
        # Count how many points in hom_Q1 and hom_Q2 with positive z value
        # Return R and t pair which resulted in the most points with positive z

        max = np.argmax(positives)
        if (max == 2):
            # print(-t)
            return R1, np.ndarray.flatten(-t) 
        elif (max == 3):
            # print(-t)
            return R2, np.ndarray.flatten(-t) 
        elif (max == 0):
            # print(t)
            return R1, np.ndarray.flatten(t) 
        elif (max == 1):
            # print(t)
            return R2, np.ndarray.flatten(t) 


def create_video(filename, width, height, fps=30):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video = cv2.VideoWriter(filename, fourcc, float(fps), (width, height))
    return video


if __name__ == "__main__":
    cap = cv2.VideoCapture('test09.mp4')
    if cap.isOpened():
      W = int((cap.get(cv2.CAP_PROP_FRAME_WIDTH))/2)#1920/2
      H = int((cap.get(cv2.CAP_PROP_FRAME_HEIGHT))/2)#1080/2
      Kk = np.array([[96.4,0,W//2],[0,96.4,H//2],[0,0,1]]) #96.4
      K = np.array([
    [1.22276742e+03,0.00000000e+00,3.87933415e+02],
    [0.00000000e+00,1.21655279e+03,8.11926095e+02],
    [0.00000000e+00,0.00000000e+00,1.00000000e+00]
    ])
      Kinv = np.linalg.inv(K)
      print(W,H)
    frames = []
    prevFrame = None
    prevRt = None
    
    gt_path = []
    estimated_path = []
    camera_pose_list = []
    start_pose = np.ones((3,4))
    start_translation = np.zeros((3,1))
    start_rotation = np.identity(3)
    start_pose = np.concatenate((start_rotation, start_translation), axis=1)
    cur_pose = start_pose
    frame_count = 0
    transf = None
    #out = create_video('pop.mp4',W,H)
    while cap.isOpened():
        ret, frame = cap.read()
        frame_count += 1
        if ret :
            img = cv2.resize(frame, (W, H))
            #frames.append(img)
            prevFrame, transf =  extract_frame(img,prevFrame,K,Kinv)
            if transf is not None:
              cur_pose = cur_pose @ transf 
        
              hom_array = np.array([[0,0,0,1]])
              hom_camera_pose = np.concatenate((cur_pose,hom_array), axis=0)
              camera_pose_list.append(hom_camera_pose)
              estimated_path.append((cur_pose[0, 3], cur_pose[2, 3]))
              estimated_camera_pose_x, estimated_camera_pose_y = cur_pose[0, 3], cur_pose[2, 3]
              print("Estimated camera pose: ({}, {})".format(estimated_camera_pose_x, estimated_camera_pose_y))
        if cv2.waitKey(25) & 0xFF == ord('q'):
          break

    cap.release()

number_of_frames = 50
image_size = np.array([960, 540])
#image_size = np.array([1920, 1080])

plt.figure()
#ax = pt.plot_transform()
ax = plt.axes(projection='3d')

camera_pose_poses = np.array(camera_pose_list)
print(camera_pose_poses)

key_frames_indices = np.linspace(0, len(camera_pose_poses) - 1, dtype=int)#, number_of_frames,
#colors = cycle("rgb")
shade = 1
for i in key_frames_indices:
    ## color gets darker as the camera moves away from the origin
    pc.plot_camera(ax, K, camera_pose_poses[i],
                   sensor_size=image_size, c=shade * np.array([1., 0., 0.]))
    shade *= 0.95
                   


plt.show()

take_every_th_camera_pose = 10

estimated_path = np.array(estimated_path[::take_every_th_camera_pose])

plt.plot(estimated_path[:,0],estimated_path[:,1])
plt.show()

## hello 