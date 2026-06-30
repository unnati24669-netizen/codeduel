const mongoose=require("mongoose")
const schema=mongoose.Schema;


const matchSchema=schema({
    player1:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
    player2:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
    /*won:{type:mongoose.Schema.Types.ObjectId,ref:"User"},*/
    result:{type:String,enum:["player1","player2","draw","abandon"]},
    duration:{type:Number,},
    questionId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Question"},
    rating1:{type:Number,required:true},
    rating2:{type:Number,required:true},
    status:{type:String,enum:["ongoing","completed","abandon"],default:"ongoing"}
},{timestamps:true})

const Match=mongoose.model("match",matchSchema)
module.exports=Match;