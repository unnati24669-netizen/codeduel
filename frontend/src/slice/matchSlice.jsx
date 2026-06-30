import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import matchapi from "../api/axiosInstance"
const player={
    playerId:null,
    username:null,

    rating:null,
    status:null
   


}
const initialState={
    players:[],
    question:{},
    newRatings:[],
    questionId:null,
    winner:null,
    matchStatus:null,
    matchId:null,
    isLoading:false,
    isError:false,
}

const questionfound=createAsyncThunk("/question",async({questionId},thunkAPI)=>{
    try{
      const res=await matchapi.get(`/question/${questionId}`);
    return res.data;
    }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not fetch a question");
    }
   


}) 

const codeSubmit=createAsyncThunk("/submit",async({code,languageId,matchId,playerId},thunkAPI)=>{
    try{
        const res=await matchapi.post("/match/submit",{
            code,languageId,matchId
        })
        
        return {...res.data,playerId};
    }catch(err){
        return thunkAPI.rejectWithValue(err.response?.data||"could not submit the question")
    }
})

const matchDetails=createAsyncThunk("/matchdetails",async({id},thunkAPI)=>{
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
           state.winner=action.payload.winner;
           state.matchStatus=action.payload.status;
           state.newRatings=[action.payload.newRating1,action.payload.newRating2];
           
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(questionfound.pending,(state,action)=>{
            state.isLoading=true;
            state.isError=false
        })
        .addCase(questionfound.fulfilled,(state,action)=>{
            state.question=action.payload.question;
            state.isLoading=false;
            state.isError=false;
        })
        .addCase(questionfound.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
        })

        .addCase(codeSubmit.pending,(state,action)=>{
            state.isLoading=true;
            state.isError=false;
        })
        .addCase(codeSubmit.fulfilled,(state,action)=>{
           
           const requiredPlayer=state.players.find((player)=>{
                return(player.playerId===action.payload.playerId)
                    
                
           })
           requiredPlayer.status="fulfilled";
           state.isLoading=false;
           state.isError=false;


           

        })
        .addCase(codeSubmit.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
        })

        .addCase(matchDetails.pending,(state,action)=>{
            state.isError=false;
            state.isLoading=true;
        })
        .addCase(matchDetails.fulfilled,(state,action)=>{
           const {player1,player2,rating1,rating2}=action.payload.data;
           state.players=[
               {playerId:player1._id,
                username:player1.username,
                rating:rating1,
                status:null
            },{
                playerId:player2._id,
                username:player2.username,
                rating:rating2,
                status:null
            }
               ]
               state.isError=false;
               state.isLoading=false;



            
        })
        .addCase(matchDetails.rejected,(state,action)=>{
            state.isError=true;
            state.isLoading=false;
        })
    }
})
export const { matchFound, matchResult } = matchSlice.actions;
export {questionfound,codeSubmit,matchDetails}


export default matchSlice.reducer