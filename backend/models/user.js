const mongoose=require("mongoose")
const schema=mongoose.Schema;

const userSchema=schema({
    username:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    password:{type:String,required:true},
    rating:{type:Number,default:1200},
    matchesPlayed:{type:Number,default:0},
    wins:{type:Number,default:0},
    losses:{type:Number,default:0},
    role:{type:String,enum:["user","admin"],default:"user"},
    avatarUrl:{type:String,default:null}

    /*createdAt:{type:String}  do not manage manually*/
   

}, {timestamps:true}/*this would automatically add createat and when it is updated*/)
userSchema.index({rating:-1,wins:-1,_id:1})//this would create a compound index on rating,win and _id in descending order, this would help in sorting the users based on rating and win and then by _id
const User=mongoose.model("user",userSchema);

module.exports=User;