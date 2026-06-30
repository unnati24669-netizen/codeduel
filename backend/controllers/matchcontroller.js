const axios=require("axios")
const dotenv=require("dotenv")
dotenv.config()
const Match=require("../models/match")
const Question=require("../models/question")
const User=require("../models/user")
const calculateElo=require("./elo");

async function getResult(token){
    try{while(true){
        const response=await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}`,{
            headers:{
                  "x-rapidapi-key": process.env.JUDGE0_API_KEY,
                "x-rapidapi-host": process.env.JUDGE0_HOST
            }
        })
        if(response.data.status.id!==1&&response.data.status.id!==2){
            return response.data;
        }
        await new Promise((resolve)=>setTimeout(resolve,1000));


    }}catch(err){
        console.log(err);
    }
    
}

async function runOnJudge0(code,languageId,input,output){
    try{
         const response =await axios.post("https://judge0-ce.p.rapidapi.com/submissions",{
        source_code:Buffer.from(code).toString("base64"),
        language_id:languageId,
        stdin:input,
        expected_output:output},
        {headers:{
            "Content-Type": "application/json",
            "x-rapidapi-key": process.env.JUDGE0_API_KEY,
            "x-rapidapi-host": process.env.JUDGE0_HOST
        }}
         
    )

    const {token}=response.data;

    return getResult(token);




    }catch(err){
        console.log(err);
    }

   

    

}
function createSubmitQuestion(io){
    return async function (req,res){
       
    const {code,languageId,matchId}=req.body;

    const getMatch=await Match.findById(matchId)
    const getQuestion=await Question.findById(getMatch.questionId);
    for(const testcase of getQuestion.testcases){
        const response=await runOnJudge0(code,languageId,testcase.input,testcase.output);
        if(response.status.id!=3){
            return res.json({
                message:"wrong solution"
            })
        }

    }
    let winner;
    let result;
    if(getMatch.player1.toString()==req.user._id.toString()){
        winner=1;
        result="player1";
    }else if(getMatch.player2.toString()==req.user._id.toString()){
        winner=2;
        result="player2";
    }
    let status;
    if(result){
        status="completed"
    }

    const time=Date.now()-getMatch.createdAt

    const {newRating1,newRating2}=calculateElo(getMatch.rating1,getMatch.rating2,winner)
    const updateMatch=await Match.findByIdAndUpdate(getMatch._id,{
        result:result,
        duration:time,
        status:status
    })

    const user1=await User.findByIdAndUpdate(getMatch.player1,{rating:newRating1});
    const user2=await User.findByIdAndUpdate(getMatch.player2,{rating:newRating2});
    io.to(matchId).emit("match ended",{winner:req.user._id,matchId,newRating1,newRating2})
    return res.json({
        message:"correct solution"
    })



    }

}

async function  getMatchData(req,res){
    try{
        const matchId=req.params.id;
    const data=await match.findById(matchId).populate("player1","username").populate("player2","username")
    res.json({data});
    }catch(err){
        res.status(500).json({message:"could not fetch data"});
    }
    
}
 module.exports={createSubmitQuestion,getMatchData}