const jwt=require("jsonwebtoken")

function  authentication(req,res,next){
    try{
    const JWT_SECRET=process.env.JWT_SECRET
    
    const token=req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"no token receive"
        })
    }

    const isAuthenticated=jwt.verify(token,JWT_SECRET);

        req.user={
            _id:isAuthenticated.id,
            id:isAuthenticated.id,
            role:isAuthenticated.role
        }
        next()
    

}catch(err){
    return res.status(401).json({
        message:"invalid or expired token"
    })
}




}
module.exports = authentication

