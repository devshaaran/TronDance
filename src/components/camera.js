import {drawKeyPoints, drawSkeleton} from './utils'
import React, {Component} from 'react'
import * as posenet from '@tensorflow-models/posenet'
import video from '../assets/samplevid.mp4'

class PoseNet extends Component {

  static defaultProps = {
    videoWidth: 900,
    videoHeight: 700,
    flipHorizontal: true,
    architecture: 'ResNet50',
    algorithm: 'single-pose',
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
    maxPoseDetections: 2,
    nmsRadius: 20,
    outputStride: 16,
    imageScaleFactor: 0.5,
    skeletonColor: '#ffadea',
    skeletonLineWidth: 6,
    loadingText: 'Loading... Posenet Model..'
  }

  constructor(props) {
    super(props, PoseNet.defaultProps)
  }

  getCanvas = elem => {
    this.canvas = elem
  }

 extractFramesFromVideo(videoUrl, fps = 25) {
    return new Promise(async (resolve) => {
      // fully download it first (no buffering):
      let videoBlob = await fetch(videoUrl).then((r) => r.blob());
      let videoObjectUrl = URL.createObjectURL(videoBlob);
      let video = document.createElement("video");
  
      let seekResolve;
      video.addEventListener("seeked", async function () {
        if (seekResolve) seekResolve();
      });
  
      video.src = videoObjectUrl;
  
      // workaround chromium metadata bug (https://stackoverflow.com/q/38062864/993683)
      while (
        (video.duration === Infinity || isNaN(video.duration)) &&
        video.readyState < 2
      ) {
        await new Promise((r) => setTimeout(r, 1000));
        video.currentTime = 10000000 * Math.random();
      }
      let duration = video.duration;
  
      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      let [w, h] = [video.videoWidth, video.videoHeight];
      canvas.width = w;
      canvas.height = h;
  
      let frames = [];
      let interval = 1 / fps;
      let currentTime = 0;
  
      while (currentTime < duration) {
        video.currentTime = currentTime;
        await new Promise((r) => (seekResolve = r));
  
        context.drawImage(video, 0, 0, w, h);
        let base64ImageData = canvas.toDataURL();
        frames.push(base64ImageData);
  
        currentTime += interval;
      }
      resolve(frames);
    });
  }

  getVideo = elem => {
    this.video = elem
  }

  async componentDidMount() {
    try {
      await this.setupCamera()


    } catch (error) {
      throw new Error(
        'This browser does not support video capture, or this device does not have a camera'
      )
    }

    try {
      this.posenet = await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        quantBytes: 2
      })
    } catch (error) {
      throw new Error('PoseNet failed to load')
    } finally {
      setTimeout(() => {
        this.setState({loading: false})
      }, 200)
    }

    this.detectPose()
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }
    const {videoWidth, videoHeight} = this.props
    // const video = this.video
    const video = document.getElementById('video');
    video.width = videoWidth
    video.height = videoHeight

    // const stream = await navigator.mediaDevices.getUserMedia({
    //   audio: false,
    //   video: {
    //     facingMode: 'user',
    //     width: videoWidth,
    //     height: videoHeight
    //   }
    // })

    // video.srcObject = stream

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play()
        resolve(video)
      }
    })
  }

  detectPose() {
    const {videoWidth, videoHeight} = this.props
    const canvas = this.canvas
    const canvasContext = canvas.getContext('2d')

    canvas.width = videoWidth
    canvas.height = videoHeight

    console.log(canvasContext)

    this.poseDetectionFrame(canvasContext)
  }

  poseDetectionFrame(canvasContext) {
    const {
      algorithm,
      imageScaleFactor, 
      flipHorizontal, 
      outputStride, 
      minPoseConfidence, 
      minPartConfidence, 
      maxPoseDetections, 
      nmsRadius, 
      videoWidth, 
      videoHeight, 
      showVideo, 
      showPoints, 
      showSkeleton, 
      skeletonColor, 
      skeletonLineWidth 
      } = this.props

    const posenetModel = this.posenet
    const video = document.getElementById('video');

    console.log("1")

    const findPoseDetectionFrame = async () => {
      let poses = []
      switch (algorithm) {
        case 'multi-pose': {
          poses = await posenetModel.estimateMultiplePoses(
          video, 
          imageScaleFactor, 
          flipHorizontal, 
          outputStride, 
          maxPoseDetections, 
          minPartConfidence, 
          nmsRadius
          )
          break
        }
        case 'single-pose': {
          const pose = await posenetModel.estimateSinglePose(
            video, 
            imageScaleFactor, 
            flipHorizontal, 
            outputStride
            )
          poses.push(pose)
          break
        }
        default:{
          // Multipose is default
          poses = await posenetModel.estimateMultiplePoses(
            video, 
            imageScaleFactor, 
            flipHorizontal, 
            outputStride, 
            maxPoseDetections, 
            minPartConfidence, 
            nmsRadius
            )
            break
        }
      }

      canvasContext.clearRect(0, 0, videoWidth, videoHeight)

      if (showVideo) {
        canvasContext.save()
        canvasContext.scale(-1, 1)
        canvasContext.translate(-videoWidth, 0)
        canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight)
        canvasContext.restore()
      }

      // console.log(poses)

      poses.forEach(({score, keypoints}) => {
        if (score >= minPoseConfidence) {
          if (showPoints) {
            drawKeyPoints(
              keypoints,
              minPartConfidence,
              skeletonColor,
              canvasContext
            )
          }
          if (showSkeleton) {
            drawSkeleton(
              keypoints,
              minPartConfidence,
              skeletonColor,
              skeletonLineWidth,
              canvasContext
            )
          }
        }
      })
      requestAnimationFrame(findPoseDetectionFrame)
    }
    findPoseDetectionFrame()
  }

  render() {
    return (
      <div>
        <div>
        <video controls className="video" id="video" preload="metadata" loade>
          <source src={video} type="video/mp4"></source>
        </video>
        <video id="videoNoShow" playsInline ref={this.getVideo}/>
        <canvas className="videocontrol" ref={this.getCanvas} />
        </div>
      </div>
    )
  }
}

export default PoseNet