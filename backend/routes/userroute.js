const express=require("express")
const userRouter=express.Router()
const authentication=require("../middlewares/auth.js")
const isadmin=require("../middlewares/isAdmin.js")


const {userController,loginController,adminUpdate}=require("../controllers/authcontroller.js")
 userRouter.post("/signup",userController)

 userRouter.post("/login",loginController)

 userRouter.put("/:id",authentication,isadmin,adminUpdate)

 module.exports=userRouter