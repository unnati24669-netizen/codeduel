const mongoose=require("mongoose")
const schema=mongoose.Schema

const questionSchema=schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    difficulty:{type:String,enum:["easy","medium","hard"],required:true},
    tag:[{type:String,required:true}],
    testcases:{type:[
        {
            input:{type:String,required:true},
            output:{type:String,required:true},
            isHidden:{type:Boolean,default:false}
        }
    ],required:true},
    timeLimit:{type:Number,required:true}



},{timestamps:true})

const Question=mongoose.model("question",questionSchema)
module.exports=Question