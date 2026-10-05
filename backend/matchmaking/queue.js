const { createClient } =require("redis");
const dotenv=require("dotenv");
dotenv.config();


const client=createClient({url:process.env.REDIS_URL});
client.on(
    "error",(err)=>console.log(err)
);

 
const clientPromise = client.connect()
  .then(() => console.log("Redis connected"))
  .catch((err) => {
    console.log("Redis connection failed:", err);
    throw err;
  });
const QUEUE_NAME="matchmaking_queue";
const SOCKET_MAPPING="socket_map";
 async function addToQueue(userId,rating,socketId){
    try{
   const ratingValue = String(rating);
    await client.hSet(SOCKET_MAPPING, `${userId}:rating`, ratingValue);
    await client.hSet(SOCKET_MAPPING, String(userId), String(socketId));
    await client.zAdd(QUEUE_NAME, [{ score: Number(rating), value: String(userId) }]);
    }catch(err){
        console.log(err);
    }

}



async function tryClaimMatch(candidateId, selfId, candidateRating) {
    try {
        const claimScript = `
          local removedCandidate = redis.call("ZREM", KEYS[1], ARGV[1])
          if (removedCandidate == 0) then
            return 0 
          end

          local removedSelf = redis.call("ZREM", KEYS[1], ARGV[2])
          if (removedSelf == 0) then
            redis.call("ZADD", KEYS[1], ARGV[3], ARGV[1])
            return -1
          end

          return 1 
        `;
        const result = await client.eval(claimScript, {
            keys: [QUEUE_NAME],
            arguments: [candidateId, selfId, String(candidateRating)]
        });
        return result ;
    } catch (err) {
        console.log(err);
        return -2;
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
        const result = await client.zRangeByScoreWithScores(QUEUE_NAME, rating - range, rating + range);
        return result || [];
    }catch(err){
        console.log(err);
        return [];
    }
    
}

async function getSocketId(userId){
    try{
        const socketid = await client.hGet(SOCKET_MAPPING, String(userId));
        const rating = await client.hGet(SOCKET_MAPPING, `${userId}:rating`);
        return {socketid, rating};
    }catch(err){
        console.log("Redis getSocketId error:", err);
        return { socketid: null, rating: null };
    }
}

module.exports={addToQueue,tryClaimMatch,findInRange,getSocketId,removeFromQueue,QUEUE_NAME,client,clientPromise,SOCKET_MAPPING}