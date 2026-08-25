const axios = require('axios');

async function groqApi(details){
    try{

    const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {...details},
        {
            timeout: 20000,
            headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
        }
    )

    return ({"reply":response.data.choices[0].message.content})

    }catch(err){
        if(err.response&&err.response.data){
            console.log(err.response.data);
        }
        
       
        return ({"reply":"error"})

    }
}
function checkHistory(entry){

   if(entry!=null){
       if((entry.role==="user"||entry.role==="assistant")&&typeof entry.content==="string"&&entry.content.length<10000){
            return true;
        }
        return false;
   }else{
    return false;
   }
        
       

}

async function review(req,res){
    const {code,question,language}=req.body;
    if(!code||!question||!language){
        return res.status(400).json({"failure":"some fields are missing"})
    }

    let questionText = question;
    if(typeof question === "object" && question !== null){
        questionText = `${question.title || ""}\n\n${question.description || ""}\n\nTime Limit: ${question.timeLimit ?? ""}`;
    }

    if(typeof code!="string"||typeof questionText!="string"||typeof language!="string"||code.length>10000||questionText.length>5000||language.length>500){
        return res.status(400).json({"failure":"invalid format"})
    }

    const details={"messages":[{
        "role":"system",
        "content":"You are an expert interviewer while analysing the code submission ,analyse its time complexity,correctness,readabilty,suggest some improvements and better alternate approach if there is any and rate it like any interviewer would do"
    },{
        "role":"user",
        "content":`here is my code ${code} question ${questionText} and language ${language}`
    }],
    "model":"openai/gpt-oss-120b",
    "temperature":0.5}

    const response=await  groqApi(details)
    if(response.reply==="error"){
        return res.status(500).json({"failure":"some error has occured"})
    }
    return res.status(200).json({"success":[{"role":"user","content":details.messages[1].content},{"role":"assistant","content":response.reply}]})


}

async function chatContinuation(req,res){
    const {chat,history}=req.body;
    if(!chat||!history||!Array.isArray(history)){
        return res.status(400).json({"failure":"some fields are missing"});
    }
    if(typeof chat!="string"||chat.length>8000){
        return res.status(400).json({"failure":"invalid format"})
    }
    if(history.length>30){
        return res.status(400).json({"failuer":"token expired"})
    }


    if(!history.every(checkHistory)){
        return res.status(400).json({"failure":"faulty data has been passed"})
    }

    const systemPrompt="You are an expert coding interviewer continuing a code review discussion with a candidate. You already reviewed their code in the prior conversation turns. Answer their follow-up questions clearly and specifically, referring back to their code and your previous review where relevant. Keep the same rigorous, interviewer-style feedback tone — honest, specific, and focused on correctness, complexity, and code quality."

    

    const details={"messages":[{"role":"system","content":systemPrompt},...history,{"role":"user","content":chat}],
    "model":"openai/gpt-oss-120b",
    "temperature":0.5}

    const response=await groqApi(details)
    if(response.reply==="error"){
        return res.status(500).json({"failure":"some error occured"})
    }
    return res.status(200).json({"success":[...history,{"role":"user","content":chat},{"role":"assistant","content":response.reply}]})
}


    
module.exports={review,chatContinuation}    





