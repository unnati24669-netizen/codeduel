const {z}=require("zod");
const Question=require("../models/question")

const requiredBody=z.object({
    title:z.string(),
    description:z.string(),
    difficulty:z.enum(["easy","medium","hard"]),
    tag:z.array(z.string()),
    testcases:z.array(z.object({
        input:z.string(),
        output:z.string(),
        isHidden:z.boolean().optional()}
    )),
    timeLimit:z.number()


})
const addQuestion=async function(req,res){
    try{
    const givenBody=requiredBody.safeParse(req.body);

    if(!givenBody.success){
        return res.status(400).json({
            message:"incorrect format"
        })
    }

    const {title,description,difficulty,tag,testcases,timeLimit}=req.body;

    const isCreated=await Question.create({
        title,description,difficulty,tag,testcases,timeLimit

    })
  

    return res.status(201).json({message:"question added successfuly"});





    }catch(err){
        return res.status(500).json({
            message:"some error occured "
        })

    }
}

const getQuestion =async function(req,res){
    try{
    const questionId=req.params.id;
    if(!questionId){
        return res.status(400).json({message:"no question id is given"})
    }

    const question=await Question.findById(
        questionId
    )
    if(!question){
        return res.status(404).json({
            message:"question not found"
        })
    }
    const newquestion=question.toObject();
    newquestion.testcases=newquestion.testcases.filter((tc)=>tc.isHidden!==true)

    return res.json({question:newquestion});

}catch(err){
    return res.status(500).json({
        message:"could not get the question"
    })
}
}

module.exports={addQuestion,getQuestion};