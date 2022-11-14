import axios from 'axios';
import BASE_URL from '../endpoints';

export const joinBattle = async (match_id, song, accessToken) => {

    try {
        const response = await axios.post(`${BASE_URL}dance/join/`, {
            match_id: match_id
        },{
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        let payload = response.data.payload
        let match_start_time = payload["match_start"]
        return {
            match_id: match_id,
            new_match: false,
            song: song,
            match_start_time: match_start_time
        }
        
    }
    catch(error){
        console.log(error);
        // if (error.response.data.message == "Dance floor timeout!"){
        //     startBattle(accessToken)
        // }
        // else{ 
            return false
        // }
    }
}


export const startBattle = async (accessToken) => {

    try {
        const response = await axios.post(`${BASE_URL}dance/start/`, {},{
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        let payload = response.data.payload
        return payload
        // let result = payload.map(async (elem,_) => {
        //     let match_id = elem["match_id"]
        //     let new_match = elem["new"]
        //     console.log("here")
        //     if(new_match){
        //         console.log("here1")
        //         return({
        //             match_id: match_id,
        //             new_match: true,
        //             song: elem["song"],
        //             match_start_time: null
        //         })
        //     }
        //     console.log("here2")
        //     joinBattle(match_id, elem["song"], accessToken).then(
        //         (finale) => {
        //             if(finale != false){
        //                 console.log("here2")
        //                 return finale
        //             }
        //             return false
        //         }
        //     )
            
        // })
    } catch (error) {
        console.log(error)
        return false
    }
}


export const viewBattle = async (match_id, accessToken) => {

    try {
        const response = await axios.post(`${BASE_URL}dance/view/`, {
            match_id: match_id
        },{
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        let payload = response.data.payload
        // console.log(payload)
        return payload
    }
    catch(error){
        console.log(error);
        // if (error.response.data.message == "Dance floor timeout!"){
        //     startBattle(accessToken)
        // }
        // else{ 
            return false
        // }
    }
}

export const completeBattle = async (match_id, accessToken, moves) => {

    try {
        const response = await axios.post(`${BASE_URL}dance/complete/`, {
            match_id: match_id,
            moves: moves
        },{
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        let payload = response.data
        // console.log(payload)
        return payload
    }
    catch(error){
        console.log(error);
        // if (error.response.data.message == "Dance floor timeout!"){
        //     startBattle(accessToken)
        // }
        // else{ 
            return false
        // }
    }
}