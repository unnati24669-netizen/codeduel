const mongoose=require("mongoose")
const schema=mongoose.Schema;


const matchSchema=schema({
    player1:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"user"},
    player2:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"user"},
    /*won:{type:mongoose.Schema.Types.ObjectId,ref:"user"},*/
    result:{type:String,enum:["player1","player2","draw","abandon"]},
    duration:{type:Number,},
    questionId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"question"},
    rating1:{type:Number,required:true},
    rating2:{type:Number,required:true},
    status:{type:String,enum:["ongoing","completed","abandon"],default:"ongoing"}
},{timestamps:true})

const Match=mongoose.model("match",matchSchema)
module.exports=Match;