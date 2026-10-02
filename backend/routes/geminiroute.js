const express=require("express")
const router=express.Router();
const {review,chatContinuation} =require("../controllers/review")
const authentication =require("../middlewares/auth")
const {strictLimiter}=require("../rate-limiter")
router.post("/review",authentication,strictLimiter,review);

router.post("/chatcontinuation",authentication,strictLimiter,chatContinuation)

module.exports=router
