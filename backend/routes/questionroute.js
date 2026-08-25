const {addQuestion,getQuestion}=require("../controllers/questioncontroller")
const authentication=require("../middlewares/auth")
const isadmin=require("../middlewares/isAdmin")
const express=require("express")
const questionRouter=express.Router();
const {limiter}=require("../rate-limiter")

questionRouter.post("/",authentication,isadmin,limiter,addQuestion);

questionRouter.get("/:id",authentication,limiter,getQuestion);
 
module.exports=questionRouter