

const jwt=require("jsonwebtoken")
const User=require("../models/user")
const calculateElo=require("../controllers/elo")
const dotenv=require("dotenv")
dotenv.config()

const {matchmaking}=require("../matchmaking/matchmaking")
const {removeFromQueue,getSocketId}=require("../matchmaking/queue")
const Match=require("../models/match")


async function initsocket(server){
    const {Server}=require("socket.io")
    const io=new Server(server,{cors:{ origin: "http://localhost:5173", credentials: true }})
    io.use(async(socket,next)=>{
         try{
            const token=socket.handshake.auth.token
            if(!token){
                next(new Error("no token found"))
            }
            const JWT_SECRET=process.env.JWT_SECRET
            const isAuthenticated=jwt.verify(token,JWT_SECRET)
            const userRating=await User.findById(isAuthenticated.id)
            socket.user=userRating
            
            next();

        }catch(err){
            console.log(err);
             next(new Error("some error occured"))
        }

    }
       
    )
    
   

    io.on("connection",(socket)=>{
        socket.on("joinQueue",async()=>{
            matchmaking(socket.user._id.toString(),socket.user.rating,io)
        })
        socket.on("leaveQueue",async()=>{
            removeFromQueue(socket.user._id.toString());
               
        })
        socket.on("disconnect",async()=>{
            try{
                const response=await Match.findOne({status:"ongoing",$or:[{player1:socket.user._id},{player2:socket.user._id},]});
                if(!response){
                     removeFromQueue(socket.user._id.toString());
                     return;
                }
                const {socketid:socketid1}=await getSocketId(response.player1);
                const {socketid:socketid2}=await getSocketId(response.player2);
                const socket1=io.sockets.sockets.get(socketid1);
                const socket2=io.sockets.sockets.get(socketid2);
                const matchId=response._id.toString()
                const time=Date.now()-response.createdAt;
                if(socket1){
                   const {newRating1,newRating2}=calculateElo(response.rating1,response.rating2,1)
                    await Match.findByIdAndUpdate(matchId,{
                        result:"player1",
                        duration:time,
                        status:"completed"
                    })
                    await User.findByIdAndUpdate(response.player1,{rating:newRating1})
                     await User.findByIdAndUpdate(response.player2,{rating:newRating2})
                    
                    io.to(matchId).emit("match ended",{winner:"player1",matchId})

                }else if(socket2){
                    const {newRating1,newRating2}=calculateElo(response.rating1,response.rating2,2)
                    await Match.findByIdAndUpdate(matchId,{
                        result:"player2",
                        duration:time,
                        status:"completed"
                    })
                     await User.findByIdAndUpdate(response.player1,{rating:newRating1})
                      await User.findByIdAndUpdate(response.player2,{rating:newRating2})
                    io.to(matchId).emit("match ended",{winner:"player2",matchId})

                }else{
                    await Match.findByIdAndUpdate(matchId,{
                        result:"abandon",
                        duration:time,
                        status:"abandon"
                    })
                    io.to(matchId).emit("match ended",{winner:"abandon",matchId})

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