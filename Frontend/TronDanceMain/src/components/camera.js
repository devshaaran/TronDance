import {drawKeyPoints, drawSkeleton} from './utils'
import React, {Component} from 'react'
import * as posenet from '@tensorflow-models/posenet'
import {getScore1} from '../utils/compare'
import Lottie from "lottie-react";
import confetti from "../assets/lottie/confetti.json"
import danceLoader from "../assets/lottie/danceloader.json"
import winnerv from "../assets/lottie/win.json"
import loserv from "../assets/lottie/loss.json"
import tDanceLogo from '../assets/trondance.png'
import volumeMute from '../assets/volume-mute.png'
import volumeUnmute from '../assets/volume.png'

// // Videos 
// import gangnam from '../assets/samplevid.mp4'
// import rasputin from '../assets/samplevid1.mp4'
// import pinkVenom from "../assets/samplevid2.mp4"
// import ymca from "../assets/YMCA.mp4"
// import danceMonkey from "../assets/dancemonkey.mp4"

//Comparison files
import gangnamC from '../oppa.json'
import rasputinC from '../rasputin.json'
import pinkVenomC from "../pinkvenom.json"
import ymcaC from "../ymca.json"
import danceMonkeyC from "../dancemonkey.json"

//CSS module
import * as styles from './Camera.module.css'; 
import { completeBattle } from '../utils/endpoints'
import { toast, ToastContainer } from 'react-toastify'
import { AwesomeButton } from 'react-awesome-button';
import { HomeIcon } from '@primer/octicons-react';

let gangnam = "https://res.cloudinary.com/dstpyrlva/video/upload/v1668722114/samplevid_nfrsi8.mp4"
let rasputin = "https://res.cloudinary.com/dstpyrlva/video/upload/v1668722115/samplevid1_lgwrvu.mp4"
let pinkVenom = "https://res.cloudinary.com/dstpyrlva/video/upload/v1668722098/samplevid2_rjlhfd.mp4"
let ymca = "https://res.cloudinary.com/dstpyrlva/video/upload/v1668722108/YMCA_inqn24.mp4"
let danceMonkey = "https://res.cloudinary.com/dstpyrlva/video/upload/v1668722104/dancemonkey_incpwv.mp4"

let videoChooser = {"Gangnam-Style": gangnam, "Rasputin": rasputin, "Pink-Venom": pinkVenom, "Dance-Monkey": danceMonkey, "YMCA": ymca}
let videoComparer = {"Gangnam-Style": gangnamC, "Rasputin": rasputinC, "Pink-Venom": pinkVenomC, "Dance-Monkey": danceMonkeyC, "YMCA": ymcaC}

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
    this.state = {...this.props.location.state, song: videoChooser[this.props.location.state.song], changeIt: false, scoreBoard: "", ended: false, finalWait: null, winner: null, txnAddress: "loading", muted: false}
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

    toast.info("Please enable sound by clicking on the speaker to the top-left", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      });
  }

  closest(host=videoComparer[this.props.location.state.song], number) {
    var counts = Object.keys(host)
    let goal = parseFloat(number);
  
    var closest = counts.reduce(function(prev, curr) {
      return (Math.abs(parseFloat(curr) - goal) < Math.abs(parseFloat(prev) - goal) ? parseFloat(curr) : parseFloat(prev));
    });
  
    return closest;
  }

  

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }
    const {videoWidth, videoHeight} = this.props
    const video = this.video
    // const video = document.getElementById('video1');
    video.width = videoWidth
    video.height = videoHeight

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: videoWidth,
        height: videoHeight
      }
    })

    video.srcObject = stream

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
    // const video = document.getElementById('video');
    const video = this.video
    const exampleVideo = document.getElementById('video');

    let posesFull = {}

    let presentSecond = 0
    let presentMax = 0

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
          posesFull[exampleVideo.currentTime] = pose
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

      // canvasContext.clearRect(0, 0, videoWidth, videoHeight)

      // if (showVideo) {
      //   canvasContext.save()
      //   canvasContext.scale(-1, 1)
      //   canvasContext.translate(-videoWidth, 0)
      //   canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight)
      //   canvasContext.restore()
      // }

      // console.log(posesFull)
      // console.log(posesFull)

      
      
      let right_comparer = videoComparer[this.props.location.state.song]
      let closestDur = this.closest(right_comparer, exampleVideo.currentTime)
      let scorer = getScore1(right_comparer[String(closestDur)], poses[0], 30)

      if(presentSecond+1 >= parseInt(exampleVideo.currentTime)){
        if(presentMax < scorer){
          presentMax = scorer
        }
      }
      else{
        if(presentMax < scorer){
          presentMax = scorer
        }
        presentSecond = parseInt(exampleVideo.currentTime)
        let multip = parseInt(presentMax * 100)
        let commentm = "OK"
        let score = "G"
        if (multip < 45) {
          commentm = "OK"
          score = "G"

        } else if(multip < 55) {
          commentm = "GOOD"
          score = "Q"
        }
        else if(multip < 70) {
          commentm = "SUPER"
          score = "M"
        }
        else{
          score = "T"
          commentm = "PERFECT"
        }
        let previousScore = this.state.scoreBoard
        console.log("Builtin: " , presentMax)
        this.setState({initVal: commentm, scoreBoard: `${previousScore}${score}`})
        presentMax = 0
      }

      // poses.forEach(({score, keypoints}) => {
      //   if (score >= minPoseConfidence) {
      //     if (showPoints) {
      //       drawKeyPoints(
      //         keypoints,
      //         minPartConfidence,
      //         skeletonColor,
      //         canvasContext
      //       )
      //     }
      //     if (showSkeleton) {
      //       drawSkeleton(
      //         keypoints,
      //         minPartConfidence,
      //         skeletonColor,
      //         skeletonLineWidth,
      //         canvasContext
      //       )
      //     }
      //   }
      // })
      requestAnimationFrame(findPoseDetectionFrame)
    }
    findPoseDetectionFrame()
  }

  render() {

    let handleVideoEnded = async () => {
      this.setState({ended: true})
      try {
        const payload = await completeBattle(this.state.matchID ,this.state.accessToken, this.state.scoreBoard);
        console.log(payload);
        if(payload){
          if(payload["payload"]["wait_until"]){
            this.setState({finalWait: payload["payload"]["wait_until"]})
          }
          else if(payload["opp"] != undefined && payload["opp"] >= 0){
            console.log(payload["opp"])
            console.log(payload["me"])
            this.setState({winner:  payload["me"] > payload["opp"], txnAddress: payload[payload]})
          }
          else{
            console.log("this_one 1")
            toast.error("Something went wrong!", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
      }
      else{
        console.log("this_one 1")
        toast.error("Something went wrong!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
      if(this.state.finalWait != null && this.state.winner == null){
        setTimeout(() => {
          handleVideoEnded()
        }, 10000);
      }
      
      } catch (error) {
        toast.error("Fatal error!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        })
        console.log(error)
        if(this.state.finalWait != null && this.state.winner == null){
          setTimeout(() => {
            handleVideoEnded()
          }, 10000);
        }
      } 
    }

    let justList = ["OK", "GOOD", "PERFECT", "SUPER"]

    let decryptScore = () => {
      let complete_score = 0
      let scoreBoard = this.state.scoreBoard
      if(scoreBoard){
        scoreBoard = scoreBoard.substr(0,76)
      }

      for (var i = 0; i < scoreBoard.length; i++) {
        let scoree = scoreBoard.charAt(i);
        if (scoree == "T"){
          complete_score = complete_score + 4
        }
        else if(scoree == "Q"){
          complete_score = complete_score + 3
        }
        else if (scoree == "M"){
          complete_score = complete_score + 2
        }
        else{
          complete_score = complete_score + 1
        }
      }
      return complete_score

    }

    if(this.state.ended && this.state.winner != null){
      return (
        <>
        <ToastContainer />
        <div style={{width: "100vw", height: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", zIndex: 200}}>
          <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
          <Lottie style={{height: "50vh"}} animationData={(this.state.winner) ? winnerv : loserv} />
          {(this.state.winner) ? <a href={(this.state.winner) ? `https://nile.tronscan.org/#/transaction/${this.state.txnAddress}` : "#"}><p  style={{color: "#FFF", cursor: "pointer", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>Prize Sent : {this.state.txnAddress}</p></a> : null}
          <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>{this.state.winner ? "You Won!" : "Better luck next time, Opponent Won"}</p>

          <AwesomeButton role="button" href='https://trondance.netlify.app/' style={{width: "20vw", height: "8vh", marginTop: "5vh", backgroundColor: "#598BFC", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<HomeIcon />}>Go Home</AwesomeButton>
          
        </div>
        </>
      )
    }

    if(this.state.ended){
      return (
        <>
        <ToastContainer />
        <div style={{width: "100vw", height: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", zIndex: 200}}>
          <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
          <Lottie style={{height: "30vh"}} animationData={danceLoader} />
          <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>{"Uploading your dance moves to Tron servers..."}</p>
          {/* <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>Song: {this.state.song}</p>
          <div style={{width: "20vw", height: "5vh",  borderRadius: "1.2em", border: '2px solid #FF030B', marginTop: "5vh", justifyContent: "center", alignItems: "center", display: "flex", padding: "1vh"}}>
              <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0}}>Battle ID - {this.state.matchID}</p>
          </div>
          <div style={{width: "10vw", height: "5vh", marginTop: "5vh", justifyContent: "center", flexDirection: "column", alignItems: "center", display: "flex"}}>
              <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "small", margin: 0}}>Battle {this.state.matchStartTime ? "starts" : "expires" } in</p>
              <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "xx-large", display: `${this.state.matchStartTime ? "none" : "block" }`, fontWeight: "bold", margin: 0}}>{this.state.timeExp && this.state.timeExp - parseInt(Date.now()/1000) >= 0 ?  this.state.timeExp - parseInt(Date.now()/1000) : "..."}s</p> 
              <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "xx-large", display: `${this.state.matchStartTime ? "block" : "none" }`, fontWeight: "bold", margin: 0}}>{this.state.matchStartTime && this.state.matchStartTime - parseInt(Date.now()/1000) >= 0 ?  parseInt(this.state.matchStartTime - parseInt(Date.now()/1000)) : "..."}s</p> 
          </div> */}
        </div>
        </>
      )
    }

    return (
      <div>
        <div>
        <ToastContainer />
        <img onClick={() => this.setState({muted: false})} src={this.state.muted ? volumeMute : volumeUnmute} style={{position: "absolute", height: "3vh", top: "6vh", left: "3vw", zIndex: 100}}/>
        <Lottie style={{height: "100vh", width: "100vw", position: 'fixed', zIndex: 500, display: `${this.state.scoreBoard && this.state.scoreBoard.charAt((this.state.scoreBoard).length -1) == "T" ? "inherit" : "none" }`}} animationData={confetti} />
        <div style={{position: "fixed", opacity: 0.8, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3vh", flexDirection: "row", top: 0, zIndex: 1, width: "100vw", height: "10vh", backgroundColor: "#000"}}>

        <div style={{display: "flex", flexDirection: "column", width: "60vw", alignItems: "center", justifyContent: "center"}}>
          <p className={`${styles.danceTextStyler} ${styles.flash}`}> {this.state.initVal}</p>
          <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "small", margin: 0, opacity: 0.8}}>You</p>
        </div>

        <div style={{display: "flex", flexDirection: "column", width: "60vw", alignItems: "center", justifyContent: "center"}}>
          <p className={`${styles.danceTextStyler}`}> {decryptScore()}</p>
          <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "small", margin: 0, opacity: 0.8}}>Score</p>
        </div>

        <div style={{display: "flex", flexDirection: "column", width: "60vw", alignItems: "center", justifyContent: "center"}}>
            <p className={`${styles.danceTextStyler2} ${styles.flash2}`}>{justList[Math.floor(Math.random() * justList.length)]}</p>
            <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "small", margin: 0, opacity: 0.8}}>Opponent</p>
        </div>

        </div>
        <video autoPlay={true} muted={this.state.muted} onEnded={handleVideoEnded} className="video" style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} id="video" preload="metadata" loade>
          <source src={this.state.song} type="video/mp4"></source>
        </video>
        {/* <video controls className="video1" id="video1" preload="metadata" loade>
          <source src={video1} type="video/mp4"></source>
        </video> */}
        <video id="videoNoShow" className={`${styles.mainVideo}`} playsInline ref={this.getVideo}/>
        <canvas className="videocontrol"  ref={this.getCanvas} />
        </div>
      </div>
    )
  }
}

export default PoseNet