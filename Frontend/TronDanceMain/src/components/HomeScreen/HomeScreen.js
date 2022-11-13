import React, {Component} from 'react'
import bgVideo from '../../assets/TronDanceCRX.mp4'
import tDanceLogo from '../../assets/trondance.png'
import Lottie from "lottie-react";
import animationData from "../../assets/lottie/movefront.json"
import danceAnimation from "../../assets/lottie/danceloader.json"
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';
import { ZapIcon, InfinityIcon } from "@primer/octicons-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


class HomeScreen extends Component {


    state = {
        tronAddress: null,
        initalCheckup: null
    }

    componentDidMount(){
        setTimeout(() => {
            this.getTronweb();
        }, 2500);
        
    }

    getTronweb(){
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            this.setState({tronAddress: window.tronWeb.defaultAddress.base58, initalCheckup: "OK"})
        }
        this.setState({initalCheckup: "OK"})
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

        if(this.state.initalCheckup == null){
            return(
                <div style={{width: "100vw", height: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                    <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>
                    <Lottie style={{height: "30vh"}} animationData={danceAnimation} />
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, marginTop: "20px"}}>Connecting with Tron...</p>
                </div>
            )
        }

        if(this.state.tronAddress){
            return(

                <>
                <ToastContainer />
                <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>

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
                        <AwesomeButton onReleased={() => this.notifyCheck()} style={{width: "20vw", height: "8vh", backgroundColor: "#598BFC",  marginRight: "5vw", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<ZapIcon />}>Dance Bet Battle</AwesomeButton>
                    </div>
                </div>

                <video autoPlay style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} >
                    <source src={bgVideo} type="video/mp4" />
                </video>
            </>
                
            )
        }

        return(
            <>

                <ToastContainer />
                <img src={tDanceLogo} style={{position: "absolute", height: "5vh", top: "5vh", left: "3vw", zIndex: 100}}/>

                <div style={{position: "fixed", display: "flex", alignItems: "center", justifyContent: "space-between", borderTopLeftRadius: "3em", borderTopRightRadius: "3em", padding: "3vh", flexDirection: "row", bottom: 0, zIndex: 1, width: "100vw", height: "10vh", backgroundColor: "#000"}}>

                <div style={{display: "flex", flexDirection: "row", width: "60vw", alignItems: "center"}}>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, verticalAlign: "middle"}}>Whoops, you need a wallet on Tron to continue </p>
                    <Lottie style={{height: "8vh"}} animationData={animationData} />
                </div>


                <AwesomeButton role="button" href='https://www.tronlink.org/' style={{width: "20vw", height: "8vh", backgroundColor: "#598BFC",  marginRight: "5vw", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<ZapIcon />}>Get TronLink</AwesomeButton>

                </div>

                <video autoPlay style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} >
                <source src={bgVideo} type="video/mp4" />
                </video>

                </>
        )
    }

}

export default HomeScreen