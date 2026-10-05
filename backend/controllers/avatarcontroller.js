const {PutObjectCommand}=require("@aws-sdk/client-s3")
const {s3client}=require("../config/s3config.js")
const User=require("../models/user.js")
const mapping={
    "image/jpeg":"jpeg",
    "image/png":"png",
    "image/jpg":"jpg",
    "image/webp":"webp"
}
const avatarController=async(req,res)=>{
    try{

        const userId=req.params.id;
        if(!userId){
            return res.status(400).json({message:"userId is missing"})
        }
        const tokenUserId=req.user.id;
        if(tokenUserId!==userId){
            return res.status(403).json({message:"You are not authorized to upload avatar for this user"})
        }
        if(!req.file){
            return res.status(400).json({message:"file is missing"})
        }

        const key=`avatars/${userId}-${Date.now()}.${mapping[req.file.mimetype]}`; // Generate a unique key for the file in S3

        const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    
         });
         await s3client.send(command);


        const URL=`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`; // Construct the URL of the uploaded file
        
        const uploaded=await User.findOneAndUpdate({_id:userId},{avatarUrl:URL});
        console.log("update result:", uploaded);
        if(uploaded){
            return res.status(200).json({avatarUrl:URL})
        }
        return res.status(500).json({message:"some error occurred"})



    }catch(err){
        res.status(501).json({message:" error occurred"})
        console.log(err);


    }
}

module.exports=avatarController