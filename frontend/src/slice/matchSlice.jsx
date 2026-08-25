import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import matchapi from "../api/axiosInstance"
const player={
    playerId:null,
    username:null,
    code:{},
    rating:null,
    newRating:null,
    status:null,
    languageId:null,
   


}
const initialState={
    players:[],
    question:{},
    pendingMatchResult:{},
   
    questionId:null,
    winner:null,
    matchStatus:null,
    matchId:null,
    isLoadingQuestion:false,
    isErrorQuestion:false,
    isLoadingSubmit:false,
    isErrorSubmit:false,
    isLoadingMatchDetails:false,
    isErrorMatchDetails:false
}

export const questionfound=createAsyncThunk("/question",async({questionId},thunkAPI)=>{
    try{
      const res=await matchapi.get(`/question/${questionId}`);
    return res.data;
    }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not fetch a question");
    }
   


}) 

export const codeSubmit=createAsyncThunk("/submit",async({code,languageId,matchId,playerId},thunkAPI)=>{
    try{
        const res=await matchapi.post("/match/submit",{
            code,languageId,matchId
        })

        
        
        return {...res.data,playerId};
    }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not submit the question")
    }
})

export const matchDetails=createAsyncThunk("/matchdetails",async({id},thunkAPI)=>{
        try{

            const res=await matchapi.get(`/match/${id}`);
            return res.data;

        }catch(err){
          return thunkAPI.rejectWithValue(err.response?.data||"could not fetch details of match");
        }
}

)

export const matchSlice=createSlice({
    name:"match",
    initialState,

    reducers:{
         matchFound:(state,action)=>{
            state.matchId=action.payload.matchId;
            state.questionId=action.payload.questionId


        },

        matchResult:(state,action)=>{
             if(state.players.length!=0){
           state.winner=action.payload.winner;
           state.matchStatus=action.payload.status;
          
                     state.players.forEach((player)=>{
            if(player.playerId===action.payload.data1.playerId){
                 player.newRating=action.payload.data1.newRating 
                }
                    
           else if(player.playerId===action.payload.data2.playerId){
                player.newRating=action.payload.data2.newRating
           }
        
           
           
           
        })
           }else{
            state.pendingMatchResult=action.payload
           }
       
    }
           
    },
    extraReducers:(builder)=>{
        builder
        .addCase(questionfound.pending,(state,action)=>{
            state.isLoadingQuestion=true;
            state.isErrorQuestion=false
        })
        .addCase(questionfound.fulfilled,(state,action)=>{
            state.question=action.payload.question;
            state.isLoadingQuestion=false;
            state.isErrorQuestion=false;
        })
        .addCase(questionfound.rejected,(state,action)=>{
            state.isErrorQuestion=true;
            state.isLoadingQuestion=false;
        })

        .addCase(codeSubmit.pending,(state,action)=>{
            const requiredPlayer=state.players.find((player)=>player.playerId===action.meta.arg.playerId);
            if(requiredPlayer){
                requiredPlayer.code=action.meta.arg.code
                requiredPlayer.languageId=action.meta.arg.languageId
            }
            
            state.isLoadingSubmit=true;
            state.isErrorSubmit=false;
        })
        .addCase(codeSubmit.fulfilled,(state,action)=>{
            
         
       const requiredPlayer=state.players.find((player)=>player.playerId===action.payload.playerId)
         if(requiredPlayer){
           const message=action.payload.message;
          requiredPlayer.status=message
          state.isLoadingSubmit=false;
          state.isErrorSubmit=false;
          
         }else{
            state.isLoadingSubmit=false;
            state.isErrorSubmit=true;
         }
                
          

           
           


           

        })
        .addCase(codeSubmit.rejected,(state,action)=>{
            state.isErrorSubmit=true;
            state.isLoadingSubmit=false;
        })

        .addCase(matchDetails.pending,(state,action)=>{
            state.isErrorMatchDetails=false;
            state.isLoadingMatchDetails=true;
        })
        .addCase(matchDetails.fulfilled,(state,action)=>{
           const {player1,player2,rating1,rating2}=action.payload.data;
           if(state.pendingMatchResult.data1){
            state.winner=state.pendingMatchResult.winner;
            state.matchStatus=state.pendingMatchResult.status;
            if(state.pendingMatchResult.data1.playerId===player1._id.toString()){
                state.players=[
               {playerId:player1._id.toString(),
                username:player1.username,
                rating:rating1,
                status:null,
                newRating:state.pendingMatchResult.data1.newRating
            },{
                playerId:player2._id.toString(),
                username:player2.username,
                rating:rating2,
                status:null,
                newRating:state.pendingMatchResult.data2.newRating
            }]

            }
            else{
                 state.players=[
               {playerId:player1._id.toString(),
                username:player1.username,
                rating:rating1,
                status:null,
                newRating:state.pendingMatchResult.data2.newRating
            },{
                playerId:player2._id.toString(),
                username:player2.username,
                rating:rating2,
                status:null,
                newRating:state.pendingMatchResult.data1.newRating
            }]

            }
            state.pendingMatchResult={};
             
           }else{
                  state.players=[
               {playerId:player1._id.toString(),
                username:player1.username,
                rating:rating1,
                status:null
            },{
                playerId:player2._id.toString(),
                username:player2.username,
                rating:rating2,
                status:null
            }]
           }
          
               
               state.isErrorMatchDetails=false;
               state.isLoadingMatchDetails=false;



            
        })
        .addCase(matchDetails.rejected,(state,action)=>{
            state.isErrorMatchDetails=true;
            state.isLoadingMatchDetails=false;
        })
    }
}

)
export const { matchFound, matchResult } = matchSlice.actions;



export default matchSlice.reducer