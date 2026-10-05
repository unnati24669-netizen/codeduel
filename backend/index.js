const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const dotenv=require("dotenv");
dotenv.config();
const userRouter=require("./routes/userroute")
const questionRouter=require("./routes/questionroute")
const app=express();
const server=require("http").createServer(app);
const {initsocket}=require("./socket/index")
const matchrouter=require("./routes/matchroute")
const router=require("./routes/geminiroute")
const leaderboardRouter=require("./routes/leaderboardroute")



app.use(express.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));




  
    app.use("/api/user",userRouter);
    app.use("/api/question",questionRouter)
    app.use("/api/leaderboard",leaderboardRouter)
    let io;
mongoose.connect(process.env.MONGO_URL, {
  family: 4,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
}).then(async()=>{
    console.log("Connected to MongoDB")
    io = await initsocket(server);
    app.use("/api/match",matchrouter(io));
    app.use("/api/gemini",router);
    server.listen(process.env.PORT,()=> {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}).catch((err)=>console.log(err));







