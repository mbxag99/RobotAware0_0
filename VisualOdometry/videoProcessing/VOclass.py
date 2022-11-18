import cv2 
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits import mplot3d
from skimage.measure import ransac
from skimage.transform import FundamentalMatrixTransform , EssentialMatrixTransform
import pickle
import pytransform3d.transformations as pt
import pytransform3d.trajectories as ptr
import pytransform3d.rotations as pr
import pytransform3d.camera as pc
from frame import Frame



class VisualOdometry:
    def __init__(self):
        # initialize
        self.K = np.array(
        [[5.85527058e+03,0.00000000e+00,5.06012858e+02],
        [0.00000000e+00,6.24699335e+03,9.50412545e+02],
        [0.00000000e+00,0.00000000e+00,1.00000000e+00]])
        self.Kinv = np.linalg.inv(self.K)
        self.prevFrame = None
        self.gt_path = []
        self.estimated_path = []
        self.camera_pose_list = []
        self.start_pose = np.ones((3,4))
        self.start_translation = np.zeros((3,1))
        self.start_rotation = np.identity(3)
        self.start_pose = np.concatenate((self.start_rotation, self.start_translation), axis=1)
        self.cur_pose = self.start_pose
        self.frame_count = 0
        self.transf = None
        self.extrinsic = np.array(((1,0,0,0),(0,1,0,0),(0,0,1,0)))
        self.P = self.K @ self.extrinsic
        self.orb = cv2.ORB_create(3000)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
        self.exposed_Img = None
        self.can_expose = True
        self.out_estimated_path = []

    def draw_2D(self):
        take_every_th_camera_pose = 2
        self.estimated_path = np.array(self.estimated_path[::take_every_th_camera_pose])
        plt.plot(self.estimated_path[:,0],self.estimated_path[:,1])
        plt.xlabel('$X$')
        plt.ylabel('$Z$')
        plt.show()
    
    def draw_3D(self):
        image_size = np.array([960, 540])
        fig = plt.figure()
        #ax = pt.plot_transform()
        ax = plt.axes(projection='3d')
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')

        camera_pose_poses = np.array(self.camera_pose_list)
        #print(camera_pose_poses)
        number_of_frames = 40
        key_frames_indices = np.linspace(0, len(camera_pose_poses) - 1, dtype=int)#, number_of_frames,
        #colors = cycle("rgb")
        shade = 1
        for i in key_frames_indices:
            ## color gets darker as the camera moves away from the origin
            pc.plot_camera(ax, self.K, camera_pose_poses[i],
                        sensor_size=image_size, c=shade * np.array([1., 0., 0.]))
            shade *= 0.93
        # save the plot as gif file
        plt.show()

    def start_Processing(self):
        cap = cv2.VideoCapture('vods/SUper.mp4')
        frame_count = 0
        if cap.isOpened():
            W = int((cap.get(cv2.CAP_PROP_FRAME_WIDTH)))#1920/2
            H = int((cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))#1080/2
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
              break
            if ret and frame_count % 5 == 0:
             img = cv2.resize(frame, (W, H))
             #self.can_expose = False
             transf = self.process(img)
             if transf is not None:
              self.cur_pose = self.cur_pose @ transf
              #print(cur_pose)
              hom_array = np.array([[0,0,0,1]])
              if self.cur_pose[1,3] > 5:
                self.cur_pose[1,3] = 5
              elif self.cur_pose[1,3] < -5:
                self.cur_pose[1,3] = -5
              hom_camera_pose = np.concatenate((self.cur_pose,hom_array), axis=0)
              self.prevFrame.pose = hom_camera_pose
              self.camera_pose_list.append(hom_camera_pose)
              self.estimated_path.append((self.cur_pose[0, 3], self.cur_pose[2, 3]))# x , z
              self.out_estimated_path.append((self.cur_pose[0, 3], self.cur_pose[1, 3], self.cur_pose[2, 3]))
              estimated_camera_pose_x, estimated_camera_pose_y, estimated_camera_pose_z = self.cur_pose[0, 3],self.cur_pose[1,3], self.cur_pose[2, 3]
              print("Estimated camera pose: ({},{},{})".format(estimated_camera_pose_x,estimated_camera_pose_y, estimated_camera_pose_z))
            frame_count += 1
        cap.release()
        print("Done")
        #self.draw_3D()
        #self.draw_2D()
        return



    def process(self, img):
        feats = cv2.goodFeaturesToTrack(np.mean(img,axis=2).astype(np.uint8), 3000, qualityLevel=0.01, minDistance=3)
        kps = [cv2.KeyPoint(x=f[0][0], y=f[0][1], size=20) for f in feats]
        kps, des = self.orb.compute(img, kps)
        transf = None
        # draw features
        for p in kps:
            cv2.circle(img, (int(p.pt[0]), int(p.pt[1])), 2, (0, 255, 0), 1)
        if self.prevFrame:
            matches = self.matcher.knnMatch(des, self.prevFrame.des,k=2)
            good = []
            for m,n in matches:
                if m.distance < 0.7*n.distance:
                #if m.distance < 32:
                   kp1 = kps[m.queryIdx].pt
                   kp2 = self.prevFrame.kps[m.trainIdx].pt
                   good.append((kp1,kp2))
            if len(good) > 0:
              good = np.array(good)
              good = self.normalizecoordinates(good)
              model, inliers = ransac((good[:,0],good[:,1]),
                                    EssentialMatrixTransform,
                                    min_samples=8,
                                    residual_threshold=0.001,
                                    max_trials=100)
            
              transf = self.get_pose(good[inliers],model.params)            
            for m in good[inliers]:
                u1,v1 = self.denormalize(m[0])
                u2,v2 = self.denormalize(m[1])
                cv2.line(img , (u1,v1),(u2,v2),(255,0,0),1)
            print("Number of good matches: ", len(good[inliers]))
        self.prevFrame = Frame(kps, des, img)
        self.exposed_Img = img
        #self.can_expose = True
        #cv2.imshow('img', img)
        cv2.waitKey(1) 
        return transf

    def normalizecoordinates(self,pts):
        pts[:,0,:] = np.dot(self.Kinv,self.add_ones(pts[:,0,:]).T).T[:,0:2]
        pts[:,1,:] = np.dot(self.Kinv,self.add_ones(pts[:,1,:]).T).T[:,0:2]
        return pts   

    def denormalize(self,pt): # Back to original 
         ret = np.dot(self.K,np.array([pt[0],pt[1],1.0]).T)
         return int(round(ret[0])),int(round(ret[1]))      


    def add_ones(self,x):
        if len(x.shape) == 1:
             return np.concatenate([x,np.array([1.0])], axis=0)
        else:
            return np.concatenate([x, np.ones((x.shape[0], 1))], axis=1)
                
    def get_pose(self,pts,E):
        R, t = self.decomp_essential_mat_new(E,pts[:,0],pts[:,1])
        transformation_matrix = self._form_transf(R, np.squeeze(t))
        return transformation_matrix


    def decomp_essential_mat_new(self,E, q1, q2):
        def sum_z_cal_relative_scale(PP,K,R, t):
            # Get the transformation matrix
            T = self._form_transf(R, t)
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
            z_sum, scale = sum_z_cal_relative_scale(self.P,self.K,R, t)
            z_sums.append(z_sum)
            relative_scales.append(scale)

        # Select the pair there has the most points with positive z coordinate
        right_pair_idx = np.argmax(z_sums)
        right_pair = pairs[right_pair_idx]
        relative_scale = relative_scales[right_pair_idx]
        R1, t = right_pair
        t = t * relative_scale
        
        return [R1, t]


    def _form_transf(self,R, t):
        T = np.eye(4, dtype=np.float64)
        T[:3, :3] = R
        T[:3, 3] = t 
        return T

    def get_image(self):
        return self.exposed_Img