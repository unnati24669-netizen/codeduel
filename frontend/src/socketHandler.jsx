import {ioCreation} from "./socket"
import {matchFound,questionfound,matchDetails,matchResult} from "./slice/matchSlice"


export function matching(dispatch){
    const io=ioCreation();
     io.off("matchfound");//this cleans up the old listeners before registering new one
    io.emit("joinQueue");
   
    io.on("matchfound",({matchId,questionId})=>{
        dispatch(matchFound({matchId,questionId}))
        dispatch(matchDetails({id:matchId}))
        dispatch(questionfound({questionId}));
    })
    io.on("match ended",({winner,matchId,newRating1,newRating2})=>{
        dispatch(matchResult({winner,matchId,newRating1,newRating2}))
    })

    }


    
