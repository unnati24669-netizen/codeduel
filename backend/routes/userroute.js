const express=require("express")
const userRouter=express.Router()
const authentication=require("../middlewares/auth.js")
const isadmin=require("../middlewares/isAdmin.js")
const {strictLimiter}=require("../rate-limiter.js")
const {limiter}=require("../rate-limiter.js")



const {userController,loginController,adminUpdate, profileController}=require("../controllers/authcontroller.js")
 userRouter.post("/signup",strictLimiter,userController,)

 userRouter.post("/login",strictLimiter,loginController)

 userRouter.put("/:id",authentication,isadmin,strictLimiter,adminUpdate)

 userRouter.get("/:id",authentication,limiter,profileController)

 module.exports=userRouter