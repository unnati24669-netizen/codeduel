import {ioCreation} from "./socket"
import {matchFound,questionfound,matchDetails,matchResult} from "./slice/matchSlice"


export function matching(dispatch){
    const io=ioCreation();
    
    io.emit("joinQueue");
   
    io.on("matchfound",({matchId,questionId})=>{
        dispatch(matchFound({matchId,questionId}))
        dispatch(matchDetails({id:matchId}))
        dispatch(questionfound({questionId}));
    })
    

    return io;

    }

export function unmatch(io){
     io.off("matchfound");//this cleans up the old listeners
     
     io.emit("leaveQueue");
}

export function listenMatchEnd(io,dispatch){
    io.on("matchended",({winner,matchId,data1,data2,status})=>{
        dispatch(matchResult({winner,matchId,data1,data2,status}))
    })

    
}

export function removeMatchEnd(io){
    io.off("matchended");
}


    
