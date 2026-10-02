const User=require("../models/user.js");
const bcrypt=require("bcrypt")
const {z}=require("zod")
const jwt=require("jsonwebtoken")
const dotenv=require("dotenv")
dotenv.config()
const JWT_SECRET=process.env.JWT_SECRET
const Match=require("../models/match.js")


const requiredBody = z.object({
    username:z.string(),
    email: z.string().email(),
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    password: z.string().min(8).max(50)
})

const userController=
    async function(req,res){
        try{
    const givenBody=requiredBody.safeParse(req.body);
    if(!givenBody.success){
       return  res.status(400).json({
            message:"invalid format"
        })
    }
    const{username,email,firstName,lastName,password}=req.body;
    const newPassword=await bcrypt.hash(password,10);

    
        const newPlayer=await User.create({
           username, email,firstName,lastName,password:newPassword
        })
        res.json({
            message:"successfully signed up"
        })
    }

 

 catch(err){
    if(err.code===11000){//database throws this error when the email or username or anything that needs to be unique  aready exist
       const field=Object.keys(err.keyPattern)[0];//this tells which field is duplicate
        return res.status(409).json({
            message:`${field} is already taken`
        })
    }
    return res.status(500).json({
         message:"some error has occured"
    })
 }
    }

const loginBody=z.object({
    email:z.string().email(),
    password:z.string()
})

const loginController=async function(req,res){
    try{
        const givenBody=loginBody.safeParse(req.body)
        if(!givenBody.success){
           return res.status(400).json({
                message:"incorrect format"
            })
        }
        const {email,password}=req.body
        
        const player=await User.findOne({email});
        if(!player){
           return res.status(404).json({
                message:"you are not signed up"
            })
        }
        const ismatch=await bcrypt.compare(password,player.password);
        if(!ismatch){
            return res.status(400).json({
                message:"incorrect password"
            })
        }
        const token=jwt.sign({id:player._id,role:player.role},JWT_SECRET,{expiresIn:"7d"});
        
        res.json({
            token,
            userId: player._id
        })




    }catch(err){
        res.status(500).json({
            message:"some error has occured"
        })

    }
}

const adminUpdate=async function(req,res){
    
   try{ 
    
    const userId=req.params.id;
    if(!userId){
        return res.status(401).json({
            message:"userId is missing"
        })
    }

    const admin=await User.findOneAndUpdate(
        {_id:userId},
        {role:"admin"},{new:true}
    )
    
    if(!admin){
        return res.status(404).json({
            message:"some error occured"
        })
    }
    const token=jwt.sign({id:admin._id,role:admin.role},JWT_SECRET,{expiresIn:"7d"});
    return res.json({
        token,role:admin.role
    })





}catch(err){
    return res.status(500).json({
        message:"some error occured"
    })
}
}

const profileController=async function (req,res){
    try{
        const userId=req.params.id;
        if(!userId){
            return res.status(400).json({message:"sent the id of user"})
        }
        const profile=await User.findById(userId);
        if(!profile){
            return res.status(404).json({message:"user not found"})
        }
        const requiredMatch=await Match.find({$or:[{player1:userId},{player2:userId}],status:"completed"}).sort({createdAt:1});
         const heatmapMatch=await Match.find({$or:[{player1:userId},{player2:userId}],status:"completed"});
        let playerRating=[];

        for(const Matchs of requiredMatch){
        if(Matchs.player1.equals(userId)){
            playerRating.push({rating:Matchs.rating1,date:Matchs.createdAt});
        }
        else{
            playerRating.push({rating:Matchs.rating2,date:Matchs.createdAt});
        }
       }

       playerRating.push({rating:profile.rating,date:new Date()});

       
    
    const dates={};
    for(const matches of heatmapMatch){
         const day=matches.createdAt.toISOString().split("T")[0];
         if(dates[day]){
            dates[day]+=1;
         }
         else{
            dates[day]=1;
         }
        
    }

    const finaldates=[];

    for(const day in dates){
        finaldates.push({date:day, count:dates[day]});

    }

        return res.status(200).json({username:profile.username,rating:profile.rating,matchesPlayed:profile.matchesPlayed,wins:profile.wins,losses:profile.losses,playerHistory:playerRating,activityHistory:finaldates,avatarUrl:profile.avatarUrl})


    }catch(err){
       return res.status(500).json({message:"some error occurred"})
    }
}


 module.exports={userController,loginController,adminUpdate,profileController}
