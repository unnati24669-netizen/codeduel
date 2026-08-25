

const jwt=require("jsonwebtoken")
const User=require("../models/user")
const calculateElo=require("../controllers/elo")
const dotenv=require("dotenv")
dotenv.config()

const {matchmaking}=require("../matchmaking/matchmaking")
const {addToQueue,removeFromQueue,getSocketId}=require("../matchmaking/queue")
const Match=require("../models/match")


async function initsocket(server){
    const {Server}=require("socket.io")
    const io=new Server(server,{cors:{ origin: "http://localhost:5173", credentials: true }})
    io.use(async(socket,next)=>{
         try{
            const rawToken=socket.handshake.auth?.token || socket.handshake.headers?.authorization || ""
            const token=rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken
            if(!token){
               return next(new Error("no token found"))
            
            }
            const JWT_SECRET=process.env.JWT_SECRET
            const isAuthenticated=jwt.verify(token,JWT_SECRET)
            const userRating=await User.findById(isAuthenticated.id).select("-password")
            socket.user=userRating
            
            next();

        }catch(err){
            console.log("socket auth error:", err.message);
             next(new Error("authentication failed"))
        }

    }
       
    )
    
   

    io.on("connection",(socket)=>{
        socket.on("joinQueue",async()=>{
            if(!socket.user) return;
            await addToQueue(socket.user._id.toString(), socket.user.rating, socket.id);
            matchmaking(socket.user._id.toString(),socket.user.rating,io)
        })
        socket.on("leaveQueue",async()=>{
            if(!socket.user) return;
            removeFromQueue(socket.user._id.toString());
        })
        socket.on("disconnect",async()=>{
            try{
                if(!socket.user) return;
                const response=await Match.findOne({status:"ongoing",$or:[{player1:socket.user._id},{player2:socket.user._id},]});
                if(!response){
                     removeFromQueue(socket.user._id.toString());
                     return;
                }
                const socketData1 = await getSocketId(response.player1.toString());
                const socketData2 = await getSocketId(response.player2.toString());
                const socketid1 = socketData1?.socketid;
                const socketid2 = socketData2?.socketid;
                if (!socketid1 && !socketid2) {
                    removeFromQueue(socket.user._id.toString());
                    return;
                }
                const socket1=socketid1 ? io.sockets.sockets.get(socketid1) : null;
                const socket2=socketid2 ? io.sockets.sockets.get(socketid2) : null;
                const matchId=response._id.toString()
                const time=Date.now()-response.createdAt;
                if(socket1){
                   const {newRating1,newRating2}=calculateElo(response.rating1,response.rating2,1)
                    const updatedMatch=await Match.findOneAndUpdate({_id:response._id,status:{$ne:"completed"}},{
                        result:"player1",
                        duration:time,
                        status:"completed"
                    })
                    if(!updatedMatch){
                        return ;
                    }
                    await User.findByIdAndUpdate(response.player1,{rating:newRating1 , $inc:{matchesPlayed:1,wins:1}})
                     await User.findByIdAndUpdate(response.player2,{rating:newRating2 , $inc:{matchesPlayed:1,losses:1}})

                    io.to(matchId).emit("matchended",{winner:response.player1,matchId,"data1":{playerId:response.player1.toString(),newRating:newRating1},"data2":{playerId:response.player2.toString(),newRating:newRating2},status:"completed"});

                }else if(socket2){
                    const {newRating1,newRating2}=calculateElo(response.rating1,response.rating2,2)
                    const updatedMatch=await Match.findOneAndUpdate({_id:response._id,status:{$ne:"completed"}},{
                        result:"player2",
                        duration:time,
                        status:"completed"
                    })
                    if(!updatedMatch){//this maintains the integrity of the match, if the match is already completed, then we should not update it again
                        return;
                    }
                     await User.findByIdAndUpdate(response.player1,{rating:newRating1,$inc:{matchesPlayed:1,losses:1}})
                      await User.findByIdAndUpdate(response.player2,{rating:newRating2,$inc:{matchesPlayed:1,wins:1}})
                    io.to(matchId).emit("matchended",{winner:response.player2,matchId,"data1":{playerId:response.player1.toString(),newRating:newRating1},"data2":{playerId:response.player2.toString(),newRating:newRating2},status:"completed"});

                }else{
                    const updatedMatch=await Match.findOneAndUpdate({_id:response._id,status:{$ne:"completed"}}   ,{
                        result:"abandon",
                        duration:time,
                        status:"abandon"
                    })
                      if(!updatedMatch){//this maintains the integrity of the match, if the match is already completed, then we should not update it again
                        return;
                    }
                    await User.findByIdAndUpdate(response.player1,{rating:response.rating1 ,$inc:{matchesPlayed:1,losses:1}})
                    await User.findByIdAndUpdate(response.player2,{rating:response.rating2 ,$inc:{matchesPlayed:1,losses:1}})
                    io.to(matchId).emit("matchended",{winner:null,matchId,"data1":{playerId:response.player1.toString(),newRating:response.rating1},"data2":{playerId:response.player2.toString(),newRating:response.rating2},status:"abandon"});

                }
              
               

            }catch(err){
                 removeFromQueue(socket.user._id.toString());
                console.log(err);
            }
            
        })
    })
      return io;
    



}


module.exports={initsocket};