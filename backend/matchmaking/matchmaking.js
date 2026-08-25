const {findInRange,tryClaimMatch,getSocketId}=require("./queue")
const Question =require("../models/question")
const Match =require("../models/match")
const User=require("../models/user");

const MATCH_DURATION=3600;


function findMatch(userId,rating,limit){
    
           //const time=Date.now();
   
    return new Promise((resolve,reject)=>{
        const attempt=async()=>{
             try{
        let result;
       
         result=await findInRange(rating,limit)


    result=result.filter((user)=>user.value!=userId);
    if(result.length==0){
         setTimeout(attempt,2000);
         return;

    }
    resolve(result);

        }
    catch(err){
        reject(err);
        console.log(err);
    }}
    attempt();
    })
    }


async function getRandomQuestion(){
    try{
       const randomQuestion = await Question.aggregate([{$sample:{size:1}}]);
       if (!randomQuestion || randomQuestion.length === 0) {
           console.log("Matchmaking failed: no questions available in the database.");
           return null;
       }
       return randomQuestion[0];
    }catch(err){
        console.log(err);
        return null;
    }
}
async function matchmaking(userId,rating,io){
   
    let limit=200;
    let ID;
    try{
          
     ID=setInterval(()=>limit=limit+300,30000)
    async function delay(time){
        return new Promise(
            (resolve)=>setTimeout(resolve,time)
        )
    }
        let ind;
        let result;

        while(true){
           
             result= await findMatch(userId,rating,limit)
             let claimed=false;
        

        for(let i=0;i<result.length;i++){
            const response=await tryClaimMatch(result[i].value,userId,result[i].score);
            if(response==1){
                ind=i;
                claimed=true;
                break;
            }
            
            else if(response===-1){
                clearInterval(ID);
                return;
            }
        }
        if(claimed){
            clearInterval(ID);
            break;

        }
        
        await delay(2000);
         
        

    }
        

        
        if (ind == null || !result[ind]) {
            clearInterval(ID);
            throw new Error("Matchmaking failed: no matched opponent found after claiming a match.");
        }

        const userSocket = await getSocketId(userId);
        const opponentSocket = await getSocketId(result[ind].value);
        if (!userSocket?.socketid || !opponentSocket?.socketid) {
            clearInterval(ID);
            throw new Error("Matchmaking failed: missing socket information for one of the players.");
        }

        const socketid1 = io.sockets.sockets.get(userSocket.socketid);
        const socketid2 = io.sockets.sockets.get(opponentSocket.socketid);
        if (!socketid1 || !socketid2) {
            clearInterval(ID);
            throw new Error("Matchmaking failed: socket connection missing for one of the players.");
        }

        const question = await getRandomQuestion();
        if (!question) {
            clearInterval(ID);
            throw new Error("Matchmaking failed: no question available for the match.");
        }

        const newMatch = await Match.create({
            player1: userId,
            player2: result[ind].value,
            questionId: question._id,
            rating1: rating,
            rating2: parseInt(opponentSocket.rating)
            



        })
        const roomId=newMatch._id.toString();
        socketid1.join(roomId);
        socketid2.join(roomId);
        socketid1.emit("matchfound",{matchId:roomId,questionId:question._id})
        socketid2.emit("matchfound",{matchId:roomId,questionId:question._id})
          
        setTimeout(async()=>{
            const match=await Match.findById(newMatch._id);
            if(match.status==="ongoing"){
                const updatedMatch=await Match.findOneAndUpdate({_id:match._id,status:{$ne:"completed"}},{result:"abandon",status:"abandon"})
                if(!updatedMatch){
                    return ;

                }
                
                await User.findByIdAndUpdate(match.player1,{rating:match.rating1 ,$inc:{matchesPlayed:1,losses:1}})
                await User.findByIdAndUpdate(match.player2,{rating:match.rating2 ,$inc:{matchesPlayed:1,losses:1}})
                io.to(roomId).emit("matchended",{winner:null,matchId:roomId,"data1":{playerId:match.player1.toString(),newRating:match.rating1},"data2":{playerId:match.player2.toString(),newRating:match.rating2},status:"abandon"})
            }

        },MATCH_DURATION*1000)






    }catch(err){
        clearInterval(ID);
        console.log(err);
    }


   

}
module.exports={matchmaking}