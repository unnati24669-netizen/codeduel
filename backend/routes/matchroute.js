const express=require("express");
const router=express.Router();
const {createSubmitQuestion,getMatchData}=require("../controllers/matchcontroller")
const  authentication=require("../middlewares/auth") 
const {strictLimiter}=require("../rate-limiter")
const {limiter}=require("../rate-limiter")

module.exports=function(io){
    
    router.post("/submit",authentication,strictLimiter,createSubmitQuestion(io));
    router.get("/:id",limiter,getMatchData);

    return router;

}