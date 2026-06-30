const User=require("../models/user.js");
const bcrypt=require("bcrypt")
const {z}=require("zod")
const jwt=require("jsonwebtoken")
const JWT_SECRET=process.env.JWT_SECRET

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
            token
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
    return res.json({
        message:"succefully added you as admin"
    })





}catch(err){
    return res.status(500).json({
        message:"some error occured"
    })
}
}


 module.exports={userController,loginController,adminUpdate}
