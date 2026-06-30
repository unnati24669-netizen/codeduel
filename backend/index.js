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
app.use(express.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.use("/api/user",userRouter);
app.use("/api/question",questionRouter)
let io;
mongoose.connect(process.env.MONGO_URL).then(()=>{console.log("Connected to MongoDB")
    io=initsocket(server);
    app.use("/api/match",matchrouter(io));
    server.listen(process.env.PORT,()=> {
    console.log(`Server is running on port ${process.env.PORT}`)
})


}).catch((err)=>console.log(err));

