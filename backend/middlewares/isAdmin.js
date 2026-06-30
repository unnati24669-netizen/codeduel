const isadmin= function(req,res,next){
    if(req.user.role==="admin"){
        next();
    }else{
        return res.status(403).json({
            message:"users cannot add questions"
        })
    }
}

module.exports=isadmin