const {addQuestion,getQuestion}=require("../controllers/questioncontroller")
const authentication=require("../middlewares/auth")
const isadmin=require("../middlewares/isAdmin")
const express=require("express")
const questionRouter=express.Router();

questionRouter.post("/",authentication,isadmin,addQuestion);

questionRouter.get("/:id",authentication,getQuestion);
 
module.exports=questionRouter