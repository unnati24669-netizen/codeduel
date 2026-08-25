const Ratinguser=require("../controllers/leaderboardcontroller")
const {Router}=require("express")
const authentication = require("../middlewares/auth")
const router=Router()
const {limiter}=require("../rate-limiter")

router.get("/",authentication,limiter,Ratinguser);

module.exports=router