const { createClient } =require("redis");
const dotenv=require("dotenv");
dotenv.config();

const client=createClient({url:process.env.REDIS_URL});
client.on(
    "error",(err)=>console.log(err)
);

 
client.connect()
const QUEUE_NAME="matchmaking_queue";
const SOCKET_MAPPING="socket_map";
 async function addToQueue(userId,rating,socketId){
    try{
        const addRating=await client.hSet(SOCKET_MAPPING,`${userId}:rating`,rating)
        const add=await client.hSet(SOCKET_MAPPING,userId,socketId);

         const adding=await client.zAdd(QUEUE_NAME,{score:rating,value:userId});

    }catch(err){
        console.log(err);
        
    }

   
    

}

 async function removeFromQueue(userId){
    try{
          const remove=await client.zRem(QUEUE_NAME,userId);
    }catch(err){
        console.log(err);

    }

    

}

async function findInRange(rating,range) {
    try{
        const result=await client.zRangeByScore(QUEUE_NAME,rating-range,rating+range)
        return result;
    }catch(err){
        console.log(err);
    }
    
}

async function getSocketId(userId){
    try{
        const socketid=await client.hGet(SOCKET_MAPPING,userId);
        const rating=await client.hGet(SOCKET_MAPPING,`${userId}:rating`)
        return {socketid,rating};

    }catch(err){
        console.log(err);
    }

}
module.exports={addToQueue,removeFromQueue,findInRange,getSocketId}

