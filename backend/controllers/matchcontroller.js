const axios=require("axios")
const dotenv=require("dotenv")
dotenv.config()
const Match=require("../models/match")
const Question=require("../models/question")
const User=require("../models/user")
const calculateElo=require("./elo");


const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const USE_RAPIDAPI = process.env.JUDGE0_USE_RAPIDAPI === 'true';

function getJudge0Headers() {
    const headers = { "Content-Type": "application/json" };
    if (USE_RAPIDAPI) {
        headers["x-rapidapi-key"] = process.env.JUDGE0_API_KEY;
        headers["x-rapidapi-host"] = process.env.JUDGE0_HOST;
    }
    return headers;
}

async function getResult(token){
    try{while(true){
        const response=await axios.get(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,{
            headers: getJudge0Headers()
        })
        if(response.data.status.id!==1&&response.data.status.id!==2){
            return response.data;
        }
        await new Promise((resolve)=>setTimeout(resolve,1000));
    }}catch(err){
        console.log(err);
        return null;
    }
}

async function runOnJudge0(code,languageId,input,output){
    try{
         const response = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=true`,{
            source_code: Buffer.from(code).toString("base64"),
            language_id: languageId,
            stdin: Buffer.from(String(input)).toString("base64"),
            expected_output: Buffer.from(String(output)).toString("base64")
        },
        {headers: getJudge0Headers()}
    )

    const {token}=response.data;
    return getResult(token);

    }catch(err){
        console.log(err);
        return null;
    }
}
function createSubmitQuestion(io){
    return async function (req,res){
       try {
        if(!req.user?._id?.toString()){
            return res.status(400).json({message:"unauthorized"});
        }
        const {code,languageId,matchId}=req.body;
        if(!code || !languageId || !matchId){
            return res.status(400).json({message:"code, languageId and matchId are required"});
        }

        const getMatch=await Match.findById(matchId);
        if(!getMatch){
            return res.status(404).json({message:"match not found"});
        }
        
        if(getMatch.player1.toString()!==req.user._id.toString()&&getMatch.player2.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"you are not a participant in this match"});
        }

        const getQuestion=await Question.findById(getMatch.questionId);
        if(!getQuestion){
            return res.status(404).json({message:"question not found"});
        }

        for(const testcase of getQuestion.testcases){
            const response=await runOnJudge0(code,languageId,testcase.input,testcase.output);
            if(!response || !response.status){
                return res.status(502).json({message:"judge0 evaluation failed"});
            }
            if(response.status.id!==3){
                return res.status(400).json({message:"wrong solution"});
            }
        }

        let winner;
        let result;
        const userId = req.user?._id?.toString() || req.user?.id?.toString();
        
        if(getMatch.player1.toString() === userId){
            winner=1;
            result="player1";
        }else if(getMatch.player2.toString() === userId){
            winner=2;
            result="player2";
        }
        
       
        const time=Date.now()-getMatch.createdAt;
        const {newRating1,newRating2}=calculateElo(getMatch.rating1,getMatch.rating2,winner);
        const updateMatch=await Match.findOneAndUpdate({_id:getMatch._id,status:{$ne:"completed"}},{
            result:result,
            duration:time,
            status:"completed"
        },{returnDocument:'after'});
        if(!updateMatch){
            return res.status(400).json({message:"match has already been over"});
        }

        if(result=="player1"){
            await User.findByIdAndUpdate(getMatch.player1,{rating:newRating1 , $inc:{matchesPlayed:1,wins:1}});
            await User.findByIdAndUpdate(getMatch.player2,{rating:newRating2 , $inc:{matchesPlayed:1,losses:1}});
        }else if(result=="player2"){
           await User.findByIdAndUpdate(getMatch.player1,{rating:newRating1 , $inc:{matchesPlayed:1,losses:1}});
           await User.findByIdAndUpdate(getMatch.player2,{rating:newRating2 , $inc:{matchesPlayed:1,wins:1}});
        }
        
        io.to(matchId).emit("matchended",{winner:req.user._id,matchId,"data1":{playerId:getMatch.player1.toString(),newRating:newRating1},"data2":{playerId:getMatch.player2.toString(),newRating:newRating2},status:"completed"});
        return res.status(200).json({message:"correct solution"});
       } catch(err) {
            console.log("submit error:", err);
            return res.status(500).json({message:"could not submit the question"});
       }

    }
}



async function  getMatchData(req,res){
    try{
        const matchId=req.params.id;
        if(!matchId){
            return res.status(400).json({message:"match id is required"});
        }
        const data=await Match.findById(matchId).populate("player1","username").populate("player2","username");
        if(!data){
            return res.status(404).json({message:"match not found"});
        }
        return res.status(200).json({data});
    }catch(err){
        console.log("getMatchData error:", err);
        return res.status(500).json({message:"could not fetch data"});
    }
    
}
 module.exports={createSubmitQuestion,getMatchData}