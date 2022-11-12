import React, {Component} from 'react'
import bgVideo from '../../assets/TronDanceCRX.mp4'
import tDanceLogo from '../../assets/trondance.png'
import Lottie from "lottie-react";
import animationData from "../../assets/lottie/movefront.json"
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';
import { ZapIcon } from "@primer/octicons-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


class HomeScreen extends Component {


    state = {
        tronAddress: null
    }

    componentDidMount(){
        setTimeout(() => {
            this.getTronweb();
        }, 1000);
        
    }

    getTronweb(){
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            this.setState({tronAddress: window.tronWeb.defaultAddress.base58})
        }
    }

    notifyCheck(){
        console.log("works")
        toast("Wow so easy!");
    }

    render(){

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
                    

                    <AwesomeButton onReleased={() => this.notifyCheck()} style={{width: "20vw", height: "8vh", backgroundColor: "#598BFC",  marginRight: "5vw", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<ZapIcon />}>Get TronLink</AwesomeButton>

                </div>

                <video autoplay="autoplay" style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} >
                    <source src={bgVideo} type="video/mp4" />
                </video>
            </>
                
            )
        }

        return(
            <>

                <ToastContainer />
                <div style={{position: "fixed", display: "flex", alignItems: "center", justifyContent: "space-between", borderTopLeftRadius: "3em", borderTopRightRadius: "3em", padding: "3vh", flexDirection: "row", bottom: 0, zIndex: 1, width: "100vw", height: "10vh", backgroundColor: "#000"}}>

                <div style={{display: "flex", flexDirection: "row", width: "60vw", alignItems: "center"}}>
                    <p style={{color: "#FFF", fontFamily: "poppins", fontSize: "1.3em", margin: 0, verticalAlign: "middle"}}>Whoops, you need a wallet on Tron to continue </p>
                    <Lottie style={{height: "8vh"}} animationData={animationData} />
                </div>


                <AwesomeButton role="button" onReleased={() => console.log("dhjdh")} style={{width: "20vw", height: "8vh", backgroundColor: "#598BFC",  marginRight: "5vw", fontFamily: "poppins", fontSize: "1.3em"}} type="primary" before={<ZapIcon />}>Get TronLink</AwesomeButton>

                </div>

                <video autoplay="autoplay" style={{minWidth: "100%", minHeight: "100%", position: "fixed"}} >
                <source src={bgVideo} type="video/mp4" />
                </video>

                </>
        )
    }

}

export default HomeScreen