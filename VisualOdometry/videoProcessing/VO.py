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
from frame import Frame
from funcs import *

orb = cv2.ORB_create(3000)
# know the transformation norm between each two matched frames
# if the norm compared to the previous frame is too large, then the transformation is not reliable
transf_norms = []
FLANN_INDEX_LSH = 6
index_params = dict(algorithm=FLANN_INDEX_LSH, table_number=6, key_size=12, multi_probe_level=1)
search_params = dict(checks=50)
flann = cv2.FlannBasedMatcher(indexParams=index_params, searchParams=search_params)
        

def add_ones(x):
  if len(x.shape) == 1:
    return np.concatenate([x,np.array([1.0])], axis=0)
  else:
    return np.concatenate([x, np.ones((x.shape[0], 1))], axis=1)

def normalizecoordinates(pts,Kinv): # DeDistortes 
    pts[:,0,:] = np.dot(Kinv,add_ones(pts[:,0,:]).T).T[:,0:2]
    pts[:,1,:] = np.dot(Kinv,add_ones(pts[:,1,:]).T).T[:,0:2]
    return pts

def denormalize(pt,K): # Back to original 
    ret = np.dot(K,np.array([pt[0],pt[1],1.0]).T)
    #print(ret)
    return int(round(ret[0])),int(round(ret[1])) 

def get_pose(pts,K,E,PP):
        # Essential matrix
        #E, mask = cv2.findEssentialMat(pts[:,0], pts[:,1], K)
        # Decompose the Essential matrix into R and t

        R, t = decomp_essential_mat_old(PP,K,E,pts[:,0],pts[:,1])#decomp_essential_mat(E, K, pts)
        #if np.linalg.norm(t) < 1.0: ##************ 80/50 threshold
        #print(np.linalg.norm(t))
        #    return None
        # Get transformation matrix
        transformation_matrix = _form_transf(R, np.squeeze(t))
        #print(transformation_matrix)
        return transformation_matrix

def matchFrames(img1,img2):
        # Find the keypoints and descriptors with ORB
        kp1, des1 = orb.detectAndCompute(img1, None)
        kp2, des2 = orb.detectAndCompute(img2, None)
        # Find matches
        if len(kp1) > 6 and len(kp2) > 6:
            matches = flann.knnMatch(des1, des2, k=2)

            # Find the matches there do not have a to high distance
            good_matches = []
            try:
                for m, n in matches:
                    if m.distance < 0.5 * n.distance:
                        good_matches.append(m)
            except ValueError:
                pass
            
            print("Number of matches: ", len(good_matches))
            # Draw matches
            img_matches = np.empty((max(img1.shape[0], img2.shape[0]), img1.shape[1] + img2.shape[1], 3), dtype=np.uint8)
            #cv2.drawMatches(img1, kp1, img2, kp2, good_matches, img_matches, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
    
            #cv2.imshow('Good Matches', img_matches)
            #cv2.waitKey(50)
            
            # Get the image points form the good matches
            #q1 = [kp1[m.queryIdx] for m in good_matches]
            #q2 = [kp2[m.trainIdx] for m in good_matches]
            q1 = np.float32([kp1[m.queryIdx].pt for m in good_matches])
            q2 = np.float32([kp2[m.trainIdx].pt for m in good_matches])
        
            return q1, q2
        else:
            return None, None


def extract_frame(img,prevFrame,K,Kinv,PP):
    feats = cv2.goodFeaturesToTrack(np.mean(img,axis=2).astype(np.uint8), 3000, qualityLevel=0.01, minDistance=3)
    kps = [cv2.KeyPoint(x=f[0][0], y=f[0][1], size=20) for f in feats]
    kps, des = orb.compute(img, kps)
    transf = None
    # draw features
    for p in kps:
     cv2.circle(img, (int(p.pt[0]), int(p.pt[1])), 2, (0, 255, 0), 1)
    if prevFrame:
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
        matches = matcher.knnMatch(des, prevFrame.des,k=2)
        good = []
        for m,n in matches:
         if m.distance < 0.6*n.distance:
          #if m.distance < 32:
           kp1 = kps[m.queryIdx].pt
           kp2 = prevFrame.kps[m.trainIdx].pt
           good.append((kp1,kp2))

        if len(good) > 0:
          good = np.array(good)
          good = normalizecoordinates(good,Kinv)
          model, inliers = ransac((good[:,0],good[:,1]),
                                 EssentialMatrixTransform,
                                 min_samples=8,
                                 residual_threshold=0.001,
                                 max_trials=100)
          
          transf = get_pose(good[inliers],K,model.params,PP)  
          #transf1 = test_pose_toRt(model.params)   
         # pts4d = test_triangulate(transf,prevFrame.pose,good[inliers][:,0],good[inliers][:,1])
          #print(pts4d)
          #print(transf1)
          #threeD_Points(good[inliers],Rt,prevRt)                
          for m in good[inliers]:
            u1,v1 = denormalize(m[0],K)
            u2,v2 = denormalize(m[1],K)
            cv2.line(img , (u1,v1),(u2,v2),(255,0,0),1)
          print("Number of good matches: ", len(good[inliers]))
    prevFrame = Frame(kps, des, img)
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
        # Decompose the Essential matrix using built in OpenCV function
        # Form the 4 possible transformation matrix T from R1, R2, and t
        # Create projection matrix using each T, and triangulate points hom_Q1
        # Transform hom_Q1 to second camera using T to create hom_Q2
        # Count how many points in hom_Q1 and hom_Q2 with positive z value
        # Return R and t pair which resulted in the most points with positive z
        # we need z to be positive because we are looking at the camera from the origin so when we move forward z increases
        # and when we move backwards z decreases
        # so a better way to to check how we are moving is to check the relative scale of the points
        # so we calculate the relative scale of the points and add it to the total sum
        # the one with the highest total sum is the correct one
        for P, T in zip(projections, transformations):
            hom_Q1 = cv2.triangulatePoints(P, P, pts[:,0].T, pts[:,1].T)
            hom_Q2 = T @ hom_Q1
            # Un-homogenize
            Q1 = hom_Q1[:3, :] / hom_Q1[3, :]
            Q2 = hom_Q2[:3, :] / hom_Q2[3, :]
           # print(Q1)

           # calculate the relative scale of the points
           # we will calculate the relative scale of the points by calculating the distance between the points
            # and the distance between the points in the previous frame
            # we will then calculate the ratio of the two distances
            # we will then add the ratio to the total sum
            # the one with the highest total sum is the correct one
            ################# this appears to affect accuracy a lot
            '''total_sum = 0 ##************ 1st Opt
            for i in range(len(Q1[0])): 
                #print(Q1[0][i],Q1[1][i],Q1[2][i])
                #print(Q2[0][i],Q2[1][i],Q2[2][i])
                dist1 = np.sqrt(Q1[0][i]**2 + Q1[1][i]**2 + Q1[2][i]**2)
                dist2 = np.sqrt(Q2[0][i]**2 + Q2[1][i]**2 + Q2[2][i]**2)
                ratio = dist1/dist2
                total_sum += ratio
            positives.append(total_sum)'''
            total_sum = sum(Q2[2, :] > 0) + sum(Q1[2, :] > 0) ##************ 2ndOpt
           # print(total_sum)
            relative_scale = np.mean(np.linalg.norm(Q1.T[:-1] - Q1.T[1:], axis=-1)/
                                     np.linalg.norm(Q2.T[:-1] - Q2.T[1:], axis=-1))
            positives.append(total_sum + relative_scale)
            


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

def decomp_essential_mat_old(PP,K, E, q1, q2):
        def sum_z_cal_relative_scale(PP,K,R, t):
            # Get the transformation matrix
            T = _form_transf(R, t)
            # Make the projection matrix
            P = np.matmul(np.concatenate((K, np.zeros((3, 1))), axis=1), T)

            # Triangulate the 3D points
            hom_Q1 = cv2.triangulatePoints(PP, P, q1.T, q2.T)
            # Also seen from cam 2
            hom_Q2 = np.matmul(T, hom_Q1)

            # Un-homogenize
            Q1 = hom_Q1[:3, :] / hom_Q1[3, :]
            Q2 = hom_Q2[:3, :] / hom_Q2[3, :]
            
            #self.world_points.append(Q1)

            # Find the number of points there has positive z coordinate in both cameras
            sum_of_pos_z_Q1 = sum(Q1[2, :] > 0)
            sum_of_pos_z_Q2 = sum(Q2[2, :] > 0)

            # Form point pairs and calculate the relative scale
            relative_scale = np.mean(np.linalg.norm(Q1.T[:-1] - Q1.T[1:], axis=-1)/
                                     np.linalg.norm(Q2.T[:-1] - Q2.T[1:], axis=-1))
            return sum_of_pos_z_Q1 + sum_of_pos_z_Q2, relative_scale

        # Decompose the essential matrix
        R1, R2, t = cv2.decomposeEssentialMat(E)
        t = np.squeeze(t)

        # Make a list of the different possible pairs
        pairs = [[R1, t], [R1, -t], [R2, t], [R2, -t]]

        # Check which solution there is the right one
        z_sums = []
        relative_scales = []
        for R, t in pairs:
            z_sum, scale = sum_z_cal_relative_scale(PP,K,R, t)
            z_sums.append(z_sum)
            relative_scales.append(scale)

        # Select the pair there has the most points with positive z coordinate
        right_pair_idx = np.argmax(z_sums)
        right_pair = pairs[right_pair_idx]
        relative_scale = relative_scales[right_pair_idx]
        R1, t = right_pair
        t = t * relative_scale
        
        return [R1, t]


def create_video(filename, width, height, fps=30):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video = cv2.VideoWriter(filename, fourcc, float(fps), (width, height))
    return video



if __name__ == "__main__":
    cap = cv2.VideoCapture('vods/SUper.mp4')
    if cap.isOpened():
      W = int((cap.get(cv2.CAP_PROP_FRAME_WIDTH)))#1920/2
      H = int((cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))#1080/2
      carK = np.array([[96.4,0,W//2],[0,96.4,H//2],[0,0,1]]) #96.4
      myK = np.array([
    [1.22276742e+03,0.00000000e+00,3.87933415e+02],
    [0.00000000e+00,1.21655279e+03,8.11926095e+02],
    [0.00000000e+00,0.00000000e+00,1.00000000e+00]
    ])
      K = np.array(
        [[5.85527058e+03,0.00000000e+00,5.06012858e+02],
        [0.00000000e+00,6.24699335e+03,9.50412545e+02],
        [0.00000000e+00,0.00000000e+00,1.00000000e+00]]) # Weaam K

      iphoneK  = np.array(
        [[1.00000000e+03,0.00000000e+00,5.00000000e+02],
        [0.00000000e+00,1.00000000e+03,5.00000000e+02],
        [0.00000000e+00,0.00000000e+00,1.00000000e+00]]) ## Iphone K

      #TrialK 
      tK = np.array(
        [[6.58431641e+03,0.00000000e+00,5.76891199e+02],
 [0.00000000e+00,7.36562451e+03,9.17904606e+02],
 [0.00000000e+00,0.00000000e+00,1.00000000e+00]])
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
    extrinsic = np.array(((1,0,0,0),(0,1,0,0),(0,0,1,0)))
    PP = K @ extrinsic
    #out = create_video('pop.mp4',W,H)
    while cap.isOpened():
        ret, frame = cap.read()
        if ret and frame_count % 8 == 0:
            img = cv2.resize(frame, (W, H))
            #frames.append(img)
            prevFrame,transf =  extract_frame(img,prevFrame,K,Kinv,PP)
            #matchFrames(prevFrame,img)
            if transf is not None:
              cur_pose = cur_pose @ transf
              #print(cur_pose)
              hom_array = np.array([[0,0,0,1]])
              if cur_pose[1,3] > 5:
                cur_pose[1,3] = 5
              elif cur_pose[1,3] < -5:
                cur_pose[1,3] = -5
              hom_camera_pose = np.concatenate((cur_pose,hom_array), axis=0)
              # check the diagonal of the matrix to see if it is positive
                # if it is negative, then the camera is facing the wrong way
                # if it is positive, then the camera is facing the right way
              #if hom_camera_pose.diagonal().prod() > 0:
              prevFrame.pose = hom_camera_pose
              camera_pose_list.append(hom_camera_pose)
              #print(hom_camera_pose)
              estimated_path.append((cur_pose[0, 3], cur_pose[2, 3]))# x , z
              estimated_camera_pose_x, estimated_camera_pose_y, estimated_camera_pose_z = cur_pose[0, 3],cur_pose[1,3], cur_pose[2, 3]
              print("Estimated camera pose: ({},{},{})".format(estimated_camera_pose_x,estimated_camera_pose_y, estimated_camera_pose_z))
        frame_count += 1
        if cv2.waitKey(1) & 0xFF == ord('q'):
          break

    cap.release()


image_size = np.array([540, 960])
#image_size = np.array([1920, 1080])

plt.figure()
#ax = pt.plot_transform()
ax = plt.axes(projection='3d')
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')

camera_pose_poses = np.array(camera_pose_list)
#print(camera_pose_poses)
number_of_frames = 40
key_frames_indices = np.linspace(0, len(camera_pose_poses) - 1, dtype=int)#, number_of_frames,
#colors = cycle("rgb")
shade = 1
for i in key_frames_indices:
    ## color gets darker as the camera moves away from the origin
    pc.plot_camera(ax, K, camera_pose_poses[i],
                   sensor_size=image_size, c=shade * np.array([1., 0., 0.]))
    shade *= 0.93
                   


plt.show()

take_every_th_camera_pose = 2

estimated_path = np.array(estimated_path[::take_every_th_camera_pose])

plt.plot(estimated_path[:,0],estimated_path[:,1])
plt.xlabel('$X$')
plt.ylabel('$Z$')
plt.show()

## hello potato chipss