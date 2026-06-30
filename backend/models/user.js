const mongoose=require("mongoose")
const schema=mongoose.Schema;

const userSchema=schema({
    username:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    password:{type:String,required:true},
    rating:{type:Number,default:1200},
    role:{type:String,enum:["user","admin"],default:"user"}
    /*createdAt:{type:String}  do not manage manually*/
   

}, {timestamps:true}/*this would automatically add createat and when it is updated*/)
const User=mongoose.model("user",userSchema);

module.exports=User;