const express=require("express");
const router=express.Router();
const {createSubmitQuestion,getMatchData}=require("../controllers/matchcontroller")
const  authentication=require("../middlewares/auth") 

module.exports=function(io){
    
    router.post("/submit",authentication,createSubmitQuestion(io));
    router.get("/:id",getMatchData);

    return router;

}