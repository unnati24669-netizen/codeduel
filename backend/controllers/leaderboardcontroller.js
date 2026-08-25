const User=require("../models/user")

const ratingUser=async(req,res)=>{
    try{
   let {page,limit}=req.query;
   if(!page||!limit){
    return res.status(400).json({
        message:"send all the fields"
    })
   }
   if(isNaN(page)||isNaN(limit)){
    return res.status(400).json({
        message:"page and limit should be numbers"
    })
   }
   page=parseInt(page);
   limit=parseInt(limit);
   if(limit>100||limit<=0){
    return res.status(400).json({
        message:"limit should be between 1 and 100"
    })
   }
   if(page<=0){
    return res.status(400).json({
        message:"page value should be greater than 0"
    })
   }

   const [requiredUser,totalUser] = await Promise.all([User.find().select("_id username rating wins losses matchesPlayed").sort({rating:-1,wins:-1,_id:1}).skip((page-1)*limit).limit(limit),User.countDocuments()]) //in one db round we are fetching the required users and total users, this would help in pagination, we are sorting the users based on rating and wins and then by _id in descending order, this would help in sorting the users based on rating and wins and then by _id
   //promise all waits for which ever promise is resolved last and then returns the result, this would help in reducing the time taken to fetch the data from db
   const leaderboard=requiredUser.map((user,key)=>({userId:user._id,name:user.username,rank:(page-1)*limit+key+1,rating:user.rating,wins:user.wins,losses:user.losses,matchesPlayed:user.matchesPlayed}))
   return res.status(200).json({
    leaderboard,totalUser,totalPages:Math.ceil(totalUser/limit)
   })

    }catch(err){
        return res.status(500).json({
            message:"some error occured"
        })

    }
}

module.exports=ratingUser