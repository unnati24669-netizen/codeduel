const {findInRange,removeFromQueue,getSocketId}=require("./queue")
const Question =require("../models/question")
const Match =require("../models/match")
const MATCH_DURATION=3600;

function findMatch(userId,rating){
    const time=Date.now();
    return new Promise((resolve)=>{
        const attempt=async()=>{
             try{
        let result;
        if(Date.now()-time<30000){
         result=await findInRange(rating,200)


    }else{
        result=await findInRange(rating,500)
    }
    result=result.filter((user)=>user!=userId);
    if(result.length==0){
         setTimeout(attempt,2000);
         return;

    }
    resolve(result);

        }
    catch(err){
        console.log(err);
    }}
    attempt();
    })
    
}


async function getRandomQuestion(){
    try{
       
       const randomQuestion=await Question.aggregate([{$sample:{size:1}}]);
       return randomQuestion[0];


    }catch(err){
        console.log(err);
    }
}
async function matchmaking(userId,rating,io){
    
    try{
        const result= await findMatch(userId,rating)
        

        const ind=Math.floor(Math.random()*result.length);
        const {socketid:socket1}=await getSocketId(userId);
        const {socketid:socket2,rating:rating2}=await getSocketId(result[ind]);
        await removeFromQueue(userId);
        await removeFromQueue(result[ind]);

       

        const socketid1=io.sockets.sockets.get(socket1);
        const socketid2=io.sockets.sockets.get(socket2);
        const question=await getRandomQuestion();

        const newMatch=await Match.create({
            player1:userId,
            player2:result[ind],
            questionId:question._id,
            rating1:rating,
            rating2:parseInt(rating2)
            



        })
        const roomId=newMatch._id.toString();
        socketid1.join(roomId);
        socketid2.join(roomId);
        socketid1.emit("matchfound",{matchId:roomId,questionId:question._id})
        socketid2.emit("matchfound",{matchId:roomId,questionId:question._id})
          
        setTimeout(async()=>{
            const match=await Match.findById(newMatch._id);
            if(match.status==="ongoing"){
                await Match.findByIdAndUpdate(match._id,{status:"abandon"})
                io.to(roomId).emit("match ended",{result:null})
            }

        },MATCH_DURATION*1000)





    }catch(err){
        console.log(err);
    }


   

}
module.exports={matchmaking}