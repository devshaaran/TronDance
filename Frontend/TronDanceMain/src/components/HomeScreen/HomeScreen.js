import React, {Component} from 'react'
// import bgVideo from '../../assets/TronDanceCRX.mp4'
// import gangnam from '../../assets/samplevid.mp4'
// import rasputin from '../../assets/samplevid1.mp4'
import tDanceLogo from '../../assets/trondance.png'
import volumeMute from '../../assets/volume-mute.png'
import volumeUnmute from '../../assets/volume.png'

import Lottie from "lottie-react";
import animationData from "../../assets/lottie/movefront.json"
import danceAnimation from "../../assets/lottie/danceloader.json"
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';
import { ZapIcon, InfinityIcon } from "@primer/octicons-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from '../../endpoints';
import axios from 'axios';
import { joinBattle, startBattle, viewBattle } from '../../utils/endpoints';
import { Redirect } from 'react-router-dom'


let bgVideo = "https://res.cloudinary.com/dstpyrlva/video/upload/v1668716090/TronDanceCRX_fqm2ql.mp4"


class HomeScreen extends Component {

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
        super(props, HomeScreen.defaultProps)
        this.button = React.createRef()
        this.putin = React.createRef()
        this.state = {
            initVal: "Loading",
            tronAddress: null,
            initalCheckup: null,
            accessToken: null,
            userBalance: null,
            showFunds: true,
            joinMatch: false,
            timeExp: null,
            newMatch: null,
            matchID: null,
            muted: true,
            matchStartTime: null,
            song: ""
        }
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



    checkIfSignedIn(){
        let accessToken = localStorage.getItem("accessTD");
        this.setState({accessToken: accessToken})
    }

    componentDidMount(){
        this.checkIfSignedIn();
        setTimeout(() => {
            this.getTronweb();
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
        }, 2500);
    }

    getTronweb(){
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            this.setState({tronAddress: window.tronWeb.defaultAddress.base58, initalCheckup: "OK"})
            setInterval(() => {
                this.getUserBalance()
            }, 5000); 
        }
        this.setState({initalCheckup: "OK"})
    }

    async getUserBalance(){
        try {
            let instance = await window.tronWeb.contract().at("TTG6tyv5ACmF4gKdARDSTzj3kkuvnVHH4H");
            let currentValue = await instance.retrieveDancerBalance(this.state.tronAddress).call();
            console.log(Number(currentValue._hex))
            let balance = Number(currentValue._hex) > 0 ? parseInt((Number(currentValue._hex) / 1000000).toFixed(2)) : Number(currentValue._hex)
            this.setState({userBalance: balance})
        } catch (error) {
            toast.error("Please change network to Nile Testnet", {
                position: "top-right",
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

    async notifyCheck(){
        console.log("works")
        window.tronWeb.trx.getAccount().then(result => console.log(result))
        const messagey = await window.tronWeb.toHex("Click sign to enter TronDance")
        window.tronWeb.trx.sign(messagey).then(result => console.log(result))
        toast("Wow so easy!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            });


        let message = await window.tronWeb.toHex("Click sign to enter TronDance")
        let address = "TEp2YwLRBdhLhhtvJoytWoRC8JQFsnVi99"
        let signedMsg = "0x4bc5b51740d1d8c65e80382fa8022ecba35db86ea7845e59b426dc97570905e36ac312b4dfca6324081b4473a1e43f7298fd6a5b3ca0cbef23c716bbd1c76a711c"
        window.tronWeb.trx.verifyMessage(message, signedMsg, address).then(result => console.log(result))
    }

    render(){

        if(window.innerWidth <= 800){
            return(
                <div style={{width: "100vw", height: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                    <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "5vw", zIndex: 100}}/>
                    <Lottie style={{height: "30vh"}} animationData={danceAnimation} />
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "large", width: "90vw", alignSelf: "center", textAlign: "center", margin: 0, marginTop: "20px"}}>Mobile phones are incompatible with Tron Dance, please use a Desktop to continue</p>
                </div>
            )
        }

        let addFunds = async () => {
            let instance = await window.tronWeb.contract().at("TTG6tyv5ACmF4gKdARDSTzj3kkuvnVHH4H");
            let currentValue = await instance.enter().send({
                feeLimit:100000000,
                callValue:5000000
            });
            console.log(currentValue)
            toast("Your transfer is now processing", {
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

        let startBetBattle = async () => {
            if(this.state.userBalance == 0){
                toast.error("You have no funds in your TronDance wallet, Add funds", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    });
                return 
            }

            else if(this.state.userBalance == null){
                toast.info("Please wait, your balance is loading...", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    });
                return
            }

            try {
                const payload = await startBattle(this.state.accessToken);
                console.log(payload);

                let index_goaler = Math.floor(Math.random() * payload.length)
                let match_id = payload[index_goaler]["match_id"]
                let new_match = payload[index_goaler]["new"]

                if(new_match){
                    console.log("State set")
                    setInterval(async () => { 
                        let meshi = await viewBattle(match_id, this.state.accessToken)
                        if (meshi != false){
                            console.log(meshi)
                            let quack = (new Date(meshi["match_start"]).valueOf()) / 1000
                            if (quack > 0){
                                this.setState({matchStartTime: quack}) 
                            }
                        }
                    }, 5000);
                    this.setState({
                        matchID: match_id,
                        newMatch: true,
                        song: payload[index_goaler]["song"],
                        timeExp: parseInt(Date.now()/1000) + 90,
                        joinMatch: true,
                        matchStartTime: null
                    })
                }

                else{
                    try {
                        let finale = await joinBattle(match_id, payload[index_goaler]["song"], this.state.accessToken)
                        console.log(finale)
                        if (finale != false){
                            this.setState({
                                matchID: match_id,
                                newMatch: false,
                                song: payload[index_goaler]["song"],
                                timeExp: parseInt(Date.now()/1000) + 90,
                                joinMatch: true,
                                matchStartTime: finale["match_start_time"]
                            })
                        }
                        else{
                            toast.error("If you got disconnected in the last match, please wait 1 minute", {
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
                    } catch (error) {
                        console.log(error)
                        toast.error("Please try again!", {
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

            } catch (error) {
                console.log(error);
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

        let signInTo = async () => {
            const messagey = await window.tronWeb.toHex("Click sign to enter TronDance")
            window.tronWeb.trx.sign(messagey).then(result => {
                axios.post(`${BASE_URL}auth/login/wallet/`, {
                    tron_address: this.state.tronAddress,
                    user_signature: result
                })
                .then((response) => {
                    let accessToken = response.data.token.access
                    localStorage.setItem("accessTD", accessToken);
                    this.setState({accessToken: accessToken})
                })
                .catch((error) => {
                    toast.error("Login request failed", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    console.log(error);
                })  
            }).catch((error) => {
                console.log(error);
            });  
        }

        if(this.state.initalCheckup == null){
            return(
                <div style={{width: "100vw", height: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                    <ToastContainer />
                    <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
                    <Lottie style={{height: "30vh"}} animationData={danceAnimation} />
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>Connecting with Tron...</p>
                </div>
            )
        }

        if(this.state.matchStartTime != null && this.state.matchStartTime < Date.now()/1000){
            return <Redirect to={{
                pathname: "/match",
                state: this.state
              }}/>
        }

        if(this.state.joinMatch && this.state.newMatch){
            return(
                <div style={{width: "100vw", height: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", zIndex: 200}}>
                    <ToastContainer />
                    <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
                    <Lottie style={{height: "30vh"}} animationData={danceAnimation} />
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>{this.state.matchStartTime ? "Match starts in a few seconds" : "Waiting for players to join..."}</p>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>Song: {this.state.song}</p>
                    <div style={{width: "20vw", height: "5vh",  borderRadius: "1.2em", border: '2px solid #FF030B', marginTop: "5vh", justifyContent: "center", alignItems: "center", display: "flex", padding: "1vh"}}>
                        <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0}}>Battle ID - {this.state.matchID}</p>
                    </div>
                    <div style={{width: "10vw", height: "5vh", marginTop: "5vh", justifyContent: "center", flexDirection: "column", alignItems: "center", display: "flex"}}>
                        <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "small", margin: 0}}>Battle {this.state.matchStartTime ? "starts" : "expires" } in</p>
                        <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "xx-large", display: `${this.state.matchStartTime ? "none" : "block" }`, fontWeight: "bold", margin: 0}}>{this.state.timeExp && this.state.timeExp - parseInt(Date.now()/1000) >= 0 ?  this.state.timeExp - parseInt(Date.now()/1000) : "..."}s</p> 
                        <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "xx-large", display: `${this.state.matchStartTime ? "block" : "none" }`, fontWeight: "bold", margin: 0}}>{this.state.matchStartTime && this.state.matchStartTime - parseInt(Date.now()/1000) >= 0 ?  parseInt(this.state.matchStartTime - parseInt(Date.now()/1000)) : "..."}s</p> 
                    </div>
                </div>
            )
        }


        if(this.state.tronAddress && this.state.accessToken){
            return(

                <>
                <ToastContainer />
                <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
                <img onClick={() => this.setState({muted: false})} src={this.state.muted ? volumeMute : volumeUnmute} style={{position: "absolute", height: "3vh", top: "6vh", left: "13vw", zIndex: 100}}/>

                <div onClick={addFunds} style={{width: "10vw", cursor: "pointer", display: (this.state.showFunds) ? "flex" : "none", justifyContent: "center", alignItems: "center", height: "5vh", backgroundColor: "#1E88E5", borderRadius: "2em", zIndex: 100, position: "absolute", top: "5vh", right: "3vw"}}>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "large", margin: 0, verticalAlign: "middle"}}> Add Funds </p>
                </div>

                <div style={{width: "15vw", opacity: 0.8, display: "flex", justifyContent: "center", alignItems: "center", height: "10vh", flexDirection: "column", backgroundColor: "#212121", borderRadius: "1em", zIndex: 100, position: "absolute", top: "5vh", left: "45vw"}}>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "small", margin: 0, verticalAlign: "middle"}}> Balance </p>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "x-large", margin: 0, verticalAlign: "middle"}}> {this.state.userBalance} TRX </p>
                </div>

                <div style={{position: "fixed", display: "flex", alignItems: "center", justifyContent: "space-between", borderTopLeftRadius: "3em", borderTopRightRadius: "3em", padding: "3vh", flexDirection: "row", bottom: 0, zIndex: 1, width: "100vw", height: "10vh", backgroundColor: "#000"}}>

                    <div style={{display: "flex", flexDirection: "row", width: "60vw", alignItems: "center"}}>
                        <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, verticalAlign: "middle"}}>Choose Battle Type </p>
                        <Lottie style={{height: "8vh"}} animationData={animationData} />
                    </div>
                    
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <AwesomeButton type="secondary"   button-secondary-color="#000" style={{width: "20vw",
                         height: "8vh",  marginRight: "2vw", fontFamily: "poppins", fontSize: "1.3em",
                        '--button-secondary-color': "#000000",
                        '--button-secondary-color-dark': "#212121",
                        '--button-secondary-color-light': "#1e88e5",
                        '--button-secondary-color-hover': "#212121",
                        '--button-secondary-color-active': "#242424",}}  after={<InfinityIcon />}>Free Battle</AwesomeButton>
                        <AwesomeButton onReleased={() => startBetBattle()} style={{width: "20vw", height: "8vh", backgroundColor: "#598BFC",  marginRight: "5vw", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<ZapIcon />}>Dance Bet Battle</AwesomeButton>
                    </div>
                </div>

                <video autoPlay={true} muted={this.state.muted} style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} >
                    <source src={bgVideo} type="video/mp4" />
                </video>
            </>
                
            )
        }

        if(this.state.tronAddress && this.state.accessToken == null){
            return (
                <>

                <ToastContainer />
                <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
                <img onClick={() => this.setState({muted: false})} src={this.state.muted ? volumeMute : volumeUnmute} style={{position: "absolute", height: "3vh", top: "6vh", left: "13vw", zIndex: 100}}/>

                <div style={{position: "fixed", display: "flex", alignItems: "center", justifyContent: "space-between", borderTopLeftRadius: "3em", borderTopRightRadius: "3em", padding: "3vh", flexDirection: "row", bottom: 0, zIndex: 1, width: "100vw", height: "10vh", backgroundColor: "#000"}}>

                <div style={{display: "flex", flexDirection: "row", width: "60vw", alignItems: "center"}}>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, verticalAlign: "middle"}}>Click "Login" to enter the World of Dancing </p>
                    <Lottie style={{height: "8vh"}} animationData={animationData} />
                </div>


                <AwesomeButton role="button" onReleased={() => signInTo()} style={{width: "20vw", height: "8vh", backgroundColor: "#598BFC",  marginRight: "5vw", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<ZapIcon />}>Login</AwesomeButton>
                </div>

                <video autoPlay={true} muted={this.state.muted} style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} >
                <source src={bgVideo} type="video/mp4" />
                </video>

                </>
            )
        }

        return(
            <>

                <ToastContainer />
                <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
                <img onClick={() => this.setState({muted: false})} src={this.state.muted ? volumeMute : volumeUnmute} style={{position: "absolute", height: "3vh", top: "6vh", left: "13vw", zIndex: 100}}/>

                <div style={{position: "fixed", display: "flex", alignItems: "center", justifyContent: "space-between", borderTopLeftRadius: "3em", borderTopRightRadius: "3em", padding: "3vh", flexDirection: "row", bottom: 0, zIndex: 1, width: "100vw", height: "10vh", backgroundColor: "#000"}}>

                <div style={{display: "flex", flexDirection: "row", width: "60vw", alignItems: "center"}}>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, verticalAlign: "middle"}}>Whoops, you need a wallet on Tron to continue </p>
                    <Lottie style={{height: "8vh"}} animationData={animationData} />
                </div>

                <AwesomeButton role="button" href='https://www.tronlink.org' style={{width: "20vw", height: "8vh", backgroundColor: "#598BFC",  marginRight: "5vw", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<ZapIcon />}>Get TronLink</AwesomeButton>
                <button ref={this.button} style={{display: "none"}} onClick={() => this.setState({muted: false})}>Click me!</button>
                </div>

                <video autoPlay={true} muted={this.state.muted} style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} >
                <source src={bgVideo} type="video/mp4" />
                </video>

            </>
        )
    }

}

export default HomeScreen